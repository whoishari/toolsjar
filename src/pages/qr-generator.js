import { renderAdSlot } from '../components/ad-slot.js';
import { copyToClipboard } from '../main.js';
import QRCode from 'qrcode';

export function renderQRGenerator(container) {
  const page = document.createElement('div');
  page.className = 'tool-page animate-in';

  page.innerHTML = `
    <div class="tool-page-header">
      <a href="#/" class="back-link">← Back to Tools</a>
      <h1>QR Code Generator</h1>
      <p>Create QR codes instantly — free, no signup required</p>
    </div>
  `;

  const panel = document.createElement('div');
  panel.className = 'tool-panel';
  panel.innerHTML = `
    <div class="form-group">
      <label>Content</label>
      <input type="text" class="form-input" id="qr-input" placeholder="Enter URL, text, or any data..." value="https://toolsjar.com" />
    </div>
    
    <div style="display: flex; gap: var(--space-md); flex-wrap: wrap;">
      <div class="form-group" style="flex: 1; min-width: 140px;">
        <label>Size (px)</label>
        <select class="form-select" id="qr-size">
          <option value="200">200 × 200</option>
          <option value="300" selected>300 × 300</option>
          <option value="400">400 × 400</option>
          <option value="500">500 × 500</option>
        </select>
      </div>
      <div class="form-group" style="flex: 1; min-width: 140px;">
        <label>Foreground</label>
        <input type="color" class="form-input" id="qr-fg" value="#ffffff" style="height: 44px; padding: 4px;" />
      </div>
      <div class="form-group" style="flex: 1; min-width: 140px;">
        <label>Background</label>
        <input type="color" class="form-input" id="qr-bg" value="#0a0a0f" style="height: 44px; padding: 4px;" />
      </div>
    </div>

    <div class="btn-group">
      <button class="btn btn-primary" id="qr-generate">Generate QR Code</button>
    </div>
  `;
  page.appendChild(panel);

  const resultPanel = document.createElement('div');
  resultPanel.className = 'tool-panel';
  resultPanel.innerHTML = `
    <div class="result-box" id="qr-result" style="padding: var(--space-2xl);">
      <span class="placeholder-text">Your QR code will appear here</span>
    </div>
    <div class="btn-group" style="margin-top: var(--space-lg); justify-content: center; display: none;" id="qr-actions">
      <button class="btn btn-primary" id="qr-download">⬇ Download PNG</button>
      <button class="btn btn-secondary" id="qr-copy-link">📋 Copy Data</button>
    </div>
  `;
  page.appendChild(resultPanel);

  container.appendChild(page);
  renderAdSlot(container, 'banner', 'qr-bottom');

  // --- QR Code generation using real `qrcode` library ---
  const input = page.querySelector('#qr-input');
  const sizeSelect = page.querySelector('#qr-size');
  const fgColor = page.querySelector('#qr-fg');
  const bgColor = page.querySelector('#qr-bg');
  const generateBtn = page.querySelector('#qr-generate');
  const resultBox = page.querySelector('#qr-result');
  const actionsDiv = page.querySelector('#qr-actions');
  const downloadBtn = page.querySelector('#qr-download');
  const copyBtn = page.querySelector('#qr-copy-link');

  let currentCanvas = null;

  async function generateQR() {
    const text = input.value.trim();
    if (!text) return;

    const size = parseInt(sizeSelect.value);
    const fg = fgColor.value;
    const bg = bgColor.value;

    try {
      // Create a canvas using the real qrcode library (produces scannable QR codes)
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        color: {
          dark: fg,
          light: bg,
        },
        errorCorrectionLevel: 'M',
      });

      canvas.style.borderRadius = 'var(--radius-md)';
      canvas.style.maxWidth = '100%';

      resultBox.innerHTML = '';
      resultBox.classList.add('has-result');
      resultBox.appendChild(canvas);
      actionsDiv.style.display = 'flex';
      currentCanvas = canvas;
    } catch (err) {
      resultBox.innerHTML = `<span class="placeholder-text" style="color: #ef4444;">Error: ${err.message}</span>`;
      actionsDiv.style.display = 'none';
    }
  }

  generateBtn.addEventListener('click', generateQR);

  // Also generate on Enter key in input
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generateQR();
  });

  downloadBtn.addEventListener('click', () => {
    if (!currentCanvas) return;
    const a = document.createElement('a');
    a.href = currentCanvas.toDataURL('image/png');
    a.download = 'qrcode.png';
    a.click();
  });

  copyBtn.addEventListener('click', () => {
    copyToClipboard(input.value.trim());
  });

  // Auto-generate on load
  setTimeout(generateQR, 100);
}
