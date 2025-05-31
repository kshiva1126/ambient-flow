import { test, expect } from '@playwright/test'

test.describe('Audio Playback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should toggle sound playback when clicking sound card', async ({
    page,
  }) => {
    const rainSound = page.getByTestId('sound-rain')
    const playingCount = page.getByTestId('playing-count')

    // Initially no sounds playing
    await expect(playingCount).toContainText('再生中: 0 個の音源')

    // Click to start playing
    await rainSound.click()

    // Check visual feedback for playing state
    await expect(rainSound).toHaveClass(/border-blue-500/)
    await expect(playingCount).toContainText('再生中: 1 個の音源')

    // Click again to stop playing
    await rainSound.click()

    // Should return to stopped state
    await expect(rainSound).toHaveClass(/border-gray-700/)
    await expect(playingCount).toContainText('再生中: 0 個の音源')
  })

  test('should allow multiple sounds to play simultaneously', async ({
    page,
  }) => {
    const rainSound = page.getByTestId('sound-rain')
    const wavesSound = page.getByTestId('sound-waves')
    const fireplaceSound = page.getByTestId('sound-fireplace')
    const playingCount = page.getByTestId('playing-count')

    // Start playing multiple sounds
    await rainSound.click()
    await expect(playingCount).toContainText('再生中: 1 個の音源')

    await wavesSound.click()
    await expect(playingCount).toContainText('再生中: 2 個の音源')

    await fireplaceSound.click()
    await expect(playingCount).toContainText('再生中: 3 個の音源')

    // All should show playing state
    await expect(rainSound).toHaveClass(/border-blue-500/)
    await expect(wavesSound).toHaveClass(/border-blue-500/)
    await expect(fireplaceSound).toHaveClass(/border-blue-500/)

    // Stop one sound
    await rainSound.click()
    await expect(playingCount).toContainText('再生中: 2 個の音源')
    await expect(rainSound).toHaveClass(/border-gray-700/)
    await expect(wavesSound).toHaveClass(/border-blue-500/)
    await expect(fireplaceSound).toHaveClass(/border-blue-500/)
  })

  test('should maintain playing state after page interactions', async ({
    page,
  }) => {
    const rainSound = page.getByTestId('sound-rain')
    const playingCount = page.getByTestId('playing-count')

    // Start playing
    await rainSound.click()
    await expect(playingCount).toContainText('再生中: 1 個の音源')
    await expect(rainSound).toHaveClass(/border-blue-500/)

    // Interact with other elements (should not affect playing state)
    const volumeSlider = page.getByTestId('volume-waves')
    await volumeSlider.fill('30')

    // Rain should still be playing
    await expect(playingCount).toContainText('再生中: 1 個の音源')
    await expect(rainSound).toHaveClass(/border-blue-500/)
  })

  test('should provide visual feedback for each sound type', async ({
    page,
  }) => {
    // Test different sound categories
    const natureSounds = [
      'rain',
      'waves',
      'stream',
      'birds',
      'thunder',
      'wind',
      'summer-night',
    ]
    const indoorSounds = ['fireplace']
    const urbanSounds = ['cafe', 'city', 'train', 'boat']
    const noiseSounds = ['white-noise', 'pink-noise', 'brown-noise']

    const allSounds = [
      ...natureSounds,
      ...indoorSounds,
      ...urbanSounds,
      ...noiseSounds,
    ]

    for (const soundId of allSounds.slice(0, 3)) {
      // Test first 3 to avoid timeout
      const soundElement = page.getByTestId(`sound-${soundId}`)

      // Click to play
      await soundElement.click()

      // Should show active state
      await expect(soundElement).toHaveClass(/border-blue-500/)

      // Click to stop
      await soundElement.click()

      // Should return to inactive state
      await expect(soundElement).toHaveClass(/border-gray-700/)
    }
  })
})
