---
name: ship
description: Release button - runs the full check suite, commits any pending work, and bumps the patch version. Never push. Human-triggered only.
disable-model-invocation: true
allowed-tools:
  - Bash(npm test:*)
  - Bash(npm run lint:*)
  - Bash(git status:*)
  - Bash(git diff:*)
  - Bash(git add:*)
  - Bash(git commit:*)
  - Bash(npm version patch:*)
---

Run this checklist in order. If any step fails, stop immediately and report exactly what failed — do not continue to a later step.

## 1. Full checks

Run `npm test` and `npm run lint`.

If either one fails, stop here and report what failed. Do not touch git or npm version — a failing check means we are not shipping.

## 2. Commit any uncommitted work

`npm version` (step 3) refuses to run on a dirty working tree, so this has to happen first, unconditionally, before step 3 runs.

Run `git status` to check for uncommitted changes.

- If the tree is already clean, skip straight to step 3.
- If there are uncommitted changes: run `git diff` (and `git diff --cached` too, if anything's already staged) to understand what actually changed, `git add` the relevant files, then `git commit` with a message describing the real change — not a generic "wip" or "checkpoint" message.

Do not proceed to step 3 until `git status` reports a clean tree.

## 3. Bump the version

Run `npm version patch`.

- Do NOT pass `--no-git-tag-version`.
- Do NOT hand-write the version-bump commit or create the tag yourself with `git tag`. `npm version` creates both the commit and the tag itself — let it.

## 4. Do not push

Nothing leaves this machine as part of `/ship`. Never run `git push` (or anything that pushes) as part of this skill.

## 5. Report back

Report, plainly:

- The new version number (from `npm version patch`'s output).
- The tag it created (npm's default: `v<version>`).
- The exact command to push when ready: `git push --follow-tags` (pushes the commit(s) and the new tag together in one command).
