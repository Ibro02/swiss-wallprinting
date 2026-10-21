'use client'

import { useFormatter, useTranslations } from 'next-intl'
import { LinkIcon } from '@/components/icons.tsx'
import { type ReactNode, type RefObject, useEffect, useState } from 'react'
import { edgesOf, FITS, imageCrop } from '@/features/configurator/model/print.ts'
import {
  estimatePrice,
  type Environment,
  type PriceRates,
} from '@/features/configurator/model/price.ts'
import { printResolution } from '@/features/configurator/model/resolution.ts'
import {
  ROOM_DIMENSIONS,
  ROOM_LIMITS,
  type Wall,
  WALLS,
} from '@/features/configurator/model/room.ts'
import { toSearchParams } from '@/features/configurator/model/share.ts'
import { placementOf, sharedConfigOf } from '@/features/configurator/store.ts'
import { ImagePicker, type PresetOption } from './ImagePicker.tsx'
import { MetreField } from './MetreField.tsx'
import { QuoteButton, type QuoteContact } from './QuoteDialog.tsx'
import type { CaptureView } from './Scene.tsx'
import { useConfigurator, useConfiguratorStore, usePlacement } from './store-context.tsx'

// The settings panel (Development Plan 4.7). Desktop: it opens from the right and can be
// closed. Phones: a bottom sheet (Q4, proposal P6); closed, it is a bar with the price and
// the quote button over the room; open, it shows all controls with the room above.

export interface PanelProps {
  presets: readonly PresetOption[]
  presetsAreExamples: boolean
  rates: PriceRates
  ratesAreExamples: boolean
  /** Sharpness threshold for uploads (Q11). */
  quality: { minPixelsPerCm: number; isExample: boolean }
  contactHref: string
  contact: QuoteContact
  privacyHref: string
  captureRef: RefObject<CaptureView | null>
  /** Phones: the bottom sheet is closed (price bar) or open (all controls). */
  sheet: { open: boolean; setOpen: (open: boolean) => void }
}

/** The walls as the visitor sees them from the first camera position (facing north). */
const WALL_NAMES: Record<Wall, 'front' | 'right' | 'back' | 'left'> = {
  north: 'front',
  east: 'right',
  south: 'back',
  west: 'left',
}

const ENVIRONMENTS: readonly Environment[] = ['interior', 'exterior']

