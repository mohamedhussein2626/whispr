/**
 * Utility functions for handling file URLs
 * Converts old R2 direct URLs to new API route URLs
 */

/**
 * Normalize file URL to use API route if it's an old R2 direct URL
 */
export function normalizeFileUrl(url: string, key?: string | null): string {
  // If URL is already an API route, return as is
  if (url.includes('/api/file/')) {
    return url;
  }

  // If we have a key and URL is an old R2 URL, convert to API route
  if (key && (url.includes('r2.cloudflarestorage.com') || url.includes('R2_PUBLIC_URL'))) {
    // Extract the key from the old URL or use provided key
    let fileKey = key;
    
    // Try to extract key from old URL format: https://...r2.cloudflarestorage.com/uploads/...
    const r2Match = url.match(/r2\.cloudflarestorage\.com\/(.+)$/);
    if (r2Match && !key) {
      fileKey = r2Match[1];
    }
    
    if (fileKey) {
      // Return relative API route URL (will be resolved by browser)
      return `/api/file/${encodeURIComponent(fileKey)}`;
    }
  }

  // Return original URL if we can't normalize it
  return url;
}

/**
 * Get absolute file URL for client-side use
 */
export function getAbsoluteFileUrl(url: string, key?: string | null): string {
  const normalized = normalizeFileUrl(url, key);
  
  // If it's already absolute, return as is
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }
  
  // If it's a relative API route, make it absolute
  if (normalized.startsWith('/api/file/')) {
    // In browser, use window.location.origin
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${normalized}`;
    }
    // On server, we'd need the request URL, but this function is mainly for client
    return normalized;
  }
  
  return normalized;
}

