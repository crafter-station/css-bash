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
import { logQuery } from "../lib/telemetry.ts";

interface Doc {
	id: string;
	feature_id: string;
	text: string;
	kind: "name" | "paraphrase" | "replaces" | "recipe";
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
	const wantExperimental = args[0] === "--experimental";
	const queryArgs = wantExperimental ? args.slice(1) : args;
	const query = queryArgs.join(" ").trim();
	if (!query) {
		return {
			stdout: "",
			stderr:
				'usage: intent [--experimental] <natural language query>\n  example: intent "popover sin floating ui"\n',
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
		await logQuery({
			query,
			hits: 0,
			top: [],
			experimental: wantExperimental || undefined,
		});
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

	// Re-rank: when scores are close (within 15%), prefer features with
	// higher baseline status (widely > newly > limited). This handles the
	// case where the user query is ambiguous about how experimental they
	// are willing to go — default to "what works in production today".
	// Pass --experimental as the first arg to invert this preference.
	const top = Array.from(perFeature.entries())
		.sort(([aId, a], [bId, b]) => {
			const aFeat = lookup[aId];
			const bFeat = lookup[bId];
			const aRank = baselineRank(aFeat?.baseline, wantExperimental);
			const bRank = baselineRank(bFeat?.baseline, wantExperimental);
			const scoreDelta = b.score - a.score;
			const scoreRatio =
				Math.min(a.score, b.score) / Math.max(a.score, b.score);
			// If the BM25 scores are within 15% of each other, baseline tier wins.
			if (scoreRatio > 0.85 && aRank !== bRank) return bRank - aRank;
			return scoreDelta;
		})
		.slice(0, 5);

	const sections: string[] = [];
	for (const [featureId, info] of top) {
		const feature = lookup[featureId];
		if (!feature) continue;
		sections.push(renderHit(featureId, info, feature));
	}

	await logQuery({
		query,
		hits: top.length,
		top: top.map(([id]) => id),
		experimental: wantExperimental || undefined,
	});

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
	if (info.matchedKind === "paraphrase" || info.matchedKind === "recipe") {
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

/**
 * Numeric rank used for tie-breaking close-score hits. Higher = preferred.
 * Inverted when --experimental is passed (limited > newly > widely).
 */
function baselineRank(
	baseline: string | undefined,
	experimental: boolean,
): number {
	const status = translateBaseline(baseline ?? "");
	const order = experimental
		? { limited: 3, newly: 2, widely: 1 }
		: { widely: 3, newly: 2, limited: 1 };
	return order[status] ?? 0;
}
