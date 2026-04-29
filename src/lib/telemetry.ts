/**
 * Local query telemetry for `intent`. Logs each query + outcome to a JSONL
 * file under ~/.css-bash/queries.jsonl so the user can mine it later for
 * patterns the curated index is missing.
 *
 * Disabled when CSS_BASH_NO_TELEMETRY=1 or when the home dir is not writable.
 * Never sends data over the network. Never logs anything beyond the query
 * string + result feature_ids + count + timestamp.
 *
 * Failure is silent — telemetry must never break the user's command.
 */

import { existsSync, mkdirSync } from "node:fs";
import { appendFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const TELEMETRY_DIR = join(homedir(), ".css-bash");
const TELEMETRY_FILE = join(TELEMETRY_DIR, "queries.jsonl");

interface TelemetryEntry {
	ts: string;
	query: string;
	hits: number;
	top: string[];
	experimental?: boolean;
}

export function isTelemetryEnabled(): boolean {
	return process.env.CSS_BASH_NO_TELEMETRY !== "1";
}

export async function logQuery(
	entry: Omit<TelemetryEntry, "ts">,
): Promise<void> {
	if (!isTelemetryEnabled()) return;
	try {
		if (!existsSync(TELEMETRY_DIR)) {
			mkdirSync(TELEMETRY_DIR, { recursive: true });
		}
		const line = JSON.stringify({
			ts: new Date().toISOString(),
			...entry,
		});
		await appendFile(TELEMETRY_FILE, `${line}\n`, "utf-8");
	} catch {
		// Silent. Telemetry must never break commands.
	}
}

export const TELEMETRY_PATH = TELEMETRY_FILE;
