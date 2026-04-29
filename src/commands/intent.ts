import { defineCommand } from "just-bash";
import MiniSearch from "minisearch";
import indexData from "../../data/intent-index.json" with { type: "json" };
import intentsData from "../../data/intents.json" with { type: "json" };
import {
	amber,
	bold,
	cssCyan,
	dim,
	green,
	sky,
	yellow,
} from "../lib/output.ts";

interface Doc {
	id: string;
	feature_id: string;
	text: string;
	kind: "name" | "paraphrase" | "replaces";
	replaces: string;
}

interface FeatureLookup {
	name: string;
	baseline: string;
	paraphrases: string[];
	replaces: string[];
	path?: string;
}

const lookup = intentsData as Record<string, FeatureLookup>;

const search = MiniSearch.loadJSON<Doc>(JSON.stringify(indexData), {
	fields: ["text", "replaces"],
	storeFields: ["feature_id", "text", "kind", "replaces"],
	searchOptions: {
		boost: { text: 2, replaces: 0.5 },
		fuzzy: 0.2,
		prefix: true,
	},
});

export const intentCmd = defineCommand("intent", async (args) => {
	const query = args.join(" ").trim();
	if (!query) {
		return {
			stdout: "",
			stderr:
				'usage: intent <natural language query>\n  example: intent "popover sin floating ui"\n',
			exitCode: 2,
		};
	}

	const hits = search.search(query) as Array<{
		id: string;
		score: number;
		feature_id: string;
		text: string;
		kind: Doc["kind"];
		replaces: string;
	}>;

	if (hits.length === 0) {
		return {
			stdout: `${dim(`(no intents matching "${query}")`)}\n`,
			stderr: "",
			exitCode: 0,
		};
	}

	const perFeature = new Map<
		string,
		{
			score: number;
			matched: string;
			matchedKind: Doc["kind"];
			matchedReplaces: string;
		}
	>();
	for (const hit of hits) {
		const prev = perFeature.get(hit.feature_id);
		if (!prev || hit.score > prev.score) {
			perFeature.set(hit.feature_id, {
				score: hit.score,
				matched: hit.text,
				matchedKind: hit.kind,
				matchedReplaces: hit.replaces,
			});
		}
	}

	const top = Array.from(perFeature.entries())
		.sort(([, a], [, b]) => b.score - a.score)
		.slice(0, 5);

	const sections: string[] = [];
	for (const [featureId, info] of top) {
		const feature = lookup[featureId];
		if (!feature) continue;
		sections.push(renderHit(featureId, info, feature));
	}

	return {
		stdout: `${sections.join("\n\n")}\n`,
		stderr: "",
		exitCode: 0,
	};
});

interface HitInfo {
	score: number;
	matched: string;
	matchedKind: Doc["kind"];
	matchedReplaces: string;
}

function renderHit(
	featureId: string,
	info: HitInfo,
	feature: FeatureLookup,
): string {
	const baseline = translateBaseline(feature.baseline);
	const baselineColor =
		baseline === "widely"
			? green(baseline)
			: baseline === "newly"
				? sky(baseline)
				: yellow(baseline);

	// Header: name · id  (id only when it differs meaningfully from name)
	const showId = featureId.toLowerCase() !== feature.name.toLowerCase();
	const header = showId
		? `  ${amber(bold(feature.name))}  ${dim("·")}  ${dim(featureId)}`
		: `  ${amber(bold(feature.name))}`;

	const lines = [header, `  ${dim("baseline:")} ${baselineColor}`];

	if (feature.replaces.length > 0) {
		// cap at 4 to avoid noise
		const shown = feature.replaces.slice(0, 4);
		const overflow =
			feature.replaces.length > 4
				? dim(` +${feature.replaces.length - 4}`)
				: "";
		lines.push(
			`  ${dim("replaces:")} ${shown.map((r) => sky(r)).join(dim(", "))}${overflow}`,
		);
	}

	// Only show "matched" when it adds info beyond the name itself
	if (info.matchedKind === "paraphrase") {
		lines.push(`  ${dim("via:")}      ${dim(info.matched)}`);
	} else if (info.matchedKind === "replaces") {
		lines.push(
			`  ${dim("via:")}      ${dim(`replaces ${info.matchedReplaces}`)}`,
		);
	}
	// kind === "name" → no "via" line, the header already says it

	const path = feature.path ?? `/css/_baseline/newly.md`;
	lines.push(
		`  ${dim("read:")}     ${cssCyan(`view ${path}`)}  ${dim("·")}  ${cssCyan(`support ${featureId}`)}`,
	);

	return lines.join("\n");
}

function translateBaseline(baseline: string): "widely" | "newly" | "limited" {
	if (baseline === "high") return "widely";
	if (baseline === "low") return "newly";
	return "limited";
}
