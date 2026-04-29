import { expect, test } from "bun:test";
import { Bash } from "just-bash";
import { buildVfs } from "./builder.ts";

test("buildVfs contains the :has() feature in selectors", () => {
	const vfs = buildVfs();
	const hasDoc = vfs["/css/selectors/has.md"];

	expect(typeof hasDoc).toBe("string");
	expect(hasDoc?.includes("baseline")).toBe(true);
	expect(hasDoc?.includes(":has()")).toBe(true);
});

test("cat reads the full :has() document through just-bash", async () => {
	const vfs = buildVfs();
	const bash = new Bash({ files: vfs });
	const hasDoc = vfs["/css/selectors/has.md"];
	const result = await bash.exec("cat /css/selectors/has.md");

	if (hasDoc === undefined) {
		throw new Error("Expected /css/selectors/has.md in VFS");
	}

	expect(result.exitCode).toBe(0);
	expect(result.stderr).toBe("");
	expect(result.stdout).toBe(hasDoc);
});

test("ls /css shows at least 30 entries", async () => {
	const bash = new Bash({ files: buildVfs() });
	const result = await bash.exec("ls /css");

	expect(result.exitCode).toBe(0);
	expect(result.stderr).toBe("");
	expect(
		result.stdout.split("\n").filter(Boolean).length,
	).toBeGreaterThanOrEqual(30);
});

test("find returns scroll feature paths", async () => {
	const bash = new Bash({ files: buildVfs() });
	const result = await bash.exec("find /css -name '*scroll*'");

	expect(result.exitCode).toBe(0);
	expect(result.stderr).toBe("");
	expect(result.stdout.length > 0).toBe(true);
	expect(
		result.stdout
			.split("\n")
			.filter(Boolean)
			.every((path) => path.includes("scroll")),
	).toBe(true);
});
