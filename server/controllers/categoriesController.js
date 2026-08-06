import { VALID_CATEGORIES } from '../utils/validate.js';

/**
 * Lists the valid task categories.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function listCategories(req, res) {
  res.json(VALID_CATEGORIES);
}

export { listCategories };
