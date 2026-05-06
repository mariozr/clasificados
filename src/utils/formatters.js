/**
 * Formats a price for display using Argentine locale.
 * Returns "Consultar" for zero prices.
 */
export function formatPrice(price, currency = 'USD') {
  if (price === 0) return 'Consultar'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace('ARS', '$')
}

/**
 * Formats a date string to a human-readable Argentine locale string.
 */
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
