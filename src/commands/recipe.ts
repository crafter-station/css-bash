import { defineCommand } from "just-bash";

export const recipeCmd = defineCommand("recipe", async (args) => {
	const [pattern] = args;

	if (!pattern) {
		return { stdout: "", stderr: "usage: recipe <pattern>\n", exitCode: 2 };
	}

	return {
		stdout: "(no recipes loaded yet — see V5)\n",
		stderr: "",
		exitCode: 0,
	};
});
