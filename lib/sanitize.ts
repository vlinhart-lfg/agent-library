import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeText(input: string): string {
  // Remove any HTML tags and potentially malicious content
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  }).trim();
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string, allowedDomains: string[] = []): string {
  try {
    const parsed = new URL(url);

    // Check if domain is allowed
    if (allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some((domain) =>
        parsed.hostname.includes(domain)
      );

      if (!isAllowed) {
        throw new Error(`URL domain not allowed: ${parsed.hostname}`);
      }
    }

    // Only allow https
    if (parsed.protocol !== 'https:') {
      throw new Error('Only HTTPS URLs are allowed');
    }

    return url;
  } catch (error: any) {
    throw new Error('Invalid URL: ' + error.message);
  }
}

/**
 * Sanitize Make.com iframe URL
 */
export function sanitizeMakeIframeUrl(url: string): string {
  if (!url) return '';

  // Must be from make.com domain
  return sanitizeUrl(url, ['make.com', 'eu2.make.com', 'us1.make.com']);
}

/**
 * Sanitize scenario data before storage
 */
export function sanitizeScenarioData(data: {
  title: string;
  description: string;
  apps: string;
  makeScenarioUrl: string;
  iframeUrl?: string;
  buttonUrl?: string;
}): {
  title: string;
  description: string;
  apps: string;
  makeScenarioUrl: string;
  iframeUrl?: string;
  buttonUrl?: string;
} {
  return {
    title: sanitizeText(data.title),
    description: sanitizeText(data.description),
    apps: sanitizeText(data.apps),
    makeScenarioUrl: sanitizeUrl(data.makeScenarioUrl, ['make.com']),
    iframeUrl: data.iframeUrl ? sanitizeMakeIframeUrl(data.iframeUrl) : undefined,
    buttonUrl: data.buttonUrl ? sanitizeUrl(data.buttonUrl, ['make.com']) : undefined,
  };
}
