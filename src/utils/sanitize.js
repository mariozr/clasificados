import DOMPurify from 'dompurify'

/**
 * Sanitizes a string for safe rendering in the DOM.
 * Prevents XSS attacks by stripping dangerous HTML.
 */
export function sanitize(dirty) {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}

/**
 * Sanitizes and allows basic formatting tags.
 */
export function sanitizeRich(dirty) {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: [],
  })
}
