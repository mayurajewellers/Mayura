/**
 * 404 Not Found Middleware
 * Catch-all for undefined API routes.
 */
export const notFoundHandler = (req, res, _next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  })
}

export default notFoundHandler
