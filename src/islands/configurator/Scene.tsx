'use client'

import { AdaptiveDpr, CameraControls, Preload, useGLTF, useTexture } from '@react-three/drei'
import { Canvas, type ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import { type ReactNode, type RefObject, Suspense, useEffect, useMemo, useRef } from 'react'
import {
  Box3,
  CanvasTexture,
  ClampToEdgeWrapping,
  Group,
  Mesh,
  MeshStandardMaterial,
  MultiplyBlending,
  NeutralToneMapping,
  type Object3D,
  type PerspectiveCamera,
  Plane,
  PlaneGeometry,
  type Ray,
  SRGBColorSpace,
  type Texture,
  Vector3,
} from 'three'
import type { QualityTier } from '@/features/configurator/model/budget.ts'
import { imageCrop } from '@/features/configurator/model/print.ts'
import { pickQualityTier } from '@/features/configurator/model/quality.ts'
import {
  cameraFor,
  neighbours,
  type Room,
  type Wall,
  wallFrame,
  WALLS,
} from '@/features/configurator/model/room.ts'
import { useConfigurator, useConfiguratorStore, usePlacement } from './store-context.tsx'

// The 3D room of the configurator (Development Plan 2.5 and 4.7). Loaded only on this
// page, with next/dynamic and ssr: false (Stage.tsx). The room is built in code from the
// store sizes (P3); the model file gives only the plaster and floor textures. The scene
// draws only after a change (frameloop "demand").

const FOV = 50

/** The tier is fixed per visit: the first model request already needs it. */
export const SCENE_TIER: QualityTier =
  typeof window === 'undefined'
    ? 'high'
    : pickQualityTier({ viewportWidth: window.innerWidth, cores: navigator.hardwareConcurrency })

const roomModel = (tier: QualityTier) => `/models/room-${tier}.glb`
const propsModel = (tier: QualityTier) => `/models/props-${tier}.glb`
// No Draco (the models use meshopt), so no decoder is fetched from a CDN.
useGLTF.preload(roomModel(SCENE_TIER), false, true)
useGLTF.preload(propsModel(SCENE_TIER), false, true)

/** Real size of one texture tile, metres. */
const TILE = { plaster: 1.25, floor: 1.6 } as const
const SKIRTING_HEIGHT = 0.08
/** The print sits this far in front of the wall, metres. */
const PRINT_GAP = 0.003

/** Returns the 3D view as a JPEG data URL (for the quote request), or null. */
export type CaptureView = () => string | null

export interface SceneProps {
  /** Preset image URLs: loaded in the background, so a click on a preset shows it at once. */
  presetSources: readonly string[]
  onReady: () => void
  /** Filled by the scene with a function that captures the view. */
  captureRef: RefObject<CaptureView | null>
}

export default function Scene({ presetSources, onReady, captureRef }: SceneProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop="demand"
      performance={{ min: 0.5 }}
      camera={{ fov: FOV, near: 0.05, far: 300, position: [0, 1.35, 6] }}
      gl={{
        // Phones have a pixel ratio of 2 or more: no multisampling needed there.
        antialias: SCENE_TIER === 'high',
        toneMapping: NeutralToneMapping,
        powerPreference: 'high-performance',
      }}
      className="touch-none"
    >
      <color attach="background" args={['#e9e5de']} />
      <Suspense fallback={null}>
        <Lights />
        <RoomShell tier={SCENE_TIER} />
        <RoomProps tier={SCENE_TIER} />
        <PrintOnWall />
        <Preload all />
        <Ready presetSources={presetSources} onReady={onReady} />
      </Suspense>
      <CameraRig />
      <Capture captureRef={captureRef} />
      <AdaptiveDpr pixelated />
    </Canvas>
  )
}

/** The longest side of the screenshot in the quote e-mail, pixels. */
const CAPTURE_MAX_WIDTH = 1200

/**
 * Gives the quote form a function that captures the 3D view. It draws one frame and copies
 * it at once (the canvas keeps no frame, which is faster), scaled down to a small JPEG.
 */
