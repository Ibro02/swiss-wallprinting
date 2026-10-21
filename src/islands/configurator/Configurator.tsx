'use client'

import { type CSSProperties, useEffect, useRef, useState } from 'react'
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
// Phones: the panel is a bottom sheet (Q4); its closed bar is SHEET_BAR high.

export interface ConfiguratorProps extends Omit<PanelProps, 'captureRef' | 'sheet'> {
  initial: ConfiguratorConfig
  machineMaxHeight: number
}

/** Phones: the height of the closed sheet (the price bar), and of the open sheet. */
const SHEET = { closed: '12.5rem', open: '60dvh' } as const

export function Configurator({ initial, machineMaxHeight, ...panel }: ConfiguratorProps) {
  const captureRef = useRef<CaptureView | null>(null)
  // Phones: the open sheet takes the lower part of the screen, and the room gets smaller to
  // stay fully visible above it (the camera frames the wall in the new size).
  const [sheetOpen, setSheetOpen] = useState(false)
  return (
    <ConfiguratorProvider initial={initial} machineMaxHeight={machineMaxHeight}>
      <ShareLinkSync />
      <div style={{ '--sheet-bar': sheetOpen ? SHEET.open : SHEET.closed } as CSSProperties}>
        <div className="relative mx-auto flex max-w-[1600px] flex-col overflow-hidden rounded-3xl bg-plaster ring-1 ring-graphite/10 lg:h-[calc(100dvh-6.25rem)] lg:min-h-[600px] lg:flex-row">
          <Panel
            {...panel}
            captureRef={captureRef}
            sheet={{ open: sheetOpen, setOpen: setSheetOpen }}
          />
          <div className="relative h-[calc(100dvh-6.25rem-var(--sheet-bar))] min-h-[180px] lg:h-auto lg:min-w-0 lg:flex-1">
            <Stage
              presetSources={panel.presets.map((preset) => preset.image.src)}
              contactHref={panel.contactHref}
              captureRef={captureRef}
            />
          </div>
        </div>
        {/* Phones: room to scroll the footer above the closed sheet. */}
        <div aria-hidden="true" className="h-(--sheet-bar) lg:hidden" />
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
