import { Navigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import authService from '@services/authService'

/**
 * Route guard enforcing authenticated ADMIN status before accessing /admin/* routes.
 * Redirects unauthenticated visitors or CUSTOMER users to /login preserving location state.
 */
export default function RequireAdminAuth({ children }) {
  const location = useLocation()
  const currentUser = authService.currentUser()

  // 1. Unauthenticated or non-ADMIN user -> Deny access & redirect to login
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <Navigate
        to={ROUTES.login}
        state={{ from: location, message: 'Admin authorization required.' }}
        replace
      />
    )
  }

  return children
}
