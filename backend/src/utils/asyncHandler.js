// asyncHandler wraps async route handlers so thrown / rejected errors
// propagate to the global error middleware automatically.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
