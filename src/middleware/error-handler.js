/**
 * Global error handler middleware
 */

export function errorHandler(err, req, res, next) {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });
  
  // Handle specific error types
  if (err.code === 'EADDRINUSE') {
    return res.status(503).json({ 
      error: 'Service temporarily unavailable',
      message: 'Port is already in use'
    });
  }
  
  if (err.message.includes('not configured')) {
    return res.status(503).json({ 
      error: 'Service not configured',
      message: err.message
    });
  }
  
  // Default error response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(statusCode).json({ 
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}

/**
 * Async error wrapper
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

