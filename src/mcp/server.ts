import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Bash } from "just-bash";
import { z } from "zod";
import { allCommands } from "../commands/index.ts";
import { buildVfs } from "../vfs/builder.ts";
import { buildDescribeText } from "./describe.ts";

export function createMcpServer(): McpServer {
	const bash = new Bash({ files: buildVfs(), customCommands: allCommands });
	const server = new McpServer({ name: "css-bash", version: "0.1.0" });

	server.tool(
		"css_shell",
		"Run a bash command against the css-bash VFS. Supports cat, ls, head, tail, find, grep, wc, pipes, and custom commands: baseline, support, whatsnew, recipe.",
		{
			command: z
				.string()
				.describe("Shell command, e.g. 'baseline newly | head -10'"),
		},
		async ({ command }) => {
			const result = await bash.exec(command);
			const sections = [
				`STDOUT:\n${result.stdout}`,
				`STDERR:\n${result.stderr}`,
				`EXIT: ${result.exitCode}`,
			];

			return {
				content: [{ type: "text" as const, text: sections.join("\n") }],
			};
		},
	);

	server.tool(
		"css_describe",
		"Return the layout, commands, and example queries for css-bash. Call this once on first use.",
		{},
		async () => ({
			content: [{ type: "text" as const, text: buildDescribeText() }],
		}),
	);

	return server;
}

export async function startServer(): Promise<void> {
	const server = createMcpServer();
	const transport = new StdioServerTransport();
	await server.connect(transport);
}
