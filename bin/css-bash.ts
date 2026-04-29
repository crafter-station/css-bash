#!/usr/bin/env bun
import { startServer } from "../src/mcp/server.ts";
import { runRepl } from "../src/repl/runner.ts";

const args = process.argv.slice(2);

if (args.length === 1 && args[0] === "--repl") {
	await runRepl();
} else if (args.length === 0 || (args.length === 1 && args[0] === "--server")) {
	await startServer();
} else if (args.length === 1 && args[0] === "--version") {
	process.stdout.write("0.1.0\n");
} else if (args.length === 1 && args[0] === "--help") {
	process.stdout.write(
		["css-bash", "", "Usage:", "  css-bash", "  css-bash --repl", ""].join(
			"\n",
		),
	);
} else {
	process.stdout.write(
		[
			"css-bash",
			"",
			"Usage:",
			"  css-bash",
			"  css-bash --repl",
			"",
		].join("\n"),
	);
	process.exit(2);
}
