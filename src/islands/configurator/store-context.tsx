'use client'

import { createContext, type ReactNode, use, useMemo, useState } from 'react'
import { useStore } from 'zustand'
import {
  type ConfiguratorConfig,
  type ConfiguratorState,
  type ConfiguratorStore,
  createConfiguratorStore,
  type Placement,
  placementOf,
} from '@/features/configurator/store.ts'

// One store per mount (Development Plan 2.4). React Three Fiber 9 bridges this context
// into the <Canvas>, so the scene and the panel read the same store.

const StoreContext = createContext<ConfiguratorStore | null>(null)

export function ConfiguratorProvider({
  initial,
  machineMaxHeight,
  children,
}: {
  initial: ConfiguratorConfig
  machineMaxHeight: number
  children: ReactNode
}) {
  const [store] = useState(() => createConfiguratorStore(initial, machineMaxHeight))
  return <StoreContext value={store}>{children}</StoreContext>
}

export function useConfiguratorStore(): ConfiguratorStore {
  const store = use(StoreContext)
  if (!store) throw new Error('useConfigurator needs a <ConfiguratorProvider> above it.')
  return store
}

/** Reads one value. Keep selectors narrow, so a change re-renders only what uses it. */
export function useConfigurator<T>(selector: (state: ConfiguratorState) => T): T {
  return useStore(useConfiguratorStore(), selector)
}

/** The fitted print and its area, computed from the stored values (not stored itself). */
export function usePlacement(): Placement {
  const room = useConfigurator((state) => state.room)
  const wall = useConfigurator((state) => state.wall)
  const image = useConfigurator((state) => state.image)
  const print = useConfigurator((state) => state.print)
  const fit = useConfigurator((state) => state.fit)
  const machineMaxHeight = useConfigurator((state) => state.machineMaxHeight)
  return useMemo(
    () => placementOf({ room, wall, image, print, fit, machineMaxHeight }),
    [room, wall, image, print, fit, machineMaxHeight],
  )
}
