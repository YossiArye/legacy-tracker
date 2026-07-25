---
paths: ["server/**"]
---

# API rules

- Every route that handles a request with a body (`POST`, `PATCH`, etc.) must validate that body through Express middleware **before** it reaches the route handler — never validate inline inside a controller function.
- Reuse an existing middleware when the payload shape matches:
  - `server/middleware/validateTaskBody.js` — task create/update payloads (`{ title, priority, completed }`). Also normalizes the payload (e.g. trims `title`) before handing it to the route handler.
  - `server/middleware/validateBulkImportBody.js` — the bulk-import payload (`{ data }`).
- If a new route needs a payload shape none of the existing middleware covers, add a new middleware under `server/middleware/` rather than validating inline in the route or controller. Keep the same contract as the existing ones: on failure, call `res.status(400).json(...)` and return (don't call `next()`); on success, call `next()`.
- Routes that only read (`GET`) or that act on the URL alone with no body (`DELETE /:id`) don't need a body-validation middleware.
- Controller functions should be able to assume `req.body` is already valid and normalized by the time they run.
