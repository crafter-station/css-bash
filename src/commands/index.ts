import { baselineCmd } from "./baseline.ts";
import { recipeCmd } from "./recipe.ts";
import { supportCmd } from "./support.ts";
import { viewCmd } from "./view.ts";
import { whatsnewCmd } from "./whatsnew.ts";

export const allCommands = [
	baselineCmd,
	supportCmd,
	whatsnewCmd,
	recipeCmd,
	viewCmd,
];
