import { expect, test } from "bun:test";
import { isCssFeature } from "./filter.ts";
import type { WebFeature } from "./types.ts";

test("isCssFeature accepts features with CSS compat keys", () => {
	const feature = {
		kind: "feature",
		name: ":has()",
		description: "Matches by descendants.",
		description_html: "Matches by descendants.",
		spec: ["https://example.com/spec"],
		status: {
			baseline: "low",
			baseline_low_date: "2023-12-19",
			support: {},
		},
		compat_features: ["css.selectors.has"],
	} satisfies WebFeature;

	expect(isCssFeature(feature)).toBe(true);
});

test("isCssFeature rejects non-CSS compat keys and redirects", () => {
	const htmlFeature = {
		kind: "feature",
		name: "Dialog",
		description: "Dialog element.",
		description_html: "Dialog element.",
		spec: ["https://example.com/spec"],
		status: {
			baseline: "high",
			baseline_low_date: "2022-01-01",
			baseline_high_date: "2024-07-01",
			support: {},
		},
		compat_features: ["html.elements.dialog"],
	} satisfies WebFeature;
	const movedFeature = {
		kind: "moved",
		redirect_target: "has",
	} satisfies WebFeature;

	expect(isCssFeature(htmlFeature)).toBe(false);
	expect(isCssFeature(movedFeature)).toBe(false);
});
