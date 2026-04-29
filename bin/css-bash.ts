#!/usr/bin/env bun
import { runRepl } from "../src/repl/runner.ts";

const args = process.argv.slice(2);

if (args.length === 1 && args[0] === "--repl") {
	await runRepl();
} else {
	process.stdout.write(
		[
			"css-bash",
			"",
			"Usage:",
			"  css-bash --repl",
			"",
			"MCP server dispatch lands in V3/V4.",
			"",
		].join("\n"),
	);
	process.exit(2);
}
