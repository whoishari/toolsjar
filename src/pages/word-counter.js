import { renderAdSlot } from '../components/ad-slot.js';
import { copyToClipboard } from '../main.js';

export function renderWordCounter(container) {
  const page = document.createElement('div');
  page.className = 'tool-page animate-in';

  page.innerHTML = `
    <div class="tool-page-header">
      <a href="#/" class="back-link">← Back to Tools</a>
      <h1>Word & Character Counter</h1>
      <p>Real-time text analysis with reading time estimation</p>
    </div>
  `;

  const panel = document.createElement('div');
  panel.className = 'tool-panel';
  panel.innerHTML = `
    <div class="form-group">
      <label>Type or paste your text</label>
      <textarea class="form-textarea" id="text-input" placeholder="Start typing or paste your text here..." style="min-height: 220px; font-family: var(--font-sans);"></textarea>
    </div>
    <div class="btn-group">
      <button class="btn btn-secondary" id="text-clear">🗑 Clear</button>
      <button class="btn btn-secondary" id="text-copy">📋 Copy</button>
      <button class="btn btn-secondary" id="text-upper">AA Upper</button>
      <button class="btn btn-secondary" id="text-lower">aa Lower</button>
      <button class="btn btn-secondary" id="text-title">Aa Title</button>
    </div>
  `;
  page.appendChild(panel);

  const statsPanel = document.createElement('div');
  statsPanel.className = 'tool-panel';
  statsPanel.innerHTML = `
    <div class="stat-grid">
      <div class="stat-item">
        <div class="stat-value" id="stat-words">0</div>
        <div class="stat-label">Words</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" id="stat-chars">0</div>
        <div class="stat-label">Characters</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" id="stat-chars-no-space">0</div>
        <div class="stat-label">Without Spaces</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" id="stat-sentences">0</div>
        <div class="stat-label">Sentences</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" id="stat-paragraphs">0</div>
        <div class="stat-label">Paragraphs</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" id="stat-reading-time">0 sec</div>
        <div class="stat-label">Reading Time</div>
      </div>
    </div>
  `;
  page.appendChild(statsPanel);

  container.appendChild(page);
  renderAdSlot(container, 'banner', 'word-bottom');

  // --- Logic ---
  const textInput = page.querySelector('#text-input');

  function updateStats() {
    const text = textInput.value;

    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;

    // Average reading speed: 200 words per minute
    const readingMinutes = words / 200;
    let readingTime;
    if (readingMinutes < 1) {
      readingTime = `${Math.ceil(readingMinutes * 60)} sec`;
    } else {
      readingTime = `${Math.ceil(readingMinutes)} min`;
    }

    page.querySelector('#stat-words').textContent = words.toLocaleString();
    page.querySelector('#stat-chars').textContent = chars.toLocaleString();
    page.querySelector('#stat-chars-no-space').textContent = charsNoSpace.toLocaleString();
    page.querySelector('#stat-sentences').textContent = sentences.toLocaleString();
    page.querySelector('#stat-paragraphs').textContent = paragraphs.toLocaleString();
    page.querySelector('#stat-reading-time').textContent = readingTime;
  }

  textInput.addEventListener('input', updateStats);

  page.querySelector('#text-clear').addEventListener('click', () => {
    textInput.value = '';
    updateStats();
    textInput.focus();
  });

  page.querySelector('#text-copy').addEventListener('click', () => {
    if (textInput.value) copyToClipboard(textInput.value);
  });

  page.querySelector('#text-upper').addEventListener('click', () => {
    textInput.value = textInput.value.toUpperCase();
    updateStats();
  });

  page.querySelector('#text-lower').addEventListener('click', () => {
    textInput.value = textInput.value.toLowerCase();
    updateStats();
  });

  page.querySelector('#text-title').addEventListener('click', () => {
    textInput.value = textInput.value.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
    );
    updateStats();
  });

  updateStats();
}
