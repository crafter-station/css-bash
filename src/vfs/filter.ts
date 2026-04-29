import type { WebFeature } from "./types.ts";

export function isCssFeature(
	feature: WebFeature,
): feature is Extract<WebFeature, { kind: "feature" }> {
	return (
		feature.kind === "feature" &&
		(feature.compat_features ?? []).some((compatFeature) =>
			compatFeature.startsWith("css."),
		)
	);
}
