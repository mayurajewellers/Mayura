import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocalStorageState } from '@hooks/index'
import { STORAGE_KEYS } from '@constants/routes'
import { getProductById } from '@data/products'
import authService from '@services/authService'

/**
 * Client-side shop state — cart, wishlist, recently viewed and toasts.
 * Scoped per user account so each user maintains their own cart & wishlist.
 */

const ShopContext = createContext(null)

const CART_LIMIT = 20
const RECENT_LIMIT = 8

export function ShopProvider({ children }) {
  const [currentUserEmail, setCurrentUserEmail] = useState(() => authService.currentUser()?.email || '')

  useEffect(() => {
    const handleAuthChange = () => {
      const u = authService.currentUser()
      setCurrentUserEmail(u?.email ? u.email.toLowerCase().trim() : '')
    }
    window.addEventListener('mayura:auth:changed', handleAuthChange)
    window.addEventListener('storage', handleAuthChange)
    return () => {
      window.removeEventListener('mayura:auth:changed', handleAuthChange)
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [])

  const userKey = currentUserEmail ? currentUserEmail.replace(/[^a-z0-9]/gi, '_') : 'guest'
  const cartKey = `mayura.cart.${userKey}`
  const wishlistKey = `mayura.wishlist.${userKey}`

  const [cart, setCart] = useState(() => {
    try {
      const stored = window.localStorage.getItem(cartKey)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = window.localStorage.getItem(wishlistKey)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Sync state when active user changes (e.g. login/logout or account switch)
  useEffect(() => {
    try {
      const userCartRaw = window.localStorage.getItem(cartKey)
      let userCart = userCartRaw ? JSON.parse(userCartRaw) : []

      // If user just logged in from guest session, merge guest items into user cart
      if (userKey !== 'guest') {
        const guestCartRaw = window.localStorage.getItem('mayura.cart.guest')
        const guestCart = guestCartRaw ? JSON.parse(guestCartRaw) : []
        if (guestCart.length > 0) {
          const merged = [...userCart]
          guestCart.forEach((gLine) => {
            const matchIndex = merged.findIndex((l) => l.key === gLine.key)
            if (matchIndex >= 0) {
              merged[matchIndex].quantity = Math.min(merged[matchIndex].quantity + gLine.quantity, CART_LIMIT)
            } else if (merged.length < CART_LIMIT) {
              merged.push(gLine)
            }
          })
          window.localStorage.setItem(cartKey, JSON.stringify(merged))
          window.localStorage.removeItem('mayura.cart.guest')
          userCart = merged
        }
      }

      setCart(userCart)

      const userWishlistRaw = window.localStorage.getItem(wishlistKey)
      setWishlist(userWishlistRaw ? JSON.parse(userWishlistRaw) : [])
    } catch (err) {
      setCart([])
      setWishlist([])
    }
  }, [userKey, cartKey, wishlistKey])

  // Persist cart changes
  useEffect(() => {
    try {
      window.localStorage.setItem(cartKey, JSON.stringify(cart))
    } catch (err) {}
  }, [cart, cartKey])

  // Persist wishlist changes
  useEffect(() => {
    try {
      window.localStorage.setItem(wishlistKey, JSON.stringify(wishlist))
    } catch (err) {}
  }, [wishlist, wishlistKey])

  const [recentlyViewed, setRecentlyViewed] = useLocalStorageState(STORAGE_KEYS.recentlyViewed, [])
  const [toasts, setToasts] = useState([])

  /* ---------------------------------------------------------------- toast */
  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const pushToast = useCallback(
    (toast) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((current) => [...current.slice(-2), { id, tone: 'default', ...toast }])
      window.setTimeout(() => dismissToast(id), toast.duration ?? 3600)
    },
    [dismissToast],
  )

  /* ----------------------------------------------------------------- cart */
  const addToCart = useCallback(
    (product, { size = null, variant = null, quantity = 1, silent = false } = {}) => {
      const pId = product.id || product._id
      const variantKey = variant ? `${variant.purity ?? ''}-${variant.shade ?? ''}` : 'std'
      const lineKey = `${pId}::${size ?? 'default'}::${variantKey}`
      let added = true

      setCart((current) => {
        const existing = current.find((line) => line.key === lineKey)
        if (existing) {
          return current.map((line) =>
            line.key === lineKey
              ? {
                  ...line,
                  product: line.product || product,
                  quantity: Math.min(line.quantity + quantity, CART_LIMIT),
                }
              : line,
          )
        }
        if (current.length >= CART_LIMIT) {
          added = false
          return current
        }
        return [...current, { key: lineKey, productId: pId, product, size, variant, quantity }]
      })

      if (!silent) {
        pushToast(
          added
            ? { title: 'Added to bag', message: product.name, tone: 'success' }
            : { title: 'Bag is full', message: `Maximum ${CART_LIMIT} lines`, tone: 'error' },
        )
      }
      return added
    },
    [pushToast, setCart],
  )

  const updateCartQuantity = useCallback(
    (key, quantity) => {
      setCart((current) =>
        quantity <= 0
          ? current.filter((line) => line.key !== key)
          : current.map((line) =>
              line.key === key ? { ...line, quantity: Math.min(quantity, 10) } : line,
            ),
      )
    },
    [setCart],
  )

  const removeFromCart = useCallback(
    (key) => {
      setCart((current) => current.filter((line) => line.key !== key))
      pushToast({ title: 'Removed from bag', tone: 'default' })
    },
    [pushToast, setCart],
  )

  const clearCart = useCallback(() => setCart([]), [setCart])

  /* ------------------------------------------------------------- wishlist */
  const isWishlisted = useCallback((id) => wishlist.includes(id), [wishlist])

  const toggleWishlist = useCallback(
    (product) => {
      let nowSaved = false
      setWishlist((current) => {
        const pId = product.id || product._id
        if (current.includes(pId)) return current.filter((id) => id !== pId)
        nowSaved = true
        return [pId, ...current]
      })
      pushToast({
        title: nowSaved ? 'Saved to wishlist' : 'Removed from wishlist',
        message: product.name,
        tone: nowSaved ? 'success' : 'default',
      })
      return nowSaved
    },
    [pushToast, setWishlist],
  )

  const clearWishlist = useCallback(() => setWishlist([]), [setWishlist])

  const moveWishlistItemToCart = useCallback(
    (product) => {
      addToCart(product, { size: product.size?.default ?? null, silent: true })
      const pId = product.id || product._id
      setWishlist((current) => current.filter((id) => id !== pId))
      pushToast({ title: 'Moved to bag', message: product.name, tone: 'success' })
    },
    [addToCart, pushToast, setWishlist],
  )

  /* ------------------------------------------------------ recently viewed */
  const recordView = useCallback(
    (productId) => {
      setRecentlyViewed((current) =>
        [productId, ...current.filter((id) => id !== productId)].slice(0, RECENT_LIMIT),
      )
    },
    [setRecentlyViewed],
  )

  /* -------------------------------------------------------------- derived */
  const cartLines = useMemo(
    () =>
      cart
        .map((line) => {
          const product = line.product || getProductById(line.productId)
          if (!product) return null
          const price = product.price ?? line.price ?? 0
          return {
            ...line,
            product,
            lineTotal: price * line.quantity,
          }
        })
        .filter(Boolean),
    [cart],
  )

  const wishlistProducts = useMemo(
    () => wishlist.map(getProductById).filter(Boolean),
    [wishlist],
  )

  const recentProducts = useMemo(
    () => recentlyViewed.map(getProductById).filter(Boolean),
    [recentlyViewed],
  )

  const cartCount = useMemo(() => cart.reduce((n, line) => n + line.quantity, 0), [cart])
  const cartSubtotal = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.lineTotal, 0),
    [cartLines],
  )

  const value = useMemo(
    () => ({
      cart,
      cartLines,
      cartCount,
      cartSubtotal,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      wishlist,
      wishlistProducts,
      wishlistCount: wishlist.length,
      isWishlisted,
      toggleWishlist,
      clearWishlist,
      moveWishlistItemToCart,
      recentProducts,
      recordView,
      toasts,
      pushToast,
      dismissToast,
    }),
    [
      cart, cartLines, cartCount, cartSubtotal, addToCart, updateCartQuantity, removeFromCart,
      clearCart, wishlist, wishlistProducts, isWishlisted, toggleWishlist, clearWishlist,
      moveWishlistItemToCart, recentProducts, recordView, toasts, pushToast, dismissToast,
    ],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const context = useContext(ShopContext)
  if (!context) throw new Error('useShop must be used inside a ShopProvider')
  return context
}

export default ShopContext
