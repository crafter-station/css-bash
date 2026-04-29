import { createInterface } from "node:readline";
import { Bash } from "just-bash";
import { allCommands } from "../commands/index.ts";
import { buildVfs } from "../vfs/builder.ts";

export async function runRepl(): Promise<void> {
	const bash = new Bash({ files: buildVfs(), customCommands: allCommands });
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: "css-bash> ",
	});

	rl.prompt();

	for await (const line of rl) {
		if (line.trim() === "exit") {
			rl.close();
			return;
		}

		const result = await bash.exec(line);

		if (result.stdout) {
			process.stdout.write(result.stdout);
		}

		if (result.stderr) {
			process.stderr.write(result.stderr);
		}

		rl.prompt();
	}
}
