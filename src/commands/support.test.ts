import { expect, test } from "bun:test";
import { Bash } from "just-bash";
import { allCommands } from "./index.ts";

test("support has renders the full support matrix", async () => {
	const bash = new Bash({ customCommands: allCommands });
	const result = await bash.exec("support has");

	expect(result.exitCode).toBe(0);
	expect(result.stderr).toBe("");
	expect(result.stdout).toBe(`:has()
baseline: low (newly)

chrome               105
chrome_android       105
edge                 105
firefox              121
firefox_android      121
safari               15.4
safari_ios           15.4
`);
});

test("support field-sizing renders missing Firefox support as no", async () => {
	const bash = new Bash({ customCommands: allCommands });
	const result = await bash.exec("support field-sizing");

	expect(result.exitCode).toBe(0);
	expect(result.stderr).toBe("");
	expect(result.stdout).toBe(`field-sizing
baseline: false (limited)

chrome               123
chrome_android       123
edge                 123
firefox              no
firefox_android      no
safari               26.2
safari_ios           26.2
`);
});

test("support rejects unknown features", async () => {
	const bash = new Bash({ customCommands: allCommands });
	const result = await bash.exec("support nope");

	expect(result.exitCode).toBe(1);
	expect(result.stdout).toBe("");
	expect(result.stderr).toBe("unknown feature: nope\n");
});
