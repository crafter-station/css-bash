import { expect, test } from "bun:test";
import { featureToMarkdown, translateBaseline } from "./markdown.ts";
import type { CssFeature } from "./types.ts";

const feature = {
	kind: "feature",
	name: ":has()",
	description:
		"The :has() CSS functional pseudo-class matches an element by descendants.",
	description_html:
		"The <code>:has()</code> CSS functional pseudo-class matches an element by descendants.",
	spec: ["https://drafts.csswg.org/selectors-4/#relational"],
	status: {
		baseline: "low",
		baseline_low_date: "2023-12-19",
		support: {
			chrome: "105",
			firefox: "121",
			safari: "15.4",
		},
	},
	caniuse: ["css-has"],
	compat_features: ["css.selectors.has"],
	group: ["selectors"],
} satisfies CssFeature;

test("featureToMarkdown renders the full feature document", () => {
	expect(featureToMarkdown("has", feature)).toBe(`# :has()

The :has() CSS functional pseudo-class matches an element by descendants.

## Baseline
- Status: newly
- baseline_low_date: 2023-12-19
- baseline_high_date: unknown

## Browser support
  chrome: 105
  chrome_android: no
  edge: no
  firefox: 121
  firefox_android: no
  safari: 15.4
  safari_ios: no

## Spec links
- https://drafts.csswg.org/selectors-4/#relational

## Caniuse links
- https://caniuse.com/css-has

## Groups
- selectors

## Compat features
- css.selectors.has
`);
});

test("translateBaseline maps web-features statuses to css-bash labels", () => {
	expect(translateBaseline("high")).toBe("widely");
	expect(translateBaseline("low")).toBe("newly");
	expect(translateBaseline(false)).toBe("limited");
});