function Capture({ captureRef }: { captureRef: RefObject<CaptureView | null> }) {
  const get = useThree((state) => state.get)
  const store = useConfiguratorStore()
  useEffect(() => {
    captureRef.current = () => {
      const { gl, scene, camera, size, invalidate } = get()
      // The front view of the wall (as on page load), whatever angle the visitor turned to:
      // the clearest picture for the client. Then the visitor's view comes back.
      const { room, wall } = store.getState()
      const perspective = camera as PerspectiveCamera
      const view = cameraFor(room, wall, {
        aspect: size.width / size.height,
        fovDeg: perspective.fov,
      })
      const position = camera.position.clone()
      const rotation = camera.quaternion.clone()
      camera.position.set(...view.position)
      camera.lookAt(...view.target)
      camera.updateMatrixWorld()
      gl.render(scene, camera)
      camera.position.copy(position)
      camera.quaternion.copy(rotation)
      camera.updateMatrixWorld()
      invalidate()

      const source = gl.domElement
      const scale = Math.min(1, CAPTURE_MAX_WIDTH / source.width)
      const copy = document.createElement('canvas')
      copy.width = Math.round(source.width * scale)
      copy.height = Math.round(source.height * scale)
      const context = copy.getContext('2d')
      if (!context) return null
      context.drawImage(source, 0, 0, copy.width, copy.height)
      return copy.toDataURL('image/jpeg', 0.82)
    }
    return () => {
      captureRef.current = null
    }
  }, [captureRef, get, store])
  return null
}

/** Runs once the room has loaded: hides the loading text and preloads the other presets. */
function Ready({ presetSources, onReady }: Omit<SceneProps, 'captureRef'>) {
  useEffect(() => {
    const frame = requestAnimationFrame(onReady)
    for (const src of presetSources) useTexture.preload(src)
    return () => cancelAnimationFrame(frame)
  }, [presetSources, onReady])
  return null
}

function Lights() {
  const room = useConfigurator((state) => state.room)
  const wall = useConfigurator((state) => state.wall)
  // The light comes from the upper left of the viewer, so the selected wall is always lit.
  // A directional light uses only the direction from its target (the origin) to it.
  const { normal, right } = wallFrame(room, wall)
  const position: [number, number, number] = [
    normal[0] * 4 - right[0] * 2,
    3,
    normal[2] * 4 - right[2] * 2,
  ]
  // three.js uses physical light units: a diffuse surface reflects intensity / π, so a
  // light wall needs intensities of about 2 to 3.
  return (
    <>
      <hemisphereLight args={['#ffffff', '#d6ccbf', 2.4]} />
      <directionalLight position={position} intensity={2.2} />
    </>
  )
}

/** A plane whose texture tiles at its real size. */
function useTiledPlane(width: number, height: number, tile: number) {
  const geometry = useMemo(() => {
    const plane = new PlaneGeometry(width, height)
    const uv = plane.attributes.uv
    if (uv) {
      for (let index = 0; index < uv.count; index++) {
        uv.setXY(index, (uv.getX(index) * width) / tile, (uv.getY(index) * height) / tile)
      }
    }
    return plane
  }, [width, height, tile])
  useEffect(() => () => geometry.dispose(), [geometry])
  return geometry
}

function useRoomMaterials(tier: QualityTier) {
  const { materials } = useGLTF(roomModel(tier), false, true)
  const materialSet = useMemo(() => {
    const surface = (name: string, fallback: string) => {
      const source = materials[name]
      if (!(source instanceof MeshStandardMaterial))
        return new MeshStandardMaterial({ color: fallback })
      return new MeshStandardMaterial({
        map: source.map,
        normalMap: source.normalMap,
        normalScale: source.normalScale,
        roughnessMap: source.roughnessMap,
        roughness: 1,
        metalness: 0,
      })
    }
    return {
      wall: surface('beige_wall_001', '#ece6dc'),
      floor: surface('laminate_floor_02', '#a07c5a'),
      ceiling: new MeshStandardMaterial({ color: '#f6f4f0', roughness: 1 }),
      skirting: new MeshStandardMaterial({ color: '#f7f5f1', roughness: 0.6 }),
    }
  }, [materials])
  useEffect(
    () => () => {
      for (const material of Object.values(materialSet)) material.dispose()
    },
    [materialSet],
  )
  return materialSet
}

