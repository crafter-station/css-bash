# Runtime tints with color-mix()

**Replaces:** Sass color functions or precomputed tint variables for simple palettes.
**Baseline:** widely — Chrome 111+, Edge 111+, Firefox 113+, Safari 16.2+.
**Falls back:** declare a static color before the `color-mix()` value.

## HTML
```html
<button class="primary-action">Create invoice</button>
```

## CSS
```css
:root {
  --brand: #2563eb;
}

.primary-action {
  background: #dbeafe;
  background: color-mix(in oklch, var(--brand) 16%, white);
  border: 1px solid color-mix(in oklch, var(--brand) 45%, black);
  color: color-mix(in oklch, var(--brand) 55%, black);
  padding: 0.625rem 0.875rem;
}

.primary-action:hover {
  background: color-mix(in oklch, var(--brand) 24%, white);
}
```

## Why
The browser can derive tints and shades from a runtime color token. That lets user themes, CMS colors, and design tokens flow through without a Sass rebuild.

## Caveats
Pick a color space intentionally; `oklch` usually gives smoother perceptual steps than `srgb`. Keep contrast checks in your design review because generated tints can still fail accessibility.

## Spec
https://drafts.csswg.org/css-color-5/#color-mix

## Tags
color-mix, palette, tint, shade, oklch, design tokens, runtime colors
