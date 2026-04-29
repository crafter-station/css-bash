import { expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { buildDescribeText } from "./describe.ts";
import { createMcpServer } from "./server.ts";

test("buildDescribeText returns exact onboarding markdown", () => {
	expect(
		buildDescribeText(),
	).toBe(`# css-bash - Modern CSS catalog as a virtual filesystem

You can explore CSS features baseline newly/widely/limited using bash.

## Layout
- /css/{group}/{feature-id}.md - one file per CSS feature
- /css/_baseline/newly.md - index of newly available features
- /css/_baseline/widely.md - index of widely available features
- /css/_baseline/limited.md - index of experimental or limited support features
- /css/_year/{2023,2024,2025,2026}.md - features that became baseline newly in that year
- /css/_recipes/*.md - curated patterns when recipes are installed

## Custom commands
- baseline <newly|widely|limited|all>
- support <feature-id>
- whatsnew [year]
- recipe <pattern>
- view <path>  (markdown viewer; cat is plain, view is formatted)

## Native bash
ls, cat, head, tail, grep, find, wc, echo, pipes (|), redirection (>), env vars

## Examples

What's new in CSS this year?
\`\`\`bash
whatsnew 2025
\`\`\`

Show modern selectors.
\`\`\`bash
ls /css/selectors
\`\`\`

Read a feature.
\`\`\`bash
cat /css/selectors/has.md
\`\`\`

Check browser support for an experimental feature.
\`\`\`bash
support anchor-positioning
\`\`\`

Find scroll-related features.
\`\`\`bash
find /css -name '*scroll*' | head
\`\`\`

Find newly available container-query related features.
\`\`\`bash
baseline newly | grep container
\`\`\`

## When to use
Before writing CSS. If unsure whether a property exists or what its support looks like, query first.
`);
});

test("MCP server lists tools and runs css_shell commands", async () => {
	const server = createMcpServer();
	const client = new Client({ name: "css-bash-test", version: "0.1.0" });
	const [clientTransport, serverTransport] =
		InMemoryTransport.createLinkedPair();

	await Promise.all([
		server.connect(serverTransport),
		client.connect(clientTransport),
	]);

	try {
		const tools = await client.listTools();
		expect(tools.tools.map((tool) => tool.name).sort()).toEqual([
			"css_describe",
			"css_shell",
		]);

		const shellResult = await client.callTool({
			name: "css_shell",
			arguments: { command: "baseline newly | head -1" },
		});

		expect(shellResult.content).toEqual([
			{
				type: "text",
				text: `STDOUT:
  abs-sign                           abs() and sign()  2025-06-26

STDERR:

EXIT: 0`,
			},
		]);

		const describeResult = await client.callTool({
			name: "css_describe",
			arguments: {},
		});

		expect(describeResult.content).toEqual([
			{ type: "text", text: buildDescribeText() },
		]);
	} finally {
		await client.close();
		await server.close();
	}
});
