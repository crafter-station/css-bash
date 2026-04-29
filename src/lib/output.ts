// ANSI color helpers — zero deps, respect NO_COLOR + TTY.
// Pattern lifted from hapi-cli/packages/cli/src/lib/output.ts.

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;

export const bold = (s: string): string =>
	useColor ? `\x1b[1m${s}\x1b[0m` : s;
export const dim = (s: string): string => (useColor ? `\x1b[2m${s}\x1b[0m` : s);
export const italic = (s: string): string =>
	useColor ? `\x1b[3m${s}\x1b[0m` : s;
export const underline = (s: string): string =>
	useColor ? `\x1b[4m${s}\x1b[0m` : s;
export const green = (s: string): string =>
	useColor ? `\x1b[32m${s}\x1b[0m` : s;
export const red = (s: string): string =>
	useColor ? `\x1b[31m${s}\x1b[0m` : s;
export const yellow = (s: string): string =>
	useColor ? `\x1b[33m${s}\x1b[0m` : s;
export const blue = (s: string): string =>
	useColor ? `\x1b[34m${s}\x1b[0m` : s;
export const magenta = (s: string): string =>
	useColor ? `\x1b[35m${s}\x1b[0m` : s;
export const cyan = (s: string): string =>
	useColor ? `\x1b[36m${s}\x1b[0m` : s;
export const gray = (s: string): string =>
	useColor ? `\x1b[90m${s}\x1b[0m` : s;

/** 24-bit truecolor wrapper for brand colors. */
export const hex =
	(hexCode: string) =>
	(s: string): string => {
		if (!useColor) return s;
		const rgb = parseHex(hexCode);
		if (!rgb) return s;
		return `\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m${s}\x1b[0m`;
	};

// css-bash brand colors — CSS3 spec purple → cyan, evokes "modern web".
export const cssPurple = hex("#663399"); // rebeccapurple, the legendary CSS color
export const cssCyan = hex("#00D9FF");
export const cssPink = hex("#FF6EC7");
export const cssYellow = hex("#FFE66D");

function parseHex(hexCode: string): [number, number, number] | null {
	const m = /^#?([0-9a-fA-F]{6})$/.exec(hexCode);
	if (!m || !m[1]) return null;
	const raw = m[1];
	return [
		Number.parseInt(raw.slice(0, 2), 16),
		Number.parseInt(raw.slice(2, 4), 16),
		Number.parseInt(raw.slice(4, 6), 16),
	];
}

function lerp(
	a: [number, number, number],
	b: [number, number, number],
	t: number,
): [number, number, number] {
	return [
		Math.round(a[0] + (b[0] - a[0]) * t),
		Math.round(a[1] + (b[1] - a[1]) * t),
		Math.round(a[2] + (b[2] - a[2]) * t),
	];
}

function rgbEscape(r: number, g: number, b: number, s: string): string {
	if (!useColor) return s;
	return `\x1b[38;2;${r};${g};${b}m${s}\x1b[0m`;
}

/**
 * Vertical gradient: each line gets a color interpolated between
 * `from` and `to`. Useful for logo banners.
 */
export function gradientV(from: string, to: string) {
	return (s: string): string => {
		const a = parseHex(from);
		const b = parseHex(to);
		if (!useColor || !a || !b) return s;
		const lines = s.split("\n");
		const len = lines.length;
		if (len === 0) return s;
		return lines
			.map((line, i) => {
				const t = len === 1 ? 0 : i / (len - 1);
				const [r, g, bb] = lerp(a, b, t);
				return rgbEscape(r, g, bb, line);
			})
			.join("\n");
	};
}

/**
 * Horizontal gradient: each visible char gets a color interpolated
 * between `from` and `to`. Whitespace passes through.
 */
export function gradientH(from: string, to: string) {
	return (s: string): string => {
		const a = parseHex(from);
		const b = parseHex(to);
		if (!useColor || !a || !b) return s;
		const chars = [...s];
		const visible = chars.filter((c) => c.trim().length > 0).length;
		if (visible === 0) return s;
		let idx = 0;
		return chars
			.map((ch) => {
				if (ch.trim().length === 0) return ch;
				const t = visible === 1 ? 0 : idx / (visible - 1);
				idx++;
				const [r, g, bb] = lerp(a, b, t);
				return rgbEscape(r, g, bb, ch);
			})
			.join("");
	};
}

export const isTTY = (): boolean => Boolean(process.stdout.isTTY);
