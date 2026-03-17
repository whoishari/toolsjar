import { navigate } from '../main.js';
import { renderAdSlot } from '../components/ad-slot.js';

const tools = [
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Compress JPEG, PNG & WebP images in your browser. Reduce file size without losing quality.',
    icon: '🖼️',
    tags: ['Image', 'Compress', 'Free'],
    gradient: 'linear-gradient(135deg, #6366f1, #a855f7)',
    path: '/image-compressor',
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes for URLs, text, WiFi credentials and more. Download as high-quality PNG.',
    icon: '📱',
    tags: ['QR Code', 'Generator', 'Free'],
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    path: '/qr-generator',
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Create strong, secure random passwords with customizable length and character options.',
    icon: '🔐',
    tags: ['Security', 'Password', 'Free'],
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
    path: '/password-generator',
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Prettify, validate, and minify JSON data with syntax highlighting and error detection.',
    icon: '{ }',
    tags: ['Developer', 'JSON', 'Free'],
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    path: '/json-formatter',
  },
  {
    id: 'word-counter',
    name: 'Word & Character Counter',
    description: 'Count words, characters, sentences and paragraphs. Includes reading time estimator.',
    icon: '📝',
    tags: ['Text', 'Counter', 'Free'],
    gradient: 'linear-gradient(135deg, #ec4899, #a855f7)',
    path: '/word-counter',
  },
  {
    id: 'color-palette',
    name: 'Color Palette Generator',
    description: 'Generate beautiful, harmonious color palettes. Copy HEX, RGB, HSL values instantly.',
    icon: '🎨',
    tags: ['Design', 'Colors', 'Free'],
    gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
    path: '/color-palette',
  },
  {
    id: 'pdf-converter',
    name: 'PDF Converter',
    description: 'Convert PDFs to Word (DOCX), extract text, or save pages as high-quality PNG/JPG images.',
    icon: '📄',
    tags: ['PDF', 'Converter', 'Document'],
    gradient: 'linear-gradient(135deg, #ef4444, #f59e0b)',
    path: '/pdf-converter',
  },
];

export function renderHome(container) {
  // Hero Section
  const hero = document.createElement('section');
  hero.className = 'hero';
  hero.innerHTML = `
    <div class="hero-badge">
      <span class="hero-badge-dot"></span>
      100% Free • No Signup • Works in Browser
    </div>
    <h1>
      Your Everyday<br>
      <span class="gradient-text">Online Toolbox</span>
    </h1>
    <p>
      Fast, free, and privacy-first tools that run entirely in your browser.
      No data uploads, no accounts, no limits — just tools that work.
    </p>
    <div class="hero-stats">
      <div class="hero-stat">
        <div class="hero-stat-value">6</div>
        <div class="hero-stat-label">Free Tools</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-value">🔒</div>
        <div class="hero-stat-label">100% Private</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-value">∞</div>
        <div class="hero-stat-label">No Limits</div>
      </div>
    </div>
  `;
  container.appendChild(hero);

  // Ad slot — top banner
  renderAdSlot(container, 'banner', 'home-top');

  // Tools Grid Section
  const section = document.createElement('section');
  section.className = 'tools-section';
  section.innerHTML = `
    <div class="section-header">
      <h2>Choose a Tool</h2>
      <p>Click any tool to get started — no signup required</p>
    </div>
  `;

  const grid = document.createElement('div');
  grid.className = 'tools-grid';

  tools.forEach(tool => {
    const card = document.createElement('article');
    card.className = 'tool-card';
    card.id = `tool-card-${tool.id}`;
    card.style.setProperty('--card-gradient', tool.gradient);
    card.innerHTML = `
      <div class="tool-card-icon">${tool.icon}</div>
      <h3>${tool.name}</h3>
      <p>${tool.description}</p>
      <div class="tool-card-tags">
        ${tool.tags.map(t => `<span class="tool-tag">${t}</span>`).join('')}
      </div>
    `;
    card.addEventListener('click', () => navigate(tool.path));
    grid.appendChild(card);
  });

  section.appendChild(grid);
  container.appendChild(section);

  // Ad slot — bottom banner
  renderAdSlot(container, 'banner', 'home-bottom');
}
