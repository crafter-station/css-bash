#!/usr/bin/env bun
/**
 * Rebuild data/intent-index.json + data/intents.json from data/intents-raw.json
 * WITHOUT re-calling OpenAI. Use this when you change indexing logic but the
 * paraphrases are fine.
 *
 * Replaces axis is sourced from scripts/lib/feature-replaces.ts (single
 * source of truth, shared with build-intent-index.ts).
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import MiniSearch from "minisearch";
import { features } from "web-features";
import {
	assertCuratedParaphraseIdsExist,
	curatedParaphrases,
	isParaphraseAllowed,
} from "./lib/curated-paraphrases.ts";
import {
	assertCuratedIdsExist,
	curatedReplaces,
	FEATURE_REPLACES,
} from "./lib/feature-replaces.ts";
import { loadRecipeSignals } from "./lib/recipe-index.ts";

const REPO = new URL("..", import.meta.url).pathname;
const DATA_DIR = join(REPO, "data");
const RAW_PATH = join(DATA_DIR, "intents-raw.json");
const INDEX_PATH = join(DATA_DIR, "intent-index.json");
const INTENTS_PATH = join(DATA_DIR, "intents.json");

interface RawFeature {
	id: string;
	paraphrases: string[];
	replaces: string[];
	error?: string;
}

async function main() {
	const allFeatureIds = new Set(Object.keys(features));
	assertCuratedIdsExist(allFeatureIds);
	assertCuratedParaphraseIdsExist(allFeatureIds);

	const raw = JSON.parse(await readFile(RAW_PATH, "utf-8")) as Record<
		string,
		RawFeature
	>;
	const entries = Object.values(raw).filter((r) => !r.error);

	// Use the curated replaces table — ignore whatever the LLM put in raw.
	const curatedCount = entries.filter(
		(r) => curatedReplaces(r.id).length > 0,
	).length;
	console.log(
		`replaces source: scripts/lib/feature-replaces.ts (${curatedCount}/${entries.length} features have curated replaces)`,
	);

	// Load recipe signals — each recipe gives extra paraphrases/replaces
	// to its primary feature(s).
	const recipeSignals = await loadRecipeSignals();
	const recipesByFeature = new Map<
		string,
		Array<(typeof recipeSignals)[number]>
	>();
	for (const r of recipeSignals) {
		for (const featureId of r.featureIds) {
			const list = recipesByFeature.get(featureId) ?? [];
			list.push(r);
			recipesByFeature.set(featureId, list);
		}
	}

	// Build documents
	const docs: Array<{
		id: string;
		text: string;
		replaces: string;
		feature_id: string;
		kind: "paraphrase" | "replaces" | "name" | "recipe";
	}> = [];
	let nextId = 0;
	for (const r of entries) {
		const feature = features[r.id];
		if (!feature) continue;
		const recipes = recipesByFeature.get(r.id) ?? [];
		const recipeReplaces = recipes.flatMap((rec) => rec.replaces);
		const replaces = Array.from(
			new Set([...curatedReplaces(r.id), ...recipeReplaces]),
		);

		// 1. The feature name + id-as-tokens. The ID often encodes the
		// canonical search term (e.g. "anchor-positioning" -> "anchor positioning").
		// Indexing both gives us coverage when the user types either form
		// and acts as a fallback for features whose `description` is too
		// short to seed the LLM paraphrases (rare but real).
		const idTokens = r.id.replace(/[-_]/g, " ");
		docs.push({
			id: String(nextId++),
			text: `${feature.name ?? r.id} ${idTokens}`,
			replaces: "",
			feature_id: r.id,
			kind: "name",
		});
		// Also index the description as a recipe-tier signal — it captures
		// vocabulary the LLM-generated paraphrases may have missed.
		if (feature.description && feature.description.length > 0) {
			docs.push({
				id: String(nextId++),
				text: feature.description,
				replaces: "",
				feature_id: r.id,
				kind: "paraphrase",
			});
		}
		// 2. Each paraphrase (LLM-generated + manually curated, minus blocked)
		const allParaphrases = [
			...new Set([...r.paraphrases, ...curatedParaphrases(r.id)]),
		].filter((p) => isParaphraseAllowed(r.id, p));
		for (const p of allParaphrases) {
			docs.push({
				id: String(nextId++),
				text: p,
				replaces: "",
				feature_id: r.id,
				kind: "paraphrase",
			});
		}
		// 3. Each curated replace as its own doc
		for (const lib of replaces) {
			docs.push({
				id: String(nextId++),
				text: `without ${lib} alternative to ${lib} replace ${lib}`,
				replaces: lib,
				feature_id: r.id,
				kind: "replaces",
			});
		}
		// 4. Recipes — title and tags become extra signals for this feature
		for (const recipe of recipes) {
			docs.push({
				id: String(nextId++),
				text: recipe.title,
				replaces: "",
				feature_id: r.id,
				kind: "recipe",
			});
			for (const tag of recipe.tags) {
				docs.push({
					id: String(nextId++),
					text: tag,
					replaces: "",
					feature_id: r.id,
					kind: "recipe",
				});
			}
		}
	}

	const index = new MiniSearch({
		fields: ["text", "replaces"],
		storeFields: ["feature_id", "text", "kind", "replaces"],
		searchOptions: {
			boost: { text: 2, replaces: 0.5 },
			fuzzy: 0.2,
			prefix: true,
		},
	});
	index.addAll(docs);
	await writeFile(INDEX_PATH, JSON.stringify(index.toJSON()));
	console.log(`saved ${INDEX_PATH} (${docs.length} docs indexed)`);

	// Lookup file (now includes the canonical VFS path so the runtime can
	// suggest "view /css/<group>/<id>.md" for any matched feature)
	const lookup: Record<
		string,
		{
			name: string;
			baseline: string;
			paraphrases: string[];
			replaces: string[];
			path: string;
		}
	> = {};
	for (const r of entries) {
		const feature = features[r.id];
		if (!feature) continue;
		const group = feature.group?.[0] ?? "misc";
		const recipes = recipesByFeature.get(r.id) ?? [];
		const recipeReplaces = recipes.flatMap((rec) => rec.replaces);
		lookup[r.id] = {
			name: feature.name ?? r.id,
			baseline: String(feature.status.baseline),
			paraphrases: r.paraphrases,
			replaces: Array.from(
				new Set([...curatedReplaces(r.id), ...recipeReplaces]),
			),
			path: `/css/${group}/${r.id}.md`,
		};
	}
	await writeFile(INTENTS_PATH, JSON.stringify(lookup));
	console.log(
		`saved ${INTENTS_PATH} (${Object.keys(lookup).length} feature lookups)`,
	);

	// Show which curated entries didn't match a real feature ID (typos/renames)
	const orphans = Object.keys(FEATURE_REPLACES).filter(
		(id) => !raw[id] && !entries.some((r) => r.id === id),
	);
	if (orphans.length > 0) {
		console.log(
			`\nwarn: curated IDs with no matching feature in web-features:`,
		);
		for (const id of orphans) console.log(`  - ${id}`);
	}

	console.log(
		`\ndone. ${entries.length} features, ${docs.length} indexed docs.`,
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
