// ToolsJar — Main Entry & Router
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderHome } from './pages/home.js';
import { renderImageCompressor } from './pages/image-compressor.js';
import { renderQRGenerator } from './pages/qr-generator.js';
import { renderPasswordGenerator } from './pages/password-generator.js';
import { renderJSONFormatter } from './pages/json-formatter.js';
import { renderWordCounter } from './pages/word-counter.js';
import { renderColorPalette } from './pages/color-palette.js';

const routes = {
  '/': { render: renderHome, title: 'ToolsJar — Free Online Tools | Image Compressor, QR Generator & More', description: 'Free, fast, privacy-friendly online tools. Compress images, generate QR codes, create passwords, format JSON — all in your browser.', category: 'WebApplication' },
  '/image-compressor': { render: renderImageCompressor, title: 'Free Image Compressor — Reduce Image Size Online | ToolsJar', description: 'Compress JPEG, PNG, and WebP images instantly in your browser. No upload needed — 100% private and free.', category: 'MultimediaApplication' },
  '/qr-generator': { render: renderQRGenerator, title: 'Free QR Code Generator — Create QR Codes Online | ToolsJar', description: 'Generate QR codes for URLs, text, WiFi, and more. Download as PNG — free, fast, and no signup required.', category: 'UtilityApplication' },
  '/password-generator': { render: renderPasswordGenerator, title: 'Free Password Generator — Secure Random Passwords | ToolsJar', description: 'Generate strong, secure random passwords with custom length and character options. 100% client-side and free.', category: 'SecurityApplication' },
  '/json-formatter': { render: renderJSONFormatter, title: 'Free JSON Formatter & Validator — Pretty Print JSON | ToolsJar', description: 'Format, validate, and beautify JSON data instantly. Syntax highlighting, error detection — free online tool.', category: 'DeveloperApplication' },
  '/word-counter': { render: renderWordCounter, title: 'Free Word & Character Counter — Text Analysis | ToolsJar', description: 'Count words, characters, sentences, and paragraphs instantly. Reading time estimator included — free online tool.', category: 'UtilityApplication' },
  '/color-palette': { render: renderColorPalette, title: 'Free Color Palette Generator — Beautiful Color Schemes | ToolsJar', description: 'Generate harmonious color palettes with one click. Copy HEX, RGB, HSL values — free tool for designers.', category: 'DesignApplication' },
};

function updateSEO(route, path) {
  document.title = route.title;
  const baseUrl = 'https://toolsjar.com';
  const fullUrl = baseUrl + (path === '/' ? '' : path);

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', route.description);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', route.title);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', route.description);

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', fullUrl);

  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) twitterTitle.setAttribute('content', route.title);

  const twitterDesc = document.querySelector('meta[name="twitter:description"]');
  if (twitterDesc) twitterDesc.setAttribute('content', route.description);

  // Canonical URL (Critical for SEO)
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', fullUrl);

  // Schema.org Structured Data (Critical for AEO - AI Engine Optimization)
  let schemaScript = document.querySelector('#schema-org-data');
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'schema-org-data';
    schemaScript.type = 'application/ld+json';
    document.head.appendChild(schemaScript);
  }

  const isHome = path === '/';
  const schemaData = isHome ? {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ToolsJar",
    "url": baseUrl,
    "description": route.description,
    "applicationCategory": "BrowserApplication",
    "operatingSystem": "All",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  } : {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": route.title.split('—')[0].trim(),
    "url": fullUrl,
    "description": route.description,
    "applicationCategory": route.category,
    "operatingSystem": "All",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  };
  
  schemaScript.textContent = JSON.stringify(schemaData);
}

function getPath() {
  return window.location.pathname || '/';
}

export function navigate(path) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
    render();
  }
}

function render() {
  const path = getPath();
  const route = routes[path] || routes['/'];
  const app = document.getElementById('app');

  updateSEO(route, path);

  app.innerHTML = '';
  app.appendChild(renderHeader(path));

  const main = document.createElement('main');
  main.className = 'main-content';
  main.setAttribute('role', 'main');
  route.render(main);
  app.appendChild(main);

  app.appendChild(renderFooter());

  // Scroll to top on navigation
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Toast notification helper
export function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// Copy to clipboard helper
export function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!');
  });
}

window.addEventListener('popstate', render);
window.addEventListener('DOMContentLoaded', () => {
  // Global click listener to intercept internal links for SPA routing
  document.body.addEventListener('click', e => {
    if (e.target.matches('a')) {
      const href = e.target.getAttribute('href');
      if (href && href.startsWith('/')) {
        e.preventDefault();
        navigate(href);
      }
    }
  });
  render();
});
