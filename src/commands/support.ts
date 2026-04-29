import { defineCommand } from "just-bash";
import { features } from "web-features";
import {
	bold,
	cssCyan,
	cssPurple,
	dim,
	gray,
	green,
	yellow,
} from "../lib/output.ts";
import { isCssFeature } from "../vfs/filter.ts";
import { translateBaseline } from "../vfs/markdown.ts";
import type { CssFeature } from "../vfs/types.ts";

const browserOrder = [
	"chrome",
	"chrome_android",
	"edge",
	"firefox",
	"firefox_android",
	"safari",
	"safari_ios",
] as const;

export const supportCmd = defineCommand("support", async (args) => {
	const [id] = args;

	if (!id) {
		return { stdout: "", stderr: "usage: support <feature-id>\n", exitCode: 2 };
	}

	const feature = features[id];

	if (!feature || !isCssFeature(feature)) {
		return { stdout: "", stderr: `unknown feature: ${id}\n`, exitCode: 1 };
	}

	return {
		stdout: formatSupport(id, feature),
		stderr: "",
		exitCode: 0,
	};
});

function formatSupport(id: string, feature: CssFeature): string {
	const baseline = translateBaseline(feature.status.baseline);
	const support = feature.status.support ?? {};
	const date = feature.status.baseline_low_date;

	const statusColored =
		baseline === "widely"
			? green(baseline)
			: baseline === "newly"
				? cssCyan(baseline)
				: yellow(baseline);

	const supportLines = browserOrder.map((browser) => {
		const version = support[browser];
		const versionStr = version ?? "—";
		const color = version ? bold : gray;
		return `    ${dim(browser.padEnd(18))}  ${color(versionStr)}`;
	});

	const header = [
		`  ${cssPurple(bold(feature.name || id))}`,
		`  ${dim("baseline:")} ${statusColored}${date ? `  ${dim(`(since ${date})`)}` : ""}`,
		"",
	];

	return `${[...header, ...supportLines, ""].join("\n")}`;
}
