# Scoped design-system widget styles with @scope

**Replaces:** CSS Modules or Shadow DOM for small design-system scoping boundaries.
**Baseline:** newly — Chrome 143+, Edge 143+, Firefox 146+, Safari 26.2+.
**Falls back:** unscoped rules can be kept outside the `@scope` block, or the scoped enhancement can be skipped.

## HTML
```html
<section class="pricing-widget">
  <h2>Team</h2>
  <p>$29 per seat</p>
  <button>Upgrade</button>
</section>
```

## CSS
```css
@scope (.pricing-widget) {
  :scope {
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    padding: 1rem;
  }

  h2 {
    margin-block: 0 0.25rem;
    font-size: 1.25rem;
  }

  button {
    background: #111827;
    color: white;
  }
}
```

## Why
The cascade gets a native boundary around a subtree, so selectors stay short without leaking into the rest of the page. That covers many widget-level scoping needs without a build step.

## Caveats
`@scope` is newly available, so check your browser target before relying on it for isolation. It scopes CSS cascade matching, not DOM, events, or JavaScript like Shadow DOM does.

## Spec
https://drafts.csswg.org/css-cascade-6/#scope-atrule

## Tags
scope, cascade, design system, component, scoping, shadow dom, css modules
