import { describe, expect, it } from 'vite-plus/test'
import { ratingSummary } from '../rating.ts'

describe('ratingSummary', () => {
  it('rounds the mean to one decimal', () => {
    expect(ratingSummary([5, 5, 4])).toEqual({ average: 4.7, count: 3, band: 'excellent' })
  })

  it('calls 4.5 and above excellent, 4.0 to 4.4 very good, below that good', () => {
    expect(ratingSummary([5, 4]).band).toBe('excellent')
    expect(ratingSummary([4, 4, 5, 4]).band).toBe('veryGood')
    expect(ratingSummary([3, 4]).band).toBe('good')
  })

  it('has no band without ratings', () => {
    expect(ratingSummary([])).toEqual({ average: 0, count: 0, band: 'none' })
  })
})
