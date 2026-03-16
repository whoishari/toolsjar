import { renderAdSlot } from '../components/ad-slot.js';
import { copyToClipboard } from '../main.js';

export function renderColorPalette(container) {
  const page = document.createElement('div');
  page.className = 'tool-page animate-in';

  page.innerHTML = `
    <div class="tool-page-header">
      <a href="#/" class="back-link">← Back to Tools</a>
      <h1>Color Palette Generator</h1>
      <p>Generate beautiful, harmonious color schemes instantly</p>
    </div>
  `;

  const panel = document.createElement('div');
  panel.className = 'tool-panel';
  panel.innerHTML = `
    <div style="display: flex; gap: var(--space-md); flex-wrap: wrap; align-items: end;">
      <div class="form-group" style="flex: 1; min-width: 140px; margin-bottom: 0;">
        <label>Base Color</label>
        <input type="color" class="form-input" id="base-color" value="#6366f1" style="height: 50px; padding: 4px;" />
      </div>
      <div class="form-group" style="flex: 1; min-width: 140px; margin-bottom: 0;">
        <label>Harmony</label>
        <select class="form-select" id="harmony-type">
          <option value="complementary">Complementary</option>
          <option value="analogous">Analogous</option>
          <option value="triadic">Triadic</option>
          <option value="split-complementary">Split Complementary</option>
          <option value="tetradic">Tetradic</option>
          <option value="monochromatic">Monochromatic</option>
        </select>
      </div>
      <div style="margin-bottom: 0;">
        <button class="btn btn-primary" id="generate-palette">🎨 Generate</button>
      </div>
      <div style="margin-bottom: 0;">
        <button class="btn btn-secondary" id="random-palette">🎲 Random</button>
      </div>
    </div>
  `;
  page.appendChild(panel);

  const palettePanel = document.createElement('div');
  palettePanel.className = 'tool-panel';
  palettePanel.id = 'palette-panel';
  palettePanel.innerHTML = `
    <div id="palette-display" style="display: flex; border-radius: var(--radius-lg); overflow: hidden; min-height: 180px; margin-bottom: var(--space-lg);"></div>
    <div id="palette-details"></div>
    <p style="text-align: center; font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-md);">Click any color to copy its HEX code</p>
  `;
  page.appendChild(palettePanel);

  container.appendChild(page);
  renderAdSlot(container, 'banner', 'color-bottom');

  // --- Color Logic ---
  const baseColorInput = page.querySelector('#base-color');
  const harmonySelect = page.querySelector('#harmony-type');
  const generateBtn = page.querySelector('#generate-palette');
  const randomBtn = page.querySelector('#random-palette');
  const paletteDisplay = page.querySelector('#palette-display');
  const paletteDetails = page.querySelector('#palette-details');

  function hexToHSL(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s));
    l = Math.max(0, Math.min(100, l));

    const s1 = s / 100;
    const l1 = l / 100;

    const c = (1 - Math.abs(2 * l1 - 1)) * s1;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l1 - c / 2;

    let r, g, b;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    const toHex = v => Math.round((v + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function hexToRGB(hex) {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    };
  }

  function generateHarmony(baseHex, type) {
    const { h, s, l } = hexToHSL(baseHex);
    const colors = [baseHex];

    switch (type) {
      case 'complementary':
        colors.push(hslToHex(h + 180, s, l));
        colors.push(hslToHex(h, s, Math.min(l + 20, 90)));
        colors.push(hslToHex(h + 180, s, Math.max(l - 20, 10)));
        colors.push(hslToHex(h + 90, s * 0.5, l));
        break;
      case 'analogous':
        colors.push(hslToHex(h + 30, s, l));
        colors.push(hslToHex(h + 60, s, l));
        colors.push(hslToHex(h - 30, s, l));
        colors.push(hslToHex(h - 60, s, l));
        break;
      case 'triadic':
        colors.push(hslToHex(h + 120, s, l));
        colors.push(hslToHex(h + 240, s, l));
        colors.push(hslToHex(h, s, Math.min(l + 25, 90)));
        colors.push(hslToHex(h + 120, s, Math.max(l - 25, 10)));
        break;
      case 'split-complementary':
        colors.push(hslToHex(h + 150, s, l));
        colors.push(hslToHex(h + 210, s, l));
        colors.push(hslToHex(h, s * 0.7, l + 15));
        colors.push(hslToHex(h + 180, s * 0.7, l - 15));
        break;
      case 'tetradic':
        colors.push(hslToHex(h + 90, s, l));
        colors.push(hslToHex(h + 180, s, l));
        colors.push(hslToHex(h + 270, s, l));
        colors.push(hslToHex(h, s * 0.6, l + 20));
        break;
      case 'monochromatic':
        colors.push(hslToHex(h, s, Math.min(l + 15, 95)));
        colors.push(hslToHex(h, s, Math.min(l + 30, 95)));
        colors.push(hslToHex(h, s, Math.max(l - 15, 5)));
        colors.push(hslToHex(h, s, Math.max(l - 30, 5)));
        break;
    }

    return colors;
  }

  function renderPalette(colors) {
    paletteDisplay.innerHTML = '';
    paletteDetails.innerHTML = '';

    colors.forEach((color, i) => {
      // Color bar
      const bar = document.createElement('div');
      bar.style.flex = '1';
      bar.style.backgroundColor = color;
      bar.style.cursor = 'pointer';
      bar.style.transition = 'flex var(--transition-normal)';
      bar.style.position = 'relative';

      bar.addEventListener('mouseenter', () => {
        bar.style.flex = '1.5';
      });
      bar.addEventListener('mouseleave', () => {
        bar.style.flex = '1';
      });
      bar.addEventListener('click', () => {
        copyToClipboard(color.toUpperCase());
      });

      paletteDisplay.appendChild(bar);

      // Detail row
      const hsl = hexToHSL(color);
      const rgb = hexToRGB(color);
      const detail = document.createElement('div');
      detail.style.cssText = `
        display: flex; align-items: center; gap: var(--space-md); padding: var(--space-sm) 0;
        border-bottom: 1px solid var(--border-glass); cursor: pointer;
      `;
      detail.innerHTML = `
        <div style="width: 32px; height: 32px; border-radius: var(--radius-sm); background: ${color}; flex-shrink: 0;"></div>
        <div style="flex: 1;">
          <span style="font-family: var(--font-mono); font-weight: 600; font-size: 0.9rem;">${color.toUpperCase()}</span>
          <span style="color: var(--text-muted); font-size: 0.75rem; margin-left: var(--space-md);">
            rgb(${rgb.r}, ${rgb.g}, ${rgb.b}) • hsl(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)
          </span>
        </div>
      `;
      detail.addEventListener('click', () => copyToClipboard(color.toUpperCase()));
      paletteDetails.appendChild(detail);
    });
  }

  function generate() {
    const baseColor = baseColorInput.value;
    const harmony = harmonySelect.value;
    const colors = generateHarmony(baseColor, harmony);
    renderPalette(colors);
  }

  function randomColor() {
    const h = Math.floor(Math.random() * 360);
    const s = 50 + Math.floor(Math.random() * 40);
    const l = 40 + Math.floor(Math.random() * 30);
    return hslToHex(h, s, l);
  }

  generateBtn.addEventListener('click', generate);
  randomBtn.addEventListener('click', () => {
    const color = randomColor();
    baseColorInput.value = color;
    generate();
  });

  baseColorInput.addEventListener('input', generate);
  harmonySelect.addEventListener('change', generate);

  // Generate on load
  generate();
}
