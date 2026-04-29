# css-bash

> LLMs are trained on 2022 CSS. css-bash teaches them 2026 CSS — by giving them a bash.

A modern CSS catalog (powered by [`web-features`](https://www.npmjs.com/package/web-features) from the WebDX CG) exposed as a virtual filesystem inside [`just-bash`](https://github.com/vercel-labs/just-bash) and served over MCP. LLMs explore CSS with the shape they already know — `cat`, `grep`, `find`, pipes — instead of having to learn a custom API.

## Status

🚧 **In construction** — built overnight 2026-04-29 by Hunter + Codex autopilot. V1-V6 slice plans live in [hunter-brain/04_Projects/_shaping/css-bash](https://github.com/Railly/kai/tree/main/04_Projects/_shaping/css-bash).

## What you get

- **VFS** at `/css/{group}/{feature-id}.md` — 429 CSS features from `web-features`, one per file.
- **Indices** at `/css/_baseline/{newly,widely,limited}.md` and `/css/_year/{2023..2026}.md`.
- **Custom commands**: `baseline <newly|widely|limited|all>`, `support <feature-id>`, `whatsnew [year]`, `recipe <pattern>`.
- **Recipes** at `/css/_recipes/*.md` — 10 hand-curated patterns that replace JS workarounds with modern CSS-native primitives.
- **MCP server** with two tools: `css_shell(command)` and `css_describe()`.

## Install (after V4 ships)

```jsonc
// .mcp.json (or ~/.config/claude/mcp.json)
{
  "mcpServers": {
    "css-bash": {
      "command": "bunx",
      "args": ["-y", "css-bash"]
    }
  }
}
```

REPL for humans:
```bash
bunx -y css-bash --repl
```

## Why bash?

LLMs already know how to use `cat`, `grep`, `find`, and pipes — better than they'd know any custom API. just-bash gives them a sandboxed bash with a virtual filesystem; web-features gives us authoritative baseline data; MCP makes it work anywhere. The whole thing is < 1000 LOC of Hunter code on top of two solid primitives.

## License

MIT © Railly Hugo / Crafter Station
