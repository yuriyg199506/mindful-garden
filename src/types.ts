export type EmotionType = '担心' | '害怕' | '委屈' | '羞耻' | '愤怒' | '孤独' | '压力' | '不确定' | '其他'
export type MaterialType = 'crystal' | 'pearl' | 'glass' | 'silk' | 'neon' | 'velvet'

export interface FlowerParams {
  petalCount: number
  petalLayers: number
  petalLength: number
  petalWidth: number
  petalCurl: number
  stemCurve: number
  bloomColor: string
  accentColor: string
  emissiveColor: string
  materialType: MaterialType
  particleAmount: number
  growthSpeed: number
  auraIntensity: number
  flowerHeight: number
  leafCount: number
  tilt: number
}

export interface MindfulEntry {
  id: string
  createdAt: string
  title: string
  rawText: string
  emotionType: EmotionType
  bodyLocation: string
  beforeIntensity: number
  strongestThought: string
  gentleReframe: string
  selectedPractice: string
  afterIntensity: number
  flowerSeed: number
  flowerParams: FlowerParams
  note: string
  tags: string[]
}

export interface DraftEntry {
  rawText: string
  emotionType: EmotionType | ''
  bodyLocation: string
  beforeIntensity: number
  strongestThought: string
  gentleReframe: string
  selectedPractice: string
  afterIntensity: number
}
