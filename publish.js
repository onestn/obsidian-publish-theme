/* ============================================================
   Obsidian Publish — Sidebar Toggle + Viewport Center
   ============================================================ */

(function () {
  var CONTENT_MAX_WIDTH = 680;

  function balanceLayout() {
    // Page header styles
    var pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
      pageHeader.style.fontSize = '2.2em';
      pageHeader.style.wordBreak = 'keep-all';
      pageHeader.style.overflowWrap = 'break-word';
    }

    // Code block processing
    var HIGHLIGHT_RE = /[ \t]*(?:\/\/|#|\/\*|<!--)[ \t]*\[!(?:blue|red|green)?\][ \t]*(?:\*\/|-->)?/g;
    var HIGHLIGHT_DETECT = /\[!(blue|red|green)?\]/;

    document.querySelectorAll('.markdown-rendered pre:not(.frontmatter):not([data-processed])').forEach(function (pre) {
      var code = pre.querySelector('code');
      if (!code) return;
      if (/language-mermaid/.test(code.className)) return;
      pre.setAttribute('data-processed', 'true');

      // Language header — outside pre to avoid overflow:hidden clipping
      var match = code.className.match(/language-(\w+)/);
      if (match) {
        var blockWrapper = document.createElement('div');
        blockWrapper.className = 'code-block-wrapper';

        var langHeader = document.createElement('div');
        langHeader.className = 'code-lang-header';
        langHeader.textContent = match[1];

        var copyBtn = pre.querySelector('.copy-code-button');
        if (copyBtn) {
          copyBtn.style.cssText = 'position:static;margin-left:auto;flex-shrink:0;';
          langHeader.appendChild(copyBtn);
        }

        pre.parentNode.insertBefore(blockWrapper, pre);
        blockWrapper.appendChild(langHeader);
        blockWrapper.appendChild(pre);

        pre.style.borderTop = 'none';
        pre.style.borderRadius = '0 0 8px 8px';
      }

      // Detect highlight markers
      var textLines = code.textContent.split('\n');
      while (textLines.length > 0 && textLines[textLines.length - 1].trim() === '') {
        textLines.pop();
      }
      var highlightLines = [];
      textLines.forEach(function (line, i) {
        var hm = line.match(HIGHLIGHT_DETECT);
        if (hm) {
          highlightLines.push({ line: i, color: hm[1] || 'blue' });
        }
      });

      // Remove markers from innerHTML (preserve line breaks)
      if (highlightLines.length > 0) {
        code.innerHTML = code.innerHTML.replace(HIGHLIGHT_RE, '');
      }

      // Recalculate clean lines
      var cleanLines = code.textContent.split('\n');
      while (cleanLines.length > 0 && cleanLines[cleanLines.length - 1].trim() === '') {
        cleanLines.pop();
      }

      // Line numbers gutter
      var gutter = document.createElement('div');
      gutter.className = 'line-numbers-gutter';
      var highlightMap = {};
      highlightLines.forEach(function (h) { highlightMap[h.line] = h.color; });
      gutter.innerHTML = cleanLines.map(function (_, i) {
        var cls = highlightMap[i] ? ' highlighted hl-' + highlightMap[i] : '';
        return '<span class="' + cls + '">' + (i + 1) + '</span>';
      }).join('\n');

      // Flex container: gutter + code content
      var wrapper = document.createElement('div');
      wrapper.className = 'code-content-wrapper';
      wrapper.appendChild(gutter);

      var codeWrap = document.createElement('div');
      codeWrap.className = 'code-content';
      pre.removeChild(code);
      codeWrap.appendChild(code);
      wrapper.appendChild(codeWrap);
      pre.appendChild(wrapper);

      // Highlight overlays
      if (highlightLines.length > 0) {
        var lineHeight = parseFloat(getComputedStyle(code).lineHeight) || 23;
        var paddingTop = parseFloat(getComputedStyle(code).paddingTop) || 16;

        highlightLines.forEach(function (h) {
          var overlay = document.createElement('div');
          overlay.className = 'code-line-highlight hl-' + h.color;
          overlay.style.top = (paddingTop + h.line * lineHeight) + 'px';
          overlay.style.height = lineHeight + 'px';
          wrapper.appendChild(overlay);
        });
      }
    });

    // Layout balancing
    var left = document.querySelector('.site-body-left-column');
    var md = document.querySelector('.markdown-rendered');
    var sizer = md?.querySelector('.markdown-preview-sizer');
    if (!left || !md || !sizer) return;

    var isCollapsed = document.body.classList.contains('sidebar-collapsed');
    var sidebarW = isCollapsed ? 0 : left.offsetWidth;

    if (sidebarW === 0) {
      var expandedWidth = Math.round((window.innerWidth + 780) / 2);
      md.style.maxWidth = 'none';
      md.style.marginLeft = 'auto';
      md.style.marginRight = 'auto';
      sizer.style.maxWidth = expandedWidth + 'px';
      sizer.style.marginLeft = 'auto';
      sizer.style.marginRight = 'auto';
    } else {
      var center = md.closest('.site-body-center-column');
      if (!center) return;
      var centerW = center.offsetWidth;
      var offset = Math.max(0, (centerW - CONTENT_MAX_WIDTH) / 2 - sidebarW / 2);

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
    var isDark = document.body.classList.contains('theme-dark');
    var bg = isDark ? '#2a2a2a' : '#ffffff';
    var color = isDark ? '#a1a1a1' : '#666666';

    var toggleBtn = document.querySelector('.sidebar-toggle-btn');
    var homeBtn = document.querySelector('.home-btn');

    if (toggleBtn) { toggleBtn.style.backgroundColor = bg; toggleBtn.style.color = color; }
    if (homeBtn) { homeBtn.style.backgroundColor = bg; homeBtn.style.color = color; }
  }

  // Watch theme changes
  new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.attributeName === 'class') syncButtonTheme();
    });
  }).observe(document.body, { attributes: true });

  function isMobile() { return window.innerWidth <= 768; }

  function initSidebarToggle() {
    var sidebar = document.querySelector('.site-body-left-column');
    if (!sidebar || document.querySelector('.sidebar-toggle-btn')) return;
    if (isMobile()) return;

    // Toggle button
    var btn = document.createElement('button');
    btn.className = 'sidebar-toggle-btn';
    btn.setAttribute('aria-label', 'Toggle sidebar');
    btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>';

    var header = document.querySelector('.publish-site-header');
    (header || document.body).appendChild(btn);

    // Home button
    if (!document.querySelector('.home-btn')) {
      var homeBtn = document.createElement('a');
      homeBtn.className = 'home-btn';
      homeBtn.setAttribute('aria-label', 'Home');
      homeBtn.href = 'https://blog.onestn.com/home';
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

    btn.addEventListener('click', function () {
      document.body.classList.toggle('sidebar-collapsed');
      var isCollapsed = document.body.classList.contains('sidebar-collapsed');
      localStorage.setItem('sidebar-collapsed', isCollapsed);
      sidebar.style.display = isCollapsed ? 'none' : '';
      balanceLayout();
    });
  }

  window.addEventListener('resize', function () {
    balanceLayout();
    if (isMobile()) {
      var tb = document.querySelector('.sidebar-toggle-btn');
      var hb = document.querySelector('.home-btn');
      if (tb) tb.remove();
      if (hb) hb.remove();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initSidebarToggle(); balanceLayout(); });
  } else {
    initSidebarToggle();
    balanceLayout();
  }

  // SPA navigation
  new MutationObserver(function () { initSidebarToggle(); balanceLayout(); })
    .observe(document.body, { childList: true, subtree: true });
})();
