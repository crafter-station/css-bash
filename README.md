# css-bash

LLMs are trained on old CSS. css-bash teaches them modern CSS by giving them a bash.

css-bash exposes the [`web-features`](https://www.npmjs.com/package/web-features) CSS catalog as a virtual filesystem inside [`just-bash`](https://github.com/vercel-labs/just-bash), then serves it over MCP. Agents can discover newer platform features with commands they already know: `ls`, `cat`, `find`, `grep`, `head`, `wc`, and pipes.

## Install

Add css-bash to your MCP client config:

```jsonc
{
  "mcpServers": {
    "css-bash": {
      "command": "bunx",
      "args": ["-y", "css-bash"]
    }
  }
}
```

The default command starts the MCP stdio server:

```bash
bunx -y css-bash
```

## REPL Demo

Use the REPL when you want to explore the catalog directly:

```bash
bunx -y css-bash --repl
```

Example session:

```text
css-bash> whatsnew 2025
abs-sign - abs() and sign() (2025-06-26)
...
css-bash> support has
Feature: :has()
Baseline: widely available
...
css-bash> ls /css/view-transitions
...
css-bash> exit
```

## Commands

| Command | Use |
| --- | --- |
| `baseline newly` | List Baseline newly available CSS features. |
| `baseline widely` | List Baseline widely available CSS features. |
| `baseline limited` | List limited availability CSS features. |
| `baseline all` | List every CSS feature in the catalog. |
| `support <feature-id>` | Show the browser support matrix for a feature. |
| `whatsnew [year]` | List features that became Baseline newly available in a year. |
| `recipe <pattern>` | Find curated CSS implementation recipes. |

## VFS Layout

```text
/css
  /{group}
    /{feature-id}.md
  /_baseline
    /newly.md
    /widely.md
    /limited.md
  /_year
    /2023.md
    /2024.md
    /2025.md
    /2026.md
  /_recipes
    /{recipe}.md
```

Feature files include the human-readable name, description, Baseline status, Baseline dates, browser support, spec links, caniuse links when available, and MDN browser-compat keys.

## Why Bash

Agents already know how to inspect filesystems and compose shell commands. A VFS keeps the catalog local and offline, while bash makes discovery flexible: `find /css -name '*anchor*'`, `grep -R "Baseline: newly" /css`, or `cat /css/selectors/has.md`.

## Why web-features

`web-features` is maintained by the WebDX Community Group and ships structured data for Baseline status, browser support, specs, groups, and feature descriptions. css-bash uses that package at runtime, so the catalog updates when the dependency updates.

## For Agents

See [AGENTS.md](./AGENTS.md) for repository instructions, stack constraints, and the recommended css-bash query workflow for AI coding tools.

## License

MIT. See [LICENSE](./LICENSE).
