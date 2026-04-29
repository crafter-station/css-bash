import { defineCommand } from "just-bash";
import { features } from "web-features";
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
	const supportLines = browserOrder.map(
		(browser) => `${browser.padEnd(20)} ${support[browser] ?? "no"}`,
	);

	return [
		feature.name || id,
		`baseline: ${feature.status.baseline} (${baseline})`,
		"",
		...supportLines,
		"",
	].join("\n");
}
