import { renderAdSlot } from '../components/ad-slot.js';
import { showToast } from '../main.js';

export function renderImageCompressor(container) {
  const page = document.createElement('div');
  page.className = 'tool-page animate-in';

  page.innerHTML = `
    <div class="tool-page-header">
      <a href="#/" class="back-link">← Back to Tools</a>
      <h1>Image Compressor</h1>
      <p>Compress images in your browser — no upload, 100% private</p>
    </div>
  `;

  // Drop zone panel
  const panel = document.createElement('div');
  panel.className = 'tool-panel';
  panel.innerHTML = `
    <div class="drop-zone" id="image-drop-zone">
      <div class="drop-zone-icon">🖼️</div>
      <h3>Drop images here or click to browse</h3>
      <p>Supports JPEG, PNG, WebP • Max 20MB per image</p>
      <input type="file" id="image-input" accept="image/jpeg,image/png,image/webp" multiple hidden />
    </div>
    
    <div class="form-group" style="margin-top: var(--space-lg)">
      <label>Quality: <span id="quality-value">80</span>%</label>
      <input type="range" class="range-slider" id="quality-slider" min="10" max="100" value="80" />
    </div>
    
    <div class="form-group">
      <label>Output Format</label>
      <select class="form-select" id="output-format">
        <option value="image/jpeg">JPEG</option>
        <option value="image/png">PNG</option>
        <option value="image/webp" selected>WebP (smallest)</option>
      </select>
    </div>
  `;
  page.appendChild(panel);

  // Results panel
  const resultsPanel = document.createElement('div');
  resultsPanel.className = 'tool-panel';
  resultsPanel.id = 'compression-results';
  resultsPanel.innerHTML = `
    <div class="result-box" id="result-placeholder">
      <span class="placeholder-text">Compressed images will appear here</span>
    </div>
  `;
  page.appendChild(resultsPanel);

  container.appendChild(page);

  // Ad slot
  renderAdSlot(container, 'banner', 'compressor-bottom');

  // --- Logic ---
  const dropZone = page.querySelector('#image-drop-zone');
  const fileInput = page.querySelector('#image-input');
  const qualitySlider = page.querySelector('#quality-slider');
  const qualityValue = page.querySelector('#quality-value');
  const formatSelect = page.querySelector('#output-format');
  const resultsContainer = page.querySelector('#compression-results');

  // Store original files so we can recompress when settings change
  let currentFiles = [];

  // Quality slider — update label AND recompress
  qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = qualitySlider.value;
    if (currentFiles.length > 0) {
      recompressAll();
    }
  });

  // Format change — recompress
  formatSelect.addEventListener('change', () => {
    if (currentFiles.length > 0) {
      recompressAll();
    }
  });

  // Click to open file picker
  dropZone.addEventListener('click', () => fileInput.click());

  // Drag & drop
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
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', () => handleFiles(fileInput.files));

  function handleFiles(files) {
    if (!files.length) return;
    // Store files for recompression
    currentFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    recompressAll();
  }

  function recompressAll() {
    resultsContainer.innerHTML = '';
    const quality = parseInt(qualitySlider.value) / 100;
    const format = formatSelect.value;
    currentFiles.forEach(file => compressImage(file, quality, format));
  }

  function compressImage(file, quality, format) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) {
            // Some browsers don't support certain formats
            const errorCard = document.createElement('div');
            errorCard.className = 'result-box';
            errorCard.innerHTML = `<span class="placeholder-text" style="color: #ef4444;">Failed to compress "${file.name}" — format may not be supported by your browser</span>`;
            resultsContainer.appendChild(errorCard);
            return;
          }

          const originalSize = file.size;
          const compressedSize = blob.size;
          const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);

          const resultCard = document.createElement('div');
          resultCard.className = 'result-box has-result';
          resultCard.style.textAlign = 'left';
          resultCard.style.flexDirection = 'row';
          resultCard.style.justifyContent = 'space-between';
          resultCard.style.flexWrap = 'wrap';

          const previewUrl = URL.createObjectURL(blob);
          const ext = format.split('/')[1];

          resultCard.innerHTML = `
            <div style="display: flex; align-items: center; gap: var(--space-md); flex: 1; min-width: 200px;">
              <img src="${previewUrl}" style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius-sm);" alt="Compressed preview" />
              <div>
                <div style="font-weight: 600; font-size: 0.95rem;">${file.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">
                  ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} 
                  <span style="color: ${parseFloat(savings) > 0 ? 'var(--accent-green)' : 'var(--accent-amber)'}; font-weight: 600;">
                    (${savings > 0 ? '-' : '+'}${Math.abs(savings)}%)
                  </span>
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">
                  Output: ${ext.toUpperCase()} • Quality: ${Math.round(quality * 100)}%
                </div>
              </div>
            </div>
            <button class="btn btn-primary btn-download" style="margin-top: var(--space-sm);">
              ⬇ Download .${ext}
            </button>
          `;

          resultCard.querySelector('.btn-download').addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = previewUrl;
            a.download = file.name.replace(/\.[^.]+$/, '') + '_compressed.' + ext;
            a.click();
            showToast('Image downloaded!');
          });

          resultsContainer.appendChild(resultCard);
        }, format, quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
