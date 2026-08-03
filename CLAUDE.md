# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # run client (Vite, :5173) + server (Express, :4000) concurrently
npm run dev:server     # server only — node server/index.js
npm run dev:client     # client only — vite
npm run build          # vite build -> outputs to ../dist (see vite.config.js)
npm test               # vitest run (server-side tests only, see below)
npx vitest run server/__tests__/store.test.js   # run a single test file
npx vitest run -t "getTaskById"                 # run tests matching a name
npm run lint           # eslint .
```

There is no test watch script defined; use `npx vitest` (no `run`) for watch mode.

## Architecture

Single-package repo (one `package.json`, no workspaces) containing an Express API and a React (Vite) client as siblings:

```
server/   Express API — the source of truth for behavior
client/   React SPA (Vite) — talks to the API over relative /api/* fetches
```

- **Dev wiring**: Vite's dev server proxies `/api/*` to `http://localhost:4000` (`vite.config.js`). There is no production static-file serving wired up — `vite build` emits to `dist/` but `server/index.js` never serves it.
- **Request flow**: `client/src/api/tasksApi.js` (fetch wrappers) → `client/src/hooks/useTasks.js` (the only state-management layer — plain `useState`/`useCallback`, no Redux/Context) → components. There's no global store; `App.jsx` calls `useTasks()` once and passes callbacks down as props.
- **Rendering the task list**: `App.jsx` filters `tasks` by the local `filter` state (all/active/completed) and passes the result to `client/src/components/TaskList.jsx`, which renders the `<ul>` (or an empty-state message) and delegates each row to `client/src/components/TaskItem.jsx` (checkbox + title + remove button). `TaskItem` is presentational only — `onToggle`/`onRemove` callbacks passed down from `useTasks` do the actual work.
- **Server flow**: `server/routes/tasks.js` → `server/controllers/tasksController.js` → `server/store.js` (in-memory array, reset on every restart, no persistence) + `server/activityLog.js` (records create/update/delete, deliberately delayed 50ms via `setTimeout` to simulate an external call).
- `server/index.js` exports the Express `app` for supertest-based integration tests and only calls `.listen()` when run directly (guarded by `isMain`/`fileURLToPath` check) — keep that pattern when touching startup logic.
- Validation (`server/utils/validate.js`) is shared between single-create and the bulk `/api/tasks/import` endpoint; the import endpoint (`bulkImportTasks` in `tasksController.js`) also does its own dedup + keyword-based priority escalation (`urgent`/`asap`/`critical`/`now` → forces `high`), delegating parsing, priority resolution, and stats-building to focused helper functions (`parseImportLine`, `resolvePriority`, `buildImportStats`).

## Code style

- Use the logger in `server/utils/logger.js` — never `console.log`.
- All new functions get JSDoc.
- Prefer `const`.
