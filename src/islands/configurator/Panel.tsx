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

// The settings panel (Development Plan 4.7). Desktop: it opens from the right, shows the
// five sections one under the other, and can be closed. Phones (the author's choice,
// 2026-10-22, in place of the bottom sheet): a tool panel at the bottom, like a photo
// editor: one section at a time above a row of five tabs, and a one-line price bar; the
// room fills the screen above it. The panel has a fixed height (`--tools-h`,
// Configurator), so the room does not change size between tabs.

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
}

const SECTIONS = ['image', 'wall', 'room', 'print', 'environment'] as const
type SectionKey = (typeof SECTIONS)[number]

/**
 * Phones: the tabs. The print section is two tabs there (size and fit; position), so no
 * tab needs to scroll in the tool panel.
 */
const PHONE_TABS = ['image', 'wall', 'room', 'print', 'position', 'environment'] as const
type PhoneTab = (typeof PHONE_TABS)[number]

/** The section that a phone tab shows. */
const sectionOf = (tab: PhoneTab): SectionKey => (tab === 'position' ? 'print' : tab)

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
  // Phones: the section shown above the tabs. The server renders the first one, as the
  // client does, so nothing changes after hydration.
  const [tab, setTab] = useState<PhoneTab>('image')

  const controls: Record<SectionKey, ReactNode> = {
    image: (
      <ImagePicker
        presets={props.presets}
        presetsAreExamples={props.presetsAreExamples}
        contactEmail={props.contact.email}
      />
    ),
    wall: <WallPicker />,
    room: <RoomFields />,
    print: (
      <PrintFields quality={props.quality} phonePart={tab === 'position' ? 'position' : 'size'} />
    ),
    environment: <EnvironmentPicker />,
  }

  return (
    <>
      <aside
        id="configurator-panel"
        aria-labelledby="configurator-title"
        className={`fixed inset-x-0 bottom-0 z-40 flex h-(--tools-h) flex-col rounded-t-3xl bg-paper shadow-[0_-16px_40px_-16px_rgb(0_0_0/0.35)] ring-1 ring-ink/8 lg:static lg:z-auto lg:order-last lg:h-auto lg:w-[400px] lg:shrink-0 lg:rounded-none lg:border-l lg:border-ink/10 lg:shadow-none lg:ring-0 ${open ? '' : 'lg:hidden'}`}
      >
        {/* Phones: the title stays in the page for screen readers; the tabs say the rest. */}
        <header className="flex items-start justify-between gap-4 px-5 pt-6 max-lg:sr-only sm:px-6">
          <div>
            <p className="text-xs font-medium text-mute">{t('eyebrow')}</p>
            <h1 id="configurator-title" className="mt-1.5 text-2xl font-medium tracking-tight">
              {t('title')}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-mute">{t('lead')}</p>
          </div>
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            aria-controls="configurator-panel"
            aria-expanded="true"
            className="hidden size-10 shrink-0 place-items-center rounded-xl ring-1 ring-ink/12 transition-[background-color,transform] duration-150 ease-out hover:bg-plaster active:scale-[0.97] lg:grid"
          >
            <span aria-hidden="true">→</span>
            <span className="sr-only">{t('panel.close')}</span>
          </button>
        </header>

        <div
          id="configurator-settings"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-3 pb-3 sm:px-6 lg:space-y-8 lg:pt-6 lg:pb-8"
        >
          {SECTIONS.map((key, index) => (
            <Section
              key={key}
              id={`configurator-${key}`}
              number={index + 1}
              title={t(`${key}.title`)}
              shownOnPhones={sectionOf(tab) === key}
            >
              {controls[key]}
            </Section>
          ))}
        </div>

        <PhoneTabs tab={tab} onSelect={setTab} />
        <PriceSummary {...props} />
      </aside>

      {!open && <OpenPanelButton rates={props.rates} />}
    </>
  )
}

