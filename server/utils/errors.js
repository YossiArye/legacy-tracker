class HttpError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

class NotFoundError extends HttpError {
  constructor(message) {
    super(message, 404);
  }
}

class BadRequestError extends HttpError {
  constructor(message) {
    super(message, 400);
  }
}

class ValidationError extends HttpError {
  constructor(errors) {
    super('Validation failed', 400);
    this.errors = errors;
    this.isValidationError = true;
  }
}

export { HttpError, NotFoundError, BadRequestError, ValidationError };
