import { v2 as cloudinary } from 'cloudinary'
import config from '../../config/env.js'

const isConfigured = Boolean(
  config.cloudinary.cloudName &&
    config.cloudinary.apiKey &&
    config.cloudinary.apiSecret,
)

if (isConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  })
}

/**
 * Upload a file buffer to Cloudinary.
 * Returns the raw Cloudinary upload result or null when not configured.
 */
export const uploadBuffer = (buffer, { folder = 'mayura/uploads', publicId, resourceType = 'auto' } = {}) => {
  if (!isConfigured) return Promise.resolve(null)

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: resourceType },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      },
    )
    stream.end(buffer)
  })
}

/**
 * Delete an asset from Cloudinary by publicId.
 * Returns true when deletion succeeded, false otherwise.
 */
export const destroyAsset = async (publicId, resourceType = 'image') => {
  if (!isConfigured || !publicId) return false
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
    return result?.result === 'ok' || result?.result === 'not found'
  } catch {
    return false
  }
}

export const cloudinaryStatus = () => ({ configured: isConfigured })

export default { uploadBuffer, destroyAsset, cloudinaryStatus }
