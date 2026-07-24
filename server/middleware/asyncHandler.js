// Wraps async route handlers so thrown errors pass to Express's error middleware
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export { asyncHandler };