export function Panel(props: PanelProps) {
  const t = useTranslations('Configurator')
  const open = useConfigurator((state) => state.panelOpen)
  const setPanelOpen = useConfigurator((state) => state.setPanelOpen)
  const sheetOpen = props.sheet.open
  const setSheetOpen = props.sheet.setOpen

  // Escape closes the open sheet, as it closes a dialog.
  useEffect(() => {
    if (!sheetOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSheetOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheetOpen, setSheetOpen])

  return (
    <>
      <aside
        id="configurator-panel"
        aria-labelledby="configurator-title"
        className={`fixed inset-x-0 bottom-0 z-40 flex flex-col rounded-t-3xl bg-plaster shadow-[0_-16px_40px_-16px_rgb(14_14_16/0.45)] ring-1 ring-graphite/10 lg:static lg:z-auto lg:order-last lg:h-auto lg:w-[400px] lg:shrink-0 lg:rounded-none lg:border-l lg:border-graphite/10 lg:shadow-none lg:ring-0 ${sheetOpen ? 'max-lg:h-(--sheet-bar)' : ''} ${open ? '' : 'lg:hidden'}`}
      >
        {/* The title stays in the page for screen readers while the sheet is closed. */}
        <header
          className={`order-2 flex items-start justify-between gap-4 px-5 pt-4 sm:px-6 lg:order-1 lg:pt-6 ${sheetOpen ? '' : 'max-lg:sr-only'}`}
        >
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-mute uppercase">
              {t('eyebrow')}
            </p>
            <h1
              id="configurator-title"
              className="mt-2 font-display text-2xl font-light tracking-tight"
            >
              {t('title')}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-mute">{t('lead')}</p>
          </div>
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            aria-controls="configurator-panel"
            aria-expanded="true"
            className="hidden size-10 shrink-0 place-items-center rounded-full ring-1 ring-graphite/15 hover:bg-white lg:grid"
          >
            <span aria-hidden="true">→</span>
            <span className="sr-only">{t('panel.close')}</span>
          </button>
        </header>

        <div
          id="configurator-settings"
          className={`order-3 flex-1 space-y-8 overflow-y-auto overscroll-contain px-5 pt-6 pb-8 sm:px-6 lg:order-2 ${sheetOpen ? '' : 'max-lg:hidden'}`}
        >
          <Section number={1} title={t('image.title')}>
            <ImagePicker
              presets={props.presets}
              presetsAreExamples={props.presetsAreExamples}
              contactEmail={props.contact.email}
            />
          </Section>
          <Section number={2} title={t('wall.title')}>
            <WallPicker />
          </Section>
          <Section number={3} title={t('room.title')}>
            <RoomFields />
          </Section>
          <Section number={4} title={t('print.title')}>
            <PrintFields quality={props.quality} />
          </Section>
          <Section number={5} title={t('environment.title')}>
            <EnvironmentPicker />
          </Section>
        </div>

        <PriceSummary {...props} toggleSheet={() => setSheetOpen(!sheetOpen)} />
      </aside>

      {!open && <OpenPanelButton rates={props.rates} />}
    </>
  )
}

function Section({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children: ReactNode
}) {
  return (
    <section aria-label={title}>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <span
          aria-hidden="true"
          className="grid size-6 place-items-center rounded-full bg-graphite text-xs text-lime"
        >
          {number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

/** Radio buttons that look like a row of pills. */
function Choices<T extends string>({
  name,
  legend,
  options,
  value,
  label,
  onChange,
}: {
  name: string
  legend: string
  options: readonly T[]
  value: T
  label: (option: T) => string
  onChange: (option: T) => void
}) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="cursor-pointer rounded-full px-3.5 py-2 text-sm font-semibold ring-1 ring-graphite/15 transition-colors ring-inset hover:bg-white has-checked:bg-graphite has-checked:text-plaster has-focus-visible:outline-2 has-focus-visible:outline-magenta-700"
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            {label(option)}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function useMetres() {
  const format = useFormatter()
  return (value: number) =>
    format.number(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function WallPicker() {
  const t = useTranslations('Configurator.wall')
  const wall = useConfigurator((state) => state.wall)
  const selectWall = useConfigurator((state) => state.selectWall)
  const { wall: size } = usePlacement()
  const metres = useMetres()
  return (
    <div>
      <Choices
        name="wall"
        legend={t('title')}
        options={WALLS}
        value={wall}
        label={(option) => t(WALL_NAMES[option])}
        onChange={selectWall}
      />
      <p className="mt-2 text-xs text-mute">
        {t('size', { width: metres(size.width), height: metres(size.height) })} {t('hint')}
      </p>
    </div>
  )
}

function RoomFields() {
  const t = useTranslations('Configurator.room')
  const room = useConfigurator((state) => state.room)
  const store = useConfiguratorStore()
  const metres = useMetres()
  return (
    <div className="grid grid-cols-3 gap-3">
      {ROOM_DIMENSIONS.map((dimension) => (
        <MetreField
          key={dimension}
          label={t(dimension)}
          value={room[dimension]}
          note={t('range', {
            min: metres(ROOM_LIMITS[dimension].min),
            max: metres(ROOM_LIMITS[dimension].max),
          })}
          onCommit={(value) => {
            store.getState().setRoomSize(dimension, value)
            return store.getState().room[dimension]
          }}
        />
      ))}
    </div>
  )
}

function PrintFields({ quality }: { quality: PanelProps['quality'] }) {
  const t = useTranslations('Configurator.print')
  const store = useConfiguratorStore()
  const fit = useConfigurator((state) => state.fit)
  const setFit = useConfigurator((state) => state.setFit)
  const centrePrint = useConfigurator((state) => state.centrePrint)
  const { print, wall, limits } = usePlacement()
  const edges = edgesOf(print, wall)
  const metres = useMetres()
  const fitted = () => placementOf(store.getState())

  return (
    <div className="space-y-5">
      <ResolutionWarning quality={quality} />
      <div className="grid grid-cols-2 gap-3">
        <MetreField
          label={t('width')}
          value={print.width}
          note={t('maxWidth', { max: metres(limits.maxWidth) })}
          onCommit={(value) => {
            store.getState().setPrintSize('width', value)
            return fitted().print.width
          }}
        />
        <MetreField
          label={t('height')}
          value={print.height}
          note={t(limits.heightLimit === 'machine' ? 'maxHeightMachine' : 'maxHeightWall', {
            max: metres(limits.maxHeight),
          })}
          onCommit={(value) => {
            store.getState().setPrintSize('height', value)
            return fitted().print.height
          }}
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-mute">{t('fit')}</p>
        <Choices
          name="fit"
          legend={t('fit')}
          options={FITS}
          value={fit}
          label={(option) => t(option)}
          onChange={setFit}
        />
        <p className="mt-2 text-xs leading-relaxed text-mute">{t(`${fit}Hint`)}</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-mute">{t('position')}</p>
        <div className="grid grid-cols-2 gap-3">
          <MetreField
            label={t('left')}
            value={Math.max(0, edges.left)}
            onCommit={(value) => {
              store.getState().setPrintEdges({ left: value })
              const placement = fitted()
              return edgesOf(placement.print, placement.wall).left
            }}
          />
          <MetreField
            label={t('bottom')}
            value={Math.max(0, edges.bottom)}
            onCommit={(value) => {
              store.getState().setPrintEdges({ bottom: value })
              const placement = fitted()
              return edgesOf(placement.print, placement.wall).bottom
            }}
          />
        </div>
        <button
          type="button"
          onClick={centrePrint}
          className="mt-3 rounded-full px-3.5 py-2 text-sm font-semibold ring-1 ring-graphite/15 ring-inset hover:bg-white"
        >
          {t('centre')}
        </button>
      </div>
    </div>
  )
}

/**
 * Proposal P5: an uploaded image with too few pixels for its print size. Says why, the
 * largest sharp size, and offers it with one click. Presets are vector art: always sharp.
 */
function ResolutionWarning({ quality }: { quality: PanelProps['quality'] }) {
  const t = useTranslations('Configurator.resolution')
  const image = useConfigurator((state) => state.image)
  const fit = useConfigurator((state) => state.fit)
  const store = useConfiguratorStore()
  const { print, printed } = usePlacement()
  const metres = useMetres()
  const format = useFormatter()
  if (image.kind !== 'upload') return null

  const check = printResolution(
    image.px,
    printed,
    imageCrop(print, image.aspect, fit).repeat,
    quality.minPixelsPerCm,
  )
  if (check.sharp) return null
  // The same factor for the print area, so the proportions stay.
  const factor = check.maxSharp.width / printed.width
  const apply = () => {
    const { setPrintSize } = store.getState()
    setPrintSize('width', print.width * factor)
    setPrintSize('height', print.height * factor)
  }

  return (
    <div
      // Not <output>: that element may hold only phrasing content, and this has a button.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="status"
      className="rounded-xl bg-ink-yellow/15 px-3.5 py-3 text-xs leading-relaxed ring-1 ring-ink-yellow/50"
    >
      <p>
        {t('warning', {
          ppc: format.number(check.pxPerCm, { maximumFractionDigits: 0 }),
          min: quality.minPixelsPerCm,
        })}{' '}
        {quality.isExample && t('example')}
      </p>
      <p className="mt-1">
        {t('suggestion', {
          width: metres(check.maxSharp.width),
          height: metres(check.maxSharp.height),
        })}
      </p>
      {factor >= 0.05 && (
        <button
          type="button"
          onClick={apply}
          className="mt-2 rounded-full bg-graphite px-3 py-1.5 font-semibold text-plaster"
        >
          {t('apply', {
            width: metres(check.maxSharp.width),
            height: metres(check.maxSharp.height),
          })}
        </button>
      )}
    </div>
  )
}

function EnvironmentPicker() {
  const t = useTranslations('Configurator.environment')
  const environment = useConfigurator((state) => state.environment)
  const setEnvironment = useConfigurator((state) => state.setEnvironment)
  return (
    <Choices
      name="environment"
      legend={t('title')}
      options={ENVIRONMENTS}
      value={environment}
      label={(option) => t(option)}
      onChange={setEnvironment}
    />
  )
}

function usePrice(rates: PriceRates) {
  const environment = useConfigurator((state) => state.environment)
  const { areaM2 } = usePlacement()
  return estimatePrice(areaM2, environment, rates)
}

function useChf() {
  const format = useFormatter()
  return (value: number, fractions = 0) =>
    format.number(value, {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: fractions,
      maximumFractionDigits: fractions,
    })
}

/**
 * Control 8: always visible. Desktop: at the bottom of the panel. Phones: the bar of the
 * bottom sheet, with the button that opens and closes it.
 */
function PriceSummary({
  rates,
  ratesAreExamples,
  presets,
  contact,
  privacyHref,
  captureRef,
  sheet,
  toggleSheet,
}: PanelProps & { toggleSheet: () => void }) {
  const t = useTranslations('Configurator.price')
  const tPanel = useTranslations('Configurator.panel')
  const format = useFormatter()
  const environment = useConfigurator((state) => state.environment)
  const price = usePrice(rates)
  const chf = useChf()
  const area = format.number(price.areaM2, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const vatRate = format.number(rates.vatRate, { style: 'percent', maximumFractionDigits: 1 })

  return (
    <div className="order-1 rounded-t-3xl border-graphite/10 bg-white px-5 pt-2 pb-4 sm:px-6 lg:order-3 lg:rounded-none lg:border-t lg:pt-5 lg:pb-5 lg:shadow-[0_-12px_30px_-20px_rgb(14_14_16/0.4)]">
      <button
        type="button"
        onClick={toggleSheet}
        aria-controls="configurator-settings"
        aria-expanded={sheet.open}
        className="mb-2 flex w-full flex-col items-center gap-1.5 pt-1 pb-1 text-xs font-semibold text-mute lg:hidden"
      >
        <span aria-hidden="true" className="h-1.5 w-10 rounded-full bg-graphite/20" />
        {sheet.open ? tPanel('close') : tPanel('open')}
      </button>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold text-mute">
          {t('label')}
          {ratesAreExamples && (
            <span className="ml-2 rounded-full bg-graphite/5 px-2 py-0.5 text-[0.7rem] tracking-wide uppercase">
              {t('example')}
            </span>
          )}
        </p>
        <p className="text-xs text-mute">{t('area', { area })}</p>
      </div>
      <p aria-live="polite" className="mt-1 font-display text-3xl font-light tabular-nums">
        {t('approx', { price: chf(price.approx) })}
      </p>

      {/* Phones: the price breakdown only in the open sheet, so the closed bar stays low. */}
      <details className={`mt-2 text-xs text-mute ${sheet.open ? '' : 'max-lg:hidden'}`}>
        <summary className="cursor-pointer font-semibold text-graphite">{t('details')}</summary>
        <dl className="mt-2 space-y-1">
          <Row
            term={
              price.minimumApplied
                ? t('minimum')
                : t('print', { area, rate: chf(rates.perSquareMetre[environment]) })
            }
            value={chf(price.print, 2)}
          />
          <Row term={t('fixed')} value={chf(price.fixed, 2)} />
          <Row term={t('vat', { rate: vatRate })} value={chf(price.vat, 2)} />
          <Row term={t('total')} value={chf(price.total, 2)} strong />
        </dl>
        <p className="mt-2 leading-relaxed">
          {t('disclaimer')} {ratesAreExamples && t('exampleNote')}
        </p>
      </details>

      <div className="mt-3 flex gap-2">
        <QuoteButton
          captureRef={captureRef}
          presets={presets}
          rates={rates}
          contact={contact}
          privacyHref={privacyHref}
        />
        <ShareButton />
      </div>
    </div>
  )
}

/** Copies the share link (proposal P7). The address bar has it too (ShareLinkSync). */
function ShareButton() {
  const t = useTranslations('Configurator.share')
  const store = useConfiguratorStore()
  const [result, setResult] = useState<'copied' | 'copiedUpload' | 'failed' | null>(null)

  useEffect(() => {
    if (!result) return
    const timer = setTimeout(() => setResult(null), 5000)
    return () => clearTimeout(timer)
  }, [result])

  const copy = async () => {
    const state = store.getState()
    const params = toSearchParams(sharedConfigOf(state))
    const url = `${window.location.origin}${window.location.pathname}?${params}`
    try {
      await navigator.clipboard.writeText(url)
      setResult(state.image.kind === 'upload' ? 'copiedUpload' : 'copied')
    } catch {
      setResult('failed')
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => void copy()}
        className="grid size-12 place-items-center rounded-full ring-1 ring-graphite/15 ring-inset hover:bg-plaster"
      >
        <LinkIcon className="size-5" />
        <span className="sr-only">{t('copy')}</span>
      </button>
      <p
        aria-live="polite"
        className={`absolute right-0 bottom-full mb-2 w-64 rounded-xl bg-graphite px-3 py-2 text-xs leading-relaxed text-plaster shadow-lg ${result ? '' : 'sr-only'}`}
      >
        {result && t(result)}
      </p>
    </div>
  )
}

function Row({ term, value, strong }: { term: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${strong ? 'font-semibold text-graphite' : ''}`}>
      <dt>{term}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  )
}

/** Desktop, panel closed: a button with the price that opens it again. */
function OpenPanelButton({ rates }: { rates: PriceRates }) {
  const t = useTranslations('Configurator')
  const setPanelOpen = useConfigurator((state) => state.setPanelOpen)
  const price = usePrice(rates)
  const chf = useChf()
  return (
    <button
      type="button"
      onClick={() => setPanelOpen(true)}
      aria-controls="configurator-panel"
      aria-expanded="false"
      className="absolute top-4 right-4 z-10 hidden items-center gap-3 rounded-full bg-graphite py-2 pr-2 pl-5 text-sm font-semibold text-plaster shadow-lg lg:flex"
    >
      {t('price.approx', { price: chf(price.approx) })}
      <span className="rounded-full bg-lime px-3 py-1.5 text-graphite">{t('panel.open')}</span>
    </button>
  )
}
