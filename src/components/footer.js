export function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="footer-inner" style="display: flex; flex-direction: column; align-items: center; gap: 1.5rem;">
      <div class="footer-about" style="max-width: 600px; text-align: center;">
        <h4 style="color: var(--text); margin-bottom: 0.5rem; font-weight: 600;">About ToolsJar</h4>
        <p class="footer-text" style="line-height: 1.5;">
          ToolsJar is a collection of high-quality, completely free online utilities. 
          We believe in privacy first, which is why every tool runs 100% in your browser—meaning your files and data never leave your device.
        </p>
      </div>
      <div style="width: 100%; height: 1px; background: rgba(255,255,255,0.1);"></div>
      <div>
        <ul class="footer-links" style="justify-content: center; margin-bottom: 1rem;">
          <li><a href="/">Home</a></li>
          <li><a href="/image-compressor">Tools</a></li>
        </ul>
        <p class="footer-text">© ${new Date().getFullYear()} ToolsJar. All rights reserved.</p>
      </div>
    </div>
  `;
  return footer;
}
