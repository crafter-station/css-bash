import { expect, test } from "bun:test";
import { readRecipes } from "./loader.ts";

const expectedRecipeSlugs = [
	"anchor-popover",
	"color-mix-palette",
	"field-sizing-textarea",
	"has-card-hover",
	"interpolate-size-accordion",
	"light-dark-theming",
	"property-typed-vars",
	"scope-shadow-alternative",
	"starting-style-enter",
	"text-wrap-balance-headings",
];

test("readRecipes loads the 10 curated V5 recipes", () => {
	const recipes = readRecipes();

	expect(Object.keys(recipes)).toEqual(expectedRecipeSlugs);
	expect(
		Object.fromEntries(
			expectedRecipeSlugs.map((slug) => [slug, typeof recipes[slug]]),
		),
	).toEqual({
		"anchor-popover": "string",
		"color-mix-palette": "string",
		"field-sizing-textarea": "string",
		"has-card-hover": "string",
		"interpolate-size-accordion": "string",
		"light-dark-theming": "string",
		"property-typed-vars": "string",
		"scope-shadow-alternative": "string",
		"starting-style-enter": "string",
		"text-wrap-balance-headings": "string",
	});
});
