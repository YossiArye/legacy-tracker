---
name: add-endpoint
description: Scaffold a new API endpoint (route + controller + test) for a resource, following this repo's conventions. Usage: /add-endpoint <resource> <method>, e.g. /add-endpoint priorities GET
---

Scaffold a new API endpoint for resource **$0** using HTTP method **$1**.

## Steps

1. Read `server/routes/tasks.js`, `server/controllers/tasksController.js`, `server/store.js`, and `server/__tests__/tasksController.test.js` first — they're the reference pattern for how routes, controllers, and tests are structured here. Match that shape; don't invent a new style.

2. **Check whether `$0` already has an endpoint before creating anything.** Look for `server/routes/$0.js`, the matching controller file (named `<resource>Controller.js` — e.g. `tasksController.js` for resource `tasks`) for `$0`, and the matching test file (`<resource>Controller.test.js`) for `$0`.
   - If none exist, this is a new resource — create all three, plus mount the router (step 5).
   - If they exist, `$1` is a new method on an existing resource — **extend** the existing files instead of overwriting them: add one more route line to the existing router (same pattern as `tasks.js` having `GET /`, `GET /next`, `GET /:id`, `POST /`, etc. all in one file), one more exported handler in the existing controller file, and one more `it(...)` block in the existing test file. Skip step 5 — the router is already mounted. Double check the method+path combo doesn't already exist (e.g. don't add a second `GET /` to the same router).

3. New-resource case — create `server/routes/$0.js`: an Express `Router`, wired for `$1 /`, exported default, same shape as `tasks.js`. Existing-resource case — add a new route line to the existing router file.

4. New-resource case — create the controller file following the `<resource>Controller.js` pattern (e.g. `tasksController.js`) for `$0`, with the handler for `$1 /api/$0`. Existing-resource case — add the new handler as another export in the existing controller file. Either way, base the response shape and status code on the method, mirroring `tasksController.js`'s conventions:
   - `GET` → `res.json(...)`
   - `POST` → `res.status(201).json(...)`
   - `PATCH`/`PUT` → `res.json(...)`, or `404` if the target doesn't exist
   - `DELETE` → `res.status(204).end()`, or `404` if the target doesn't exist
   If the handler needs somewhere to keep state and no store exists yet for `$0`, add a small in-memory store following `server/store.js`'s pattern (plain functions over a module-level array) rather than inventing a different persistence approach. If a store already exists for `$0` (from an earlier endpoint on the same resource), reuse it — add a new store function only if the existing ones don't cover what this method needs.

5. Mount the new router in `server/index.js` at `/api/$0`, next to the existing `app.use('/api/tasks', tasksRouter)` line — **new-resource case only**. If the router's already mounted from a previous endpoint on this resource, don't touch `index.js`.

6. Validation: `.claude/rules/api-rules.md` is scoped to `server/**` and will load automatically once you touch these files — follow it. In short: if `$1` is `POST` or `PATCH`/`PUT` (has a request body), add a validation middleware under `server/middleware/`, matching `validateTaskBody.js`'s contract (normalize, validate, `400` + `{ errors }` on failure, `next()` on success). If `$1` is `GET` or `DELETE`, skip body validation — there's no body to validate. If a validation middleware already exists for `$0` and the new method's payload shape matches, reuse it instead of adding a second one.

7. Follow CLAUDE.md: use `log()` from `server/utils/logger.js`, never `console.log`; JSDoc on every new function; prefer `const`. If the handler does anything async (recording to `activityLog`, awaiting a store call that's async, etc.), make the function `async` and `await` it, the way `createTask`/`updateTask`/`deleteTask` do.

8. New-resource case — create the test file following the `<resource>Controller.test.js` pattern (e.g. `tasksController.test.js`) for `$0`, using the same vitest + supertest pattern. Existing-resource case — add new `it(...)` block(s) to the existing test file instead of creating a second one. Either way: `beforeEach` resets relevant store state, tests go through `request(app)`, not the handler function directly. Cover at minimum: the happy path for `$1 /api/$0`, and one relevant edge/error case (e.g. `404` for an unknown id, or `400` for invalid input on a body-carrying method).

9. Run `npm test` and confirm the *whole* suite is green, not just the new/changed test file, before finishing.

Report back what you scaffolded: the files created/edited, and the final route signature (`$1 /api/$0...`).
