import type { H3Event } from 'h3'

const GALLERY_CACHE_TAGS = ['gallery-photos', 'gallery-tags']
const GALLERY_CACHE_CONTROL = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=60'

interface CachePurgeContext {
  purge: (options: { tags: string[] }) => Promise<unknown>
}

interface CloudflareEventContext {
  context?: {
    cache?: CachePurgeContext
  }
  ctx?: {
    cache?: CachePurgeContext
  }
}

export function setGalleryPhotosCacheHeaders(event: H3Event) {
  setHeader(event, 'Cache-Control', GALLERY_CACHE_CONTROL)
  setHeader(event, 'Cache-Tag', 'gallery-photos')
}

export function setGalleryTagsCacheHeaders(event: H3Event) {
  setHeader(event, 'Cache-Control', GALLERY_CACHE_CONTROL)
  setHeader(event, 'Cache-Tag', 'gallery-tags')
}

export async function purgeGalleryCache(event: H3Event) {
  const cloudflare = (event.context as { cloudflare?: CloudflareEventContext }).cloudflare
  const executionContext = cloudflare?.context ?? cloudflare?.ctx

  if (!executionContext?.cache)
    return

  try {
    await executionContext.cache.purge({ tags: GALLERY_CACHE_TAGS })
  }
  catch (error) {
    console.warn('Failed to purge gallery cache:', error)
  }
}