function Section({
  id,
  number,
  title,
  shownOnPhones,
  children,
}: {
  id: string
  number: number
  title: string
  /** Phones show one section at a time (the active tab); desktops show all five. */
  shownOnPhones: boolean
  children: ReactNode
}) {
  return (
    <section id={id} aria-label={title} className={shownOnPhones ? '' : 'max-lg:hidden'}>
      {/* Phones: the active tab names the section, so the heading is for screen readers only. */}
      <h2 className="mb-3 flex items-center gap-2.5 text-sm font-medium max-lg:sr-only">
        <span
          aria-hidden="true"
          className="grid size-6 place-items-center rounded-full bg-graphite text-xs text-lime tabular-nums max-lg:hidden"
        >
          {number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

/**
 * Phones: the tabs under the controls (buttons that show one part; the active one is
 * black, like the other choices of the configurator). Not on desktops.
 */
function PhoneTabs({ tab, onSelect }: { tab: PhoneTab; onSelect: (tab: PhoneTab) => void }) {
  const t = useTranslations('Configurator')
  return (
    <fieldset className="grid min-w-0 grid-cols-6 gap-0.5 border-t border-ink/8 px-2 pt-2 lg:hidden">
      <legend className="sr-only">{t('panel.open')}</legend>
      {PHONE_TABS.map((key, index) => (
        <button
          key={key}
          type="button"
          aria-pressed={tab === key}
          aria-controls={`configurator-${sectionOf(key)}`}
          onClick={() => onSelect(key)}
          className="group flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[0.6875rem] leading-none font-medium tracking-tight text-mute transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] aria-pressed:bg-graphite aria-pressed:text-white motion-reduce:active:scale-100"
        >
          <span
            aria-hidden="true"
            className="grid size-5 place-items-center rounded-full bg-plaster-200 text-[0.6875rem] text-ink tabular-nums group-aria-pressed:bg-lime group-aria-pressed:text-graphite"
          >
            {index + 1}
          </span>
          <span className="max-w-full truncate">{t(`tabs.${key}`)}</span>
        </button>
      ))}
    </fieldset>
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
            className="cursor-pointer rounded-lg px-3.5 py-2 text-sm font-medium ring-1 ring-ink/12 transition-[background-color,color,transform] duration-150 ease-out ring-inset select-none hover:bg-plaster active:scale-[0.97] has-checked:bg-graphite has-checked:text-white has-checked:ring-graphite has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink motion-reduce:active:scale-100"
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

function PrintFields({
  quality,
  phonePart,
}: {
  quality: PanelProps['quality']
  /** Phones show the size and fit, or the position (two tabs); desktops show both. */
  phonePart: 'size' | 'position'
}) {
  const t = useTranslations('Configurator.print')
  const onPhones = (part: typeof phonePart) => (phonePart === part ? '' : 'max-lg:hidden')
  const store = useConfiguratorStore()
  const fit = useConfigurator((state) => state.fit)
  const setFit = useConfigurator((state) => state.setFit)
  const centrePrint = useConfigurator((state) => state.centrePrint)
  const { print, wall, limits } = usePlacement()
  const edges = edgesOf(print, wall)
  const metres = useMetres()
  const fitted = () => placementOf(store.getState())

  return (
    // A flex gap, not space-y: a part hidden on phones then leaves no margin behind.
    <div className="flex flex-col gap-5 max-lg:gap-4">
      <div className={`empty:hidden ${onPhones('size')}`}>
        <ResolutionWarning quality={quality} />
      </div>
      <div className={`grid grid-cols-2 gap-3 ${onPhones('size')}`}>
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

      <div className={onPhones('size')}>
        <p className="mb-2 text-xs font-medium text-mute">{t('fit')}</p>
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

      <div className={onPhones('position')}>
        <p className="mb-2 text-xs font-medium text-mute">{t('position')}</p>
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
          className="mt-3 rounded-lg px-3.5 py-2 text-sm font-medium ring-1 ring-ink/12 transition-[background-color,transform] duration-150 ease-out ring-inset hover:bg-plaster active:scale-[0.97]"
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
          className="mt-2 rounded-lg bg-graphite px-3 py-1.5 font-medium text-white transition-transform duration-150 ease-out active:scale-[0.97]"
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
 * Control 8: always visible. Desktop: at the bottom of the panel, with the breakdown.
 * Phones: one line under the tabs, the price beside the quote and share buttons.
 */
function PriceSummary({
  rates,
  ratesAreExamples,
  presets,
  contact,
  privacyHref,
  captureRef,
}: PanelProps) {
  const t = useTranslations('Configurator.price')
  const format = useFormatter()
  const environment = useConfigurator((state) => state.environment)
  const price = usePrice(rates)
  const chf = useChf()
  const area = format.number(price.areaM2, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const vatRate = format.number(rates.vatRate, { style: 'percent', maximumFractionDigits: 1 })

  return (
    <div className="flex items-center gap-3 bg-paper px-5 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 lg:block lg:border-t lg:border-ink/10 lg:pt-5 lg:pb-5 lg:shadow-[0_-12px_30px_-20px_rgb(14_14_16/0.4)]">
      <div className="min-w-0 shrink-0">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs font-medium text-mute max-lg:text-[0.6875rem]">
            {t('label')}
            {ratesAreExamples && (
              <span className="ml-2 rounded-full bg-plaster px-2 py-0.5 text-[0.7rem] font-medium max-lg:ml-1 max-lg:px-1.5">
                {t('example')}
              </span>
            )}
          </p>
          <p className="text-xs text-mute max-lg:hidden">{t('area', { area })}</p>
        </div>
        <p
          aria-live="polite"
          className="mt-1 text-3xl font-medium tracking-tight tabular-nums max-lg:mt-0.5 max-lg:text-xl"
        >
          {t('approx', { price: chf(price.approx) })}
        </p>
      </div>

      {/* Desktop only: on phones the quote dialog shows the configuration and the price. */}
      <details className="mt-2 text-xs text-mute max-lg:hidden">
        <summary className="cursor-pointer font-medium text-ink">{t('details')}</summary>
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

      <div className="flex min-w-0 flex-1 gap-2 lg:mt-3">
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
        className="grid size-12 place-items-center rounded-2xl ring-1 ring-ink/12 transition-[background-color,transform] duration-150 ease-out ring-inset hover:bg-plaster active:scale-[0.97]"
      >
        <LinkIcon className="size-5" />
        <span className="sr-only">{t('copy')}</span>
      </button>
      <p
        aria-live="polite"
        className={`absolute right-0 bottom-full mb-2 w-64 rounded-xl bg-graphite px-3 py-2 text-xs leading-relaxed text-white shadow-lg ${result ? '' : 'sr-only'}`}
      >
        {result && t(result)}
      </p>
    </div>
  )
}

function Row({ term, value, strong }: { term: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${strong ? 'font-medium text-ink' : ''}`}>
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
      className="absolute top-4 right-4 z-10 hidden items-center gap-3 rounded-2xl bg-graphite py-2 pr-2 pl-4 text-sm font-medium text-white shadow-lg transition-transform duration-150 ease-out active:scale-[0.97] lg:flex"
    >
      {t('price.approx', { price: chf(price.approx) })}
      <span className="rounded-xl bg-lime px-3 py-1.5 text-graphite">{t('panel.open')}</span>
    </button>
  )
}
