import { bold, cssCyan, cssPurple, cssYellow, dim } from "./output.ts";

type Group = { title: string; items: [string, string][] };

const MODES: Group = {
	title: "Modes",
	items: [
		["css-bash <command...>", "run a one-shot bash command (default)"],
		["css-bash --repl", "interactive REPL"],
		["css-bash --server", "MCP server stdio (used by LLMs)"],
		["css-bash --version", "print version"],
		["css-bash --help", "show this help"],
	],
};

const CUSTOM_COMMANDS: Group = {
	title: "Custom commands",
	items: [
		["baseline <newly|widely|limited|all>", "list features by Baseline status"],
		["support <feature-id>", "show browser support matrix for a feature"],
		["whatsnew [year]", "features that became Baseline newly in a year"],
		["recipe <pattern>", "find curated CSS implementation recipes"],
	],
};

const BASH_BUILTINS: Group = {
	title: "Bash builtins (just-bash)",
	items: [
		["ls /css", "list groups (animation, selectors, view-transitions, ...)"],
		["cat /css/<group>/<feature>.md", "read a feature spec"],
		["find /css -name '*scroll*'", "find features by name pattern"],
		["grep -R 'Baseline: newly' /css", "search across the catalog"],
		["head -n 10 <file>", "first N lines"],
		["wc -l <file>", "count lines"],
		["<command> | <command>", "pipe results"],
	],
};

const VFS_LAYOUT: Group = {
	title: "VFS layout",
	items: [
		["/css/<group>/<feature-id>.md", "one file per CSS feature (~429 today)"],
		["/css/_baseline/{newly,widely,limited}.md", "indices by status"],
		["/css/_year/{2023..2026}.md", "indices by year newly Baseline"],
		["/css/_recipes/<slug>.md", "10 curated patterns"],
	],
};

const EXAMPLES: Group = {
	title: "Examples",
	items: [
		["css-bash whatsnew 2025", "what landed in CSS this year"],
		[
			"css-bash 'baseline newly | head -5'",
			"5 most recent newly-Baseline features",
		],
		["css-bash support has", "browser support for :has()"],
		["css-bash 'cat /css/selectors/has.md'", "read the :has() spec"],
		["css-bash recipe popover", "find curated popover patterns"],
	],
};

const NEXT_STEPS: string[] = [
	`${bold("1.")}  Try the REPL:        ${cssCyan("css-bash --repl")}`,
	`${bold("2.")}  Explore the VFS:     ${cssCyan("css-bash 'ls /css'")}`,
	`${bold("3.")}  Wire as MCP:         ${dim("see")} ${cssYellow("MCP config")} ${dim("below")}`,
	`${bold("4.")}  Star the repo:       ${cssCyan("https://github.com/crafter-station/css-bash")}`,
];

const MCP_CONFIG = `{
  "mcpServers": {
    "css-bash": {
      "command": "bunx",
      "args": ["-y", "css-bash"]
    }
  }
}`;

export function renderHelp(): string {
	const lines: string[] = [];
	const all = [MODES, CUSTOM_COMMANDS, BASH_BUILTINS, VFS_LAYOUT, EXAMPLES];
	const pad = all
		.flatMap((g) => g.items.map(([cmd]) => cmd.length))
		.reduce((a, b) => Math.max(a, b), 0);

	for (const group of all) {
		lines.push(cssCyan(bold(group.title)));
		for (const [cmd, desc] of group.items) {
			lines.push(`  ${bold(cmd.padEnd(pad))}  ${dim(desc)}`);
		}
		lines.push("");
	}

	lines.push(cssPurple(bold("Next steps")));
	for (const step of NEXT_STEPS) lines.push(`  ${step}`);
	lines.push("");

	lines.push(cssPurple(bold("MCP config")));
	for (const line of MCP_CONFIG.split("\n")) lines.push(`  ${dim(line)}`);
	lines.push("");

	lines.push(
		dim(
			"Tip: pipe everything. Custom commands return strings — feed them through head, grep, wc.",
		),
	);
	lines.push("");

	return lines.join("\n");
}

export function renderUsageHint(): string {
	return [
		"",
		`  ${bold("css-bash")} ${dim("<command...>")}     ${dim("run one-shot bash")}`,
		`  ${bold("css-bash --repl")}        ${dim("interactive shell")}`,
		`  ${bold("css-bash --server")}      ${dim("MCP stdio for LLMs")}`,
		`  ${bold("css-bash --help")}        ${dim("full help")}`,
		"",
	].join("\n");
}
