import { useState } from 'react'
import cn from '@utils/cn'

/**
 * Lazy image with a champagne shimmer placeholder and a soft fade-in on
 * decode. Every image on the site goes through this so nothing ever pops.
 */
export default function SmartImage({
  src,
  alt = '',
  className,
  imgClassName,
  ratio = 'aspect-editorial',
  priority = false,
  objectFit = 'cover',
  position,
  rounded = 'rounded-card',
  children,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={cn('relative overflow-hidden bg-champagne-100', rounded, ratio, className)}
      {...rest}
    >
      {!loaded && !failed && (
        <div className={cn('absolute inset-0 mj-skeleton', rounded)} aria-hidden="true" />
      )}

      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center bg-champagne-100">
          <span className="font-serif text-body-sm italic text-bronze/60">Mayura</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchpriority={priority ? 'high' : undefined}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={position ? { objectPosition: position } : undefined}
          className={cn(
            'h-full w-full transition-opacity duration-700 ease-luxe',
            objectFit === 'contain' ? 'object-contain' : 'object-cover',
            loaded ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
        />
      )}

      {children}
    </div>
  )
}
