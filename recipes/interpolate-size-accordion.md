# Auto-height accordion with interpolate-size

**Replaces:** JavaScript height measurement for `auto` accordion transitions.
**Baseline:** limited — Chrome 129+ and Edge 129+; Firefox and Safari support is not listed in web-features.
**Falls back:** details opens and closes without animating intrinsic height.

## HTML
```html
<section class="faq">
  <details>
    <summary>Can I export the report?</summary>
    <p>Yes. Reports can be exported as CSV or shared with a signed link.</p>
  </details>
</section>
```

## CSS
```css
:root {
  interpolate-size: allow-keywords;
}

.faq details::details-content {
  block-size: 0;
  overflow: clip;
  transition: block-size 220ms ease;
}

.faq details[open]::details-content {
  block-size: auto;
}
```

## Why
The browser can interpolate between a length and an intrinsic keyword such as `auto`. That removes the common measure, set pixel height, animate, then cleanup cycle.

## Caveats
Support is limited, so the non-animated details behavior must be acceptable. Keep the native `summary` control so keyboard and screen-reader behavior remains intact.

## Spec
https://drafts.csswg.org/css-values-5/#interpolate-size

## Tags
interpolate-size, accordion, details, auto height, intrinsic size, transition
