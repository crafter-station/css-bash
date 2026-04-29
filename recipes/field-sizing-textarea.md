# Auto-growing textareas with field-sizing

**Replaces:** JavaScript textarea auto-grow measurement code.
**Baseline:** limited — Chrome 123+, Edge 123+, Safari 26.2+; Firefox support is not listed in web-features.
**Falls back:** textarea keeps its default fixed field sizing.

## HTML
```html
<label class="message-field">
  Message
  <textarea rows="2" placeholder="Write the update"></textarea>
</label>
```

## CSS
```css
.message-field {
  display: grid;
  gap: 0.5rem;
  max-width: 32rem;
}

.message-field textarea {
  field-sizing: content;
  max-block-size: 16rem;
  min-block-size: 4rem;
  resize: vertical;
}
```

## Why
The form control can size itself from its contents, so you do not need scrollHeight reads or input handlers. The browser keeps selection, IME, and platform textarea behavior intact.

## Caveats
Set a max block size so long content does not push the whole page too far. Keep manual resize enabled when that fits the product.

## Spec
https://drafts.csswg.org/css-forms-1/#field-sizing

## Tags
field-sizing, textarea, auto-grow, forms, content sizing, input
