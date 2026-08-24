import mongoose from 'mongoose'
import Product from '../models/Product.js'

/**
 * Utility to escape regex characters for search safety
 */
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

/**
 * Public: Get paginated, filtered, and sorted products (isActive: true only)
 * GET /api/v1/products
 */
export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      collection,
      type,
      department,
      audience,
      metalKey,
      purity,
      styleTags,
      occasion,
      minPrice,
      maxPrice,
      inStockOnly,
      isFeatured,
      sort = 'featured',
    } = req.query

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))
    const skip = (pageNum - 1) * limitNum

    // Public API strictly returns active products
    const query = { isActive: true }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim())
      const searchRegex = new RegExp(safeSearch, 'i')
      query.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { slug: searchRegex },
        { description: searchRegex },
        { type: searchRegex },
        { collection: searchRegex },
        { metal: searchRegex },
        { styleTags: searchRegex },
      ]
    }

    if (collection) query.collection = collection.trim()
    if (type) query.type = type.trim()
    if (department) query.departments = department.trim()
    if (audience) query.audience = audience.trim()
    if (metalKey) query.metalKey = metalKey.trim()
    if (purity) query.purity = new RegExp('^' + escapeRegex(purity.trim()), 'i')
    if (styleTags) query.styleTags = styleTags.trim()
    if (occasion) query.occasions = occasion.trim()

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {}
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        query.price.$gte = Number(minPrice)
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        query.price.$lte = Number(maxPrice)
      }
    }

    if (inStockOnly === 'true' || inStockOnly === true) {
      query.inStock = true
    }

    if (isFeatured === 'true' || isFeatured === true) {
      query.isFeatured = true
    }

    // Safe sorting map
    let sortOption = { isFeatured: -1, rating: -1, reviewCount: -1 }
    switch (sort) {
      case 'price-asc':
        sortOption = { price: 1 }
        break
      case 'price-desc':
        sortOption = { price: -1 }
        break
      case 'weight-desc':
        sortOption = { grossWeight: -1 }
        break
      case 'rating':
        sortOption = { rating: -1, reviewCount: -1 }
        break
      case 'newest':
        sortOption = { createdAt: -1 }
        break
      case 'featured':
      default:
        sortOption = { isFeatured: -1, rating: -1, reviewCount: -1 }
        break
    }

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limitNum) || 1

    return res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Public: Get single active product by slug
 * GET /api/v1/products/:slug
 */
export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params

    const product = await Product.findOne({
      slug: slug.toLowerCase(),
      isActive: true,
    }).lean()

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: { product },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Create new product
 * POST /api/v1/admin/products
 */
export const createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body }

    // Do not accept client-provided _id
    delete productData._id

    // Ensure required identifier fields are present or format defaults
    if (!productData.name || !productData.price || !productData.type || !productData.collection) {
      return res.status(400).json({
        success: false,
        message: 'Missing required product fields: name, price, type, or collection.',
      })
    }

    // Auto-generate legacyId / SKU / slug if omitted in admin payload
    if (!productData.sku) {
      const count = await Product.countDocuments()
      const code = (productData.type || 'MJ').substring(0, 2).toUpperCase()
      productData.sku = `MJ${code}${1001 + count}`
    }
    if (!productData.legacyId) {
      productData.legacyId = productData.sku
    }
    if (!productData.slug) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    }

    // Default required schema attributes if omitted
    if (!productData.description) productData.description = `${productData.name} - Handcrafted luxury jewellery piece by Mayura Jewellers.`
    if (!productData.certification) productData.certification = 'BIS Hallmarked 22K/18K Gold'
    if (!productData.returns) productData.returns = '15-day return policy'
    if (!productData.shipping) productData.shipping = 'Insured shipping across India'
    if (!productData.makingCharges) productData.makingCharges = '12% making charges'
    if (!productData.purity) productData.purity = '22K Gold'
    if (!productData.metal) productData.metal = '22K Gold'
    if (!productData.metalKey) productData.metalKey = 'gold-22k'
    if (!productData.images || !productData.images.length) productData.images = ['/images/products/placeholder.jpg']
    if (productData.grossWeight === undefined) productData.grossWeight = 10
    if (productData.netWeight === undefined) productData.netWeight = 9.5

    // Check for duplicate SKU
    const existingSku = await Product.findOne({ sku: productData.sku.toUpperCase() })
    if (existingSku) {
      return res.status(409).json({
        success: false,
        message: `Product with SKU '${productData.sku}' already exists.`,
      })
    }

    // Check for duplicate slug
    const existingSlug = await Product.findOne({ slug: productData.slug.toLowerCase() })
    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message: `Product with slug '${productData.slug}' already exists.`,
      })
    }

    // Check for duplicate legacyId
    const existingLegacy = await Product.findOne({ legacyId: productData.legacyId })
    if (existingLegacy) {
      return res.status(409).json({
        success: false,
        message: `Product with legacyId '${productData.legacyId}' already exists.`,
      })
    }

    const product = await Product.create(productData)

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
    })
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'unique field'
      return res.status(409).json({
        success: false,
        message: `Duplicate product value for ${field}.`,
      })
    }
    next(error)
  }
}

