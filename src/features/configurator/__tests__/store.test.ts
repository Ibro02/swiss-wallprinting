import { describe, expect, it } from 'vite-plus/test'
import { edgesOf } from '../model/print.ts'
import { fromSearchParams, toSearchParams } from '../model/share.ts'
import { startConfig, type StartContent } from '../start.ts'
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

const newStore = (area?: string) => createConfiguratorStore(startConfig(area, content), MACHINE)

describe('startConfig', () => {
  it('starts with the first preset, the default room, and the north wall', () => {
    const config = startConfig(undefined, content)
    expect(config.image).toMatchObject({ kind: 'preset', id: 'cmyk', aspect: 2 })
    expect(config.room).toEqual({ width: 5, length: 4, height: 2.7 })
    expect(config.wall).toBe('north')
    expect(config.environment).toBe('interior')
    expect(config.print).toEqual({ width: 3.5, height: 1.75, x: 0, y: 0 })
  })

  it('starts with the wall and artwork of the area (?area=)', () => {
    const config = startConfig('facade', content)
    expect(config.image).toMatchObject({ id: 'peaks' })
    expect(config.room).toMatchObject({ width: 9, height: 6 })
    expect(config.environment).toBe('exterior')
  })

  it('ignores an unknown area', () => {
    expect(startConfig('castle', content)).toEqual(startConfig(undefined, content))
  })

  it('restores a share link, before the area, and fits the print to the wall', () => {
    const config = startConfig('facade', content, {
      room: { width: 4, length: 3, height: 2.5 },
      wall: 'west',
      preset: 'peaks',
      print: { width: 9, height: 1, x: 0, y: 0 },
      fit: 'contain',
      environment: 'interior',
    })
    expect(config).toMatchObject({ wall: 'west', fit: 'contain', environment: 'interior' })
    expect(config.image).toMatchObject({ id: 'peaks' })
    // The west wall is as wide as the room is long: 3 m.
    expect(config.print.width).toBe(3)
  })

  it('opens a link to an uploaded image with the first preset', () => {
    const config = startConfig(undefined, content, {
      room: { width: 5, length: 4, height: 2.7 },
      wall: 'north',
      preset: undefined,
      print: { width: 2, height: 1, x: 0, y: 0 },
      fit: 'cover',
      environment: 'interior',
    })
    expect(config.image).toMatchObject({ id: 'cmyk' })
  })
})

describe('sharedConfigOf', () => {
  it('opens the same configuration again from its link', () => {
    const store = newStore('facade')
    store.getState().selectWall('east')
    store.getState().setFit('contain')
    const shared = sharedConfigOf(store.getState())
    const params = Object.fromEntries(toSearchParams(shared).entries())
    const reopened = startConfig(undefined, content, fromSearchParams(params, ['cmyk', 'peaks']))
    expect(reopened).toMatchObject({
      room: store.getState().room,
      wall: 'east',
      fit: 'contain',
      environment: 'exterior',
      image: { id: 'peaks' },
      print: placementOf(store.getState()).print,
    })
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
    expect(print.x).toBeCloseTo((wall.width - print.width) / 2)
    expect(print.y).toBeCloseTo((wall.height - print.height) / 2)
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
    expect(placementOf(store.getState()).print.width).toBe(2.5)
    setRoomSize('width', 5)
    expect(placementOf(store.getState()).print.width).toBe(3.5)
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
    expect(edgesOf(print, wall).left).toBeCloseTo(wall.width - print.width)

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
    store.getState().setFit('contain')
    const contain = placementOf(store.getState()).areaM2
    expect(contain).toBeLessThan(cover)
    expect(contain).toBeCloseTo(3.5 * 1.75)
  })
})
