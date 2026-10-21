// The price estimate (Development Plan 4.7, control 8; decided in Q5): print area × rate,
// a minimum for small prints, fixed costs, and VAT. The page shows it as "approx. CHF X",
// with "Request exact quote". The rates come from src/content/pricing.ts.

export type Environment = 'interior' | 'exterior'

export interface PriceRates {
  /** CHF per square metre of print, without VAT. */
  perSquareMetre: Record<Environment, number>
  /** The print part costs at least this, CHF without VAT. */
  minimum: number
  /** Set-up and travel, CHF without VAT. */
  fixed: number
  /** 0.081 = 8.1 %. */
  vatRate: number
}

export interface PriceEstimate {
  areaM2: number
  /** Area × rate, or the minimum. CHF. */
  print: number
  /** True when the minimum applies. */
  minimumApplied: boolean
  fixed: number
  net: number
  vat: number
  total: number
  /** The total, rounded to CHF 10: the number the page shows. */
  approx: number
}

/** Rounds to 5 centimes (the smallest Swiss coin). */
function roundCentimes(chf: number): number {
  return Math.round(chf * 20) / 20
}

export function estimatePrice(
  areaM2: number,
  environment: Environment,
  rates: PriceRates,
): PriceEstimate {
  const byArea = areaM2 * rates.perSquareMetre[environment]
  const minimumApplied = byArea < rates.minimum
  const print = roundCentimes(minimumApplied ? rates.minimum : byArea)
  const net = roundCentimes(print + rates.fixed)
  const vat = roundCentimes(net * rates.vatRate)
  const total = roundCentimes(net + vat)
  return {
    areaM2,
    print,
    minimumApplied,
    fixed: rates.fixed,
    net,
    vat,
    total,
    approx: Math.round(total / 10) * 10,
  }
}
