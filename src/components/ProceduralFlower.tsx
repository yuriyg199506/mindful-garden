import { useEffect, useMemo, useRef, useState } from 'react'
import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { FlowerParams } from '../types'
import { mulberry32 } from '../lib/flower'

interface Props {
  params: FlowerParams
  seed: number
  quality?: 'low' | 'high'
  growth?: boolean
  onGrowthStage?: (stage: number) => void
}

function petalGeometry(length: number, width: number, curl: number, segments: number) {
  const geometry = new THREE.BufferGeometry()
  const vertices: number[] = []; const indices: number[] = []; const uvs: number[] = []
  const across = Math.max(4, Math.floor(segments * .6))
  for (let y = 0; y <= segments; y++) {
    const u = y / segments
    for (let x = 0; x <= across; x++) {
      const v = x / across
      const edge = Math.sin(Math.PI * v)
      const taper = Math.pow(Math.sin(Math.PI * Math.min(.99, u)), .34) * (.45 + .55 * u)
      const px = (v - .5) * width * 2 * taper
      const py = u * length
      const pz = Math.sin(u * Math.PI * .82) * curl + edge * .045 - u * u * curl * .2
      vertices.push(px, py, pz); uvs.push(v, u)
    }
  }
  for (let y = 0; y < segments; y++) for (let x = 0; x < across; x++) {
    const a = y * (across + 1) + x; const b = a + 1; const c = a + across + 1; const d = c + 1
    indices.push(a, c, b, b, c, d)
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices); geometry.computeVertexNormals()
  return geometry
}

function materialProps(type: FlowerParams['materialType'], high: boolean) {
  const common = { side: THREE.DoubleSide, transparent: true, depthWrite: true }
  switch (type) {
    case 'crystal': return { ...common, roughness: .08, metalness: .05, transmission: high ? .55 : 0, thickness: .6, ior: 1.45, opacity: .82 }
    case 'glass': return { ...common, roughness: .14, metalness: 0, transmission: high ? .68 : 0, thickness: .38, ior: 1.35, opacity: .7 }
    case 'pearl': return { ...common, roughness: .24, metalness: .18, iridescence: high ? .9 : .3, iridescenceIOR: 1.8, opacity: .94 }
    case 'neon': return { ...common, roughness: .28, metalness: .05, opacity: .82 }
    case 'velvet': return { ...common, roughness: .8, metalness: 0, sheen: 1, sheenRoughness: .5, opacity: .96 }
    default: return { ...common, roughness: .4, metalness: .04, sheen: .7, opacity: .9 }
  }
}

