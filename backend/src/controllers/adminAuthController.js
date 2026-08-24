import User from '../models/User.js'
import { signToken } from '../utils/jwt.js'

/**
 * @desc    Authenticate admin user and return JWT
 * @route   POST /api/v1/admin/auth/login
 * @access  Public (Admin only allowed)
 */
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' })
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Find user and explicitly select passwordHash
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash')

    // CRITICAL SECURITY RULE: Only users whose database role is ADMIN can log in here.
    // If user does not exist OR user.role !== 'ADMIN', reject with 401.
    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      })
    }

    // Verify password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      })
    }

    // Account status check
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is disabled',
      })
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date()
    await user.save()

    // Generate JWT token for Admin
    const token = signToken({ userId: user._id.toString(), role: user.role })

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        user: user.toSafeObject(),
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get currently authenticated admin user profile
 * @route   GET /api/v1/admin/auth/me
 * @access  Private (ADMIN role required)
 */
export const getAdminMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Authenticated admin profile',
    data: {
      user: req.user.toSafeObject(),
    },
  })
}
