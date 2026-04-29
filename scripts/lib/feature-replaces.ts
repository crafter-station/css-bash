/**
 * Curated map: web-features ID -> JS libraries this CSS feature directly replaces.
 *
 * The LLM was unreliable at this — it would invent floating-ui as a replace
 * for unrelated features like cascade-layers. We compute it deterministically
 * from this hand-curated map. Both build-intent-index.ts (online) and
 * rebuild-index.ts (offline) use this single source of truth.
 *
 * Add a row only when a developer would Google this feature as the
 * replacement for that lib. When in doubt, leave the feature out — empty
 * replaces is correct for ~95% of CSS features.
 */
export const FEATURE_REPLACES: Record<string, string[]> = {
	// Positioning
	"anchor-positioning": [
		"floating-ui",
		"popper.js",
		"popper",
		"react-popper",
		"tippy.js",
		"@floating-ui/react",
	],
	popover: [
		"floating-ui",
		"popper.js",
		"react-popper",
		"radix-popover",
		"@radix-ui/react-popover",
		"headlessui",
	],
	"absolute-positioning": ["floating-ui", "popper.js"],
	"sticky-positioning": ["floating-ui"],

	// View transitions
	"view-transitions": [
		"framer-motion",
		"motion-one",
		"react-transition-group",
		"react-spring",
		"auto-animate",
	],
	"cross-document-view-transitions": [
		"framer-motion",
		"react-transition-group",
		"next-view-transitions",
	],
	"active-view-transition": ["framer-motion", "react-transition-group"],
	"view-transition-class": ["framer-motion"],

	// Transitions / interpolation / animations
	transitions: ["framer-motion", "motion-one", "react-spring", "anime.js"],
	"transition-behavior": ["framer-motion", "react-transition-group"],
	"interpolate-size": ["framer-motion", "react-spring", "auto-animate"],
	"starting-style": ["framer-motion", "react-transition-group", "auto-animate"],
	"animations-css": [
		"gsap",
		"anime.js",
		"framer-motion",
		"motion-one",
		"velocity.js",
		"animate.css",
	],
	"animation-composition": ["framer-motion", "gsap"],
	"display-animation": ["framer-motion", "auto-animate"],

	// Scroll-driven
	"scroll-driven-animations": [
		"gsap",
		"scrollmagic",
		"locomotive-scroll",
		"framer-motion",
		"motion-one",
	],
	"scroll-snap": ["full-page-js", "swiper", "embla-carousel"],

	// Form ergonomics
	"field-sizing": [
		"react-textarea-autosize",
		"autosize",
		"react-autosize-textarea",
	],

	// Color
	"color-mix": ["color.js", "polished", "chroma.js", "tinycolor"],
	"color-function": ["color.js", "polished", "chroma.js"],
	"light-dark": ["color.js"],
	"relative-color": ["color.js", "polished"],

	// Layout
	masonry: ["masonry.js", "react-masonry-css", "isotope"],

	// Images
	"image-set": ["picturefill", "lazysizes"],

	// Sibling reactivity / parent selector
	has: ["alpinejs", "intersection-observer", "headlessui"],

	// Typed CSS variables
	"registered-custom-properties": ["polished", "css-typed-om"],

	// Scope
	scope: ["css-modules", "styled-components", "emotion"],

	// Container queries
	"container-queries": ["react-resize-detector", "use-resize-observer"],

	// Subgrid
	subgrid: [],
};

export function curatedReplaces(featureId: string): string[] {
	return FEATURE_REPLACES[featureId] ?? [];
}

/**
 * Assert every key in FEATURE_REPLACES references a real web-features ID.
 * Throws on first orphan so build/index pipeline fails fast instead of
 * silently skipping a curated entry.
 */
export function assertCuratedIdsExist(
	allFeatureIds: ReadonlySet<string>,
): void {
	const orphans = Object.keys(FEATURE_REPLACES).filter(
		(id) => !allFeatureIds.has(id),
	);
	if (orphans.length > 0) {
		throw new Error(
			`scripts/lib/feature-replaces.ts has ${orphans.length} curated entries with no matching web-features ID:\n  ${orphans.join("\n  ")}\nFix the IDs or remove the entries.`,
		);
	}
}