/**
 * Admin: Get all products (active & inactive) with filter/pagination
 * GET /api/v1/admin/products
 */
export const getAdminProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      collection,
      type,
      department,
      isActive,
      isFeatured,
      sort = 'newest',
    } = req.query

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))
    const skip = (pageNum - 1) * limitNum

    const query = {}

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
        { name: searchRegex },
        { sku: searchRegex },
        { slug: searchRegex },
        { legacyId: searchRegex },
        { description: searchRegex },
      ]
    }

    if (collection) query.collection = collection.trim()
    if (type) query.type = type.trim()
    if (department) query.departments = department.trim()

    let sortOption = { createdAt: -1 }
    switch (sort) {
      case 'price-asc':
        sortOption = { price: 1 }
        break
      case 'price-desc':
        sortOption = { price: -1 }
        break
      case 'name-asc':
        sortOption = { name: 1 }
        break
      case 'oldest':
        sortOption = { createdAt: 1 }
        break
      case 'newest':
      default:
        sortOption = { createdAt: -1 }
        break
    }

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limitNum) || 1

    return res.status(200).json({
      success: true,
      message: 'Admin products fetched successfully',
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Get single product by ID or legacyId
 * GET /api/v1/admin/products/:id
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params

    let product = null

    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).lean()
    }

    if (!product) {
      product = await Product.findOne({ legacyId: id }).lean()
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: { product },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Update product by ID
 * PUT /api/v1/admin/products/:id
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    delete updateData._id

    let product = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id)
    }
    if (!product) {
      product = await Product.findOne({ legacyId: id })
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      })
    }

    // Check SKU duplicate if updating SKU
    if (updateData.sku && updateData.sku.toUpperCase() !== product.sku) {
      const existingSku = await Product.findOne({
        sku: updateData.sku.toUpperCase(),
        _id: { $ne: product._id },
      })
      if (existingSku) {
        return res.status(409).json({
          success: false,
          message: `Product with SKU '${updateData.sku}' already exists.`,
        })
      }
    }

    // Check slug duplicate if updating slug
    if (updateData.slug && updateData.slug.toLowerCase() !== product.slug) {
      const existingSlug = await Product.findOne({
        slug: updateData.slug.toLowerCase(),
        _id: { $ne: product._id },
      })
      if (existingSlug) {
        return res.status(409).json({
          success: false,
          message: `Product with slug '${updateData.slug}' already exists.`,
        })
      }
    }

    // Apply updates
    Object.assign(product, updateData)
    await product.save()

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product },
    })
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'unique field'
      return res.status(409).json({
        success: false,
        message: `Duplicate product value for ${field}.`,
      })
    }
    next(error)
  }
}

/**
 * Admin: Soft delete / deactivate product
 * DELETE /api/v1/admin/products/:id
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params

    let product = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id)
    }
    if (!product) {
      product = await Product.findOne({ legacyId: id })
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      })
    }

    // Soft delete by deactivating
    product.isActive = false
    await product.save()

    return res.status(200).json({
      success: true,
      message: 'Product deactivated successfully',
      data: { product },
    })
  } catch (error) {
    next(error)
  }
}
