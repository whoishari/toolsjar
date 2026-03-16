import { renderAdSlot } from '../components/ad-slot.js';
import { copyToClipboard, showToast } from '../main.js';

export function renderJSONFormatter(container) {
  const page = document.createElement('div');
  page.className = 'tool-page animate-in';

  page.innerHTML = `
    <div class="tool-page-header">
      <a href="#/" class="back-link">← Back to Tools</a>
      <h1>JSON Formatter & Validator</h1>
      <p>Prettify, validate, and minify JSON data instantly</p>
    </div>
  `;

  const panel = document.createElement('div');
  panel.className = 'tool-panel';
  panel.innerHTML = `
    <div class="form-group">
      <label>Paste your JSON</label>
      <textarea class="form-textarea" id="json-input" placeholder='{"name": "John", "age": 30, "hobbies": ["reading", "coding"]}' style="min-height: 200px;"></textarea>
    </div>

    <div class="btn-group">
      <button class="btn btn-primary" id="json-format">✨ Format / Prettify</button>
      <button class="btn btn-secondary" id="json-minify">📦 Minify</button>
      <button class="btn btn-secondary" id="json-validate">✅ Validate</button>
      <button class="btn btn-secondary" id="json-copy">📋 Copy</button>
    </div>

    <div id="json-status" style="margin-top: var(--space-md); font-size: 0.85rem; display: none;"></div>
  `;
  page.appendChild(panel);

  const outputPanel = document.createElement('div');
  outputPanel.className = 'tool-panel';
  outputPanel.innerHTML = `
    <div class="form-group">
      <label>Output</label>
      <textarea class="form-textarea" id="json-output" readonly placeholder="Formatted output will appear here..." style="min-height: 250px;"></textarea>
    </div>
    <div class="stat-grid" id="json-stats" style="display: none;">
      <div class="stat-item">
        <div class="stat-value" id="json-keys">0</div>
        <div class="stat-label">Keys</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" id="json-depth">0</div>
        <div class="stat-label">Max Depth</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" id="json-size">0 B</div>
        <div class="stat-label">Size</div>
      </div>
    </div>
  `;
  page.appendChild(outputPanel);

  container.appendChild(page);
  renderAdSlot(container, 'banner', 'json-bottom');

  // --- Logic ---
  const input = page.querySelector('#json-input');
  const output = page.querySelector('#json-output');
  const statusDiv = page.querySelector('#json-status');
  const statsDiv = page.querySelector('#json-stats');

  function showStatus(message, isError = false) {
    statusDiv.style.display = 'block';
    statusDiv.style.color = isError ? '#ef4444' : 'var(--accent-green)';
    statusDiv.innerHTML = `${isError ? '❌' : '✅'} ${message}`;
  }

  function countKeys(obj) {
    let count = 0;
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        obj.forEach(item => { count += countKeys(item); });
      } else {
        for (const key in obj) {
          count++;
          count += countKeys(obj[key]);
        }
      }
    }
    return count;
  }

  function getDepth(obj) {
    if (typeof obj !== 'object' || obj === null) return 0;
    if (Array.isArray(obj)) {
      return obj.length === 0 ? 1 : 1 + Math.max(...obj.map(getDepth));
    }
    const values = Object.values(obj);
    return values.length === 0 ? 1 : 1 + Math.max(...values.map(getDepth));
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(1) + ' KB';
  }

  function updateStats(parsed, text) {
    statsDiv.style.display = 'grid';
    page.querySelector('#json-keys').textContent = countKeys(parsed);
    page.querySelector('#json-depth').textContent = getDepth(parsed);
    page.querySelector('#json-size').textContent = formatBytes(new Blob([text]).size);
  }

  page.querySelector('#json-format').addEventListener('click', () => {
    try {
      const parsed = JSON.parse(input.value);
      const formatted = JSON.stringify(parsed, null, 2);
      output.value = formatted;
      input.value = formatted;
      showStatus('Valid JSON — formatted successfully!');
      updateStats(parsed, formatted);
    } catch (e) {
      showStatus(`Invalid JSON: ${e.message}`, true);
      output.value = '';
      statsDiv.style.display = 'none';
    }
  });

  page.querySelector('#json-minify').addEventListener('click', () => {
    try {
      const parsed = JSON.parse(input.value);
      const minified = JSON.stringify(parsed);
      output.value = minified;
      showStatus(`Minified! Saved ${((1 - minified.length / input.value.length) * 100).toFixed(0)}% space`);
      updateStats(parsed, minified);
    } catch (e) {
      showStatus(`Invalid JSON: ${e.message}`, true);
    }
  });

  page.querySelector('#json-validate').addEventListener('click', () => {
    try {
      const parsed = JSON.parse(input.value);
      showStatus('Valid JSON! ✨');
      updateStats(parsed, input.value);
    } catch (e) {
      showStatus(`Invalid JSON at position ${e.message.match(/\d+/)?.[0] || '?'}: ${e.message}`, true);
    }
  });

  page.querySelector('#json-copy').addEventListener('click', () => {
    const text = output.value || input.value;
    if (text) copyToClipboard(text);
  });

  // Pre-fill example
  input.value = JSON.stringify({
    name: "ToolsJar",
    type: "Online Tools",
    tools: ["Image Compressor", "QR Generator", "Password Generator"],
    free: true,
    privacy: { dataUpload: false, tracking: false }
  }, null, 2);
}
