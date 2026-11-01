import { describe, expect, it } from 'vite-plus/test'
import { anchorFor, cornerOf, edgesOf, WALL_MARGIN } from '../model/print.ts'
import { OUTDOOR_WALL, type StartContent, startConfiguration } from '../model/configuration.ts'
import { toSearchParams } from '../model/share.ts'
import { createConfiguratorStore, placementOf, type PrintImage, sharedConfigOf } from '../store.ts'

const MACHINE = 3.8
const image = (id: string, width: number, height: number) => ({
  id,
  image: { src: `/mock/presets/${id}.jpg`, width, height, blurDataURL: '' },
})

const content: StartContent = {
  presets: [image('cmyk', 2000, 1000), image('peaks', 2000, 1000)],
  rooms: [{ area: 'facade', preset: 'peaks', wall: { widthM: 9, heightM: 6 } }],
  areas: [
    { id: 'office', environment: 'interior' },
    { id: 'facade', environment: 'exterior' },
  ],
  machineMaxHeight: MACHINE,
}

const newStore = (area?: string) =>
  createConfiguratorStore(startConfiguration(area ? { area } : {}, content), MACHINE)

/** The configuration that the store's share link opens. */
const reopen = (store: ReturnType<typeof newStore>) =>
  startConfiguration(
    Object.fromEntries(toSearchParams(sharedConfigOf(store.getState())).entries()),
    content,
  )

describe('sharedConfigOf', () => {
  it('opens the same configuration again from its link', () => {
    const store = newStore('office')
    store.getState().selectWall('east')
    const reopened = reopen(store)
    expect(reopened).toMatchObject({
      room: store.getState().room,
      wall: 'east',
      fit: 'cover',
      environment: 'interior',
      image: { id: 'cmyk' },
      print: placementOf(store.getState()).print,
    })
  })

  it('opens an outdoor configuration on the one outdoor wall', () => {
    const store = newStore('office')
    store.getState().selectWall('west')
    store.getState().setEnvironment('exterior')
    expect(store.getState().wall).toBe(OUTDOOR_WALL)
    expect(reopen(store)).toMatchObject({ wall: OUTDOOR_WALL, environment: 'exterior' })
  })

  it('leaves an uploaded image out of the link', () => {
    const store = newStore()
    store.getState().chooseImage({
      kind: 'upload',
      name: 'photo.jpg',
      canvas: {} as HTMLCanvasElement,
      src: 'blob:test',
      aspect: 1.5,
      px: { width: 3000, height: 2000 },
    })
    expect(sharedConfigOf(store.getState()).preset).toBeUndefined()
  })
})

describe('configurator store', () => {
  it('moves a dragged print and keeps it on the wall', () => {
    const store = newStore()
    store.getState().movePrint({ x: 0.4, y: -0.2 })
    expect(placementOf(store.getState()).print).toMatchObject({ x: 0.4, y: -0.2 })
    store.getState().movePrint({ x: 99, y: 99 })
    const { print, wall } = placementOf(store.getState())
    expect(print.x).toBeCloseTo((wall.width - 2 * WALL_MARGIN.horizontal - print.width) / 2)
    expect(print.y).toBeCloseTo((wall.height - 2 * WALL_MARGIN.vertical - print.height) / 2)
  })

  it('resizes the print from a dragged corner and keeps it in the margins', () => {
    const store = newStore()
    const before = placementOf(store.getState()).print
    const anchor = anchorFor(before, 'top-right')
    store.getState().resizePrint('top-right', anchor, { x: 99, y: 99 })
    const { print, wall } = placementOf(store.getState())
    expect(cornerOf(print, 'bottom-left').x).toBeCloseTo(anchor.x)
    expect(cornerOf(print, 'bottom-left').y).toBeCloseTo(anchor.y)
    expect(cornerOf(print, 'top-right').x).toBeCloseTo(wall.width / 2 - WALL_MARGIN.horizontal)
    expect(cornerOf(print, 'top-right').y).toBeCloseTo(wall.height / 2 - WALL_MARGIN.vertical)
  })

  it('keeps typed room sizes in the limits', () => {
    const store = newStore()
    store.getState().setRoomSize('height', 12)
    expect(store.getState().room.height).toBe(8)
  })

  it('shrinks the print with a smaller wall and gives it back when the wall grows again', () => {
    const store = newStore()
    const { setRoomSize } = store.getState()
    setRoomSize('width', 2.5)
    expect(placementOf(store.getState()).print.width).toBe(2.3)
    setRoomSize('width', 5)
    expect(placementOf(store.getState()).print.width).toBe(3.36)
  })

  it('limits the print height by the machine on a high wall', () => {
    const store = newStore('facade')
    store.getState().setPrintSize('height', 5)
    const placement = placementOf(store.getState())
    expect(placement.print.height).toBe(3.8)
    expect(placement.limits.heightLimit).toBe('machine')
  })

  it('moves the print by its edges and keeps it on the wall', () => {
    const store = newStore()
    store.getState().setPrintEdges({ left: 0.5, bottom: 0.3 })
    let { print, wall } = placementOf(store.getState())
    expect(edgesOf(print, wall).left).toBeCloseTo(0.5)
    expect(edgesOf(print, wall).bottom).toBeCloseTo(0.3)

    store.getState().setPrintEdges({ left: 10 })
    ;({ print, wall } = placementOf(store.getState()))
    expect(edgesOf(print, wall).left).toBeCloseTo(wall.width - WALL_MARGIN.horizontal - print.width)

    store.getState().centrePrint()
    expect(placementOf(store.getState()).print).toMatchObject({ x: 0, y: 0 })
  })

  it('gives a new image its own proportions and shows the print', () => {
    const store = newStore()
    store.getState().setView('before')
    const upload: PrintImage = {
      kind: 'upload',
      name: 'logo.png',
      canvas: {} as HTMLCanvasElement,
      src: 'blob:test',
      aspect: 1,
      px: { width: 1000, height: 1000 },
    }
    store.getState().chooseImage(upload)
    const state = store.getState()
    expect(state.print.width).toBe(state.print.height)
    expect(state.view).toBe('after')
  })

  it('prints only the image rectangle with contain, so the area is smaller', () => {
    const store = newStore()
    store.getState().setPrintSize('height', 2.5)
    const cover = placementOf(store.getState()).areaM2
    // The store keeps "whole image" off (the product rules); the placement still knows it.
    const contain = placementOf({ ...store.getState(), fit: 'contain' }).areaM2
    expect(contain).toBeLessThan(cover)
    expect(contain).toBeCloseTo(3.36 * 1.68)
  })
})

describe('product rules in the store', () => {
  it('keeps an outdoor configuration on the one outdoor wall', () => {
    const store = newStore('facade')
    store.getState().selectWall('east')
    expect(store.getState().wall).toBe(OUTDOOR_WALL)
  })

  it('keeps a turned-off fit off', () => {
    const store = newStore()
    store.getState().setFit('contain')
    expect(store.getState().fit).toBe('cover')
  })

  it('gives the wall choice back indoors', () => {
    const store = newStore('facade')
    store.getState().setEnvironment('interior')
    store.getState().selectWall('east')
    expect(store.getState().wall).toBe('east')
  })
})
