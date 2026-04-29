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
	"anchor-positioning": ["floating-ui", "popper.js", "popper", "react-popper"],
	popover: ["floating-ui", "popper.js", "react-popper"],
	"absolute-positioning": ["floating-ui", "popper.js"],
	"sticky-positioning": ["floating-ui"],

	// View transitions
	"view-transitions": [
		"framer-motion",
		"react-transition-group",
		"react-spring",
	],
	"cross-document-view-transitions": [
		"framer-motion",
		"react-transition-group",
	],
	"active-view-transition": ["framer-motion", "react-transition-group"],
	"view-transition-class": ["framer-motion"],

	// Transitions / interpolation / animations
	transitions: ["framer-motion", "react-spring", "anime.js"],
	"transition-behavior": ["framer-motion", "react-transition-group"],
	"interpolate-size": ["framer-motion", "react-spring"],
	"starting-style": ["framer-motion", "react-transition-group"],
	"animations-css": ["gsap", "anime.js", "framer-motion", "velocity.js"],
	"animation-composition": ["framer-motion", "gsap"],
	"display-animation": ["framer-motion"],

	// Scroll-driven
	"scroll-driven-animations": [
		"gsap",
		"scrollmagic",
		"locomotive-scroll",
		"framer-motion",
	],

	// Form ergonomics
	"field-sizing": ["react-textarea-autosize"],

	// Color
	"color-mix": ["color.js", "polished", "chroma.js", "tinycolor"],
	"color-function": ["color.js", "polished", "chroma.js"],
	"light-dark": ["color.js"],
	"relative-color": ["color.js", "polished"],

	// Layout
	masonry: ["masonry.js", "react-masonry-css"],

	// Images
	"image-set": ["picturefill", "lazysizes"],
};

export function curatedReplaces(featureId: string): string[] {
	return FEATURE_REPLACES[featureId] ?? [];
}
