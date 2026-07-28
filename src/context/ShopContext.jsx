import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useLocalStorageState } from '@hooks/index'
import { STORAGE_KEYS } from '@constants/routes'
import { getProductById } from '@data/products'

/**
 * Client-side shop state — cart, wishlist, recently viewed and toasts.
 *
 * Everything lives in the browser's own localStorage. There is no backend,
 * no session and no network call anywhere in this provider.
 */

const ShopContext = createContext(null)

const CART_LIMIT = 20
const RECENT_LIMIT = 8

export function ShopProvider({ children }) {
  const [cart, setCart] = useLocalStorageState(STORAGE_KEYS.cart, [])
  const [wishlist, setWishlist] = useLocalStorageState(STORAGE_KEYS.wishlist, [])
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
    (product, { size = null, quantity = 1, silent = false } = {}) => {
      const lineKey = `${product.id}::${size ?? 'default'}`
      let added = true

      setCart((current) => {
        const existing = current.find((line) => line.key === lineKey)
        if (existing) {
          return current.map((line) =>
            line.key === lineKey
              ? { ...line, quantity: Math.min(line.quantity + quantity, CART_LIMIT) }
              : line,
          )
        }
        if (current.length >= CART_LIMIT) {
          added = false
          return current
        }
        return [...current, { key: lineKey, productId: product.id, size, quantity }]
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
        if (current.includes(product.id)) return current.filter((id) => id !== product.id)
        nowSaved = true
        return [product.id, ...current]
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
      setWishlist((current) => current.filter((id) => id !== product.id))
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
          const product = getProductById(line.productId)
          return product ? { ...line, product, lineTotal: product.price * line.quantity } : null
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
