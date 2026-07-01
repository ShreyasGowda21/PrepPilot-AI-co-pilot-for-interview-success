// Wrap a validator function and translate its error list to an ApiError.
const ApiError = require('../utils/ApiError');

const validate = (validatorFn) => (req, _res, next) => {
  const errors = validatorFn(req.body) || [];
  if (errors.length) return next(ApiError.badRequest('Validation failed', errors));
  next();
};

module.exports = validate;
