import { expect, test } from "bun:test";
import { Bash } from "just-bash";
import { allCommands } from "./index.ts";

test("recipe popover finds the anchor popover recipe", async () => {
	const bash = new Bash({ customCommands: allCommands });
	const result = await bash.exec("recipe popover");

	expect(result.exitCode).toBe(0);
	expect(result.stderr).toBe("");
	expect(result.stdout).toBe(
		"/css/_recipes/anchor-popover.md\n  Anchor-positioned popover (no Floating UI)\n",
	);
});

test("recipe theming finds the light-dark recipe", async () => {
	const bash = new Bash({ customCommands: allCommands });
	const result = await bash.exec("recipe theming");

	expect(result.exitCode).toBe(0);
	expect(result.stderr).toBe("");
	expect(result.stdout).toBe(
		"/css/_recipes/light-dark-theming.md\n  System-aware theming with light-dark()\n",
	);
});

test("recipe returns an empty match message", async () => {
	const bash = new Bash({ customCommands: allCommands });
	const result = await bash.exec("recipe masonry");

	expect(result.exitCode).toBe(0);
	expect(result.stderr).toBe("");
	expect(result.stdout).toBe('(no recipes matching "masonry")\n');
});

test("recipe validates its pattern", async () => {
	const bash = new Bash({ customCommands: allCommands });
	const result = await bash.exec("recipe");

	expect(result.exitCode).toBe(2);
	expect(result.stdout).toBe("");
	expect(result.stderr).toBe("usage: recipe <pattern>\n");
});
