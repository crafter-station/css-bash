#!/usr/bin/env bun
import packageJson from "../package.json" with { type: "json" };
import { startServer } from "../src/mcp/server.ts";
import { runRepl } from "../src/repl/runner.ts";

const args = process.argv.slice(2);
const usage = `css-bash - modern CSS catalog as a bash sandbox

Usage:
  css-bash              Start MCP server (stdio)
  css-bash --repl       Start interactive REPL
  css-bash --version    Print version
  css-bash --help       Show this help

MCP config:
  { "mcpServers": { "css-bash": { "command": "bunx", "args": ["-y", "css-bash"] } } }
`;

if (args.includes("--repl") || args.includes("repl")) {
	await runRepl();
} else if (args.includes("--help") || args.includes("-h")) {
	process.stdout.write(usage);
} else if (args.includes("--version") || args.includes("-v")) {
	process.stdout.write(`${packageJson.version}\n`);
} else if (args.length === 0 || args.includes("--server")) {
	await startServer();
} else {
	process.stderr.write(usage);
	process.exit(2);
}
