import { Suspense, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Float, OrbitControls, Sparkles } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { ProceduralFlower } from './ProceduralFlower'
import type { MindfulEntry } from '../types'

interface Props { entries: MindfulEntry[]; onSelect: (entry: MindfulEntry) => void; compact?: boolean }

function ConstellationFlower({ position, scale = 1, phase = 0 }: { position: [number,number,number]; scale?: number; phase?: number }) {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = []
    for (let petal = 0; petal < 6; petal++) {
      const a = petal / 6 * Math.PI * 2
      for (let i = 0; i < 13; i++) {
        const t = i / 12 * Math.PI * 2
        const radial = .25 + Math.sin(t) * .2
        const x = Math.cos(a) * (.28 + Math.cos(t) * .25) - Math.sin(a) * Math.sin(t) * .13
        const y = 1.62 + Math.sin(a) * (.28 + Math.cos(t) * .25) + Math.cos(a) * Math.sin(t) * .13
        points.push(new THREE.Vector3(x * radial / .25, y, Math.sin(t + a) * .04))
      }
    }
    for (let i = 0; i < 24; i++) {
      const t = i / 23
      points.push(new THREE.Vector3(Math.sin(t * 3 + phase) * .05, t * 1.35 + .12, 0))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [phase])
  return <Float speed={.55} rotationIntensity={.04} floatIntensity={.08}>
    <points geometry={geometry} position={position} scale={scale}>
      <pointsMaterial color="#a9f8e0" size={.035} sizeAttenuation transparent opacity={.42} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  </Float>
}

function Scene({ entries, onSelect, compact }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const shown = entries.slice(0, compact ? 8 : 18)
  return <>
    <color attach="background" args={['#06131a']} />
    <fog attach="fog" args={['#07171f', 7, 15]} />
    <ambientLight intensity={.48} color="#b7dcff" />
    <directionalLight position={[4,7,4]} intensity={2.1} color="#c8fff2" />
    <pointLight position={[-4,3,2]} intensity={18} distance={8} color="#815dff" />
    <pointLight position={[4,2,-2]} intensity={14} distance={7} color="#32d7c1" />
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.05,0]}>
      <circleGeometry args={[9,64]} /><meshStandardMaterial color="#071f22" roughness={.72} metalness={.08} />
    </mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.035,0]}>
      <ringGeometry args={[2.8,7.5,64]} /><meshBasicMaterial color="#0c342f" transparent opacity={.25} blending={THREE.AdditiveBlending} />
    </mesh>
    {entries.length === 0 && <>
      <ConstellationFlower position={[-2.5,0,.8]} scale={.78} phase={.3}/>
      <ConstellationFlower position={[0,0,.2]} scale={.92} phase={1.4}/>
      <ConstellationFlower position={[2.6,0,1]} scale={.7} phase={2.1}/>
    </>}
    {shown.map((entry,i) => {
      const cols = compact ? 4 : 6; const row = Math.floor(i/cols); const col = i%cols
      const x = (col-(Math.min(cols,shown.length)-1)/2)*1.65 + (row%2)*.5; const z = -.6-row*1.6
      const active = hovered === entry.id
      return <group key={entry.id} position={[x,0,z]} scale={active ? .74 : .64}
        onPointerEnter={(e) => {e.stopPropagation();setHovered(entry.id);document.body.style.cursor='pointer'}}
        onPointerLeave={() => {setHovered(null);document.body.style.cursor='default'}} onClick={(e) => {e.stopPropagation();onSelect(entry)}}>
        <Float speed={1.15} rotationIntensity={.08} floatIntensity={.12}><ProceduralFlower seed={entry.flowerSeed} params={entry.flowerParams} quality="low" /></Float>
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,.015,0]}><ringGeometry args={[.22,.42,32]} /><meshBasicMaterial color={entry.flowerParams.emissiveColor} transparent opacity={active ? .52 : .18} /></mesh>
      </group>
    })}
    <Sparkles count={compact ? 28 : 48} scale={[12,4,9]} position={[0,2,-1]} size={1.3} speed={.12} color="#9fffe6" opacity={.32} />
    {!compact && <OrbitControls makeDefault enablePan={false} enableDamping dampingFactor={.07} minDistance={5.8} maxDistance={12} minPolarAngle={.62} maxPolarAngle={1.42} target={[0,1.15,-1.2]} rotateSpeed={.55} zoomSpeed={.65} />}
    <EffectComposer multisampling={0}><Bloom luminanceThreshold={.45} mipmapBlur intensity={.9} radius={.55} /><Vignette offset={.15} darkness={.45} /></EffectComposer>
  </>
}

export function GardenScene(props: Props) {
  return <Canvas dpr={[1,1.5]} camera={{ position: [0,4.1,8.8], fov: 42 }} gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}>
    <Suspense fallback={null}><Scene {...props} /></Suspense>
  </Canvas>
}

export function FlowerPortrait({ entry, growth = false, onGrowthStage }: { entry: MindfulEntry; growth?: boolean; onGrowthStage?: (s:number)=>void }) {
  return <Canvas dpr={[1,1.75]} camera={{position:[0,2.5,6],fov:38}} gl={{antialias:true, powerPreference:'high-performance'}}>
    <color attach="background" args={['#07151d']} /><ambientLight intensity={.6} /><directionalLight position={[3,5,4]} intensity={2.4} color="#e4fff6" />
    <pointLight position={[-2,2,2]} intensity={14} distance={6} color={entry.flowerParams.bloomColor} />
    <group position={[0,-1.55,0]} scale={1.05}><ProceduralFlower seed={entry.flowerSeed} params={entry.flowerParams} quality="high" growth={growth} onGrowthStage={onGrowthStage} /></group>
    {!growth && <OrbitControls makeDefault enablePan={false} enableDamping dampingFactor={.08} minDistance={4.4} maxDistance={7.5} minPolarAngle={.55} maxPolarAngle={1.75} target={[0,.25,0]} rotateSpeed={.6} zoomSpeed={.65} />}
    <EffectComposer multisampling={0}><Bloom luminanceThreshold={.38} mipmapBlur intensity={1.15} radius={.65} /><Vignette offset={.16} darkness={.5} /></EffectComposer>
  </Canvas>
}
