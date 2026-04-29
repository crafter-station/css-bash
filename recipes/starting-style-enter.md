# Top-layer enter animation with @starting-style

**Replaces:** Framer Motion or manual first-frame classes for simple popover and dialog enter animations.
**Baseline:** newly — Chrome 117+, Edge 117+, Firefox 129+, Safari 17.5+.
**Falls back:** the popover appears without the first-frame transition.

## HTML
```html
<button popovertarget="notice">Show notice</button>

<div id="notice" popover>
  <p>Your export is ready.</p>
  <button popovertarget="notice">Close</button>
</div>
```

## CSS
```css
#notice {
  opacity: 0;
  transform: translateY(0.5rem);
  transition: opacity 180ms ease, transform 180ms ease, overlay 180ms allow-discrete, display 180ms allow-discrete;
}

#notice:popover-open {
  opacity: 1;
  transform: translateY(0);
}

@starting-style {
  #notice:popover-open {
    opacity: 0;
    transform: translateY(0.5rem);
  }
}
```

## Why
The browser now has a declared before-change style for elements that were not rendered. You can animate into the top layer without adding a temporary JavaScript class.

## Caveats
Use short motion and respect reduced-motion preferences in production. Exit animation for top-layer elements may also need `overlay`, `display`, and `allow-discrete` depending on the pattern.

## Spec
https://drafts.csswg.org/css-transitions-2/#defining-before-change-style

## Tags
starting-style, dialog, enter animation, transition, top layer
