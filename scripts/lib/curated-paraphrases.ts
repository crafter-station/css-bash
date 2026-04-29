/**
 * Manually-curated paraphrases for top features where the LLM run produced
 * gaps. Merged into the search index alongside the generated paraphrases.
 *
 * Add an entry only when a representative query consistently misses the
 * correct feature. Each entry should be a real Stack Overflow / Reddit
 * style query, mixed ES + EN.
 */
export const CURATED_PARAPHRASES: Record<string, string[]> = {
	"field-sizing": [
		"how to make a textarea auto-grow as i type",
		"auto grow textarea pure css",
		"textarea expands with content",
		"cómo hacer que un textarea crezca automáticamente",
		"textarea que se agranda con el contenido sin javascript",
		"input field that resizes to content",
		"auto resize textarea css only",
		"how do i make a textarea height fit content",
		"field auto resize",
		"textarea altura automatica",
	],
	"interpolate-size": [
		"animate height auto in css",
		"transition from height 0 to auto",
		"animate width auto",
		"interpolate to keyword values",
		"cómo animar de 0 a auto",
		"accordion height auto animation pure css",
		"transition height to fit-content",
	],
	"text-wrap-balance": [
		"balance heading line wrap",
		"avoid orphan words in headings",
		"distribute heading text evenly across lines",
		"cómo balancear el wrap de un titulo",
		"heading text balance",
		"prevent single word on last line",
	],
	"text-wrap-pretty": [
		"pretty text wrap last line",
		"avoid widow words in paragraphs",
		"better text wrapping for paragraphs",
		"cómo evitar palabras huerfanas",
	],
	"starting-style": [
		"animate popover when it opens",
		"enter animation for dialog",
		"animate from display none",
		"transition on first render",
		"cómo animar la entrada de un popover",
		"dialog open animation",
		"appear animation css only",
	],
	"anchor-positioning": [
		"position element relative to another element",
		"tooltip anchored to button",
		"floating menu attached to trigger",
		"anclar tooltip a un boton",
		"menu posicionado al lado de su trigger",
		"position tooltip without javascript",
		"connector line between two elements",
	],
	popover: [
		"native popover html attribute",
		"popover api built into html",
		"top layer popover without js library",
		"cómo hacer un popover nativo",
		"popover sin react portal",
	],
	"view-transitions": [
		"animate route change in react",
		"page transition between routes",
		"shared element transition",
		"cómo animar cambio de pagina",
		"transition between dom states",
		"morph between two layouts",
	],
	"scroll-driven-animations": [
		"animate based on scroll position",
		"scroll progress animation",
		"parallax scroll css only",
		"animation linked to scroll",
		"animation timeline scroll",
		"cómo animar al hacer scroll",
		"reveal element on scroll",
	],
	"light-dark": [
		"system color scheme theme",
		"dark mode css only no js",
		"prefers-color-scheme alternative function",
		"cómo hacer dark mode con css",
		"light dark mode toggle",
	],
	"color-mix": [
		"blend two colors at runtime",
		"darken color in css",
		"lighten color css",
		"mix two colors percentage",
		"cómo mezclar dos colores en css",
		"tint variations of brand color",
	],
	subgrid: [
		"align inner grid with outer grid",
		"nested grid same tracks as parent",
		"cards with aligned headers and footers",
		"cómo alinear un grid hijo con el padre",
		"share grid tracks with child",
	],
	"container-queries": [
		"style based on parent size not viewport",
		"responsive based on container width",
		"component-level media query",
		"cómo hacer queries por contenedor",
		"container size queries",
		"@container syntax",
	],
	masonry: [
		"pinterest layout css",
		"masonry layout without js",
		"variable height grid items",
		"cómo hacer layout tipo pinterest",
		"grid template rows masonry",
	],
	has: [
		"parent selector css",
		"select parent based on children",
		"style element when it contains certain child",
		"sibling selector reactive to hover",
		"card hover affects siblings",
		"cómo seleccionar el padre en css",
		"parent reactive to child state",
		":has() selector",
	],
	scope: [
		"css module style scoping native",
		"scoped css without preprocessor",
		"limit styles to a section",
		"cómo limitar estilos a un componente",
		"@scope at-rule",
	],
	"registered-custom-properties": [
		"typed css custom properties",
		"animate custom property",
		"declare typed variable in css",
		"@property at-rule",
		"register css custom property",
		"animatable css variable",
		"cómo animar una variable css",
	],
};

export function curatedParaphrases(featureId: string): string[] {
	return CURATED_PARAPHRASES[featureId] ?? [];
}
