// The first configuration when the page opens. `?area=hotel` (from the application areas
// and the services room cards) starts with the same wall size and artwork as that room;
// a share link (model/share.ts) restores a whole configuration.

import type { ImageAsset } from '@/content/images/types.ts'
import { defaultPrint, fitPrintToWall } from './model/print.ts'
import type { Environment } from './model/price.ts'
import { DEFAULT_ROOM, wallSize } from './model/room.ts'
import type { SharedConfig } from './model/share.ts'
import type { ConfiguratorConfig, PrintImage } from './store.ts'

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
 * A share link (`?room=…`) wins over `?area=`. Without either, the default room and the
 * first preset.
 */
export function startConfig(
  area: string | undefined,
  content: StartContent,
  shared: SharedConfig | null = null,
): ConfiguratorConfig {
  const first = content.presets[0]
  if (!first)
    throw new Error('The configurator needs at least one preset (src/content/presets.ts).')

  if (shared) {
    const preset = content.presets.find((item) => item.id === shared.preset) ?? first
    const wall = wallSize(shared.room, shared.wall)
    return {
      room: shared.room,
      wall: shared.wall,
      image: presetImage(preset),
      print: fitPrintToWall(shared.print, wall, content.machineMaxHeight),
      fit: shared.fit,
      environment: shared.environment,
    }
  }

  const serviceRoom = content.rooms.find((room) => room.area === area)
  const preset = content.presets.find((item) => item.id === serviceRoom?.preset) ?? first
  const room = serviceRoom
    ? { ...DEFAULT_ROOM, width: serviceRoom.wall.widthM, height: serviceRoom.wall.heightM }
    : DEFAULT_ROOM
  const image = presetImage(preset)
  const environment = content.areas.find((item) => item.id === area)?.environment ?? 'interior'

  return {
    room,
    wall: 'north',
    image,
    print: defaultPrint(image.aspect, wallSize(room, 'north'), content.machineMaxHeight),
    fit: 'cover',
    environment,
  }
}
