# Balanced headings with text-wrap

**Replaces:** Manual `<br>` tags and copy tweaks to balance headline lines.
**Baseline:** newly — Chrome 130+, Edge 130+, Firefox 124+, Safari 17.5+.
**Falls back:** headings wrap with normal line breaking.

## HTML
```html
<header class="hero">
  <h1>Launch operational dashboards without rebuilding your data model</h1>
  <p>Connect events, accounts, and billing signals in one workspace.</p>
</header>
```

## CSS
```css
.hero {
  max-width: 48rem;
}

.hero h1 {
  font-size: clamp(2rem, 6vw, 4rem);
  line-height: 1.05;
  text-wrap: balance;
}

.hero p {
  max-width: 36rem;
  text-wrap: pretty;
}
```

## Why
The browser can choose more even line breaks for short text blocks. That keeps headings adaptable across viewport widths without hard-coded breaks.

## Caveats
Balance is best for headings and short blocks, not long paragraphs. Keep semantic text intact so unsupported browsers still receive the same content.

## Spec
https://drafts.csswg.org/css-text-4/#text-wrap-shorthand

## Tags
text-wrap, balance, pretty, headings, hero, typography, line breaks
