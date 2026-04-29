# Local MCP test

Add this server entry to the `mcpServers` section in `/Users/raillyhugo/.config/claude/settings.json`:

```json
{
  "css-bash-local": {
    "command": "bun",
    "args": [
      "run",
      "/Users/raillyhugo/Programming/crafter-station/css-bash/bin/css-bash.ts"
    ]
  }
}
```

Then restart Claude Code and ask it to use css-bash for a query such as:

```text
what CSS features became baseline newly in 2025? use css-bash
```

The expected tool call is `css_shell` with a command like:

```bash
whatsnew 2025
```
