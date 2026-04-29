import { expect, test } from "bun:test";
import { Bash } from "just-bash";
import { allCommands } from "./index.ts";

test("baseline newly pipes into head with exact first three lines", async () => {
	const bash = new Bash({ customCommands: allCommands });
	const result = await bash.exec("baseline newly | head -3");

	expect(result.exitCode).toBe(0);
	expect(result.stderr).toBe("");
	expect(result.stdout).toBe(`abs-sign — abs() and sign() (2025-06-26)
active-view-transition — Active view transition (2026-01-13)
align-content-block — align-content in block layouts (2024-04-16)
`);
});

test("baseline limited can find anchor positioning exactly", async () => {
	const bash = new Bash({ customCommands: allCommands });
	const result = await bash.exec(
		"baseline limited | grep '^anchor-positioning'",
	);

	expect(result.exitCode).toBe(0);
	expect(result.stderr).toBe("");
	expect(result.stdout).toBe("anchor-positioning — Anchor positioning\n");
});

test("baseline validates its filter", async () => {
	const bash = new Bash({ customCommands: allCommands });
	const result = await bash.exec("baseline recent");

	expect(result.exitCode).toBe(2);
	expect(result.stdout).toBe("");
	expect(result.stderr).toBe("usage: baseline <newly|widely|limited|all>\n");
});
