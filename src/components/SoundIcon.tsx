import {
  Bird,
  CloudRain,
  Waves,
  Trees,
  Zap,
  Wind,
  Flame,
  Clock,
  Keyboard,
  Coffee,
  Building,
  Train,
  Radio,
  Volume2,
  Moon,
  Anchor,
  Headphones,
  LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Bird,
  CloudRain,
  Waves,
  Trees,
  Zap,
  Wind,
  Flame,
  Clock,
  Keyboard,
  Coffee,
  Building,
  Train,
  Radio,
  Volume2,
  Moon,
  Anchor,
  Headphones,
}

interface SoundIconProps {
  iconName: string
  className?: string
  style?: React.CSSProperties
}

export const SoundIcon = ({ iconName, className, style }: SoundIconProps) => {
  const Icon = iconMap[iconName]

  if (!Icon) {
    console.warn(`Icon "${iconName}" not found`)
    return null
  }

  return <Icon className={className} style={style} />
}
