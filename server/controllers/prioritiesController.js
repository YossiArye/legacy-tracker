import { VALID_PRIORITIES } from '../utils/validate.js';

/**
 * Lists the valid task priority levels.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function listPriorities(req, res) {
  res.json(VALID_PRIORITIES);
}

export { listPriorities };
