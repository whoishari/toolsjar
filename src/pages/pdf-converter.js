import { renderAdSlot } from '../components/ad-slot.js';
import { showToast } from '../main.js';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak } from 'docx';
import { saveAs } from 'file-saver';

// Set the worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export function renderPDFConverter(container) {
  const page = document.createElement('div');
  page.className = 'tool-page animate-in';

  page.innerHTML = `
    <div class="tool-page-header">
      <a href="/" class="back-link">← Back to Tools</a>
      <h1>PDF Converter</h1>
      <p>Convert PDFs to Word, Images, or Text — 100% in your browser, no uploads</p>
    </div>
  `;

  // Upload panel
  const panel = document.createElement('div');
  panel.className = 'tool-panel';
  panel.innerHTML = `
    <div class="drop-zone" id="pdf-drop-zone">
      <div class="drop-zone-icon">📄</div>
      <h3>Drop your PDF here or click to browse</h3>
      <p>Max 50MB • All processing happens in your browser</p>
      <input type="file" id="pdf-input" accept="application/pdf" hidden />
    </div>

    <div class="form-group" style="margin-top: var(--space-lg)">
      <label>Convert To</label>
      <div class="pdf-format-grid" id="format-selector">
        <button class="pdf-format-btn selected" data-format="images">
          <span class="pdf-format-icon">🖼️</span>
          <span class="pdf-format-label">Images</span>
          <span class="pdf-format-desc">PNG per page</span>
        </button>
        <button class="pdf-format-btn" data-format="docx">
          <span class="pdf-format-icon">📝</span>
          <span class="pdf-format-label">Word (.docx)</span>
          <span class="pdf-format-desc">Editable text</span>
        </button>
        <button class="pdf-format-btn" data-format="text">
          <span class="pdf-format-icon">📋</span>
          <span class="pdf-format-label">Plain Text</span>
          <span class="pdf-format-desc">Copy-paste ready</span>
        </button>
        <button class="pdf-format-btn" data-format="jpg">
          <span class="pdf-format-icon">📸</span>
          <span class="pdf-format-label">JPG Images</span>
          <span class="pdf-format-desc">Smaller file size</span>
        </button>
      </div>
    </div>

    <div class="form-group" id="quality-group" style="display: none;">
      <label>Image Scale: <span id="scale-value">2</span>x</label>
      <input type="range" class="range-slider" id="scale-slider" min="1" max="4" value="2" step="0.5" />
      <span style="font-size: 0.75rem; color: var(--text-muted);">Higher = better quality, larger file</span>
    </div>
  `;
  page.appendChild(panel);

  // Progress bar
  const progressPanel = document.createElement('div');
  progressPanel.className = 'tool-panel';
  progressPanel.id = 'pdf-progress-panel';
  progressPanel.style.display = 'none';
  progressPanel.innerHTML = `
    <div class="pdf-progress-container">
      <div class="pdf-progress-header">
        <span id="progress-status">Processing...</span>
        <span id="progress-percent">0%</span>
      </div>
      <div class="pdf-progress-bar">
        <div class="pdf-progress-fill" id="progress-fill" style="width: 0%"></div>
      </div>
    </div>
  `;
  page.appendChild(progressPanel);

  // Results panel
  const resultsPanel = document.createElement('div');
  resultsPanel.className = 'tool-panel';
  resultsPanel.id = 'pdf-results';
  resultsPanel.innerHTML = `
    <div class="result-box" id="pdf-result-placeholder">
      <span class="placeholder-text">Converted files will appear here</span>
    </div>
  `;
  page.appendChild(resultsPanel);

  container.appendChild(page);
  renderAdSlot(container, 'banner', 'pdf-bottom');

  // --- Logic ---
  const dropZone = page.querySelector('#pdf-drop-zone');
  const fileInput = page.querySelector('#pdf-input');
  const formatSelector = page.querySelector('#format-selector');
  const qualityGroup = page.querySelector('#quality-group');
  const scaleSlider = page.querySelector('#scale-slider');
  const scaleValue = page.querySelector('#scale-value');
  const progressPanel_ = page.querySelector('#pdf-progress-panel');
  const progressFill = page.querySelector('#progress-fill');
  const progressStatus = page.querySelector('#progress-status');
  const progressPercent = page.querySelector('#progress-percent');
  const resultsContainer = page.querySelector('#pdf-results');

  let selectedFormat = 'images';
  let currentFile = null;

  // Format selector
  formatSelector.addEventListener('click', (e) => {
    const btn = e.target.closest('.pdf-format-btn');
    if (!btn) return;
    formatSelector.querySelectorAll('.pdf-format-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedFormat = btn.dataset.format;

    // Show/hide scale slider for image formats
    qualityGroup.style.display = (selectedFormat === 'images' || selectedFormat === 'jpg') ? 'block' : 'none';

    // Auto-reconvert if file is already loaded
    if (currentFile) {
      convertPDF(currentFile);
    }
  });

  scaleSlider.addEventListener('input', () => {
    scaleValue.textContent = scaleSlider.value;
  });

  // File input
  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      currentFile = file;
      convertPDF(file);
    } else {
      showToast('Please drop a valid PDF file');
    }
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      currentFile = file;
      convertPDF(file);
    }
  });

  function updateProgress(percent, status) {
    progressPanel_.style.display = 'block';
    progressFill.style.width = percent + '%';
    progressPercent.textContent = Math.round(percent) + '%';
    if (status) progressStatus.textContent = status;
  }

  async function convertPDF(file) {
    resultsContainer.innerHTML = '';
    updateProgress(5, 'Loading PDF...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      updateProgress(10, `Found ${numPages} page${numPages > 1 ? 's' : ''}. Converting...`);

      if (selectedFormat === 'images' || selectedFormat === 'jpg') {
        await convertToImages(pdf, numPages, file.name);
      } else if (selectedFormat === 'text') {
        await convertToText(pdf, numPages, file.name);
      } else if (selectedFormat === 'docx') {
        await convertToDocx(pdf, numPages, file.name);
      }

      updateProgress(100, 'Done!');
      setTimeout(() => { progressPanel_.style.display = 'none'; }, 1500);

    } catch (err) {
      console.error('PDF conversion error:', err);
      progressPanel_.style.display = 'none';
      resultsContainer.innerHTML = `
        <div class="result-box">
          <span class="placeholder-text" style="color: #ef4444;">
            Error: Could not process this PDF. It may be password-protected or corrupted.
          </span>
        </div>
      `;
    }
  }

  // --- Convert to Images ---
  async function convertToImages(pdf, numPages, fileName) {
    const scale = parseFloat(scaleSlider.value);
    const isJpg = selectedFormat === 'jpg';
    const mime = isJpg ? 'image/jpeg' : 'image/png';
    const ext = isJpg ? 'jpg' : 'png';

    // Download All button
    if (numPages > 1) {
      const downloadAllBtn = document.createElement('div');
      downloadAllBtn.style.cssText = 'text-align: center; margin-bottom: var(--space-md);';
      downloadAllBtn.innerHTML = `<button class="btn btn-primary" id="download-all-images">⬇ Download All ${numPages} Pages</button>`;
      resultsContainer.appendChild(downloadAllBtn);
    }

    const imageBlobs = [];

    for (let i = 1; i <= numPages; i++) {
      updateProgress(10 + (i / numPages) * 85, `Rendering page ${i} of ${numPages}...`);

      const pdfPage = await pdf.getPage(i);
      const viewport = pdfPage.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      await pdfPage.render({ canvasContext: ctx, viewport }).promise;

      const blob = await new Promise(resolve => canvas.toBlob(resolve, mime, isJpg ? 0.92 : undefined));
      imageBlobs.push({ blob, pageNum: i });

      const previewUrl = URL.createObjectURL(blob);
      const resultCard = document.createElement('div');
      resultCard.className = 'result-box has-result pdf-image-result';
      resultCard.innerHTML = `
        <div class="pdf-image-preview">
          <img src="${previewUrl}" alt="Page ${i}" loading="lazy" />
        </div>
        <div class="pdf-image-info">
          <span class="pdf-page-label">Page ${i}</span>
          <span class="pdf-size-label">${formatBytes(blob.size)}</span>
          <button class="btn btn-primary btn-sm">⬇ Download</button>
        </div>
      `;
      resultCard.querySelector('.btn').addEventListener('click', () => {
        saveAs(blob, `${fileName.replace('.pdf', '')}_page${i}.${ext}`);
        showToast(`Page ${i} downloaded!`);
      });
      resultsContainer.appendChild(resultCard);
    }

    // Download All handler
    const downloadAllBtn = resultsContainer.querySelector('#download-all-images');
    if (downloadAllBtn) {
      downloadAllBtn.addEventListener('click', () => {
        imageBlobs.forEach(({ blob, pageNum }) => {
          saveAs(blob, `${fileName.replace('.pdf', '')}_page${pageNum}.${ext}`);
        });
        showToast(`All ${numPages} pages downloaded!`);
      });
    }
  }

  // --- Convert to Text ---
  async function convertToText(pdf, numPages, fileName) {
    let allText = '';

    for (let i = 1; i <= numPages; i++) {
      updateProgress(10 + (i / numPages) * 80, `Extracting text from page ${i}...`);

      const pdfPage = await pdf.getPage(i);
      const textContent = await pdfPage.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      allText += `--- Page ${i} ---\n${pageText}\n\n`;
    }

    // Text display
    const textArea = document.createElement('div');
    textArea.className = 'result-box has-result';
    textArea.style.flexDirection = 'column';
    textArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: var(--space-md);">
        <span style="font-weight: 600;">Extracted Text (${numPages} pages)</span>
        <div style="display: flex; gap: var(--space-sm);">
          <button class="btn btn-secondary btn-sm" id="copy-text-btn">📋 Copy</button>
          <button class="btn btn-primary btn-sm" id="download-text-btn">⬇ Download .txt</button>
        </div>
      </div>
      <textarea class="form-textarea" style="width: 100%; min-height: 300px; font-family: monospace; font-size: 0.85rem;">${escapeHtml(allText)}</textarea>
    `;
    resultsContainer.appendChild(textArea);

    textArea.querySelector('#copy-text-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(allText);
      showToast('Text copied to clipboard!');
    });

    textArea.querySelector('#download-text-btn').addEventListener('click', () => {
      const blob = new Blob([allText], { type: 'text/plain' });
      saveAs(blob, fileName.replace('.pdf', '') + '.txt');
      showToast('Text file downloaded!');
    });
  }

  // --- Convert to DOCX ---
  async function convertToDocx(pdf, numPages, fileName) {
    const sections = [];

    for (let i = 1; i <= numPages; i++) {
      updateProgress(10 + (i / numPages) * 80, `Extracting page ${i} for Word document...`);

      const pdfPage = await pdf.getPage(i);
      const textContent = await pdfPage.getTextContent();

      // Group text items into lines based on Y-position
      const lines = [];
      let currentLine = [];
      let lastY = null;

      textContent.items.forEach(item => {
        const y = Math.round(item.transform[5]);
        if (lastY !== null && Math.abs(y - lastY) > 3) {
          if (currentLine.length > 0) {
            lines.push(currentLine.join(' '));
          }
          currentLine = [];
        }
        currentLine.push(item.str);
        lastY = y;
      });
      if (currentLine.length > 0) {
        lines.push(currentLine.join(' '));
      }

      // Build paragraphs for this page
      const paragraphs = [];

      // Page header
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: `Page ${i}`, bold: true, size: 28 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 },
      }));

      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0) {
          paragraphs.push(new Paragraph({ text: '' }));
        } else {
          // Heuristic: if line is short and mostly uppercase, treat as heading
          const isHeading = trimmedLine.length < 80 && trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 3;
          paragraphs.push(new Paragraph({
            children: [new TextRun({
              text: trimmedLine,
              bold: isHeading,
              size: isHeading ? 26 : 22,
            })],
            heading: isHeading ? HeadingLevel.HEADING_3 : undefined,
            spacing: { after: 120 },
          }));
        }
      });

      // Add page break between pages (except last page)
      if (i < numPages) {
        paragraphs.push(new Paragraph({
          children: [new PageBreak()],
        }));
      }

      sections.push(...paragraphs);
    }

    updateProgress(92, 'Building Word document...');

    const doc = new Document({
      sections: [{
        properties: {},
        children: sections,
      }],
    });

    const blob = await Packer.toBlob(doc);

    updateProgress(98, 'Ready!');

    // Result card
    const resultCard = document.createElement('div');
    resultCard.className = 'result-box has-result';
    resultCard.style.flexDirection = 'row';
    resultCard.style.justifyContent = 'space-between';
    resultCard.style.alignItems = 'center';
    resultCard.innerHTML = `
      <div style="display: flex; align-items: center; gap: var(--space-md);">
        <div style="font-size: 2.5rem;">📝</div>
        <div>
          <div style="font-weight: 600;">${fileName.replace('.pdf', '')}.docx</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">${numPages} pages • ${formatBytes(blob.size)}</div>
        </div>
      </div>
      <button class="btn btn-primary" id="download-docx-btn">⬇ Download .docx</button>
    `;
    resultsContainer.appendChild(resultCard);

    resultCard.querySelector('#download-docx-btn').addEventListener('click', () => {
      saveAs(blob, fileName.replace('.pdf', '') + '.docx');
      showToast('Word document downloaded!');
    });
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
