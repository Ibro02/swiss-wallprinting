import { describe, expect, it } from 'vite-plus/test'
import { estimatePrice, type PriceRates } from '../price.ts'

const rates: PriceRates = {
  perSquareMetre: { interior: 100, exterior: 150 },
  minimum: 300,
  fixed: 100,
  vatRate: 0.081,
}

describe('estimatePrice', () => {
  it('multiplies the area by the rate and adds fixed costs and VAT', () => {
    const price = estimatePrice(10, 'interior', rates)
    expect(price.print).toBe(1000)
    expect(price.minimumApplied).toBe(false)
    expect(price.net).toBe(1100)
    expect(price.vat).toBe(89.1)
    expect(price.total).toBe(1189.1)
    expect(price.approx).toBe(1190)
  })

  it('uses the exterior rate outdoors', () => {
    expect(estimatePrice(10, 'exterior', rates).print).toBe(1500)
  })

  it('charges the minimum for a small print', () => {
    const price = estimatePrice(1, 'interior', rates)
    expect(price.print).toBe(300)
    expect(price.minimumApplied).toBe(true)
  })

  it('rounds the money to 5 centimes', () => {
    const price = estimatePrice(3.333, 'interior', rates)
    expect(price.print).toBe(333.3)
    expect(price.vat).toBe(35.1)
    expect((price.total * 20) % 1).toBeCloseTo(0)
  })
})
