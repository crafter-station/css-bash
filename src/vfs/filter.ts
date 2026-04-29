import type { WebFeature } from "./types.ts";

export function isCssFeature(feature: WebFeature): boolean {
	return (
		feature.kind === "feature" &&
		(feature.compat_features ?? []).some((compatFeature) =>
			compatFeature.startsWith("css."),
		)
	);
}
