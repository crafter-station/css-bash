export function buildDescribeText(): string {
	return `# css-bash - Modern CSS catalog as a virtual filesystem

You can explore CSS features baseline newly/widely/limited using bash.

## Layout
- /css/{group}/{feature-id}.md - one file per CSS feature
- /css/_baseline/newly.md - index of newly available features
- /css/_baseline/widely.md - index of widely available features
- /css/_baseline/limited.md - index of experimental or limited support features
- /css/_year/{2023,2024,2025,2026}.md - features that became baseline newly in that year
- /css/_recipes/*.md - curated patterns when recipes are installed

## Custom commands
- baseline <newly|widely|limited|all>
- support <feature-id>
- whatsnew [year]
- recipe <pattern>

## Native bash
ls, cat, head, tail, grep, find, wc, echo, pipes (|), redirection (>), env vars

## Examples

What's new in CSS this year?
\`\`\`bash
whatsnew 2025
\`\`\`

Show modern selectors.
\`\`\`bash
ls /css/selectors
\`\`\`

Read a feature.
\`\`\`bash
cat /css/selectors/has.md
\`\`\`

Check browser support for an experimental feature.
\`\`\`bash
support anchor-positioning
\`\`\`

Find scroll-related features.
\`\`\`bash
find /css -name '*scroll*' | head
\`\`\`

Find newly available container-query related features.
\`\`\`bash
baseline newly | grep container
\`\`\`

## When to use
Before writing CSS. If unsure whether a property exists or what its support looks like, query first.
`;
}
