import { dim, gradientV, isTTY } from "./output.ts";

const PURPLE = "#663399";
const CYAN = "#00D9FF";

const LOGO = `
   ██████╗███████╗███████╗
  ██╔════╝██╔════╝██╔════╝
  ██║     ███████╗███████╗
  ██║     ╚════██║╚════██║
  ╚██████╗███████║███████║
   ╚═════╝╚══════╝╚══════╝
  ██████╗  █████╗ ███████╗██╗  ██╗
  ██╔══██╗██╔══██╗██╔════╝██║  ██║
  ██████╔╝███████║███████╗███████║
  ██╔══██╗██╔══██║╚════██║██╔══██║
  ██████╔╝██║  ██║███████║██║  ██║
  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝`;

export function printBanner(version?: string): void {
	if (!isTTY() || process.env.NO_COLOR) return;
	const colored = gradientV(PURPLE, CYAN)(LOGO);
	process.stdout.write(`${colored}\n`);
	const tagline = `${version ? `v${version}  ·  ` : ""}modern CSS catalog as a bash sandbox  ·  agent-first`;
	process.stdout.write(`\n  ${dim(tagline)}\n\n`);
}

export function printMiniBanner(version?: string): void {
	if (!isTTY() || process.env.NO_COLOR) return;
	const tag = `${version ? `v${version}  ·  ` : ""}modern CSS catalog as a bash sandbox`;
	const line = gradientV(PURPLE, CYAN)("  css-bash");
	process.stdout.write(`\n${line}  ${dim(tag)}\n\n`);
}
