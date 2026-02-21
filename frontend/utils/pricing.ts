export function calcWholesalePrice(retail: number, discountPercent: number) {
  const dp = Math.max(0, Math.min(100, Number(discountPercent) || 0))
  const r = Number(retail) || 0
  return Math.round(r * (1 - dp / 100))
}
