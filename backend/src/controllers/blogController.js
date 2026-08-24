import mongoose from 'mongoose'
import BlogPost from '../models/BlogPost.js'

/**
 * Utility to escape regex characters for search safety
 */
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

const ALLOWED_CATEGORIES = [
  'Buying Guides',
  'Jewellery Care',
  'Bridal',
  'Gold Investment',
  'Trends',
]

/**
 * Public: Get published & active blog posts
 * GET /api/v1/blog
 */
export const getBlogPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const skip = (page - 1) * limit

    const { category, search, featured, sort } = req.query
    const now = new Date()

    const query = {
      status: 'PUBLISHED',
      isActive: true,
      publishedAt: { $lte: now },
    }

    if (category && category.trim() && category.trim() !== 'All') {
      if (ALLOWED_CATEGORIES.includes(category.trim())) {
        query.category = category.trim()
      } else {
        return res.status(400).json({
          success: false,
          message: `Invalid category filter. Allowed categories: ${ALLOWED_CATEGORIES.join(', ')}`,
        })
      }
    }

    if (featured !== undefined) {
      query.isFeatured = featured === 'true' || featured === true
    }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim())
      const searchRegex = new RegExp(safeSearch, 'i')
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { author: searchRegex },
      ]
    }

    let sortObj = { publishedAt: -1 }
    if (sort === 'oldest') sortObj = { publishedAt: 1 }
    if (sort === 'featured') sortObj = { isFeatured: -1, publishedAt: -1 }

    const [posts, total] = await Promise.all([
      BlogPost.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      BlogPost.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return res.status(200).json({
      success: true,
      message: 'Blog posts fetched successfully',
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Public: Get single published & active blog post by slug
 * GET /api/v1/blog/:slug
 */
export const getBlogPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params
    const now = new Date()

    const post = await BlogPost.findOne({
      slug: slug.toLowerCase().trim(),
      status: 'PUBLISHED',
      isActive: true,
      publishedAt: { $lte: now },
    }).lean()

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found or unpublished',
      })
    }

    // Fetch related posts (same category, excluding current)
    const relatedPosts = await BlogPost.find({
      slug: { $ne: post.slug },
      category: post.category,
      status: 'PUBLISHED',
      isActive: true,
      publishedAt: { $lte: now },
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean()

    return res.status(200).json({
      success: true,
      message: 'Blog post retrieved successfully',
      data: {
        post,
        relatedPosts,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Get paginated list of all blog posts (published, draft, archived, inactive)
 * GET /api/v1/admin/blog
 */
export const getAdminBlogPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const skip = (page - 1) * limit

    const { status, category, isActive, isFeatured, search, sort } = req.query

    const query = {}

    if (status && status.trim()) {
      if (['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status.trim())) {
        query.status = status.trim()
      }
    }

    if (category && category.trim()) {
      if (ALLOWED_CATEGORIES.includes(category.trim())) {
        query.category = category.trim()
      }
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true' || isActive === true
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true' || isFeatured === true
    }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim())
      const searchRegex = new RegExp(safeSearch, 'i')
      query.$or = [
        { title: searchRegex },
        { slug: searchRegex },
        { excerpt: searchRegex },
        { author: searchRegex },
        { legacyId: searchRegex },
      ]
    }

    let sortObj = { publishedAt: -1, createdAt: -1 }
    if (sort === 'oldest') sortObj = { publishedAt: 1, createdAt: 1 }
    if (sort === 'title') sortObj = { title: 1 }

    const [posts, total] = await Promise.all([
      BlogPost.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      BlogPost.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return res.status(200).json({
      success: true,
      message: 'Admin blog posts fetched successfully',
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Create new blog post
 * POST /api/v1/admin/blog
 */
export const createBlogPost = async (req, res, next) => {
  try {
    const postData = { ...req.body }

    delete postData._id

    if (!postData.title || !postData.slug || !postData.category || !postData.excerpt || !postData.content || !postData.coverImage) {
      return res.status(400).json({
        success: false,
        message: 'Title, slug, category, excerpt, content, and coverImage are required fields.',
      })
    }

    if (!ALLOWED_CATEGORIES.includes(postData.category.trim())) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Allowed values: ${ALLOWED_CATEGORIES.join(', ')}`,
      })
    }

    postData.slug = postData.slug.toLowerCase().trim()

    if (!postData.legacyId) {
      postData.legacyId = `BLOG-${Date.now()}`
    }

    // Check duplicate slug
    const existingSlug = await BlogPost.findOne({ slug: postData.slug })
    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message: `Blog post with slug '${postData.slug}' already exists.`,
      })
    }

    // Check duplicate legacyId
    const existingLegacy = await BlogPost.findOne({ legacyId: postData.legacyId })
    if (existingLegacy) {
      return res.status(409).json({
        success: false,
        message: `Blog post with legacyId '${postData.legacyId}' already exists.`,
      })
    }

    const post = await BlogPost.create(postData)

    return res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: { post },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate blog post slug or legacyId.',
      })
    }
    next(error)
  }
}

/**
 * Admin: Get single blog post by ID, legacyId, or slug
 * GET /api/v1/admin/blog/:id
 */
export const getBlogPostById = async (req, res, next) => {
  try {
    const { id } = req.params

    let post = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      post = await BlogPost.findById(id).lean()
    }
    if (!post) {
      post = await BlogPost.findOne({
        $or: [{ legacyId: id }, { slug: id.toLowerCase().trim() }],
      }).lean()
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Blog post retrieved successfully',
      data: { post },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Update blog post
 * PUT /api/v1/admin/blog/:id
 */
export const updateBlogPost = async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    delete updateData._id
    delete updateData.createdAt

    let post = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      post = await BlogPost.findById(id)
    }
    if (!post) {
      post = await BlogPost.findOne({
        $or: [{ legacyId: id }, { slug: id.toLowerCase().trim() }],
      })
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found',
      })
    }

    if (updateData.category && !ALLOWED_CATEGORIES.includes(updateData.category.trim())) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Allowed values: ${ALLOWED_CATEGORIES.join(', ')}`,
      })
    }

    // Check slug uniqueness if changing
    if (updateData.slug && updateData.slug.toLowerCase().trim() !== post.slug) {
      const existing = await BlogPost.findOne({
        slug: updateData.slug.toLowerCase().trim(),
        _id: { $ne: post._id },
      })
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Blog post with slug '${updateData.slug}' already exists.`,
        })
      }
      updateData.slug = updateData.slug.toLowerCase().trim()
    }

    Object.assign(post, updateData)
    await post.save()

    return res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      data: { post },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate blog post slug or legacyId.',
      })
    }
    next(error)
  }
}

/**
 * Admin: Soft-delete (deactivate) blog post
 * DELETE /api/v1/admin/blog/:id
 */
export const deleteBlogPost = async (req, res, next) => {
  try {
    const { id } = req.params

    let post = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      post = await BlogPost.findById(id)
    }
    if (!post) {
      post = await BlogPost.findOne({
        $or: [{ legacyId: id }, { slug: id.toLowerCase().trim() }],
      })
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found',
      })
    }

    post.isActive = false
    await post.save()

    return res.status(200).json({
      success: true,
      message: 'Blog post deactivated successfully',
      data: { post },
    })
  } catch (error) {
    next(error)
  }
}