function RoomShell({ tier }: { tier: QualityTier }) {
  const room = useConfigurator((state) => state.room)
  const selected = useConfigurator((state) => state.wall)
  const selectWall = useConfigurator((state) => state.selectWall)
  const materials = useRoomMaterials(tier)
  const floor = useTiledPlane(room.width, room.length, TILE.floor)
  const ceiling = useTiledPlane(room.width, room.length, TILE.floor)

  return (
    <group>
      {WALLS.map((wall) => (
        <WallMesh
          key={wall}
          room={room}
          wall={wall}
          selected={wall === selected}
          material={materials.wall}
          skirting={materials.skirting}
          onSelect={selectWall}
        />
      ))}
      <mesh geometry={floor} material={materials.floor} rotation-x={-Math.PI / 2} />
      <mesh
        geometry={ceiling}
        material={materials.ceiling}
        position-y={room.height}
        rotation-x={Math.PI / 2}
      />
    </group>
  )
}

function WallMesh({
  room,
  wall,
  selected,
  material,
  skirting,
  onSelect,
}: {
  room: Room
  wall: Wall
  selected: boolean
  material: MeshStandardMaterial
  skirting: MeshStandardMaterial
  onSelect: (wall: Wall) => void
}) {
  const frame = wallFrame(room, wall)
  const geometry = useTiledPlane(frame.width, frame.height, TILE.plaster)
  const skirtingGeometry = useTiledPlane(frame.width, SKIRTING_HEIGHT, 1)
  const [cx, , cz] = frame.center
  const [nx, , nz] = frame.normal

  // Click a wall to print on it (Development Plan 4.7, control 2). A drag turns the
  // camera instead: `delta` is how far the pointer moved, in pixels.
  const onClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (event.delta > 6 || selected) return
    setCursor('')
    onSelect(wall)
  }

  return (
    <group>
      <mesh
        geometry={geometry}
        material={material}
        position={frame.center}
        rotation-y={frame.rotationY}
        onClick={onClick}
        onPointerOver={(event) => {
          event.stopPropagation()
          if (!selected) setCursor('pointer')
        }}
        onPointerOut={() => setCursor('')}
      />
      <mesh
        geometry={skirtingGeometry}
        material={skirting}
        position={[cx + nx * 0.005, SKIRTING_HEIGHT / 2, cz + nz * 0.005]}
        rotation-y={frame.rotationY}
      />
    </group>
  )
}

/** The pointer over something to click or drag (as in the three.js examples: on the page). */
function setCursor(cursor: '' | 'pointer' | 'grab' | 'grabbing') {
  document.body.style.cursor = cursor
}

/**
 * One object from a loaded model, as a new group with its world transform baked in. The
 * group is centred on x, its bottom at y = 0, and its back at z = 0 (against the wall).
 */
function useModelPart(url: string, name: string) {
  const { scene } = useGLTF(url, false, true)
  return useMemo(() => {
    // A copy: the loaded scene is cached and shared, so it stays unchanged.
    const copy = scene.clone(true)
    copy.updateMatrixWorld(true)
    const part = copy.getObjectByName(name)
    if (!part) return null
    const group = new Group()
    part.traverse((child: Object3D) => {
      if (!(child instanceof Mesh)) return
      const mesh = new Mesh(child.geometry, child.material)
      child.matrixWorld.decompose(mesh.position, mesh.quaternion, mesh.scale)
      group.add(mesh)
    })
    const box = new Box3().setFromObject(group)
    const offset = new Vector3((box.min.x + box.max.x) / 2, box.min.y, box.min.z)
    for (const mesh of group.children) mesh.position.sub(offset)
    const size = box.getSize(new Vector3())
    return { group, width: size.x, height: size.y }
  }, [scene, name])
}

/** Puts a part on a wall: `along` metres from the wall centre (to the right), bottom at `bottom`. */
function OnWall({
  wall,
  along,
  bottom,
  scale,
  children,
}: {
  wall: Wall
  along: number
  bottom: number
  scale: number
  children: ReactNode
}) {
  const room = useConfigurator((state) => state.room)
  const { center, normal, right, rotationY } = wallFrame(room, wall)
  const position: [number, number, number] = [
    center[0] + right[0] * along + normal[0] * 0.002,
    bottom,
    center[2] + right[2] * along + normal[2] * 0.002,
  ]
  // A wall seen from behind is invisible (one-sided); its window or door must be too, or
  // the camera outside the room sees them float in the air.
  const group = useRef<Group>(null)
  useFrame(({ camera }) => {
    if (!group.current) return
    const front =
      (camera.position.x - center[0]) * normal[0] + (camera.position.z - center[2]) * normal[2]
    group.current.visible = front > 0
  })
  return (
    <group ref={group} position={position} rotation-y={rotationY} scale={scale}>
      {children}
    </group>
  )
}

