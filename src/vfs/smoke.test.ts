import { expect, test } from "bun:test";
import { buildVfs } from "./builder.ts";

const stableIdPaths = {
	has: ["/css/selectors/has.md"],
	"anchor-positioning": ["/css/misc/anchor-positioning.md"],
	"field-sizing": ["/css/css/field-sizing.md"],
	scope: ["/css/css/scope.md"],
	"starting-style": ["/css/css/starting-style.md"],
	"text-wrap-balance": ["/css/text-wrap/text-wrap-balance.md"],
	"view-transitions": ["/css/view-transitions/view-transitions.md"],
	"color-mix": ["/css/css/color-mix.md"],
	"light-dark": ["/css/css/light-dark.md"],
	"container-queries": ["/css/container-queries/container-queries.md"],
};

test("stable CSS feature ids continue to resolve in VFS", () => {
	const vfs = buildVfs();

	expect(
		Object.fromEntries(
			Object.keys(stableIdPaths).map((id) => [
				id,
				Object.keys(vfs)
					.filter((path) => path.endsWith(`/${id}.md`))
					.sort((left, right) => left.localeCompare(right)),
			]),
		),
	).toEqual(stableIdPaths);
});

test("VFS contains expected group directories", () => {
	const vfs = buildVfs();
	const groups = new Set(
		Object.keys(vfs)
			.map((path) => path.split("/")[2])
			.filter((group): group is string => group !== undefined),
	);

	expect(
		Object.fromEntries(
			["selectors", "animation", "container-queries"].map((group) => [
				group,
				groups.has(group),
			]),
		),
	).toEqual({
		selectors: true,
		animation: true,
		"container-queries": true,
	});
});
