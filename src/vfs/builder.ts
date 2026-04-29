import { features } from "web-features";
import { isCssFeature } from "./filter.ts";
import { featureToMarkdown, translateBaseline } from "./markdown.ts";
import type { CssFeature } from "./types.ts";

type CssEntry = [string, CssFeature];

const baselineKinds = ["newly", "widely", "limited"] as const;
const years = ["2023", "2024", "2025", "2026"] as const;

export function buildVfs(): Record<string, string> {
	const out: Record<string, string> = {};
	const cssEntries = getCssEntries();

	for (const [id, feature] of cssEntries) {
		for (const group of groupsForFeature(feature)) {
			out[`/css/${group}/${id}.md`] = featureToMarkdown(id, feature);
		}
	}

	for (const baseline of baselineKinds) {
		out[`/css/_baseline/${baseline}.md`] = buildBaselineIndex(
			baseline,
			cssEntries,
		);
	}

	for (const year of years) {
		out[`/css/_year/${year}.md`] = buildYearIndex(year, cssEntries);
	}

	out["/css/README.md"] = buildReadme(cssEntries);

	return out;
}

function getCssEntries(): CssEntry[] {
	return Object.entries(features)
		.filter((entry): entry is CssEntry => isCssFeature(entry[1]))
		.sort(([left], [right]) => left.localeCompare(right));
}

function groupsForFeature(feature: CssFeature): string[] {
	const groups = feature.group?.length ? feature.group : ["misc"];
	return [...new Set(groups)];
}

function buildReadme(entries: CssEntry[]): string {
	const groups = [
		...new Set(entries.flatMap(([, feature]) => groupsForFeature(feature))),
	]
		.sort((left, right) => left.localeCompare(right))
		.map((group) => `- /css/${group}/`);

	const counts = baselineKinds.map((baseline) => {
		const count = entries.filter(
			([, feature]) => translateBaseline(feature.status.baseline) === baseline,
		).length;
		return `- ${baseline}: ${count}`;
	});

	return [
		"# css-bash",
		"",
		`Modern CSS catalog with ${entries.length} CSS features from web-features.`,
		"",
		"## Baseline indexes",
		...counts,
		"",
		"## Year indexes",
		...years.map((year) => `- /css/_year/${year}.md`),
		"",
		"## Groups",
		...groups,
		"",
	].join("\n");
}

function buildBaselineIndex(
	baseline: (typeof baselineKinds)[number],
	entries: CssEntry[],
): string {
	const matchingEntries = entries
		.filter(
			([, feature]) => translateBaseline(feature.status.baseline) === baseline,
		)
		.sort(compareByBaselineLowDateDesc);

	return buildIndex(`Baseline ${baseline}`, matchingEntries);
}

function buildYearIndex(year: string, entries: CssEntry[]): string {
	const matchingEntries = entries
		.filter(([, feature]) => feature.status.baseline_low_date?.startsWith(year))
		.sort(compareByBaselineLowDateDesc);

	return buildIndex(`Baseline newly in ${year}`, matchingEntries);
}

function buildIndex(title: string, entries: CssEntry[]): string {
	const lines = entries.map(([id, feature]) => {
		const group = groupsForFeature(feature)[0] ?? "misc";
		const date = feature.status.baseline_low_date ?? "unknown";
		return `- ${date} [${feature.name || id}](/css/${group}/${id}.md)`;
	});

	return [`# ${title}`, "", ...lines, ""].join("\n");
}

function compareByBaselineLowDateDesc(
	[, leftFeature]: CssEntry,
	[, rightFeature]: CssEntry,
): number {
	const leftDate = leftFeature.status.baseline_low_date ?? "";
	const rightDate = rightFeature.status.baseline_low_date ?? "";
	const dateOrder = rightDate.localeCompare(leftDate);

	if (dateOrder !== 0) {
		return dateOrder;
	}

	return leftFeature.name.localeCompare(rightFeature.name);
}
