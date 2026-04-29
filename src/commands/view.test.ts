import { expect, test } from "bun:test";
import { Bash } from "just-bash";
import { buildVfs } from "../vfs/builder.ts";
import { allCommands } from "./index.ts";

test("view renders has.md from VFS without ANSI under !TTY", async () => {
	const bash = new Bash({ files: buildVfs(), customCommands: allCommands });
	const result = await bash.exec("view /css/selectors/has.md");

	expect(result.exitCode).toBe(0);
	expect(result.stderr).toBe("");
	// Under !TTY (bun test) helpers emit raw text, no escapes
	expect(result.stdout).toContain(":has()");
	expect(result.stdout).toContain("Baseline");
	expect(result.stdout).toContain("- Status: newly");
	expect(result.stdout).toContain(
		"https://drafts.csswg.org/selectors-4/#relational",
	);
	// No ANSI escapes leaked
	// biome-ignore lint/suspicious/noControlCharactersInRegex: testing for ANSI
	expect(result.stdout).not.toMatch(/\x1b\[/);
});

test("view rejects missing path", async () => {
	const bash = new Bash({ files: buildVfs(), customCommands: allCommands });
	const result = await bash.exec("view");

	expect(result.exitCode).toBe(2);
	expect(result.stdout).toBe("");
	expect(result.stderr).toBe("usage: view <path>\n");
});

test("view returns error for nonexistent file", async () => {
	const bash = new Bash({ files: buildVfs(), customCommands: allCommands });
	const result = await bash.exec("view /css/does-not-exist.md");

	expect(result.exitCode).toBe(1);
	expect(result.stdout).toBe("");
	expect(result.stderr).toContain("view:");
});
