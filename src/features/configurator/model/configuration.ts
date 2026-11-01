// The configuration and its product rules (swiss-wallprinting/Glossary.md). Every way into
// the configurator goes through here: the page's first configuration (a share link,
// `?area=`, or the defaults), each store change (store.ts), and the quote on the server
// (features/quote/quote.ts). So the page, the store, and the e-mail cannot disagree.
// A rule corrects a configuration; it never rejects one: an old link keeps opening.

import type { ImageAsset } from '@/content/images/types.ts'
import type { ConfiguratorConfig, PrintImage } from '../store.ts'
import { defaultPrint, type Fit, fitPrintToWall } from './print.ts'
import type { Environment } from './price.ts'
import { DEFAULT_ROOM, type Wall, wallSize } from './room.ts'
import { fromSearchParams, type SearchParams, type SharedConfig } from './share.ts'

/** Outdoors the configurator shows one wall (the client, 2026-10-31): the front one. */
export const OUTDOOR_WALL: Wall = 'north'

/**
 * "Whole image" (contain) is off for now (the client, 2026-10-31: it seemed to do nothing,
 * because a new print already has the image's proportions). The panel greys these out, and
 * a configuration with one of them fills the area.
 */
export const DISABLED_FITS: readonly Fit[] = ['contain']

/**
 * Outdoors is hidden for now (the author, 2026-11-01): a configuration outdoors (an old share
 * link, `?area=` of an outdoor area) opens indoors, and the panel has no "Where" choice while
 * one environment is left. The outdoor scene and its one-wall rule stay: empty this list to
 * bring outdoors back.
 */
export const DISABLED_ENVIRONMENTS: readonly Environment[] = ['exterior']

/** The environments the visitor can choose. */
export const ENVIRONMENTS: readonly Environment[] = (['interior', 'exterior'] as const).filter(
  (environment) => !DISABLED_ENVIRONMENTS.includes(environment),
)

/** The fields that the product rules read and correct; all others pass through. */
interface RuledFields {
  wall: Wall
  fit: Fit
  environment: Environment
}

/**
 * The same configuration, corrected to the product rules. Unchanged when it follows them.
 * `disabledEnvironments` is for the tests of the outdoor rule while outdoors is off.
 */
export function applyProductRules<T extends RuledFields>(
  config: T,
  disabledEnvironments: readonly Environment[] = DISABLED_ENVIRONMENTS,
): T {
  const environment = disabledEnvironments.includes(config.environment)
    ? 'interior'
    : config.environment
  const wall = environment === 'exterior' ? OUTDOOR_WALL : config.wall
  const fit = DISABLED_FITS.includes(config.fit) ? 'cover' : config.fit
  if (wall === config.wall && fit === config.fit && environment === config.environment)
    return config
  return { ...config, wall, fit, environment }
}

/**
 * The configuration in a share link, checked and corrected to the product rules. Null when
 * the address has no complete configuration.
 */
export function sharedConfigurationOf(
  params: SearchParams,
  presetIds: readonly string[],
): SharedConfig | null {
  const shared = fromSearchParams(params, presetIds)
  return shared && applyProductRules(shared)
}

export interface StartContent {
  presets: readonly { id: string; image: ImageAsset }[]
  rooms: readonly { area: string; preset: string; wall: { widthM: number; heightM: number } }[]
  areas: readonly { id: string; environment: Environment }[]
  machineMaxHeight: number
}

export function presetImage(preset: { id: string; image: ImageAsset }): PrintImage {
  return {
    kind: 'preset',
    id: preset.id,
    src: preset.image.src,
    aspect: preset.image.width / preset.image.height,
  }
}

/**
 * The first configuration when the page opens. A share link (`?room=…`) wins over `?area=`
 * (from the application areas and the services page: that area's wall size and artwork,
 * src/content/area-starts.ts). Without either, the default room and the first preset.
 */
export function startConfiguration(
  params: SearchParams,
  content: StartContent,
): ConfiguratorConfig {
  const first = content.presets[0]
  if (!first)
    throw new Error('The configurator needs at least one preset (src/content/presets.ts).')

  const shared = sharedConfigurationOf(
    params,
    content.presets.map((preset) => preset.id),
  )
  if (shared) {
    const preset = content.presets.find((item) => item.id === shared.preset) ?? first
    return {
      room: shared.room,
      wall: shared.wall,
      image: presetImage(preset),
      print: fitPrintToWall(
        shared.print,
        wallSize(shared.room, shared.wall),
        content.machineMaxHeight,
      ),
      fit: shared.fit,
      environment: shared.environment,
    }
  }

  const area = typeof params.area === 'string' ? params.area : undefined
  const areaRoom = content.rooms.find((room) => room.area === area)
  const preset = content.presets.find((item) => item.id === areaRoom?.preset) ?? first
  const room = areaRoom
    ? { ...DEFAULT_ROOM, width: areaRoom.wall.widthM, height: areaRoom.wall.heightM }
    : DEFAULT_ROOM
  const image = presetImage(preset)
  const environment = content.areas.find((item) => item.id === area)?.environment ?? 'interior'
  // The rules choose the wall (outdoors), so the print is sized after them.
  const ruled = applyProductRules({
    room,
    wall: 'north' as Wall,
    image,
    fit: 'cover' as Fit,
    environment,
  })
  return {
    ...ruled,
    print: defaultPrint(image.aspect, wallSize(room, ruled.wall), content.machineMaxHeight),
  }
}
