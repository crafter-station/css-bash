import { defineCommand } from "just-bash";
import { features } from "web-features";
import { bold, cssCyan, dim } from "../lib/output.ts";
import { isCssFeature } from "../vfs/filter.ts";
import { translateBaseline } from "../vfs/markdown.ts";
import type { CssFeature } from "../vfs/types.ts";

type CssEntry = [string, CssFeature];
type BaselineFilter = "newly" | "widely" | "limited" | "all";

const baselineFilters = ["newly", "widely", "limited", "all"] as const;

const cssEntries = Object.entries(features)
	.filter((entry): entry is CssEntry => isCssFeature(entry[1]))
	.sort(([left], [right]) => left.localeCompare(right));

const idPad = cssEntries.reduce((max, [id]) => Math.max(max, id.length), 0);

export const baselineCmd = defineCommand("baseline", async (args) => {
	const [filter] = args;

	if (!isBaselineFilter(filter)) {
		return {
			stdout: "",
			stderr: "usage: baseline <newly|widely|limited|all>\n",
			exitCode: 2,
		};
	}

	const matches =
		filter === "all"
			? cssEntries
			: cssEntries.filter(
					([, feature]) =>
						translateBaseline(feature.status.baseline) === filter,
				);

	return {
		stdout: `${matches.map(formatFeatureLine).join("\n")}\n`,
		stderr: "",
		exitCode: 0,
	};
});

function isBaselineFilter(value: string | undefined): value is BaselineFilter {
	return baselineFilters.some((filter) => filter === value);
}

function formatFeatureLine([id, feature]: CssEntry): string {
	const date = feature.status.baseline_low_date ?? "";
	const name = feature.name || id;
	const datePart = date ? `  ${cssCyan(date)}` : "";
	return `  ${bold(id.padEnd(idPad))}  ${dim(name)}${datePart}`;
}
