import { test, expect } from '@playwright/test'

test.describe('Volume Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should adjust volume using slider', async ({ page }) => {
    const volumeSlider = page.getByTestId('volume-rain')
    const volumeDisplay = page.getByTestId('volume-display-rain')

    // Check initial volume (default 50%)
    await expect(volumeDisplay).toContainText('50%')
    await expect(volumeSlider).toHaveValue('50')

    // Adjust volume to 75%
    await volumeSlider.fill('75')
    await expect(volumeDisplay).toContainText('75%')
    await expect(volumeSlider).toHaveValue('75')

    // Adjust volume to 25%
    await volumeSlider.fill('25')
    await expect(volumeDisplay).toContainText('25%')
    await expect(volumeSlider).toHaveValue('25')

    // Set to maximum volume
    await volumeSlider.fill('100')
    await expect(volumeDisplay).toContainText('100%')
    await expect(volumeSlider).toHaveValue('100')

    // Set to minimum volume
    await volumeSlider.fill('0')
    await expect(volumeDisplay).toContainText('0%')
    await expect(volumeSlider).toHaveValue('0')
  })

  test('should not affect sound playback when adjusting volume', async ({
    page,
  }) => {
    const rainSound = page.getByTestId('sound-rain')
    const volumeSlider = page.getByTestId('volume-rain')
    const playingCount = page.getByTestId('playing-count')

    // Start playing sound
    await rainSound.click()
    await expect(playingCount).toContainText('再生中: 1 個の音源')
    await expect(rainSound).toHaveClass(/border-blue-500/)

    // Adjust volume while playing
    await volumeSlider.fill('80')

    // Should still be playing
    await expect(playingCount).toContainText('再生中: 1 個の音源')
    await expect(rainSound).toHaveClass(/border-blue-500/)
  })

  test('should maintain independent volume for each sound', async ({
    page,
  }) => {
    const rainVolumeSlider = page.getByTestId('volume-rain')
    const wavesVolumeSlider = page.getByTestId('volume-waves')
    const fireplaceVolumeSlider = page.getByTestId('volume-fireplace')

    const rainVolumeDisplay = page.getByTestId('volume-display-rain')
    const wavesVolumeDisplay = page.getByTestId('volume-display-waves')
    const fireplaceVolumeDisplay = page.getByTestId('volume-display-fireplace')

    // Set different volumes for each sound
    await rainVolumeSlider.fill('30')
    await wavesVolumeSlider.fill('60')
    await fireplaceVolumeSlider.fill('90')

    // Verify each sound maintains its own volume
    await expect(rainVolumeDisplay).toContainText('30%')
    await expect(wavesVolumeDisplay).toContainText('60%')
    await expect(fireplaceVolumeDisplay).toContainText('90%')

    // Change one volume and verify others are unchanged
    await rainVolumeSlider.fill('70')
    await expect(rainVolumeDisplay).toContainText('70%')
    await expect(wavesVolumeDisplay).toContainText('60%') // unchanged
    await expect(fireplaceVolumeDisplay).toContainText('90%') // unchanged
  })

  test('should handle edge cases for volume control', async ({ page }) => {
    const volumeSlider = page.getByTestId('volume-rain')
    const volumeDisplay = page.getByTestId('volume-display-rain')

    // Test boundary values
    await volumeSlider.fill('0')
    await expect(volumeDisplay).toContainText('0%')

    await volumeSlider.fill('100')
    await expect(volumeDisplay).toContainText('100%')

    // Test mid-range values
    await volumeSlider.fill('1')
    await expect(volumeDisplay).toContainText('1%')

    await volumeSlider.fill('99')
    await expect(volumeDisplay).toContainText('99%')
  })

  test('should prevent volume slider from affecting sound toggle', async ({
    page,
  }) => {
    const rainSound = page.getByTestId('sound-rain')
    const volumeSlider = page.getByTestId('volume-rain')
    const playingCount = page.getByTestId('playing-count')

    // Click on volume slider should not toggle sound
    await volumeSlider.click()
    await expect(playingCount).toContainText('再生中: 0 個の音源')
    await expect(rainSound).toHaveClass(/border-gray-700/)

    // But clicking on the sound card should toggle
    await rainSound.click()
    await expect(playingCount).toContainText('再生中: 1 個の音源')
    await expect(rainSound).toHaveClass(/border-blue-500/)
  })

  test('should show different default volumes for different sounds', async ({
    page,
  }) => {
    // Test a few sounds with different default volumes
    const rainVolumeDisplay = page.getByTestId('volume-display-rain') // 50%
    const birdsVolumeDisplay = page.getByTestId('volume-display-birds') // 30%
    await expect(rainVolumeDisplay).toContainText('50%')
    await expect(birdsVolumeDisplay).toContainText('30%')

    const whitenoisVolumeDisplay = page.getByTestId(
      'volume-display-white-noise'
    ) // 30%
    await expect(whitenoisVolumeDisplay).toContainText('30%')
  })
})
