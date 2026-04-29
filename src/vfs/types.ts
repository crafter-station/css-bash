import type { features } from "web-features";

export type WebFeature = (typeof features)[string];

export type CssFeature = Extract<WebFeature, { kind: "feature" }>;
