import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import PasswordResetToken from '../models/PasswordResetToken.js'
import { signToken } from '../utils/jwt.js'
import config from '../config/env.js'

/**
 * @desc    Register a new customer account
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' })
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' })
    }
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Check for existing user
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Try signing in instead.',
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // SECURITY CRITICAL: Public registration ALWAYS creates role CUSTOMER.
    // Any role field sent by the client is strictly ignored.
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : '',
      passwordHash,
      role: 'CUSTOMER', // Hardcoded CUSTOMER role
      isActive: true,
      isEmailVerified: false,
    })

    // Generate JWT
    const token = signToken({ userId: user._id.toString(), role: user.role })

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
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
 * @desc    Authenticate customer and get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
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

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    // Verify password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    // Account status check
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is disabled. Please contact support.',
      })
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date()
    await user.save()

    // Generate JWT
    const token = signToken({ userId: user._id.toString(), role: user.role })

    return res.status(200).json({
      success: true,
      message: 'Login successful',
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
 * @desc    Get currently authenticated customer profile
 * @route   GET /api/v1/auth/me
 * @access  Private (CUSTOMER or ADMIN)
 */
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Authenticated user profile',
    data: {
      user: req.user.toSafeObject(),
    },
  })
}

/**
 * @desc    Logout customer / acknowledge token clearance
 * @route   POST /api/v1/auth/logout
 * @access  Public / Private
 */
export const logout = async (_req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully. Please clear your token from client storage.',
  })
}

/**
 * @desc    Request password reset token
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail })

    // Generic response to prevent account enumeration
    const genericResponse = {
      success: true,
      message: 'If an account exists for this email, password reset instructions will be processed.',
    }

    if (!user || !user.isActive) {
      return res.status(200).json(genericResponse)
    }

    // Generate cryptographically random token
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry

    // Purge old tokens for user
    await PasswordResetToken.deleteMany({ userId: user._id })

    // Store tokenHash in database
    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    })

    // Development safe inspection output (for Postman/curl manual verification)
    if (config.nodeEnv === 'development') {
      console.log(`\n[DEV TESTING] Password reset token for ${normalizedEmail}:`)
      console.log(`[DEV TESTING] Raw Token: ${rawToken}\n`)
    }

    return res.status(200).json({
      ...genericResponse,
      ...(config.nodeEnv === 'development' ? { devTestRawToken: rawToken } : {}),
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Reset password using reset token
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !token.trim()) {
      return res.status(400).json({ success: false, message: 'Reset token is required' })
    }
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long',
      })
    }

    // Hash incoming token to match tokenHash
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex')

    // Find valid token
    const resetRecord = await PasswordResetToken.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    })

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.',
      })
    }

    // Find user
    const user = await User.findById(resetRecord.userId)
    if (!user || !user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is invalid or disabled.',
      })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    user.passwordHash = await bcrypt.hash(newPassword, salt)
    await user.save()

    // Mark reset token as used
    resetRecord.usedAt = new Date()
    await resetRecord.save()

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. You may now log in with your new password.',
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update current authenticated user profile
 * @route   PUT /api/v1/auth/me
 * @access  Private
 */
export const updateMe = async (req, res, next) => {
  try {
    const { name, phone, addresses, avatar } = req.body
    const user = req.user

    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    if (name && name.trim()) user.name = name.trim()
    if (phone !== undefined) user.phone = phone.trim()
    if (avatar !== undefined) user.avatar = avatar.trim()
    if (Array.isArray(addresses)) user.addresses = addresses

    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toSafeObject(),
      },
    })
  } catch (error) {
    next(error)
  }
}

