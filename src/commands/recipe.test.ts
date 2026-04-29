import { expect, test } from "bun:test";
import { Bash } from "just-bash";
import { allCommands } from "./index.ts";

test("recipe returns the V2 stub", async () => {
	const bash = new Bash({ customCommands: allCommands });
	const result = await bash.exec("recipe popover");

	expect(result.exitCode).toBe(0);
	expect(result.stderr).toBe("");
	expect(result.stdout).toBe("(no recipes loaded yet — see V5)\n");
});

test("recipe validates its pattern", async () => {
	const bash = new Bash({ customCommands: allCommands });
	const result = await bash.exec("recipe");

	expect(result.exitCode).toBe(2);
	expect(result.stdout).toBe("");
	expect(result.stderr).toBe("usage: recipe <pattern>\n");
});
