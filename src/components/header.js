import { navigate } from '../main.js';

export function renderHeader(currentPath) {
  const header = document.createElement('header');
  header.className = 'header';
  header.innerHTML = `
    <div class="header-inner">
      <div class="logo" id="header-logo">
        <div class="logo-icon">TJ</div>
        <span class="logo-text">ToolsJar</span>
      </div>
      <nav>
        <ul class="nav-links" id="nav-links">
          <li><a href="/" class="${currentPath === '/' ? 'active' : ''}">Home</a></li>
          <li><a href="/image-compressor" class="${currentPath === '/image-compressor' ? 'active' : ''}">Image</a></li>
          <li><a href="/qr-generator" class="${currentPath === '/qr-generator' ? 'active' : ''}">QR Code</a></li>
          <li><a href="/password-generator" class="${currentPath === '/password-generator' ? 'active' : ''}">Password</a></li>
          <li><a href="/json-formatter" class="${currentPath === '/json-formatter' ? 'active' : ''}">JSON</a></li>
          <li><a href="/word-counter" class="${currentPath === '/word-counter' ? 'active' : ''}">Word Count</a></li>
          <li><a href="/color-palette" class="${currentPath === '/color-palette' ? 'active' : ''}">Colors</a></li>
        </ul>
      </nav>
      <button class="menu-toggle" id="menu-toggle" aria-label="Toggle menu">☰</button>
    </div>
  `;

  // Logo click → go home
  header.querySelector('#header-logo').addEventListener('click', () => navigate('/'));

  // Mobile menu toggle
  header.querySelector('#menu-toggle').addEventListener('click', () => {
    header.querySelector('#nav-links').classList.toggle('open');
  });

  // Close mobile menu on link click
  header.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      header.querySelector('#nav-links').classList.remove('open');
    });
  });

  return header;
}
