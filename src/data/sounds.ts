import type { SoundSource, SoundCategory } from '../types/sound'

/**
 * 14種類の環境音ソース定義
 */
export const SOUND_SOURCES: SoundSource[] = [
  // Nature sounds
  {
    id: 'rain',
    name: '雨',
    category: 'nature',
    description: '穏やかな雨音',
    icon: 'CloudRain',
    fileName: 'rain.ogg',
    defaultVolume: 50,
    color: '#3B82F6', // blue-500
  },
  {
    id: 'waves',
    name: '波',
    category: 'nature',
    description: '海岸の波音',
    icon: 'Waves',
    fileName: 'waves.ogg',
    defaultVolume: 40,
    color: '#06B6D4', // cyan-500
  },
  {
    id: 'stream',
    name: '小川',
    category: 'nature',
    description: '小川のせせらぎ',
    icon: 'Waves',
    fileName: 'stream.ogg',
    defaultVolume: 45,
    color: '#10B981', // emerald-500
  },
  {
    id: 'birds',
    name: '鳥',
    category: 'nature',
    description: '鳥のさえずり',
    icon: 'Bird',
    fileName: 'birds.ogg',
    defaultVolume: 30,
    color: '#F59E0B', // amber-500
  },
  {
    id: 'thunder',
    name: '雷雨',
    category: 'nature',
    description: '雷雨と嵐',
    icon: 'Zap',
    fileName: 'thunder.ogg',
    defaultVolume: 35,
    color: '#8B5CF6', // violet-500
  },
  {
    id: 'wind',
    name: '風',
    category: 'nature',
    description: 'そよ風の音',
    icon: 'Wind',
    fileName: 'wind.ogg',
    defaultVolume: 40,
    color: '#6EE7B7', // emerald-300
  },
  {
    id: 'summer-night',
    name: '夏の夜',
    category: 'nature',
    description: '虫の音が響く夏の夜',
    icon: 'Moon',
    fileName: 'summer-night.ogg',
    defaultVolume: 35,
    color: '#4B5563', // gray-600
  },

  // Indoor sounds
  {
    id: 'fireplace',
    name: '暖炉',
    category: 'indoor',
    description: '暖炉の炎の音',
    icon: 'Flame',
    fileName: 'fireplace.ogg',
    defaultVolume: 45,
    color: '#F97316', // orange-500
  },

  // Urban sounds
  {
    id: 'cafe',
    name: 'カフェ',
    category: 'urban',
    description: 'カフェの環境音',
    icon: 'Coffee',
    fileName: 'cafe.ogg',
    defaultVolume: 40,
    color: '#78350F', // amber-900
  },
  {
    id: 'city',
    name: '都市',
    category: 'urban',
    description: '都市の環境音',
    icon: 'Building',
    fileName: 'city.ogg',
    defaultVolume: 35,
    color: '#64748B', // slate-500
  },
  {
    id: 'train',
    name: '電車',
    category: 'urban',
    description: '電車の走行音',
    icon: 'Train',
    fileName: 'train.ogg',
    defaultVolume: 45,
    color: '#DC2626', // red-600
  },
  {
    id: 'boat',
    name: 'ボート',
    category: 'urban',
    description: 'ボートのエンジン音',
    icon: 'Anchor',
    fileName: 'boat.ogg',
    defaultVolume: 40,
    color: '#1E40AF', // blue-800
  },

  // White noise
  {
    id: 'white-noise',
    name: 'ホワイトノイズ',
    category: 'white-noise',
    description: '集中力を高めるホワイトノイズ',
    icon: 'Radio',
    fileName: 'white-noise.ogg',
    defaultVolume: 30,
    color: '#E5E7EB', // gray-200
  },
  {
    id: 'pink-noise',
    name: 'ピンクノイズ',
    category: 'white-noise',
    description: '心地よいピンクノイズ',
    icon: 'Volume2',
    fileName: 'pink-noise.ogg',
    defaultVolume: 30,
    color: '#FFC0CB', // pink
  },
  {
    id: 'brown-noise',
    name: 'ブラウンノイズ',
    category: 'white-noise',
    description: '深いリラックスのためのブラウンノイズ',
    icon: 'Headphones',
    fileName: 'brown-noise.ogg',
    defaultVolume: 30,
    color: '#92400E', // amber-800
  },
]

/**
 * 音源IDから音源情報を取得
 */
export const getSoundById = (id: string): SoundSource | undefined => {
  return SOUND_SOURCES.find((sound) => sound.id === id)
}

/**
 * カテゴリー別に音源を取得
 */
export const getSoundsByCategory = (category: SoundCategory): SoundSource[] => {
  return SOUND_SOURCES.filter((sound) => sound.category === category)
}
