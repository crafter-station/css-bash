import { defineCommand } from "just-bash";
import { features } from "web-features";
import { isCssFeature } from "../vfs/filter.ts";
import type { CssFeature } from "../vfs/types.ts";

type CssEntry = [string, CssFeature];

const cssEntries = Object.entries(features)
	.filter((entry): entry is CssEntry => isCssFeature(entry[1]))
	.sort(([left], [right]) => left.localeCompare(right));

export const whatsnewCmd = defineCommand("whatsnew", async (args) => {
	const currentYear = new Date().getUTCFullYear();
	const [yearArg] = args;
	const year = yearArg ?? String(currentYear);

	if (!/^\d{4}$/.test(year)) {
		return usage(currentYear);
	}

	const numericYear = Number(year);

	if (numericYear < 2020 || numericYear > 2030) {
		return usage(currentYear);
	}

	const matches = cssEntries
		.filter(([, feature]) => feature.status.baseline_low_date?.startsWith(year))
		.map(formatFeatureLine)
		.sort();

	if (matches.length === 0) {
		return {
			stdout: `(no features became baseline newly in ${year})\n`,
			stderr: "",
			exitCode: 0,
		};
	}

	return { stdout: `${matches.join("\n")}\n`, stderr: "", exitCode: 0 };
});

function usage(currentYear: number) {
	return {
		stdout: "",
		stderr: `usage: whatsnew [year]  (2020..2030, default ${currentYear})\n`,
		exitCode: 2,
	};
}

function formatFeatureLine([id, feature]: CssEntry): string {
	return `${id} — ${feature.name || id} (${feature.status.baseline_low_date})`;
}
