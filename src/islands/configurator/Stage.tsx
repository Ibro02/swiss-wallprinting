'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { Component, type ReactNode, type RefObject, useCallback, useEffect, useState } from 'react'
import { CubeIcon } from '@/components/icons.tsx'
import { PHONE_MAX_WIDTH } from '@/features/configurator/model/quality.ts'
import { CAMERA_MARGIN } from '@/features/configurator/model/room.ts'
import type { View } from '@/features/configurator/store.ts'
import type { CaptureView } from './Scene.tsx'
import { useConfigurator, usePlacement } from './store-context.tsx'

// The canvas area. three.js is only in the Scene chunk: this file must not import three,
// drei, or fiber, or they end up in the page bundle (Development Plan 2.3). The type
// import from Scene.tsx is removed by the compiler.

const Scene = dynamic(() => import('./Scene.tsx'), { ssr: false })

/** Show the loading text only when loading takes longer than this (no flash). */
const LOADING_DELAY_MS = 300

/** Signs that a person is at the desktop page: the 3D view loads on the first one. */
const INTENT_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'scroll'] as const

export function Stage({
  presetSources,
  contactHref,
  captureRef,
}: {
  presetSources: readonly string[]
  contactHref: string
  captureRef: RefObject<CaptureView | null>
}) {
  const t = useTranslations('Configurator.stage')
  const [load, setLoad] = useState(false)
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const start = useCallback(() => setLoad(true), [])

  // The poster and the panel are complete without 3D, and the 3D code costs about 0.7 s of
  // main thread on a desktop (more on a phone). So it runs only when a person is there:
  // desktops on the first mouse move, key, or scroll (at once in practice, after the
  // poster has painted); phones when the visitor taps the room or the 3D button, so taps
  // on the panel always answer at once and no battery is spent unasked.
  useEffect(() => {
    if (window.innerWidth <= PHONE_MAX_WIDTH) return
    for (const type of INTENT_EVENTS) {
      window.addEventListener(type, start, { once: true, passive: true })
    }
    return () => {
      for (const type of INTENT_EVENTS) window.removeEventListener(type, start)
    }
  }, [start])

  return (
    <div className="relative size-full bg-[#e9e5de]" onPointerDown={start}>
      <Poster />
      <SceneBoundary fallback={(kind) => <SceneError kind={kind} contactHref={contactHref} />}>
        {load && (
          // The WebGL canvas cannot be an <img>; the panel has every control as HTML.
          <div
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
            role="img"
            aria-label={t('canvasLabel')}
            className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${ready ? 'opacity-100' : 'opacity-0'}`}
          >
            <Scene presetSources={presetSources} onReady={onReady} captureRef={captureRef} />
          </div>
        )}
        {load && !ready && <Loading label={t('loading')} />}
      </SceneBoundary>
      {!load && (
        <button
          type="button"
          onClick={start}
          className="absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-graphite/85 px-4 py-2.5 text-sm font-semibold text-plaster shadow-lg backdrop-blur md:hidden"
        >
          <CubeIcon className="size-4" />
          {t('open3d')}
        </button>
      )}
      <ViewToggle />
      <p className="pointer-events-none absolute top-4 left-4 max-w-[17rem] rounded-2xl bg-graphite/70 px-3 py-2 text-xs leading-relaxed text-plaster backdrop-blur pointer-coarse:hidden">
        {t('hint')}
      </p>
    </div>
  )
}

/**
 * The poster frame (proposal P11, `no-ui-flash`): a flat front view of the selected wall
 * with the print, in the server HTML. It has the framing of the 3D camera (the wall fills
 * 1 / CAMERA_MARGIN of the view), so the 3D view fades in over it without a jump. It also
 * stays as a preview when the browser has no WebGL.
 */
function Poster() {
  const image = useConfigurator((state) => state.image)
  const view = useConfigurator((state) => state.view)
  const { wall, print, printed } = usePlacement()
  const fill = 100 / CAMERA_MARGIN
  const aspect = wall.width / wall.height
  const box = {
    left: ((wall.width / 2 + print.x - printed.width / 2) / wall.width) * 100,
    top: ((wall.height / 2 - print.y - printed.height / 2) / wall.height) * 100,
    width: (printed.width / wall.width) * 100,
    height: (printed.height / wall.height) * 100,
  }

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-[linear-gradient(#f1eee9_0_50%,#a3856a_50%_100%)] [container-type:size]"
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#ebe7e0] shadow-[0_0_0_100vmax_rgb(14_14_16/0.06)]"
        style={{
          aspectRatio: `${wall.width} / ${wall.height}`,
          width: `min(${fill}cqw, ${fill * aspect}cqh)`,
        }}
      >
        {view === 'after' && (
          <div
            className="absolute"
            style={{
              left: `${box.left}%`,
              top: `${box.top}%`,
              width: `${box.width}%`,
              height: `${box.height}%`,
            }}
          >
            {image.kind === 'preset' ? (
              <Image
                src={image.src}
                alt=""
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                loading="eager"
                fetchPriority="high"
                className="object-cover mix-blend-multiply"
              />
            ) : (
              // A local blob: URL of the upload: nothing for next/image to optimize.
              // oxlint-disable-next-line nextjs/no-img-element
              <img src={image.src} alt="" className="size-full object-cover mix-blend-multiply" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Loading({ label }: { label: string }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), LOADING_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])
  if (!visible) return null
  return (
    // <output> is a live status region; its content must be inline (spans).
    <output className="absolute inset-0 grid place-items-center">
      <span className="block w-56 text-center text-sm text-mute">
        {label}
        <span className="mt-3 block h-1 overflow-hidden rounded-full bg-graphite/10">
          <span className="block h-full w-1/3 animate-[loading-bar_1.2s_ease-in-out_infinite] rounded-full bg-magenta motion-reduce:animate-none" />
        </span>
      </span>
    </output>
  )
}

/** Before / after: the blank wall, or the wall with the print (Development Plan 4.7, control 7). */
function ViewToggle() {
  const t = useTranslations('Configurator.stage')
  const view = useConfigurator((state) => state.view)
  const setView = useConfigurator((state) => state.setView)
  const views: readonly View[] = ['before', 'after']

  return (
    <fieldset className="absolute bottom-4 left-1/2 flex -translate-x-1/2 rounded-full bg-graphite/80 p-1 text-sm text-plaster backdrop-blur">
      <legend className="sr-only">{t('viewLabel')}</legend>
      {views.map((option) => (
        <label
          key={option}
          className="cursor-pointer rounded-full px-4 py-1.5 font-semibold transition-colors has-checked:bg-plaster has-checked:text-graphite has-focus-visible:outline-2 has-focus-visible:outline-lime"
        >
          <input
            type="radio"
            name="view"
            value={option}
            checked={view === option}
            onChange={() => setView(option)}
            className="sr-only"
          />
          {t(option)}
        </label>
      ))}
    </fieldset>
  )
}

type SceneFailure = 'webgl' | 'load'

/** Over the poster, which stays as a flat preview. */
function SceneError({ kind, contactHref }: { kind: SceneFailure; contactHref: string }) {
  const t = useTranslations('Configurator.stage.error')
  return (
    <div role="alert" className="absolute inset-x-4 top-4 flex justify-center">
      <div className="max-w-md rounded-3xl bg-white/95 p-6 shadow-lg ring-1 ring-graphite/10 backdrop-blur">
        <h2 className="font-display text-xl font-light">{t(`${kind}.title`)}</h2>
        <p className="mt-3 text-sm leading-relaxed text-mute">{t(`${kind}.body`)}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
          {kind === 'load' && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-graphite px-4 py-2 text-plaster"
            >
              {t('reload')}
            </button>
          )}
          <a href={contactHref} className="rounded-full px-4 py-2 ring-1 ring-graphite/20">
            {t('quote')}
          </a>
        </div>
      </div>
    </div>
  )
}

/**
 * Catches a browser without WebGL (three.js cannot create a context) and a scene file
 * that did not load. The panel next to it still works: sizes and price need no 3D.
 */
class SceneBoundary extends Component<
  { children: ReactNode; fallback: (kind: SceneFailure) => ReactNode },
  { failure: SceneFailure | null }
> {
  override state: { failure: SceneFailure | null } = { failure: null }

  static getDerivedStateFromError(error: unknown): { failure: SceneFailure } {
    const message = error instanceof Error ? error.message : String(error)
    return { failure: /webgl|context/i.test(message) ? 'webgl' : 'load' }
  }

  override componentDidCatch(error: unknown) {
    console.error('The configurator 3D scene failed:', error)
  }

  override render() {
    return this.state.failure ? this.props.fallback(this.state.failure) : this.props.children
  }
}
