# css-bash — Agent instructions

## Identity
This repo is an MCP server that exposes a virtual filesystem of modern CSS features (from the `web-features` npm package) inside a `just-bash` sandbox. LLMs query it with bash commands.

## Stack (locked, do not change)
- Runtime: **Bun** (NEVER npm/yarn/pnpm). Use `bun add`, `bun install`, `bun run`, `bun test`.
- Lint/format: **Biome** (NEVER eslint/prettier). `biome check src`, `biome format --write src`.
- TypeScript strict, ESM, .ts imports.
- Deps:
  - `just-bash` — bash sandbox with virtual filesystem, custom commands via `defineCommand`.
  - `web-features` — JSON catalog of 1165 web platform features (~429 CSS) with baseline status.
  - `@modelcontextprotocol/sdk` — MCP server stdio.
  - `zod` — schema validation for tool inputs.

## Repo layout
```
css-bash/
├── bin/
│   └── css-bash.ts            # entrypoint: dispatch --repl|--server|--help
├── src/
│   ├── index.ts               # re-exports buildVfs, allCommands, startServer, runRepl
│   ├── vfs/
│   │   ├── builder.ts         # buildVfs(): Record<path, content>
│   │   ├── markdown.ts        # featureToMarkdown(id, feature)
│   │   ├── filter.ts          # isCssFeature(feature)
│   │   ├── builder.test.ts
│   │   └── smoke.test.ts      # contract test for stable feature ids (V6)
│   ├── commands/
│   │   ├── baseline.ts        # cmd: baseline newly|widely|limited|all
│   │   ├── support.ts         # cmd: support <feature-id>
│   │   ├── whatsnew.ts        # cmd: whatsnew [year]
│   │   ├── recipe.ts          # cmd: recipe <pattern>
│   │   ├── *.test.ts
│   │   └── index.ts           # exports allCommands array
│   ├── mcp/
│   │   ├── server.ts          # McpServer config + tool defs
│   │   ├── describe.ts        # buildDescribeText(): onboarding md
│   │   └── server.test.ts
│   ├── repl/
│   │   └── runner.ts          # readline loop -> bash.exec()
│   └── recipes/
│       ├── loader.ts          # readRecipes(): Record<slug, content>
│       └── loader.test.ts
├── recipes/                   # source markdown for V5 (hand-curated)
└── .github/workflows/
    ├── test.yml
    └── publish.yml
```

## Hard rules

- DO commit locally with conventional commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`).
- DO write unit tests for every public function — collocate as `*.test.ts`.
- DO assert full stdout/stderr (no `toContain` — use exact strings or full-shape match).
- DO push to `origin main` after each slice ships green.
- DO NOT add Co-Authored-By in commits.
- DO NOT introduce dependencies beyond the locked four (just-bash, web-features, @modelcontextprotocol/sdk, zod) without justification.
- DO NOT use wasm packages (just-bash explicitly bans them; not needed here anyway).
- DO NOT touch `recipes/*.md` content — those are hand-curated by Hunter (V5 only adds new files, V1-V4 don't touch).
- DO NOT modify the autopilot orchestrator or Hunter's vault.

## Slice plans (read before working)
Plans live in the vault at `~/hunter-brain/04_Projects/_shaping/css-bash/V{1..6}-plan.md`. Each plan has Goal, Acceptance script, Files to create, Implementation steps, Tests, Out of scope, Risks. Treat it as the source of truth.

## Commands
```bash
bun install
bun test                   # all tests
bun run repl               # interactive REPL
bun run server             # MCP stdio (used by Claude Code)
bun bin/css-bash.ts --help # CLI help
biome check src --write    # lint + format
```

## Spike findings (already validated, don't redo)
- 429 CSS features in `web-features`. 130 newly (low), 239 widely (high), 131 limited (false).
- 49 CSS groups (animation, selectors, container-queries, view-transitions, anchor-positioning, scroll-markers, text-wrap, etc).
- `feature.group` is an **array**, not a string. Iterate all entries when building the VFS path index.
- Custom commands return full string at once — pipes work fine because `head`/`grep` are native in just-bash.
- web-features is JSON only — zero network at runtime. Auto-update via Renovate.

## When in doubt
1. Read the slice plan first.
2. Read just-bash README at `node_modules/just-bash/README.md` (or local clone at `~/Programming/oss/just-bash`).
3. Read `web-features` types at `node_modules/web-features/index.d.ts`.
4. Add a unit test that fails, then make it pass.
