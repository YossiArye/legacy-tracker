/**
 * Express middleware that validates req.body.data for the bulk-import
 * endpoint: must be a non-empty string. Responds 400 with { error } on
 * failure, otherwise calls next().
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function validateBulkImportBody(req, res, next) {
  const { data } = req.body;
  if (typeof data !== 'string' || data.trim().length === 0) {
    return res.status(400).json({ error: 'No import data provided' });
  }
  next();
}

export { validateBulkImportBody };
