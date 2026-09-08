/**
 * Standardized API Response Utilities
 */

const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== null ? (Array.isArray(data) ? { data } : (typeof data === 'object' ? data : { data })) : {}),
  });
};

const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
