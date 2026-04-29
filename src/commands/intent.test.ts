import { expect, test } from "bun:test";
import { Bash } from "just-bash";
import { allCommands } from "./index.ts";

test("intent finds anchor-positioning for popover query", async () => {
	const bash = new Bash({ customCommands: allCommands });
	const result = await bash.exec("intent 'popover sin floating ui'");

	expect(result.exitCode).toBe(0);
	expect(result.stderr).toBe("");
	// Should include anchor-positioning, popover, or absolute-positioning in top
	const lower = result.stdout.toLowerCase();
	expect(
		lower.includes("anchor-positioning") ||
			lower.includes("popover") ||
			lower.includes("absolute-positioning"),
	).toBe(true);
	// Should NOT include cascade-layers (was a false positive before cleanup)
	expect(lower).not.toContain("cascade-layers");
});

test("intent finds view-transitions for page transition query", async () => {
	const bash = new Bash({ customCommands: allCommands });
	const result = await bash.exec("intent 'transicion entre paginas'");

	expect(result.exitCode).toBe(0);
	const lower = result.stdout.toLowerCase();
	expect(lower).toContain("view-transitions");
});

test("intent rejects empty query", async () => {
	const bash = new Bash({ customCommands: allCommands });
	const result = await bash.exec("intent");

	expect(result.exitCode).toBe(2);
	expect(result.stderr).toContain("usage: intent");
});

test("intent emits no ANSI under !TTY", async () => {
	const bash = new Bash({ customCommands: allCommands });
	const result = await bash.exec("intent 'auto grow textarea'");

	// biome-ignore lint/suspicious/noControlCharactersInRegex: testing for ANSI
	expect(result.stdout).not.toMatch(/\x1b\[/);
});
