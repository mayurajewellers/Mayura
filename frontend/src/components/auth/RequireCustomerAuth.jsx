import { Navigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import { useShop } from '@context/ShopContext'
import authService from '@services/authService'

/**
 * Route guard enforcing authenticated CUSTOMER status before accessing /checkout.
 * Redirects unauthenticated visitors to /login preserving current location state.
 */
export default function RequireCustomerAuth({ children }) {
  const location = useLocation()
  const { cartLines } = useShop()

  const isCustomer = authService.isCustomer()

  // 1. Unauthenticated or non-CUSTOMER -> Redirect to login with return location state
  if (!isCustomer) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />
  }

  // 2. Empty cart -> Redirect to cart page
  if (!cartLines || cartLines.length === 0) {
    return <Navigate to={ROUTES.cart} replace />
  }

  return children
}
