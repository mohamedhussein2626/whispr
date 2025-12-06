/**
 * Utility functions for handling file URLs
 * Converts old R2 direct URLs to new API route URLs
 */

/**
 * Normalize file URL to use API route if it's an old R2 direct URL or localhost URL
 */
export function normalizeFileUrl(url: string, key?: string | null): string {
  // If URL is already a relative API route, return as is
  if (url.startsWith('/api/file/')) {
    return url;
  }

  // Check if URL is an absolute URL (http:// or https://)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Try to extract the API route path from the URL
    const apiRouteMatch = url.match(/\/api\/file\/(.+?)(?:\?|$)/);
    if (apiRouteMatch) {
      // URL already contains /api/file/ path - extract it and make it relative
      // This handles localhost URLs like: http://localhost:3000/api/file/uploads%2F...
      const path = apiRouteMatch[1];
      return `/api/file/${path}`;
    }
    
    // If we have a key and URL is localhost or old R2 URL, convert to API route
    if (key && (
      url.includes('localhost') ||
      url.includes('127.0.0.1') ||
      url.includes('r2.cloudflarestorage.com') || 
      url.includes('R2_PUBLIC_URL')
    )) {
      // Return relative API route URL using the key (will be resolved by browser)
      return `/api/file/${encodeURIComponent(key)}`;
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

