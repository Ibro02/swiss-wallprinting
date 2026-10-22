'use client'

import { type CSSProperties, useEffect, useRef } from 'react'
import { toSearchParams } from '@/features/configurator/model/share.ts'
import {
  type ConfiguratorConfig,
  type ConfiguratorState,
  sharedConfigOf,
} from '@/features/configurator/store.ts'
import { Panel, type PanelProps } from './Panel.tsx'
import type { CaptureView } from './Scene.tsx'
import { Stage } from './Stage.tsx'
import { ConfiguratorProvider, useConfiguratorStore } from './store-context.tsx'

// "Try your wall printing" (Development Plan 4.7). The server page renders the panel and
// the poster with real values; the 3D room fades in over the poster (Stage → Scene).
// Phones: the panel is a tool panel of a fixed height at the bottom (tabs, Panel), and the
// room fills the screen above it.

export interface ConfiguratorProps extends Omit<PanelProps, 'captureRef'> {
  initial: ConfiguratorConfig
  machineMaxHeight: number
}

/**
 * Phones: the height of the tool panel (a section, the tabs, the price line). Fixed, so the
 * room keeps its size when the visitor changes tabs: 24rem fits the tallest tab without
 * scrolling. A short screen (a phone held sideways) keeps 14rem for the room and the pill.
 */
const TOOLS_HEIGHT = 'min(24rem, 100dvh - 14rem)'

export function Configurator({ initial, machineMaxHeight, ...panel }: ConfiguratorProps) {
  const captureRef = useRef<CaptureView | null>(null)
  return (
    <ConfiguratorProvider initial={initial} machineMaxHeight={machineMaxHeight}>
      <ShareLinkSync />
      <div style={{ '--tools-h': TOOLS_HEIGHT } as CSSProperties}>
        {/* The header pill floats above this card: the card starts below it (pill top
            28/40/56 px, about 52 px high), and fills the rest of the screen on desktops. */}
        <div className="relative mt-18 flex flex-col overflow-hidden rounded-2xl bg-plaster sm:mt-22 sm:rounded-3xl md:mt-24 lg:h-[calc(100dvh-9rem)] lg:min-h-[600px] lg:flex-row">
          <Panel {...panel} captureRef={captureRef} />
          <div className="relative h-[calc(100dvh-5.25rem-var(--tools-h))] min-h-[180px] sm:h-[calc(100dvh-6.5rem-var(--tools-h))] md:h-[calc(100dvh-7.5rem-var(--tools-h))] lg:h-auto lg:min-w-0 lg:flex-1">
            <Stage
              presetSources={panel.presets.map((preset) => preset.image.src)}
              contactHref={panel.contactHref}
              captureRef={captureRef}
            />
          </div>
        </div>
        {/* Phones: room to scroll the footer above the tool panel. */}
        <div aria-hidden="true" className="h-(--tools-h) lg:hidden" />
      </div>
    </ConfiguratorProvider>
  )
}

const CONFIG_KEYS = ['room', 'wall', 'image', 'print', 'fit', 'environment'] as const

/**
 * Keeps the address a share link (proposal P7): after each change the page address gets the
 * configuration, without a new history entry. "Back" then leaves the page, and a reload or
 * a sent link opens the same configuration.
 */
function ShareLinkSync() {
  const store = useConfiguratorStore()
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const write = (state: ConfiguratorState) => {
      const params = toSearchParams(sharedConfigOf(state))
      window.history.replaceState(window.history.state, '', `${window.location.pathname}?${params}`)
    }
    const unsubscribe = store.subscribe((state, previous) => {
      if (CONFIG_KEYS.every((key) => state[key] === previous[key])) return
      clearTimeout(timer)
      timer = setTimeout(() => write(store.getState()), 400)
    })
    return () => {
      unsubscribe()
      clearTimeout(timer)
    }
  }, [store])
  return null
}
