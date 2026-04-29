# Anchor-positioned popover (no Floating UI)

**Replaces:** Floating UI / Popper.js for simple anchored menus.
**Baseline:** limited — not Baseline in web-features; support is still incomplete across stable browsers.
**Falls back:** popover still opens, but anchor placement should be gated behind `@supports`.

## HTML
```html
<button id="account-button" popovertarget="account-menu">Account</button>

<nav id="account-menu" popover>
  <a href="/settings">Settings</a>
  <a href="/billing">Billing</a>
  <button type="button">Sign out</button>
</nav>
```

## CSS
```css
@supports (anchor-name: --account-button) {
  #account-button {
    anchor-name: --account-button;
  }

  #account-menu {
    inset: auto;
    margin: 0;
    position: fixed;
    position-anchor: --account-button;
    top: calc(anchor(bottom) + 0.5rem);
    left: anchor(left);
  }
}
```

## Why
The browser resolves the anchored geometry after layout, scrolling, and zoom. For straightforward menus and teaching UI, that removes a JavaScript positioning loop and a dependency.

## Caveats
Anchor positioning is limited today, so protect it with `@supports` and keep a readable default position. Popover accessibility still depends on using appropriate controls, labels, focus order, and dismiss behavior.

## Spec
https://drafts.csswg.org/css-anchor-position-1/#anchoring

## Tags
popover, anchor, position-anchor, floating, menu, tooltip, overlay
