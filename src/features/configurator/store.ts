// The configurator store (Development Plan 2.4). One store per mount: the page creates it
// in a React context (src/islands/configurator/store-context.tsx), so state never leaks
// between server requests. The canvas and the panel read the same store.
// Derived values (the fitted print, limits, price) are not stored: `placementOf` and the
// pure functions in model/ compute them.

import { createStore } from 'zustand/vanilla'
import {
  defaultPrint,
  edgesOf,
  fitPrintToWall,
  type Fit,
  offsetFromEdges,
  type PrintBox,
  type PrintDimension,
  type PrintEdges,
  type PrintLimits,
  clampPrintSize,
  printedRect,
  printLimits,
} from './model/print.ts'
import type { Environment } from './model/price.ts'
import {
  clampRoomSize,
  type Room,
  type RoomDimension,
  type Wall,
  wallSize,
  type WallSize,
} from './model/room.ts'
import type { SharedConfig } from './model/share.ts'

export type PrintImage =
  | { kind: 'preset'; id: string; src: string; aspect: number }
  | {
      kind: 'upload'
      /** File name, to show in the panel. */
      name: string
      /** The image, already scaled down to the tier limit. */
      canvas: HTMLCanvasElement
      /** A local blob: URL of the same image, for the flat poster view. */
      src: string
      aspect: number
      /** Size of the original file, pixels (for the resolution warning). */
      px: { width: number; height: number }
    }

/** What the visitor configures. Serializable except an uploaded image. */
export interface ConfiguratorConfig {
  room: Room
  wall: Wall
  image: PrintImage
  /** The size and position the visitor asked for; `placementOf` fits it to the wall. */
  print: PrintBox
  fit: Fit
  environment: Environment
}

export type View = 'before' | 'after'

export interface ConfiguratorState extends ConfiguratorConfig {
  view: View
  panelOpen: boolean
  /** The machine prints up to this height, metres (src/content/company.ts). */
  machineMaxHeight: number

  setRoomSize: (dimension: RoomDimension, metres: number) => void
  selectWall: (wall: Wall) => void
  chooseImage: (image: PrintImage) => void
  setPrintSize: (dimension: PrintDimension, metres: number) => void
  setPrintEdges: (edges: Partial<PrintEdges>) => void
  /** Moves the print centre to this offset from the wall centre (dragging in 3D). */
  movePrint: (offset: Pick<PrintBox, 'x' | 'y'>) => void
  centrePrint: () => void
  setFit: (fit: Fit) => void
  setEnvironment: (environment: Environment) => void
  setView: (view: View) => void
  setPanelOpen: (open: boolean) => void
}

export type ConfiguratorStore = ReturnType<typeof createConfiguratorStore>

export interface Placement {
  wall: WallSize
  limits: PrintLimits
  /** The print fitted to the current wall. */
  print: PrintBox
  /** The area that gets ink (smaller than `print` with `contain`). */
  printed: { width: number; height: number }
  areaM2: number
}

/** Where the print is on the current wall, and how large it really is. */
export function placementOf(
  state: Pick<ConfiguratorState, 'room' | 'wall' | 'print' | 'fit' | 'machineMaxHeight'> & {
    /** Only the proportions matter (the server knows no canvas). */
    image: { aspect: number }
  },
): Placement {
  const wall = wallSize(state.room, state.wall)
  const print = fitPrintToWall(state.print, wall, state.machineMaxHeight)
  const printed = printedRect(print, state.image.aspect, state.fit)
  return {
    wall,
    limits: printLimits(wall, state.machineMaxHeight),
    print,
    printed,
    areaM2: printed.width * printed.height,
  }
}

/** What goes into the share link: the fitted print, and the preset (an upload stays local). */
export function sharedConfigOf(
  state: Pick<
    ConfiguratorState,
    'room' | 'wall' | 'image' | 'print' | 'fit' | 'environment' | 'machineMaxHeight'
  >,
): SharedConfig {
  return {
    room: state.room,
    wall: state.wall,
    preset: state.image.kind === 'preset' ? state.image.id : undefined,
    print: placementOf(state).print,
    fit: state.fit,
    environment: state.environment,
  }
}

export function createConfiguratorStore(initial: ConfiguratorConfig, machineMaxHeight: number) {
  return createStore<ConfiguratorState>()((set, get) => {
    /** The print as it shows now; edits start from it, not from an older, larger request. */
    const fitted = () => placementOf(get())

    return {
      ...initial,
      view: 'after',
      panelOpen: true,
      machineMaxHeight,

      setRoomSize: (dimension, metres) =>
        set((state) => ({
          room: { ...state.room, [dimension]: clampRoomSize(dimension, metres) },
        })),

      selectWall: (wall) => set({ wall }),

      chooseImage: (image) =>
        set((state) => ({
          image,
          print: defaultPrint(image.aspect, wallSize(state.room, state.wall), machineMaxHeight),
          view: 'after',
        })),

      setPrintSize: (dimension, metres) => {
        const { print, limits, wall } = fitted()
        const resized = { ...print, [dimension]: clampPrintSize(dimension, metres, limits) }
        set({ print: fitPrintToWall(resized, wall, machineMaxHeight) })
      },

      setPrintEdges: (edges) => {
        const { print, wall } = fitted()
        const offset = offsetFromEdges({ ...edgesOf(print, wall), ...edges }, print, wall)
        set({ print: fitPrintToWall({ ...print, ...offset }, wall, machineMaxHeight) })
      },

      movePrint: (offset) => {
        const { print, wall } = fitted()
        set({ print: fitPrintToWall({ ...print, ...offset }, wall, machineMaxHeight) })
      },

      centrePrint: () => set({ print: { ...fitted().print, x: 0, y: 0 } }),

      setFit: (fit) => set({ fit }),
      setEnvironment: (environment) => set({ environment }),
      setView: (view) => set({ view }),
      setPanelOpen: (panelOpen) => set({ panelOpen }),
    }
  })
}
