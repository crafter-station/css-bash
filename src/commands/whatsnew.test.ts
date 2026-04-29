import { expect, test } from "bun:test";
import { Bash } from "just-bash";
import { allCommands } from "./index.ts";

test("whatsnew 2024 renders exact first five features through head", async () => {
	const bash = new Bash({ customCommands: allCommands });
	const result = await bash.exec("whatsnew 2024 | head -5");

	expect(result.exitCode).toBe(0);
	expect(result.stderr).toBe("");
	expect(
		result.stdout,
	).toBe(`align-content-block — align-content in block layouts (2024-04-16)
alt-text-generated-content — Alt text for generated content (2024-07-09)
backdrop-filter — backdrop-filter (2024-09-16)
font-size-adjust — font-size-adjust (2024-07-25)
gradient-interpolation — Gradient interpolation (2024-06-11)
`);
});

test("whatsnew validates year bounds", async () => {
	const bash = new Bash({ customCommands: allCommands });
	const result = await bash.exec("whatsnew 2019");
	const currentYear = new Date().getUTCFullYear();

	expect(result.exitCode).toBe(2);
	expect(result.stdout).toBe("");
	expect(result.stderr).toBe(
		`usage: whatsnew [year]  (2020..2030, default ${currentYear})\n`,
	);
});
