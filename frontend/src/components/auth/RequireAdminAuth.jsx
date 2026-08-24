import { Navigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import authService from '@services/authService'

/**
 * Route guard enforcing authenticated ADMIN status before accessing /admin/* routes.
 * Redirects unauthenticated visitors or CUSTOMER users to /login preserving location state.
 */
export default function RequireAdminAuth({ children }) {
  const location = useLocation()
  const isAdmin = authService.isAdmin()

  // 1. Unauthenticated or non-ADMIN user -> Deny access & redirect to /admin/login
  if (!isAdmin) {
    return (
      <Navigate
        to={ROUTES.adminLogin}
        state={{ from: location, message: 'Admin authorization required.' }}
        replace
      />
    )
  }

  return children
}
