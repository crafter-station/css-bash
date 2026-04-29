# System-aware theming with light-dark()

**Replaces:** `[data-theme]` attribute swaps for simple light and dark color pairs.
**Baseline:** newly — Chrome 123+, Edge 123+, Firefox 120+, Safari 17.5+.
**Falls back:** declare a normal color before the `light-dark()` value.

## HTML
```html
<article class="panel">
  <h2>Deployment ready</h2>
  <p>The build passed checks and can be promoted.</p>
</article>
```

## CSS
```css
:root {
  color-scheme: light dark;
}

.panel {
  background: #ffffff;
  background: light-dark(#ffffff, #111827);
  border: 1px solid light-dark(#d4d4d8, #374151);
  color: light-dark(#111827, #f9fafb);
  padding: 1rem;
}
```

## Why
The browser resolves the right color from the active color scheme. For simple theming, that means fewer custom properties and no JavaScript theme bootstrap.

## Caveats
Set `color-scheme` so form controls and system colors follow the same intent. Product-level manual theme overrides may still need attributes or classes.

## Spec
https://drafts.csswg.org/css-color-5/#light-dark

## Tags
light-dark, theming, dark mode, color-scheme, colors, system theme
