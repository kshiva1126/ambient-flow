import { test, expect } from '@playwright/test'

test.describe('AmbientFlow App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display app title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('AmbientFlow')
  })

  test('should display initial playing count as 0', async ({ page }) => {
    const playingCount = page.getByTestId('playing-count')
    await expect(playingCount).toContainText('再生中: 0 個の音源')
  })

  test('should display all sound sources', async ({ page }) => {
    // Check if all 15 sound sources are displayed
    const soundCards = page.locator('[data-testid^="sound-"]')
    await expect(soundCards).toHaveCount(15)

    // Check specific sound sources
    await expect(page.getByTestId('sound-rain')).toBeVisible()
    await expect(page.getByTestId('sound-waves')).toBeVisible()
    await expect(page.getByTestId('sound-fireplace')).toBeVisible()
  })

  test('should display volume controls for each sound', async ({ page }) => {
    const volumeSliders = page.locator('[data-testid^="volume-"]')
    await expect(volumeSliders).toHaveCount(15)

    // Check initial volume display
    const rainVolumeDisplay = page.getByTestId('volume-display-rain')
    await expect(rainVolumeDisplay).toContainText('50%') // defaultVolume for rain
  })
})
