/* ============================================================
   Obsidian Publish — Sidebar Toggle + Viewport Center
   ============================================================ */

(function () {
  const CONTENT_MAX_WIDTH = 680;
  const HOME_URL = 'https://blog.onestn.com/home';
  const HIGHLIGHT_RE = /[ \t]*(?:\/\/|#|\/\*|<!--)[ \t]*\[!(?:blue|red|green)?\][ \t]*(?:\*\/|-->)?/g;
  const HIGHLIGHT_DETECT = /\[!(blue|red|green)?\]/;

  function processCodeBlocks() {
    document.querySelectorAll('.markdown-rendered pre:not(.frontmatter):not([data-processed])').forEach((pre) => {
      const code = pre.querySelector('code');
      if (!code) return;
      if (/language-mermaid/.test(code.className)) return;
      pre.setAttribute('data-processed', 'true');

      // Language header — outside pre to avoid overflow:hidden clipping
      const match = code.className.match(/language-(\w+)/);
      if (match) {
        const blockWrapper = document.createElement('div');
        blockWrapper.className = 'code-block-wrapper';

        const langHeader = document.createElement('div');
        langHeader.className = 'code-lang-header';
        langHeader.textContent = match[1];

        const copyBtn = pre.querySelector('.copy-code-button');
        if (copyBtn) langHeader.appendChild(copyBtn);

        pre.parentNode.insertBefore(blockWrapper, pre);
        blockWrapper.appendChild(langHeader);
        blockWrapper.appendChild(pre);

        pre.style.borderTop = 'none';
        pre.style.borderRadius = '0 0 8px 8px';
      }

      // Detect highlight markers
      const textLines = code.textContent.split('\n');
      while (textLines.length > 0 && textLines[textLines.length - 1].trim() === '') {
        textLines.pop();
      }
      const highlightLines = [];
      textLines.forEach((line, i) => {
        const hm = line.match(HIGHLIGHT_DETECT);
        if (hm) {
          highlightLines.push({ line: i, color: hm[1] || 'blue' });
        }
      });

      // Remove markers from innerHTML
      if (highlightLines.length > 0) {
        code.innerHTML = code.innerHTML.replace(HIGHLIGHT_RE, '');
      }

      // Recalculate clean lines
      const cleanLines = code.textContent.split('\n');
      while (cleanLines.length > 0 && cleanLines[cleanLines.length - 1].trim() === '') {
        cleanLines.pop();
      }

      // Build highlight lookup
      const highlightMap = {};
      highlightLines.forEach((h) => { highlightMap[h.line] = h.color; });

      // Line numbers gutter
      const gutter = document.createElement('div');
      gutter.className = 'line-numbers-gutter';
      gutter.innerHTML = cleanLines.map((_, i) => {
        const cls = highlightMap[i] ? ' highlighted hl-' + highlightMap[i] : '';
        return '<span class="' + cls + '">' + (i + 1) + '</span>';
      }).join('');

      // Flex container: gutter + code content
      const wrapper = document.createElement('div');
      wrapper.className = 'code-content-wrapper';
      wrapper.appendChild(gutter);

      const codeWrap = document.createElement('div');
      codeWrap.className = 'code-content';
      pre.removeChild(code);
      codeWrap.appendChild(code);
      wrapper.appendChild(codeWrap);
      pre.appendChild(wrapper);

      // Highlight lines by wrapping ALL lines in divs (block layout)
      if (highlightLines.length > 0) {
        const htmlLines = code.innerHTML.split('\n');
        if (htmlLines.length > 0 && htmlLines[htmlLines.length - 1] === '') {
          htmlLines.pop();
        }
        code.innerHTML = htmlLines.map((line, i) => {
          const hlColor = highlightMap[i];
          if (hlColor) {
            return '<div class="code-line code-line-highlight hl-' + hlColor + '">' + (line || '\u200b') + '</div>';
          }
          return '<div class="code-line">' + (line || '\u200b') + '</div>';
        }).join('');
      }
    });
  }

  function balanceLayout() {
    processCodeBlocks();

    const left = document.querySelector('.site-body-left-column');
    const md = document.querySelector('.markdown-rendered');
    const sizer = md?.querySelector('.markdown-preview-sizer');
    if (!left || !md || !sizer) return;

    const isCollapsed = document.body.classList.contains('sidebar-collapsed');
    const sidebarW = isCollapsed ? 0 : left.offsetWidth;

    if (sidebarW === 0) {
      const expandedWidth = Math.round((window.innerWidth + 780) / 2);
      md.style.maxWidth = 'none';
      md.style.marginLeft = 'auto';
      md.style.marginRight = 'auto';
      sizer.style.maxWidth = expandedWidth + 'px';
      sizer.style.marginLeft = 'auto';
      sizer.style.marginRight = 'auto';
    } else {
      const center = md.closest('.site-body-center-column');
      if (!center) return;
      const centerW = center.offsetWidth;
      const offset = Math.max(0, (centerW - CONTENT_MAX_WIDTH) / 2 - sidebarW / 2);

      sizer.style.maxWidth = CONTENT_MAX_WIDTH + 'px';
      sizer.style.marginLeft = offset + 'px';
      sizer.style.marginRight = 'auto';
      md.style.maxWidth = 'none';
      md.style.marginLeft = '0';
      md.style.marginRight = '0';
    }
  }

  // Theme sync for buttons
  function syncButtonTheme() {
    const styles = getComputedStyle(document.body);
    const bg = styles.getPropertyValue('--background-primary').trim();
    const color = styles.getPropertyValue('--text-muted').trim();

    const toggleBtn = document.querySelector('.sidebar-toggle-btn');
    const homeBtn = document.querySelector('.home-btn');

    if (toggleBtn) { toggleBtn.style.backgroundColor = bg; toggleBtn.style.color = color; }
    if (homeBtn) { homeBtn.style.backgroundColor = bg; homeBtn.style.color = color; }
  }

  // Watch theme changes
  new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      if (m.attributeName === 'class') syncButtonTheme();
    });
  }).observe(document.body, { attributes: true });

  function isMobile() { return window.innerWidth <= 768; }

  function initSidebarToggle() {
    const sidebar = document.querySelector('.site-body-left-column');
    if (!sidebar || document.querySelector('.sidebar-toggle-btn')) return;
    if (isMobile()) return;

    // Toggle button
    const btn = document.createElement('button');
    btn.className = 'sidebar-toggle-btn';
    btn.setAttribute('aria-label', 'Toggle sidebar');
    btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>';

    const header = document.querySelector('.publish-site-header');
    (header || document.body).appendChild(btn);

    // Home button
    if (!document.querySelector('.home-btn')) {
      const homeBtn = document.createElement('a');
      homeBtn.className = 'home-btn';
      homeBtn.setAttribute('aria-label', 'Home');
      homeBtn.href = HOME_URL;
      homeBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';
      document.body.appendChild(homeBtn);
    }

    syncButtonTheme();

    // Restore saved state
    if (localStorage.getItem('sidebar-collapsed') === 'true') {
      document.body.classList.add('sidebar-collapsed');
      sidebar.style.display = 'none';
    }

    balanceLayout();

    btn.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-collapsed');
      const collapsed = document.body.classList.contains('sidebar-collapsed');
      localStorage.setItem('sidebar-collapsed', collapsed);
      sidebar.style.display = collapsed ? 'none' : '';
      balanceLayout();
    });
  }

  window.addEventListener('resize', balanceLayout);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initSidebarToggle(); balanceLayout(); });
  } else {
    initSidebarToggle();
    balanceLayout();
  }

  // SPA navigation (debounced)
  let debounceTimer = null;
  new MutationObserver(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      initSidebarToggle();
      balanceLayout();
    }, 100);
  }).observe(document.body, { childList: true, subtree: true });
})();
