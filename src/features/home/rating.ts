// The rating summary above the testimonials ("Excellent · based on 6 reviews").

export type RatingBand = 'excellent' | 'veryGood' | 'good' | 'none'

export interface RatingSummary {
  /** Mean of all ratings, one decimal. 0 when there are no ratings. */
  average: number
  count: number
  band: RatingBand
}

export function ratingSummary(ratings: readonly number[]): RatingSummary {
  if (ratings.length === 0) return { average: 0, count: 0, band: 'none' }
  const mean = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
  const average = Math.round(mean * 10) / 10
  const band = average >= 4.5 ? 'excellent' : average >= 4 ? 'veryGood' : 'good'
  return { average, count: ratings.length, band }
}
