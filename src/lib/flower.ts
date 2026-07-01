import type { EmotionType, FlowerParams, MaterialType } from '../types'

export function hashString(value: string) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function mulberry32(seed: number) {
  return () => {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

const palettes: Record<EmotionType, string[][]> = {
  担心: [['#728dff','#c29cff','#9ff6ff'], ['#76a7ff','#e0b7ff','#7fffdc']],
  害怕: [['#195f9f','#3be1c2','#79aaff'], ['#233f92','#69efd5','#a4c8ff']],
  委屈: [['#e78cce','#ad8dff','#9ceaff'], ['#ff9fcf','#d0b2ff','#86d6ff']],
  羞耻: [['#e7a4b9','#f6e7e0','#b5b8e8'], ['#d993a9','#fff0e6','#b6a4da']],
  愤怒: [['#ff654d','#ffbb4d','#ff3b72'], ['#ff754a','#ffd166','#e93973']],
  孤独: [['#d9edff','#7cb8e8','#d8c6ff'], ['#f2f7ff','#8dc5dd','#aca9ef']],
  压力: [['#167f97','#8259df','#58e0c1'], ['#285fb2','#9c63e8','#74efd5']],
  不确定: [['#ff71c8','#71eaff','#ffe36f'], ['#a873ff','#65ffd1','#ff8fbd']],
  其他: [['#a67dff','#ff8fc6','#66efd6'], ['#6ce0ff','#d17eff','#ffd27d']],
}

const materials: MaterialType[] = ['crystal', 'pearl', 'glass', 'silk', 'neon', 'velvet']

export function generateFlowerParams(seed: number, emotion: EmotionType, intensity: number): FlowerParams {
  const r = mulberry32(seed)
  const palette = palettes[emotion][Math.floor(r() * palettes[emotion].length)]
  const materialBias: Partial<Record<EmotionType, MaterialType>> = {
    担心: 'glass', 害怕: 'crystal', 委屈: 'pearl', 羞耻: 'silk', 愤怒: 'neon', 孤独: 'glass', 压力: 'velvet', 不确定: 'crystal',
  }
  return {
    petalCount: 7 + Math.floor(r() * 8),
    petalLayers: 2 + Math.floor(r() * 3),
    petalLength: .78 + r() * .58,
    petalWidth: .28 + r() * .26,
    petalCurl: .18 + r() * .55,
    stemCurve: (r() - .5) * .62,
    bloomColor: palette[0], accentColor: palette[1], emissiveColor: palette[2],
    materialType: r() < .62 && materialBias[emotion] ? materialBias[emotion]! : materials[Math.floor(r() * materials.length)],
    particleAmount: 8 + Math.floor(r() * 16),
    growthSpeed: .85 + r() * .35,
    auraIntensity: .55 + intensity / 20 + r() * .35,
    flowerHeight: 2.2 + r() * .65,
    leafCount: 2 + Math.floor(r() * 3),
    tilt: (r() - .5) * .24,
  }
}

export function createSeed(id: string, text: string, emotion: EmotionType, intensity: number) {
  return hashString(`${id}|${text}|${emotion}|${intensity}`)
}
