import cors from 'cors'
import config from './env.js'

/**
 * Configure CORS based on environment settings.
 */
export const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (like curl, Postman, server-to-server) or localhost in dev
    const allowedOrigins = [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173']

    if (!origin || config.nodeEnv === 'development' || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS blocked: Origin ${origin} is not allowed.`))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

export const configureCors = () => cors(corsOptions)

export default configureCors
