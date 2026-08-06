---
name: audit-todos
description: Search the whole repo for TODO/FIXME comments and report each one with file:line.
context: fork
agent: Explore
---

Search this entire repository for `TODO` and `FIXME` comments — in code, config, and docs, anywhere in the tree (not just `server/` or `client/`) — excluding `node_modules/` and `dist/`.

For each one found, report:

- `file:line`
- The exact comment text
- One short phrase on what it's flagging, inferred from the surrounding code

Group the results by file, and finish with a total count.
