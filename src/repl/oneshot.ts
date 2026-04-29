import { Bash } from "just-bash";
import { allCommands } from "../commands/index.ts";
import { buildVfs } from "../vfs/builder.ts";

/**
 * Run a single bash command and exit. Used for direct CLI mode:
 *   css-bash whatsnew 2025
 *   css-bash 'baseline newly | head -5'
 */
export async function runOneShot(command: string): Promise<number> {
	const bash = new Bash({ files: buildVfs(), customCommands: allCommands });
	const result = await bash.exec(command);
	if (result.stdout) process.stdout.write(result.stdout);
	if (result.stderr) process.stderr.write(result.stderr);
	return result.exitCode ?? 0;
}
