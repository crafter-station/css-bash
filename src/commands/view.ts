import { defineCommand } from "just-bash";
import {
	bold,
	cssCyan,
	cssPurple,
	dim,
	gray,
	green,
	yellow,
} from "../lib/output.ts";

/**
 * `view <path>` — render markdown from the VFS with discreet colors.
 *
 * Plain `cat` returns raw text (good for piping). `view` is the human
 * variant: bold headers, colored Baseline status, dim links, gray code.
 *
 * Color helpers in lib/output.ts auto-disable under !TTY or NO_COLOR,
 * so `view` is safe to call from MCP/pipes — the output stays plain.
 */
export const viewCmd = defineCommand("view", async (args, ctx) => {
	const [path] = args;
	if (!path) {
		return { stdout: "", stderr: "usage: view <path>\n", exitCode: 2 };
	}

	let raw: string;
	try {
		raw = await ctx.fs.readFile(path);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		return { stdout: "", stderr: `view: ${msg}\n`, exitCode: 1 };
	}

	return { stdout: render(raw), stderr: "", exitCode: 0 };
});

function render(md: string): string {
	// Collapse 2+ consecutive blank lines into a single blank line so the
	// VFS markdown (which surrounds every section with blanks) reads tight.
	const collapsed = md.replace(/\n{3,}/g, "\n\n");
	const lines = collapsed.split("\n").map(renderLine);
	return `${lines.join("\n")}${collapsed.endsWith("\n") ? "" : "\n"}`;
}

function renderLine(line: string): string {
	// Code fences: keep raw line, gray it out so blocks read as separators
	if (line.startsWith("```")) return gray(line);

	// H1: cssPurple bold + underline rule
	if (line.startsWith("# "))
		return `${cssPurple(bold(line.slice(2)))}\n${cssPurple(dim("─".repeat(Math.max(8, line.length - 2))))}`;

	// H2: cssCyan bold (no leading blank — markdown already has one above)
	if (line.startsWith("## ")) return cssCyan(bold(line.slice(3)));

	// H3: bold
	if (line.startsWith("### ")) return bold(line.slice(4));

	// Baseline status line: "- Status: widely | newly | limited"
	const statusMatch = line.match(/^(- Status:\s*)(\w+)$/);
	if (statusMatch) {
		const [, prefix, status] = statusMatch;
		const colored =
			status === "widely"
				? green(status)
				: status === "newly"
					? cssCyan(status)
					: yellow(status);
		return `${dim(prefix)}${colored}`;
	}

	// Links: "- https://..." (handle BEFORE bullet-kv because https: looks like key:)
	if (/^- https?:\/\//.test(line)) {
		return `${dim("- ")}${cssCyan(line.slice(2))}`;
	}

	// Bullet list with key:value (e.g. "- baseline_low_date: 2024-01-12")
	const bulletKvMatch = line.match(/^(- )([\w_-]+):\s*(.+)$/);
	if (bulletKvMatch) {
		const [, bullet, key, value] = bulletKvMatch;
		return `${dim(bullet)}${dim(`${key}:`)} ${value}`;
	}

	// Plain bullet
	if (line.startsWith("- ")) {
		return `${dim("- ")}${line.slice(2)}`;
	}

	// Browser support indented "  chrome: 105"
	const browserMatch = line.match(/^(\s+)([\w_]+):\s*(.+)$/);
	if (browserMatch) {
		const [, indent, browser, version] = browserMatch;
		const versionFmt =
			version === "no" || version === "—" ? gray(version) : bold(version);
		return `${indent}${dim(`${browser}:`)} ${versionFmt}`;
	}

	return line;
}
