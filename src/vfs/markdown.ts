import type { CssFeature } from "./types.ts";

const browserOrder = [
	"chrome",
	"chrome_android",
	"edge",
	"firefox",
	"firefox_android",
	"safari",
	"safari_ios",
] as const;

export function featureToMarkdown(id: string, feature: CssFeature): string {
	const lines = [
		`# ${feature.name || id}`,
		"",
		feature.description || "No description available.",
		"",
		"## Baseline",
		`- Status: ${translateBaseline(feature.status.baseline)}`,
		`- baseline_low_date: ${feature.status.baseline_low_date ?? "unknown"}`,
		`- baseline_high_date: ${feature.status.baseline_high_date ?? "unknown"}`,
		"",
		"## Browser support",
		...browserSupportLines(feature),
		"",
		"## Spec links",
		...listLines(feature.spec),
		"",
		"## Caniuse links",
		...caniuseLines(feature.caniuse ?? []),
		"",
		"## Groups",
		...listLines(feature.group ?? ["misc"]),
		"",
		"## Compat features",
		...listLines(feature.compat_features ?? []),
	];

	return `${lines.join("\n")}\n`;
}

export function translateBaseline(
	baseline: CssFeature["status"]["baseline"],
): "widely" | "newly" | "limited" {
	if (baseline === "high") {
		return "widely";
	}

	if (baseline === "low") {
		return "newly";
	}

	return "limited";
}

function browserSupportLines(feature: CssFeature): string[] {
	const support = feature.status.support ?? {};
	return browserOrder.map(
		(browser) => `  ${browser}: ${support[browser] ?? "no"}`,
	);
}

function listLines(values: readonly string[]): string[] {
	if (values.length === 0) {
		return ["- none"];
	}

	return values.map((value) => `- ${value}`);
}

function caniuseLines(values: readonly string[]): string[] {
	if (values.length === 0) {
		return ["- none"];
	}

	return values.map((value) => `- https://caniuse.com/${value}`);
}
