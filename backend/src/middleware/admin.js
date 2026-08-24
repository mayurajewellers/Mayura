/**
 * Admin Authorization Middleware
 * Verifies that the authenticated user has role === 'ADMIN'.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden: Admin privileges required.',
    })
  }
  next()
}

export default requireAdmin
