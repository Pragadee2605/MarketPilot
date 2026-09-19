export function getCurrencySymbol(location?: string, forcedSymbol?: string): string {
  if (forcedSymbol && forcedSymbol !== 'AUTO' && forcedSymbol !== '') return forcedSymbol
  if (!location) return '₹'
  const loc = location.toLowerCase()
  if (loc.includes('uk') || loc.includes('london') || loc.includes('manchester') || loc.includes('gbp') || loc.includes('united kingdom')) {
    return '£'
  }
  if (loc.includes('usa') || loc.includes('united states') || loc.includes('new york') || loc.includes('san francisco') || loc.includes('dollar') || loc.includes('canada') || loc.includes('toronto') || loc.includes('australia') || loc.includes('sydney')) {
    return '$'
  }
  if (loc.includes('europe') || loc.includes('germany') || loc.includes('france') || loc.includes('paris') || loc.includes('berlin') || loc.includes('euro')) {
    return '€'
  }
  if (loc.includes('japan') || loc.includes('tokyo') || loc.includes('yen')) {
    return '¥'
  }
  return '₹'
}

export function formatCurrency(amount: number | string, location?: string, forcedSymbol?: string): string {
  const symbol = getCurrencySymbol(location, forcedSymbol)
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.-]+/g, ''))
  if (isNaN(num)) return `${symbol}${amount}`
  return `${symbol}${num.toLocaleString()}`
}
