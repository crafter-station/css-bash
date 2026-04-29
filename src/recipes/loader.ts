import { readdirSync, readFileSync } from "node:fs";

const recipesDir = new URL("../../recipes/", import.meta.url);

export function readRecipes(): Record<string, string> {
	const entries = readdirSync(recipesDir, { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
		.sort((left, right) => left.name.localeCompare(right.name));

	return Object.fromEntries(
		entries.map((entry) => {
			const slug = entry.name.slice(0, -".md".length);
			const content = readFileSync(new URL(entry.name, recipesDir), "utf8");
			return [slug, content];
		}),
	);
}
