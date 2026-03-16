import { renderAdSlot } from '../components/ad-slot.js';
import { copyToClipboard } from '../main.js';

export function renderPasswordGenerator(container) {
  const page = document.createElement('div');
  page.className = 'tool-page animate-in';

  page.innerHTML = `
    <div class="tool-page-header">
      <a href="#/" class="back-link">← Back to Tools</a>
      <h1>Password Generator</h1>
      <p>Generate strong, secure passwords instantly — 100% client-side</p>
    </div>
  `;

  const panel = document.createElement('div');
  panel.className = 'tool-panel';
  panel.innerHTML = `
    <div class="result-box has-result" id="password-display" style="cursor: pointer; font-family: var(--font-mono); font-size: 1.3rem; letter-spacing: 0.05em; word-break: break-all; min-height: 80px;" title="Click to copy">
      Generating...
    </div>
    <p style="text-align: center; font-size: 0.7rem; color: var(--text-muted); margin-top: var(--space-xs);">Click the password to copy it</p>
    <div class="strength-bar-container" id="strength-bars">
      <div class="strength-bar"></div>
      <div class="strength-bar"></div>
      <div class="strength-bar"></div>
      <div class="strength-bar"></div>
    </div>
    <p id="strength-text" style="text-align: center; font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-sm);"></p>

    <div class="btn-group" style="margin-top: var(--space-lg); justify-content: center;">
      <button class="btn btn-primary" id="generate-btn">🔄 Generate New</button>
      <button class="btn btn-secondary" id="copy-btn">📋 Copy</button>
    </div>
  `;
  page.appendChild(panel);

  const optionsPanel = document.createElement('div');
  optionsPanel.className = 'tool-panel';
  optionsPanel.innerHTML = `
    <div class="form-group">
      <label>Length: <span id="length-value">16</span></label>
      <input type="range" class="range-slider" id="length-slider" min="4" max="128" value="16" />
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
      <label class="toggle">
        <input type="checkbox" id="opt-upper" checked />
        <span class="toggle-track"></span>
        Uppercase (A–Z)
      </label>
      <label class="toggle">
        <input type="checkbox" id="opt-lower" checked />
        <span class="toggle-track"></span>
        Lowercase (a–z)
      </label>
      <label class="toggle">
        <input type="checkbox" id="opt-numbers" checked />
        <span class="toggle-track"></span>
        Numbers (0–9)
      </label>
      <label class="toggle">
        <input type="checkbox" id="opt-symbols" checked />
        <span class="toggle-track"></span>
        Symbols (!@#$...)
      </label>
    </div>
  `;
  page.appendChild(optionsPanel);

  container.appendChild(page);
  renderAdSlot(container, 'banner', 'password-bottom');

  // --- Logic ---
  const display = page.querySelector('#password-display');
  const generateBtn = page.querySelector('#generate-btn');
  const copyBtn = page.querySelector('#copy-btn');
  const lengthSlider = page.querySelector('#length-slider');
  const lengthValue = page.querySelector('#length-value');
  const strengthBars = page.querySelectorAll('.strength-bar');
  const strengthText = page.querySelector('#strength-text');

  const optUpper = page.querySelector('#opt-upper');
  const optLower = page.querySelector('#opt-lower');
  const optNumbers = page.querySelector('#opt-numbers');
  const optSymbols = page.querySelector('#opt-symbols');

  const charSets = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  };

  function generate() {
    let chars = '';
    if (optUpper.checked) chars += charSets.upper;
    if (optLower.checked) chars += charSets.lower;
    if (optNumbers.checked) chars += charSets.numbers;
    if (optSymbols.checked) chars += charSets.symbols;

    if (!chars) {
      chars = charSets.lower;
      optLower.checked = true;
    }

    const length = parseInt(lengthSlider.value);
    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      password += chars[array[i] % chars.length];
    }

    display.textContent = password;
    updateStrength(password);
  }

  function updateStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 16) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const level = score <= 1 ? 'weak' : score <= 2 ? 'medium' : score <= 3 ? 'strong' : 'very-strong';
    const labels = { weak: 'Weak', medium: 'Medium', strong: 'Strong', 'very-strong': 'Very Strong' };
    const colors = { weak: '#ef4444', medium: '#f59e0b', strong: '#10b981', 'very-strong': '#06b6d4' };

    const activeBars = score <= 1 ? 1 : score <= 2 ? 2 : score <= 3 ? 3 : 4;
    strengthBars.forEach((bar, i) => {
      bar.className = 'strength-bar';
      if (i < activeBars) {
        bar.classList.add('active', level);
      }
    });

    strengthText.textContent = `Strength: ${labels[level]}`;
    strengthText.style.color = colors[level];
  }

  lengthSlider.addEventListener('input', () => {
    lengthValue.textContent = lengthSlider.value;
    generate();
  });

  [optUpper, optLower, optNumbers, optSymbols].forEach(opt => {
    opt.addEventListener('change', generate);
  });

  generateBtn.addEventListener('click', generate);
  
  copyBtn.addEventListener('click', () => {
    copyToClipboard(display.textContent);
  });

  display.addEventListener('click', () => {
    copyToClipboard(display.textContent);
  });

  // Generate on load
  generate();
}
