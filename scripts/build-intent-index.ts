#!/usr/bin/env bun

/**
 * Build the intent index by generating paraphrases for each CSS feature
 * via OpenAI gpt-4o-mini, then index them with MiniSearch for runtime
 * BM25 + fuzzy lookup.
 *
 * Usage:
 *   OPENAI_API_KEY=... bun scripts/build-intent-index.ts
 *
 * Flags:
 *   --limit N      Only process first N features (for smoke testing)
 *   --concurrency  Parallel API calls (default 8)
 *   --resume       Skip features already in data/intents-raw.json
 *   --dry          Print prompt for first feature, do not call API
 *
 * Output:
 *   data/intents-raw.json   { feature_id: { paraphrases: [...], replaces: [...] } }
 *   data/intent-index.json  serialized MiniSearch index
 *   data/intents.json       lookup { intent_id → { feature_id, text } }
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import MiniSearch from "minisearch";
import OpenAI from "openai";
import { features } from "web-features";
import { isCssFeature } from "../src/vfs/filter.ts";
import type { CssFeature } from "../src/vfs/types.ts";

const REPO = new URL("..", import.meta.url).pathname;
const DATA_DIR = join(REPO, "data");
const RAW_PATH = join(DATA_DIR, "intents-raw.json");
const INDEX_PATH = join(DATA_DIR, "intent-index.json");
const INTENTS_PATH = join(DATA_DIR, "intents.json");

type CssEntry = [string, CssFeature];

interface RawFeature {
	id: string;
	paraphrases: string[];
	replaces: string[];
	error?: string;
}

interface CliOptions {
	limit: number;
	concurrency: number;
	resume: boolean;
	dry: boolean;
}

function parseArgs(argv: string[]): CliOptions {
	const opts: CliOptions = {
		limit: Number.POSITIVE_INFINITY,
		concurrency: 8,
		resume: false,
		dry: false,
	};
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === "--limit") opts.limit = Number(argv[++i]);
		else if (arg === "--concurrency") opts.concurrency = Number(argv[++i]);
		else if (arg === "--resume") opts.resume = true;
		else if (arg === "--dry") opts.dry = true;
	}
	return opts;
}

import { curatedReplaces } from "./lib/feature-replaces.ts";

const PROMPT = (
	id: string,
	feature: CssFeature,
) => `You generate intent paraphrases for a CSS feature so a search engine can match natural-language developer questions to it.

FEATURE
- id: ${id}
- name: ${feature.name ?? id}
- description: ${feature.description ?? "(no description)"}
- group: ${(feature.group ?? []).join(", ")}
- baseline: ${feature.status.baseline}

TASK
Output a JSON object with one array:
1. "paraphrases": 20 short questions/intents a frustrated dev would type into Stack Overflow, Reddit, Google, or a chat AI. Mix English (14) and Spanish (6). No quotes around items.

(The "replaces" axis is computed deterministically from a curated allowlist after this call. You only generate paraphrases.)

WHAT GOES IN paraphrases
- "how to X" / "cómo hacer X" form
- the specific UI behavior the user wants ("popover anchored to button", "auto-grow textarea")
- synonyms devs use for the SAME concept this feature implements
- HTML/CSS terms users would search ("text wrap balance", "anchor positioning", "container query")

⛔ NEVER include "X without Y" paraphrases — the replaces axis is handled separately by the indexer.
⛔ NEVER mention jquery, bootstrap, framer-motion, floating-ui, popper, gsap, or any other JS library by name in paraphrases — the indexer adds those as separate signals.
✅ Talk about the visible behavior ("auto-grow textarea", "balanced heading wrap", "popover anchored to button"), the property syntax, and the user goal.
✅ Use synonyms devs actually type ("dropdown", "tooltip", "menu" for positioning features).

OTHER RULES
- Be concrete. Every paraphrase must include enough context that someone reading it alone could imagine the visual result.
- No marketing speak. Match how devs actually talk on SO ("how do i make a textarea grow as i type").
- Lowercase paraphrases unless a proper noun or lib name requires capitalization.
- No duplicates. No empty strings.
- Output ONLY the JSON object, no commentary.`;

const FORMAT_HINT = `Output strict JSON with this exact shape:
{ "paraphrases": ["...", "..."] }`;

async function callOpenAI(
	client: OpenAI,
	id: string,
	feature: CssFeature,
): Promise<{ paraphrases: string[]; replaces: string[] }> {
	const resp = await client.chat.completions.create({
		model: "gpt-4o-mini",
		response_format: { type: "json_object" },
		temperature: 0.7,
		messages: [
			{
				role: "system",
				content:
					"You are a CSS expert. You output strict JSON. You never explain or add commentary.",
			},
			{ role: "user", content: `${PROMPT(id, feature)}\n\n${FORMAT_HINT}` },
		],
	});

	const content = resp.choices[0]?.message?.content?.trim();
	if (!content) throw new Error("empty response");

	const parsed = JSON.parse(content) as { paraphrases?: unknown };
	const paraphrases = Array.isArray(parsed.paraphrases)
		? parsed.paraphrases
				.filter((s): s is string => typeof s === "string" && s.length > 0)
				.map((s) => s.trim())
		: [];

	const dedupedParaphrases = Array.from(new Set(paraphrases));
	// Replaces are NOT trusted from the LLM — pulled from the curated allowlist.
	const replaces = curatedReplaces(id);

	return { paraphrases: dedupedParaphrases, replaces };
}

async function pool<T, R>(
	items: T[],
	concurrency: number,
	worker: (item: T, idx: number) => Promise<R>,
	onProgress?: (done: number, total: number, last?: R) => void,
): Promise<R[]> {
	const results = new Array<R>(items.length);
	let cursor = 0;
	let done = 0;
	const total = items.length;

	const runners = Array.from({ length: Math.min(concurrency, total) }, () =>
		(async () => {
			while (true) {
				const i = cursor++;
				if (i >= total) return;
				try {
					const r = await worker(items[i] as T, i);
					results[i] = r;
					done++;
					onProgress?.(done, total, r);
				} catch (err) {
					done++;
					onProgress?.(done, total);
					throw err;
				}
			}
		})(),
	);
	await Promise.all(runners);
	return results;
}

async function main() {
	const opts = parseArgs(process.argv.slice(2));
	if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });

	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey && !opts.dry) {
		console.error("error: OPENAI_API_KEY not set");
		process.exit(1);
	}

	const cssEntries = (Object.entries(features) as CssEntry[])
		.filter(([, f]) => isCssFeature(f))
		.sort(([a], [b]) => a.localeCompare(b));

	const limited = cssEntries.slice(0, opts.limit);
	console.log(
		`processing ${limited.length} CSS features (concurrency=${opts.concurrency})`,
	);

	if (opts.dry) {
		const [id, feature] = limited[0] as CssEntry;
		console.log("---PROMPT PREVIEW (first feature)---");
		console.log(PROMPT(id, feature));
		console.log("---END---");
		return;
	}

	let existing: Record<string, RawFeature> = {};
	if (opts.resume && existsSync(RAW_PATH)) {
		existing = JSON.parse(await readFile(RAW_PATH, "utf-8"));
		console.log(
			`resuming: ${Object.keys(existing).length} features already processed`,
		);
	}

	const todo = limited.filter(([id]) => !existing[id]);
	console.log(`${todo.length} features to fetch`);

	const client = new OpenAI({ apiKey: apiKey as string });

	const startTs = Date.now();
	const newResults = await pool(
		todo,
		opts.concurrency,
		async ([id, feature]) => {
			try {
				const out = await callOpenAI(client, id, feature);
				return { id, ...out } as RawFeature;
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				return { id, paraphrases: [], replaces: [], error: msg } as RawFeature;
			}
		},
		(done, total, last) => {
			if (last && !last.error) {
				process.stderr.write(
					`  [${done}/${total}] ${last.id} (${last.paraphrases.length} paraphrases, ${last.replaces.length} replaces)\n`,
				);
			} else if (last?.error) {
				process.stderr.write(
					`  [${done}/${total}] ${last.id} ERROR: ${last.error}\n`,
				);
			}
		},
	);

	for (const r of newResults) existing[r.id] = r;

	await writeFile(RAW_PATH, JSON.stringify(existing, null, 2));
	const elapsedMin = ((Date.now() - startTs) / 60000).toFixed(1);
	console.log(
		`\nsaved ${RAW_PATH} (${Object.keys(existing).length} features, ${elapsedMin}min)`,
	);

	const errors = Object.values(existing).filter((r) => r.error).length;
	if (errors > 0)
		console.log(`${errors} features errored — re-run with --resume to retry`);

	// Build the MiniSearch index
	const docs: Array<{
		id: string;
		text: string;
		replaces: string;
		feature_id: string;
		kind: "paraphrase" | "replaces" | "name";
	}> = [];
	let nextId = 0;
	for (const r of Object.values(existing)) {
		if (r.error) continue;
		const feature = features[r.id];
		if (!feature) continue;
		// 1. The feature name itself
		const name = feature.name ?? r.id;
		docs.push({
			id: String(nextId++),
			text: name,
			replaces: "",
			feature_id: r.id,
			kind: "name",
		});
		// 2. Each paraphrase
		for (const p of r.paraphrases) {
			docs.push({
				id: String(nextId++),
				text: p,
				replaces: r.replaces.join(" "),
				feature_id: r.id,
				kind: "paraphrase",
			});
		}
		// 3. Replaces axis as its own doc per item
		for (const lib of r.replaces) {
			docs.push({
				id: String(nextId++),
				text: `without ${lib} alternative to ${lib} replace ${lib}`,
				replaces: lib,
				feature_id: r.id,
				kind: "replaces",
			});
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

	// Lookup file: { feature_id: { name, baseline, paraphrases, replaces } }
	const lookup: Record<
		string,
		{
			name: string;
			baseline: string;
			paraphrases: string[];
			replaces: string[];
		}
	> = {};
	for (const r of Object.values(existing)) {
		if (r.error) continue;
		const feature = features[r.id];
		if (!feature) continue;
		lookup[r.id] = {
			name: feature.name ?? r.id,
			baseline: String(feature.status.baseline),
			paraphrases: r.paraphrases,
			replaces: r.replaces,
		};
	}
	await writeFile(INTENTS_PATH, JSON.stringify(lookup));
	console.log(
		`saved ${INTENTS_PATH} (${Object.keys(lookup).length} feature lookups)`,
	);

	console.log(
		`\ndone. ${Object.keys(existing).length - errors} OK, ${errors} errors.`,
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
