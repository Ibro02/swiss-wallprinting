// Render budgets per quality tier (Development Plan, section 2.5).
// `low` is for phones and weak GPUs, `high` for desktops.

export const QUALITY_TIERS = ['high', 'low'] as const
export type QualityTier = (typeof QUALITY_TIERS)[number]

/** Most triangles the whole configurator scene may draw. */
export const TRIANGLE_BUDGET: Record<QualityTier, number> = { high: 150_000, low: 30_000 }

/** Longest side of any model texture, in pixels. */
export const TEXTURE_SIZE: Record<QualityTier, number> = { high: 2048, low: 1024 }
