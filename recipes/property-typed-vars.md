# Animatable typed variables with @property

**Replaces:** JavaScript animation plumbing for custom CSS variable values.
**Baseline:** newly — Chrome 85+, Edge 85+, Firefox 128+, Safari 16.4+.
**Falls back:** the custom property changes discretely instead of interpolating.

## HTML
```html
<button class="save-button">Save changes</button>
```

## CSS
```css
@property --glow {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 0%;
}

.save-button {
  --glow: 0%;
  background: color-mix(in oklch, #16a34a var(--glow), #14532d);
  color: white;
  padding: 0.625rem 0.875rem;
  transition: --glow 180ms ease;
}

.save-button:hover {
  --glow: 42%;
}
```

## Why
Registration gives a custom property a type, inheritance behavior, and initial value. Once typed, the browser can interpolate it like a built-in animatable property.

## Caveats
Use valid syntax descriptors or the registration is ignored. For color animation, register the driving scalar or color value and keep a static fallback declaration.

## Spec
https://drafts.css-houdini.org/css-properties-values-api-1/

## Tags
property, typed custom properties, css variables, animation, registerProperty, houdini