const WINDOW = { sill: 0.9, margin: 0.4 } as const
const DOOR = { height: 2.05, fromCorner: 0.45 } as const

/**
 * A window on the wall left of the print, and a door on the wall right of it (from the two
 * models, Development Plan 4.7). They never cover the print, and they show the scale of the
 * room. A wall too small for them stays empty.
 */
function RoomProps({ tier }: { tier: QualityTier }) {
  const room = useConfigurator((state) => state.room)
  const wall = useConfigurator((state) => state.wall)
  const frame = useModelPart(roomModel(tier), 'Window1001_7')
  const door = useModelPart(propsModel(tier), 'door_12')
  const { left, right } = neighbours(wall)

  const leftWall = wallFrame(room, left)
  const windowScale = frame ? Math.min(1, (leftWall.width - 2 * WINDOW.margin) / frame.width) : 0
  const showWindow =
    frame !== null &&
    windowScale >= 0.5 &&
    WINDOW.sill + frame.height * windowScale < room.height - 0.2

  const rightWall = wallFrame(room, right)
  const doorScale = door ? DOOR.height / door.height : 0
  const doorWidth = door ? door.width * doorScale : 0
  const showDoor =
    door !== null &&
    room.height >= DOOR.height + 0.2 &&
    rightWall.width >= doorWidth + 2 * DOOR.fromCorner

  return (
    <>
      {showWindow && frame && (
        <OnWall wall={left} along={0} bottom={WINDOW.sill} scale={windowScale}>
          <primitive object={frame.group} />
          {/* Daylight behind the glass: the wall has no hole, so the pane itself glows. */}
          <mesh position={[0, frame.height / 2, 0.01]}>
            <planeGeometry args={[frame.width * 0.94, frame.height * 0.9]} />
            <meshBasicMaterial color="#e4eef4" toneMapped={false} />
          </mesh>
        </OnWall>
      )}
      {showDoor && door && (
        <OnWall
          wall={right}
          along={-rightWall.width / 2 + DOOR.fromCorner + doorWidth / 2}
          bottom={0}
          scale={doorScale}
        >
          <primitive object={door.group} />
        </OnWall>
      )}
    </>
  )
}

function PrintOnWall() {
  const image = useConfigurator((state) => state.image)
  if (image.kind === 'preset') return <PresetPrint src={image.src} />
  return <UploadPrint canvas={image.canvas} />
}

function PresetPrint({ src }: { src: string }) {
  return <PrintPlane texture={useTexture(src)} />
}

function UploadPrint({ canvas }: { canvas: HTMLCanvasElement }) {
  const texture = useMemo(() => new CanvasTexture(canvas), [canvas])
  useEffect(() => () => texture.dispose(), [texture])
  return <PrintPlane texture={texture} />
}

/**
 * The print (proposal P4): multiply blending, so the lit plaster and its relief show
 * through the ink, as on a real wall print. White in the image leaves the wall as it is.
 */
