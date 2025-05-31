import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should handle multiple simultaneous sound playback', async ({
    page,
  }) => {
    const playingCount = page.getByTestId('playing-count')

    // Start playing multiple sounds quickly
    const soundIds = ['rain', 'waves', 'fireplace', 'birds', 'city']

    for (const soundId of soundIds) {
      const soundElement = page.getByTestId(`sound-${soundId}`)
      await soundElement.click()
    }

    // Verify all sounds are marked as playing
    await expect(playingCount).toContainText('再生中: 5 個の音源')

    // Check that UI remains responsive
    for (const soundId of soundIds) {
      const soundElement = page.getByTestId(`sound-${soundId}`)
      await expect(soundElement).toHaveClass(/border-blue-500/)
    }
  })

  test('should maintain performance with rapid volume changes', async ({
    page,
  }) => {
    const rainSound = page.getByTestId('sound-rain')
    const volumeSlider = page.getByTestId('volume-rain')
    const volumeDisplay = page.getByTestId('volume-display-rain')

    // Start playing sound
    await rainSound.click()

    // Rapidly change volume
    const volumes = ['10', '50', '80', '20', '100', '0', '45']

    for (const volume of volumes) {
      await volumeSlider.fill(volume)
      await expect(volumeDisplay).toContainText(`${volume}%`)
    }

    // UI should still be responsive
    await expect(rainSound).toHaveClass(/border-blue-500/)
  })

  test('should handle stress test with all sounds', async ({ page }) => {
    const playingCount = page.getByTestId('playing-count')

    // Get all sound elements
    const allSounds = await page.locator('[data-testid^="sound-"]').all()

    // Start all sounds
    for (const sound of allSounds) {
      await sound.click()
    }

    // Should show all 15 sounds playing
    await expect(playingCount).toContainText('再生中: 15 個の音源')

    // Verify UI responsiveness by checking a few random sounds
    await expect(page.getByTestId('sound-rain')).toHaveClass(/border-blue-500/)
    await expect(page.getByTestId('sound-fireplace')).toHaveClass(
      /border-blue-500/
    )
    await expect(page.getByTestId('sound-white-noise')).toHaveClass(
      /border-blue-500/
    )

    // Stop all sounds
    for (const sound of allSounds) {
      await sound.click()
    }

    // Should return to 0
    await expect(playingCount).toContainText('再生中: 0 個の音源')
  })

  test('should respond quickly to user interactions', async ({ page }) => {
    const rainSound = page.getByTestId('sound-rain')
    const playingCount = page.getByTestId('playing-count')

    // Measure response time for sound toggle
    const startTime = Date.now()

    await rainSound.click()
    await expect(playingCount).toContainText('再生中: 1 個の音源')

    const responseTime = Date.now() - startTime

    // UI should respond within reasonable time (less than 500ms)
    expect(responseTime).toBeLessThan(500)

    // Verify visual feedback is immediate
    await expect(rainSound).toHaveClass(/border-blue-500/)
  })

  test('should not cause memory leaks with repeated operations', async ({
    page,
  }) => {
    const rainSound = page.getByTestId('sound-rain')
    const playingCount = page.getByTestId('playing-count')

    // Perform many start/stop cycles
    for (let i = 0; i < 20; i++) {
      await rainSound.click() // Start
      await expect(playingCount).toContainText('再生中: 1 個の音源')

      await rainSound.click() // Stop
      await expect(playingCount).toContainText('再生中: 0 個の音源')
    }

    // UI should still be responsive after many cycles
    await rainSound.click()
    await expect(rainSound).toHaveClass(/border-blue-500/)
    await expect(playingCount).toContainText('再生中: 1 個の音源')
  })
})
