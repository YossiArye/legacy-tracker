import { ValidationError, HttpError } from '../utils/errors.js';
import { log } from '../utils/logger.js';

// Express error middleware (must have exactly 4 parameters to be recognized as error handler)
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(400).json({ errors: err.errors });
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Unexpected errors: log and return generic 500
  log(`Unexpected error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
}

export { errorHandler };
