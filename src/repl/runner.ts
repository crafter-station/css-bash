import { createInterface } from "node:readline";
import { Bash } from "just-bash";
import packageJson from "../../package.json" with { type: "json" };
import { allCommands } from "../commands/index.ts";
import { printMiniBanner } from "../lib/banner.ts";
import { bold, cssCyan, cssPurple, dim, isTTY } from "../lib/output.ts";
import { buildVfs } from "../vfs/builder.ts";

const REPL_TIPS = [
	"baseline newly | head -5",
	"support has",
	"whatsnew 2025",
	"recipe popover",
	"ls /css/view-transitions",
	"cat /css/selectors/has.md",
];

export async function runRepl(): Promise<void> {
	printMiniBanner(packageJson.version);

	if (isTTY()) {
		process.stdout.write(`  ${cssPurple(bold("Try"))}\n`);
		for (const tip of REPL_TIPS) process.stdout.write(`    ${dim(tip)}\n`);
		process.stdout.write(
			`\n  ${dim("Type")} ${cssCyan("help")} ${dim("for more,")} ${cssCyan("exit")} ${dim("to quit.")}\n\n`,
		);
	}

	const bash = new Bash({ files: buildVfs(), customCommands: allCommands });
	const promptStr = isTTY()
		? `${cssPurple("css-bash")}${dim("›")} `
		: "css-bash> ";
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: promptStr,
	});

	rl.prompt();

	for await (const line of rl) {
		const trimmed = line.trim();
		if (trimmed === "exit" || trimmed === "quit" || trimmed === ":q") {
			rl.close();
			if (isTTY()) {
				process.stdout.write(`\n  ${dim("bye.")}\n`);
			}
			return;
		}

		if (trimmed === "help" || trimmed === "?") {
			process.stdout.write(`\n${replHelp()}\n`);
			rl.prompt();
			continue;
		}

		if (trimmed === "") {
			rl.prompt();
			continue;
		}

		const result = await bash.exec(line);
		if (result.stdout) process.stdout.write(result.stdout);
		if (result.stderr) process.stderr.write(result.stderr);
		rl.prompt();
	}
}

function replHelp(): string {
	return [
		`  ${cssPurple(bold("Custom commands"))}`,
		`    ${bold("baseline")} ${dim("<newly|widely|limited|all>")}`,
		`    ${bold("support")} ${dim("<feature-id>")}`,
		`    ${bold("whatsnew")} ${dim("[year]")}`,
		`    ${bold("recipe")} ${dim("<pattern>")}`,
		`    ${bold("view")} ${dim("<path>")}`,
		"",
		`  ${cssPurple(bold("Bash"))}`,
		`    ${dim("ls, cat, head, tail, find, grep, wc, echo, pipes (|)")}`,
		"",
		`  ${cssPurple(bold("REPL"))}`,
		`    ${bold("help, ?")}      ${dim("this hint")}`,
		`    ${bold("exit, quit")}   ${dim("leave")}`,
		"",
	].join("\n");
}