export function ProceduralFlower({ params, seed, quality = 'high', growth = false, onGrowthStage }: Props) {
  const root = useRef<THREE.Group>(null); const stem = useRef<THREE.Group>(null); const leaves = useRef<THREE.Group>(null)
  const petals = useRef<THREE.Group>(null); const heart = useRef<THREE.Group>(null); const started = useRef<number | null>(null)
  const [particleVisible, setParticleVisible] = useState(!growth)
  const r = useMemo(() => mulberry32(seed), [seed])
  const motion = useMemo(() => {
    const wind = mulberry32(seed ^ 0x9e3779b9)
    return {
      phase: wind() * Math.PI * 2,
      swaySpeed: .42 + wind() * .5,
      swayAmount: .007 + wind() * .018,
      yawSpeed: (.012 + wind() * .026) * (wind() > .5 ? 1 : -1),
      yawAmount: .025 + wind() * .055,
      nodSpeed: .27 + wind() * .4,
    }
  }, [seed])
  const phase = useMemo(() => Array.from({ length: params.petalLayers }, () => r() * .3), [params.petalLayers, r])
  const geometry = useMemo(() => petalGeometry(params.petalLength, params.petalWidth, params.petalCurl, quality === 'high' ? 18 : 8), [params, quality])
  const leafGeo = useMemo(() => petalGeometry(.58, .19, .12, quality === 'high' ? 10 : 5), [quality])
  const stemGeo = useMemo(() => {
    const h = params.flowerHeight
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(params.stemCurve * .25, h * .35, 0),
      new THREE.Vector3(params.stemCurve, h * .7, params.stemCurve * .18), new THREE.Vector3(params.stemCurve * .72, h, 0),
    ])
    return new THREE.TubeGeometry(curve, quality === 'high' ? 32 : 12, quality === 'high' ? .055 : .065, quality === 'high' ? 8 : 5, false)
  }, [params, quality])

  useEffect(() => () => { geometry.dispose(); leafGeo.dispose(); stemGeo.dispose() }, [geometry, leafGeo, stemGeo])

  useFrame(({ clock }) => {
    if (!root.current) return
    const time = clock.elapsedTime
    root.current.rotation.y = Math.sin(time * motion.nodSpeed + motion.phase) * motion.yawAmount + time * motion.yawSpeed
    root.current.rotation.z = params.tilt + Math.sin(time * motion.swaySpeed + motion.phase) * motion.swayAmount + Math.sin(time * motion.swaySpeed * .43 + motion.phase * 1.7) * motion.swayAmount * .42
    if (!growth) return
    if (started.current === null) started.current = clock.elapsedTime
    const t = Math.min(1, (clock.elapsedTime - started.current) / (4.3 / params.growthSpeed))
    const ease = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3)
    const stemP = ease(t / .38); const leafP = ease((t - .24) / .28); const petalP = ease((t - .43) / .35); const heartP = ease((t - .73) / .2)
    if (stem.current) stem.current.scale.set(1, stemP, 1)
    if (leaves.current) leaves.current.scale.setScalar(Math.max(.001, leafP))
    if (petals.current) petals.current.scale.setScalar(Math.max(.001, petalP))
    if (heart.current) heart.current.scale.setScalar(Math.max(.001, heartP))
    const stage = t < .12 ? 0 : t < .38 ? 1 : t < .5 ? 2 : t < .74 ? 3 : t < .9 ? 4 : 5
    onGrowthStage?.(stage)
    if (t > .82) setParticleVisible(true)
  })

  const petalMat = materialProps(params.materialType, quality === 'high')
  const head = [params.stemCurve * .72, params.flowerHeight, 0] as [number, number, number]
  return (
    <group ref={root}>
      {growth && <mesh position={[0,.08,0]} scale={[.12,.08,.12]}><sphereGeometry args={[1,16,10]} /><meshStandardMaterial color={params.emissiveColor} emissive={params.emissiveColor} emissiveIntensity={2} /></mesh>}
      <group ref={stem} scale={growth ? [1,.001,1] : 1}>
        <mesh geometry={stemGeo}><meshStandardMaterial color="#3b9173" roughness={.48} emissive="#123c35" emissiveIntensity={.3} /></mesh>
      </group>
      <group ref={leaves} scale={growth ? .001 : 1}>
        {Array.from({ length: params.leafCount }).map((_, i) => {
          const side = i % 2 ? -1 : 1; const y = .55 + i * params.flowerHeight / (params.leafCount + 2)
          return <mesh key={i} geometry={leafGeo} position={[params.stemCurve * y / params.flowerHeight, y, 0]} rotation={[1.05, side * .4, side * -1.18]} scale={[side,1,1]}>
            <meshPhysicalMaterial color={i % 2 ? '#58bfa0' : '#79d2a9'} emissive="#0a5a4b" emissiveIntensity={.28} roughness={.36} side={THREE.DoubleSide} />
          </mesh>
        })}
      </group>
      <group position={head} rotation={[.2, 0, 0]}>
        <group ref={petals} scale={growth ? .001 : 1}>
          {Array.from({ length: params.petalLayers }).flatMap((_, layer) => Array.from({ length: params.petalCount + layer * 2 }).map((__, i) => {
            const count = params.petalCount + layer * 2; const angle = i / count * Math.PI * 2 + phase[layer]
            const scale = 1 - layer * .13; const lift = .16 + layer * .18
            return <mesh key={`${layer}-${i}`} geometry={geometry} rotation={[lift, layer * .08, angle]} scale={[scale,scale,scale]}>
              <meshPhysicalMaterial {...petalMat} color={layer % 2 ? params.accentColor : params.bloomColor} emissive={params.emissiveColor} emissiveIntensity={params.materialType === 'neon' ? 1.25 : .32 + params.auraIntensity * .22} />
            </mesh>
          }))}
        </group>
        <group ref={heart} scale={growth ? .001 : 1}>
          <mesh position={[0,0,.11]}><sphereGeometry args={[.22, quality === 'high' ? 24 : 12, 12]} /><meshPhysicalMaterial color={params.accentColor} emissive={params.emissiveColor} emissiveIntensity={1.8} roughness={.12} /></mesh>
          {quality === 'high' && Array.from({length: 11}).map((_,i) => {
            const a = i / 11 * Math.PI * 2
            return <mesh key={i} position={[Math.cos(a)*.25,Math.sin(a)*.25,.16]} scale={.025 + (i%3)*.006}><sphereGeometry args={[1,8,8]} /><meshBasicMaterial color={params.emissiveColor} /></mesh>
          })}
        </group>
        {particleVisible && <Sparkles count={quality === 'high' ? params.particleAmount : Math.min(5,params.particleAmount)} scale={[2.5,2.5,1.5]} size={quality === 'high' ? 2.5 : 1.2} speed={.22} color={params.emissiveColor} opacity={.65} noise={1.2} />}
      </group>
    </group>
  )
}
