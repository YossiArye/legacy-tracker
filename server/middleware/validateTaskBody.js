import { validateTask, normalizeTaskInput } from '../utils/validate.js';

/**
 * Express middleware factory that validates req.body as a task payload.
 * Normalizes the payload first (e.g. trims title), then runs validateTask.
 * On failure, responds 400 with { errors }. On success, replaces req.body
 * with the normalized payload and calls next().
 * @param {object} [options]
 * @param {boolean} [options.partial] - allow a partial payload (for PATCH)
 * @returns {import('express').RequestHandler}
 */
function validateTaskBody({ partial = false } = {}) {
  return (req, res, next) => {
    const payload = normalizeTaskInput(req.body);
    const errors = validateTask(payload, { partial });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    req.body = payload;
    next();
  };
}

export { validateTaskBody };
