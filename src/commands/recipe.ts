import { defineCommand } from "just-bash";
import { bold, cssCyan, dim } from "../lib/output.ts";
import { readRecipes } from "../recipes/loader.ts";

const recipes = readRecipes();

export const recipeCmd = defineCommand("recipe", async (args) => {
	const pattern = args.join(" ").trim();

	if (!pattern) {
		return { stdout: "", stderr: "usage: recipe <pattern>\n", exitCode: 2 };
	}

	const lower = pattern.toLowerCase();
	const matches = Object.entries(recipes)
		.filter(([slug, content]) => recipeMatches(slug, content, lower))
		.map(([slug, content]) => {
			const title = extractTitle(content) ?? slug;
			const path = `/css/_recipes/${slug}.md`;
			return `  ${cssCyan(path)}\n    ${bold(title)}`;
		});

	if (matches.length === 0) {
		return {
			stdout: `${dim(`(no recipes matching "${pattern}")`)}\n`,
			stderr: "",
			exitCode: 0,
		};
	}

	return { stdout: `${matches.join("\n")}\n`, stderr: "", exitCode: 0 };
});

function recipeMatches(
	slug: string,
	content: string,
	pattern: string,
): boolean {
	const title = extractTitle(content)?.toLowerCase() ?? "";
	const tags = content.match(/^## Tags\s*\n(.+)$/m)?.[1].toLowerCase() ?? "";

	return (
		slug.includes(pattern) || title.includes(pattern) || tags.includes(pattern)
	);
}

function extractTitle(content: string): string | undefined {
	return content.match(/^# (.+)$/m)?.[1];
}
