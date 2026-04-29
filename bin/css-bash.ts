#!/usr/bin/env bun
import packageJson from "../package.json" with { type: "json" };
import { printBanner } from "../src/lib/banner.ts";
import { renderHelp, renderUsageHint } from "../src/lib/help.ts";
import { red } from "../src/lib/output.ts";
import { startServer } from "../src/mcp/server.ts";
import { runOneShot } from "../src/repl/oneshot.ts";
import { runRepl } from "../src/repl/runner.ts";

const argv = process.argv.slice(2);

function hasFlag(name: string, alias?: string): boolean {
	return argv.includes(name) || (alias ? argv.includes(alias) : false);
}

function stripFlags(): string[] {
	return argv.filter(
		(a) => !a.startsWith("-") && a !== "repl" && a !== "mcp" && a !== "server",
	);
}

if (hasFlag("--help", "-h")) {
	printBanner(packageJson.version);
	process.stdout.write(renderHelp());
	process.exit(0);
}

if (hasFlag("--version", "-v")) {
	process.stdout.write(`${packageJson.version}\n`);
	process.exit(0);
}

if (hasFlag("--repl") || argv[0] === "repl") {
	await runRepl();
	process.exit(0);
}

if (hasFlag("--server") || argv[0] === "mcp" || argv[0] === "server") {
	await startServer();
	// startServer() awaits stdio transport — never returns until disconnect.
}

// Default: if there are positional args, treat them as a one-shot bash command.
const positional = stripFlags();
if (positional.length > 0) {
	const command = positional.join(" ");
	const code = await runOneShot(command);
	process.exit(code);
}

// No args, no flags: TTY users get usage hint; piped/scripted callers get MCP.
if (process.stdout.isTTY) {
	printBanner(packageJson.version);
	process.stderr.write(renderUsageHint());
	process.stderr.write(`  ${red("(no command given)")}\n\n`);
	process.exit(2);
}

// Non-TTY default: MCP server (Claude Code, Codex, etc.).
await startServer();
