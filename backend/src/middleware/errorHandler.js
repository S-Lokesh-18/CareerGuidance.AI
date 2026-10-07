export function errorHandler(err, req, res, next) {
  // Log server-side for diagnostics without leaking to client
  console.error('[Error Middleware]', {
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    status: err.status || err.statusCode,
  });

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
    data: null,
  });
}

export default {
  errorHandler,
  notFoundHandler,
};
