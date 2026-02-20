/* ============================================================
   Obsidian Publish — Sidebar Toggle + Viewport Center
   ============================================================ */

(function () {
  var CONTENT_MAX_WIDTH = 680;

  // Center content visually relative to viewport
  function balanceLayout() {
    // Apply page header styles
    var pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
      pageHeader.style.fontSize = '2.2em';
      pageHeader.style.wordBreak = 'keep-all';
      pageHeader.style.overflowWrap = 'break-word';
    }

    var left = document.querySelector('.site-body-left-column');
    var md = document.querySelector('.markdown-rendered');
    if (!left || !md) return;

    var isCollapsed = document.body.classList.contains('sidebar-collapsed');
    var sidebarW = isCollapsed ? 0 : left.offsetWidth;

    if (sidebarW === 0) {
      // No sidebar: default center alignment
      md.style.marginLeft = 'auto';
      md.style.marginRight = 'auto';
      md.style.maxWidth = '780px';
    } else {
      // Sidebar visible: offset to viewport center
      var center = md.closest('.site-body-center-column');
      if (!center) return;
      var centerW = center.offsetWidth;
      var offset = Math.max(0, (centerW - CONTENT_MAX_WIDTH) / 2 - sidebarW / 2);

      md.style.maxWidth = CONTENT_MAX_WIDTH + 'px';
      md.style.marginLeft = offset + 'px';
      md.style.marginRight = 'auto';
    }
  }

  // Sync both button colors to current theme
  function syncButtonTheme() {
    var isDark = document.body.classList.contains('theme-dark');
    var bg = isDark ? '#0a0a0a' : '#ffffff';
    var color = isDark ? '#a1a1a1' : '#666666';

    var toggleBtn = document.querySelector('.sidebar-toggle-btn');
    var homeBtn = document.querySelector('.home-btn');

    if (toggleBtn) {
      toggleBtn.style.backgroundColor = bg;
      toggleBtn.style.color = color;
    }
    if (homeBtn) {
      homeBtn.style.backgroundColor = bg;
      homeBtn.style.color = color;
    }
  }

  // Watch for theme changes via body class mutation
  var themeObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.attributeName === 'class') syncButtonTheme();
    });
  });
  themeObserver.observe(document.body, { attributes: true });

  function isMobile() {
    return window.innerWidth <= 768;
  }

  // Create sidebar toggle button
  function initSidebarToggle() {
    var sidebar = document.querySelector('.site-body-left-column');
    if (!sidebar || document.querySelector('.sidebar-toggle-btn')) return;
    if (isMobile()) return;

    var btn = document.createElement('button');
    btn.className = 'sidebar-toggle-btn';
    btn.setAttribute('aria-label', 'Toggle sidebar');
    btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>';

    var header = document.querySelector('.publish-site-header');
    if (header) {
      header.appendChild(btn);
    } else {
      document.body.appendChild(btn);
    }

    // Create home button (fixed position)
    if (!document.querySelector('.home-btn')) {
      var homeBtn = document.createElement('a');
      homeBtn.className = 'home-btn';
      homeBtn.setAttribute('aria-label', 'Home');
      homeBtn.href = 'https://blog.onestn.com/home';
      homeBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';
      document.body.appendChild(homeBtn);
    }

    // Initialize button colors
    syncButtonTheme();

    // Restore saved state
    if (localStorage.getItem('sidebar-collapsed') === 'true') {
      document.body.classList.add('sidebar-collapsed');
      sidebar.style.display = 'none';
    }

    // Initial layout
    balanceLayout();

    btn.addEventListener('click', function () {
      document.body.classList.toggle('sidebar-collapsed');
      var isCollapsed = document.body.classList.contains('sidebar-collapsed');
      localStorage.setItem('sidebar-collapsed', isCollapsed);

      // Completely remove with display:none
      if (isCollapsed) {
        sidebar.style.display = 'none';
      } else {
        sidebar.style.removeProperty('display');
      }

      balanceLayout();
    });
  }

  // Recalculate on window resize
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
    document.addEventListener('DOMContentLoaded', function () {
      initSidebarToggle();
      balanceLayout();
    });
  } else {
    initSidebarToggle();
    balanceLayout();
  }

  // Handle SPA navigation
  var observer = new MutationObserver(function () {
    initSidebarToggle();
    balanceLayout();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
