# Card hover sibling reactivity with :has()

**Replaces:** JS hover state hooks for dimming sibling cards.
**Baseline:** newly — Chrome 105+, Edge 105+, Firefox 121+, Safari 15.4+.
**Falls back:** cards stay fully opaque when `:has()` is unsupported.

## HTML
```html
<div class="cards">
  <article class="card">
    <h2>Analytics</h2>
    <p>Usage, retention, and revenue signals.</p>
  </article>
  <article class="card">
    <h2>Automation</h2>
    <p>Rules that run without a dashboard.</p>
  </article>
  <article class="card">
    <h2>Billing</h2>
    <p>Invoices, credits, and plan changes.</p>
  </article>
</div>
```

## CSS
```css
.cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
}

.card {
  border: 1px solid #d4d4d8;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: opacity 160ms ease, transform 160ms ease;
}

.cards:has(.card:hover) .card:not(:hover) {
  opacity: 0.45;
}

.card:hover {
  transform: translateY(-2px);
}
```

## Why
The parent can react to a hovered child, so the browser handles the sibling state graph. You avoid wiring mouseenter and mouseleave listeners just to style related elements.

## Caveats
Hover-only affordances do not help touch users, so keep the card content usable without hover. Pair hover styling with focus-visible rules when cards contain links or buttons.

## Spec
https://drafts.csswg.org/selectors-4/#relational

## Tags
has, selector, hover, cards, siblings, reactivity, parent selector
