# Obsidian Publish — Vercel-inspired Theme

A clean, minimal dark/light theme for [Obsidian Publish](https://obsidian.md/publish), inspired by [Vercel's](https://vercel.com) design system.

🔗 **Live Demo:** [blog.onestn.com](https://blog.onestn.com)

## Features

- **Vercel-style design** — Clean typography, layered dark backgrounds, subtle borders
- **Font stack** — Pretendard (한글) + Geist Sans (headings) + JetBrains Mono (code)
- **Dark / Light mode** — Full CSS variable system with smooth transitions
- **Sidebar toggle** — Collapsible sidebar with viewport-centered content rebalancing
- **Home button** — Fixed navigation button above sidebar toggle
- **Mermaid support** — Horizontal scroll + 80% scale for large diagrams
- **Mobile-friendly** — Toggle/home buttons hidden on mobile (≤768px)
- **Hidden scrollbar** — Clean look with scroll functionality preserved

## Installation

1. Copy `publish.css` and `publish.js` to your Obsidian vault root
2. Open Obsidian → **Settings** → **Publish** plugin
3. Include both files when publishing
4. **Important:** `publish.js` requires a [custom domain](https://help.obsidian.md/Obsidian+Publish/Set+up+a+custom+domain)

## File Structure

```
your-vault/
├── publish.css    # Theme styles
├── publish.js     # Sidebar toggle + layout balancing + home button
└── ...
```

## Customization

### Colors

Edit CSS variables in `.theme-dark` / `.theme-light` sections of `publish.css`:

```css
.theme-dark {
  --background-primary: #0a0a0a;
  --text-accent: #0070f3;
  /* ... */
}
```

### Content Width

In `publish.js`, adjust `CONTENT_MAX_WIDTH`:

```javascript
var CONTENT_MAX_WIDTH = 680; // default
```

### Home Button URL

In `publish.js`, update the href:

```javascript
homeBtn.href = 'https://your-domain.com/home';
```

## Tech Notes

- Sidebar uses `display: none` instead of `width: 0` (Obsidian Publish's flex layout overrides width)
- Layout balancing is handled via JS (`margin-left` offset calculation) since CSS approaches are overridden by Publish defaults
- Button colors are synced via `MutationObserver` watching body class changes for theme toggle
- `localStorage` persists sidebar state across page reloads

## License

MIT