function PrintPlane({ texture }: { texture: Texture }) {
  const room = useConfigurator((state) => state.room)
  const wall = useConfigurator((state) => state.wall)
  const fit = useConfigurator((state) => state.fit)
  const aspect = useConfigurator((state) => state.image.aspect)
  const visible = useConfigurator((state) => state.view === 'after')
  const { print, printed } = usePlacement()
  const anisotropy = useThree((state) => state.gl.capabilities.getMaxAnisotropy())
  const crop = imageCrop(print, aspect, fit)
  const [repeatX, repeatY] = crop.repeat
  const [offsetX, offsetY] = crop.offset

  // A copy with this crop. Copies share the image, so the GPU gets it only once; the
  // loaded texture stays as it is (drei caches it for the next time).
  const map = useMemo(() => {
    const copy = texture.clone()
    copy.colorSpace = SRGBColorSpace
    copy.wrapS = ClampToEdgeWrapping
    copy.wrapT = ClampToEdgeWrapping
    copy.anisotropy = Math.min(8, anisotropy)
    copy.repeat.set(repeatX, repeatY)
    copy.offset.set(offsetX, offsetY)
    copy.needsUpdate = true
    return copy
  }, [texture, anisotropy, repeatX, repeatY, offsetX, offsetY])
  useEffect(() => () => map.dispose(), [map])

  const frame = wallFrame(room, wall)
  const [cx, cy, cz] = frame.center
  const [nx, , nz] = frame.normal
  const [rx, , rz] = frame.right
  const position: [number, number, number] = [
    cx + rx * print.x + nx * PRINT_GAP,
    cy + print.y,
    cz + rz * print.x + nz * PRINT_GAP,
  ]

  // Drag the print on the wall (Development Plan 4.7, control 5). The pointer ray meets
  // the wall plane; the point in wall coordinates, minus where the print was grabbed, is
  // the new centre offset. The store keeps the print on the wall.
  const movePrint = useConfigurator((state) => state.movePrint)
  const get = useThree((state) => state.get)
  // On or off at once, in this event: the camera controls listen to the same canvas and
  // get this pointer event right after R3F (a React state update would come too late).
  const lockCamera = (locked: boolean) => {
    const controls = get().controls as CameraControls | null
    if (controls) controls.enabled = !locked
  }
  const grab = useRef<{ dx: number; dy: number } | null>(null)
  const onWall = (ray: Ray) => {
    const normal = new Vector3(nx, 0, nz)
    const plane = new Plane(normal, -normal.dot(new Vector3(cx, cy, cz)))
    const point = ray.intersectPlane(plane, new Vector3())
    if (!point) return null
    return { x: (point.x - cx) * rx + (point.z - cz) * rz, y: point.y - cy }
  }
  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    const point = onWall(event.ray)
    if (!point || !visible) return
    event.stopPropagation()
    grab.current = { dx: point.x - print.x, dy: point.y - print.y }
    ;(event.target as Element).setPointerCapture(event.pointerId)
    lockCamera(true)
    setCursor('grabbing')
  }
  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!grab.current) return
    event.stopPropagation()
    const point = onWall(event.ray)
    if (point) movePrint({ x: point.x - grab.current.dx, y: point.y - grab.current.dy })
  }
  const onPointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (!grab.current) return
    grab.current = null
    ;(event.target as Element).releasePointerCapture(event.pointerId)
    lockCamera(false)
    setCursor('grab')
  }

  return (
    <mesh
      position={position}
      rotation-y={frame.rotationY}
      scale={[printed.width, printed.height, 1]}
      visible={visible}
      renderOrder={1}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerOver={() => {
        if (visible && !grab.current) setCursor('grab')
      }}
      onPointerOut={() => {
        if (!grab.current) setCursor('')
      }}
    >
      <planeGeometry />
      <meshBasicMaterial
        map={map}
        transparent
        blending={MultiplyBlending}
        premultipliedAlpha
        depthWrite={false}
        toneMapped={false}
        polygonOffset
        polygonOffsetFactor={-2}
      />
    </mesh>
  )
}

/** Frames the selected wall; moves smoothly when the wall or the room changes. */
function CameraRig() {
  const controls = useRef<CameraControls>(null)
  const room = useConfigurator((state) => state.room)
  const wall = useConfigurator((state) => state.wall)
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const width = useThree((state) => state.size.width)
  const height = useThree((state) => state.size.height)
  const store = useConfiguratorStore()
  const first = useRef(true)

  useEffect(() => {
    const rig = controls.current
    if (!rig || height === 0) return
    const view = cameraFor(room, wall, { aspect: width / height, fovDeg: camera.fov })
    // Free the turn limits during the move, then allow about 60° to each side.
    rig.minAzimuthAngle = -Infinity
    rig.maxAzimuthAngle = Infinity
    rig.maxDistance = view.distance * 1.6
    const animate = !first.current
    first.current = false
    let cancelled = false
    void rig.setLookAt(...view.position, ...view.target, animate).then(() => {
      if (cancelled || store.getState().wall !== wall) return
      rig.minAzimuthAngle = rig.azimuthAngle - 1.05
      rig.maxAzimuthAngle = rig.azimuthAngle + 1.05
    })
    return () => {
      cancelled = true
    }
  }, [room, wall, width, height, camera, store])

  return (
    <CameraControls
      ref={controls}
      makeDefault
      // Lower the pixel ratio while the camera moves (<AdaptiveDpr>), for a smooth 60 FPS.
      regress
      smoothTime={0.35}
      truckSpeed={0}
      minDistance={0.8}
      minPolarAngle={Math.PI * 0.3}
      // A little below eye level at most: lower, the camera would go under the floor.
      maxPolarAngle={Math.PI * 0.52}
    />
  )
}
