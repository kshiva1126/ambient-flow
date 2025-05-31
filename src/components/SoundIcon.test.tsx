import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { SoundIcon } from './SoundIcon'

describe('SoundIcon', () => {
  describe('rendering', () => {
    it('should render the correct icon', () => {
      const { container } = render(<SoundIcon iconName="CloudRain" />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('lucide-cloud-rain')
    })

    it('should render with custom className', () => {
      const { container } = render(
        <SoundIcon iconName="CloudRain" className="custom-class" />
      )

      const icon = container.querySelector('svg')
      expect(icon).toHaveClass('custom-class')
      expect(icon).toHaveClass('lucide-cloud-rain')
    })

    it('should render with custom style', () => {
      const customStyle = { color: 'red', fontSize: '24px' }
      const { container } = render(
        <SoundIcon iconName="CloudRain" style={customStyle} />
      )

      const icon = container.querySelector('svg')
      expect(icon).toHaveStyle('color: rgb(255, 0, 0)')
      expect(icon).toHaveStyle('font-size: 24px')
    })
  })

  describe('icon mapping', () => {
    const iconNames = [
      'Bird',
      'CloudRain',
      'Waves',
      'Trees',
      'Zap',
      'Wind',
      'Flame',
      'Clock',
      'Keyboard',
      'Coffee',
      'Building',
      'Train',
      'Radio',
      'Volume2',
      'Moon',
      'Anchor',
      'Headphones',
    ]

    it.each(iconNames)('should render %s icon', (iconName) => {
      const { container } = render(<SoundIcon iconName={iconName} />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
      // Just check that SVG is rendered, lucide-react handles the class names
      expect(icon?.tagName).toBe('svg')
    })
  })

  describe('error handling', () => {
    it('should warn and return null for unknown icon', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { container } = render(<SoundIcon iconName="UnknownIcon" />)

      expect(consoleWarn).toHaveBeenCalledWith('Icon "UnknownIcon" not found')
      expect(container.firstChild).toBeNull()

      consoleWarn.mockRestore()
    })
  })

  describe('props combination', () => {
    it('should handle both className and style props', () => {
      const { container } = render(
        <SoundIcon
          iconName="CloudRain"
          className="test-class another-class"
          style={{ color: '#3B82F6', width: '32px' }}
        />
      )

      const icon = container.querySelector('svg')
      expect(icon).toHaveClass('test-class', 'another-class')
      expect(icon).toHaveStyle({
        color: '#3B82F6',
        width: '32px',
      })
    })
  })
})
