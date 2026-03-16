export function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="footer-inner">
      <p class="footer-text">© ${new Date().getFullYear()} ToolsJar. All tools run in your browser — your data never leaves your device.</p>
      <ul class="footer-links">
        <li><a href="#/">Home</a></li>
        <li><a href="#/image-compressor">Tools</a></li>
      </ul>
    </div>
  `;
  return footer;
}
