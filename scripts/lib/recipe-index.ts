/**
 * Map recipe slugs to the feature_id(s) they primarily showcase, plus the
 * paraphrase-style signals harvested from each recipe (title, replaces, tags).
 *
 * Recipes are hand-curated, so they are high-quality intent signals — every
 * recipe was written because someone wants to do that thing. We extract:
 *   1. The recipe title -> paraphrase
 *   2. The "Replaces:" line -> additional libs in the replaces axis
 *   3. The "Tags" line -> short keyword paraphrases
 *
 * Each recipe gets indexed under its primary feature_id from the map below.
 * The recipe file itself stays at /css/_recipes/{slug}.md and is unaffected.
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const RECIPES_DIR = join(new URL("../..", import.meta.url).pathname, "recipes");

/**
 * Recipe slug → primary feature_id in web-features. When a recipe demonstrates
 * multiple features, list them all and we will index against each.
 */
export const RECIPE_TO_FEATURES: Record<string, string[]> = {
	"anchor-popover": ["anchor-positioning", "popover"],
	"color-mix-palette": ["color-mix"],
	"field-sizing-textarea": ["field-sizing"],
	"has-card-hover": ["has"],
	"interpolate-size-accordion": ["interpolate-size"],
	"light-dark-theming": ["light-dark"],
	"property-typed-vars": ["registered-custom-properties"],
	"scope-shadow-alternative": ["scope"],
	"starting-style-enter": ["starting-style"],
	"text-wrap-balance-headings": ["text-wrap-balance"],
};

export interface RecipeSignals {
	slug: string;
	title: string;
	replaces: string[];
	tags: string[];
	featureIds: string[];
}

export async function loadRecipeSignals(): Promise<RecipeSignals[]> {
	const files = await readdir(RECIPES_DIR);
	const signals: RecipeSignals[] = [];
	for (const f of files) {
		if (!f.endsWith(".md")) continue;
		const slug = f.replace(/\.md$/, "");
		const content = await readFile(join(RECIPES_DIR, f), "utf-8");
		signals.push(parseRecipe(slug, content));
	}
	return signals;
}

function parseRecipe(slug: string, content: string): RecipeSignals {
	const title = content.match(/^# (.+)$/m)?.[1]?.trim() ?? slug;
	// "**Replaces:** Floating UI / Popper.js for simple anchored menus."
	const replacesLine =
		content.match(/^\*\*Replaces:\*\*\s*(.+)$/m)?.[1]?.trim() ?? "";
	// "## Tags\npopover, anchor, position-anchor, floating, menu, tooltip"
	const tagsBlock = content.match(/^##\s+Tags\s*\n(.+)$/m)?.[1]?.trim() ?? "";

	const replaces = parseReplaces(replacesLine);
	const tags = tagsBlock
		.split(",")
		.map((t) => t.trim().toLowerCase())
		.filter(Boolean);
	const featureIds = RECIPE_TO_FEATURES[slug] ?? [];

	return { slug, title, replaces, tags, featureIds };
}

function parseReplaces(line: string): string[] {
	if (!line) return [];
	// Pull lib names — match anything word-shaped including dots and dashes,
	// then drop common stopwords, lowercase, dedupe.
	const tokens = line
		.split(/[/,;]+|\s+for\s+|\s+and\s+|\s+or\s+/i)
		.map((t) => t.trim().toLowerCase())
		.filter((t) => /^[a-z][a-z0-9.\-_]+$/i.test(t))
		.filter((t) => !STOPWORDS.has(t));
	return Array.from(new Set(tokens));
}

const STOPWORDS = new Set([
	"the",
	"a",
	"an",
	"simple",
	"anchored",
	"menus",
	"animations",
	"styling",
	"javascript",
	"manual",
	"positioning",
	"with",
	"css",
	"based",
	"fallback",
]);
