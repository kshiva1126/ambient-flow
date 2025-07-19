# E2Eテスト計画

## テストツールの選択肢

### 1. Playwright (推奨)

- PWAアプリケーション対応
- クロスブラウザ対応（Chrome, Firefox, Safari, Edge）
- ヘッドレステスト可能
- PWA機能（インストール、オフライン動作）テスト対応

### 2. WebdriverIO

- PWA対応
- 豊富なアサーション機能
- CI/CD統合が容易

## テストシナリオ

### 基本機能テスト

1. **PWAアプリケーション起動**

   - ブラウザでの正常表示確認
   - レスポンシブデザインの確認
   - 初期表示の確認
   - PWAインストールプロンプトの表示確認

2. **音源再生テスト**

   - 各音源のクリックで再生開始
   - 再生中の視覚的フィードバック確認
   - 複数音源の同時再生

3. **ボリューム調整テスト**

   - スライダー操作
   - 音量値の表示更新
   - 実際の音量変化（可能であれば）

4. **プリセット機能テスト**

   - プリセット保存（3つのスロット）
   - プリセット読み込み
   - プリセット削除
   - LocalStorageへの永続化確認

5. **PWA機能テスト**
   - Service Workerの登録確認
   - オフライン動作確認
   - インストールプロンプト表示
   - キャッシュ機能の確認
   - アプリ更新通知の表示

### パフォーマンステスト

1. **Core Web Vitalsテスト**

   - LCP (Largest Contentful Paint) < 2.5s
   - FID (First Input Delay) < 100ms
   - CLS (Cumulative Layout Shift) < 0.1

2. **長時間動作テスト**

   - 24時間連続再生
   - メモリリーク確認
   - ブラウザメモリ使用率監視

3. **負荷テスト**
   - 全音源同時再生（15音源）
   - 頻繁な操作
   - ネットワーク制限下での動作

### クロスブラウザテスト

- Chrome 120+
- Firefox 119+
- Safari 17+
- Edge 120+

### クロスプラットフォームテスト

- Windows 10/11 (Chrome, Edge)
- macOS 12+ (Chrome, Safari)
- Ubuntu 22.04+ (Chrome, Firefox)
- モバイルブラウザ (iOS Safari, Android Chrome)

## 実装例（Playwright）

```typescript
import { test, expect } from '@playwright/test'

test.describe('AmbientFlow PWA E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // PWAアプリにアクセス
    await page.goto('http://localhost:5173') // Vite dev server
    // Service Workerの登録を待つ
    await page.waitForFunction(() => 'serviceWorker' in navigator)
  })

  test('should display responsive design correctly', async ({ page }) => {
    // デスクトップサイズ
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible()

    // モバイルサイズ
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible()
  })

  test('should show PWA install prompt', async ({ page }) => {
    // PWAインストールプロンプトの確認
    await expect(page.locator('[data-testid="install-prompt"]')).toBeVisible()
  })

  test('should play sound when clicked', async ({ page }) => {
    // 雨音をクリック
    const rainSound = await page.locator('[data-testid="sound-rain"]')
    await rainSound.click()

    // 再生中の視覚的確認
    await expect(rainSound).toHaveClass(/border-blue-500/)

    // 再生中カウントの確認
    const playingCount = await page.locator('[data-testid="playing-counter"]')
    await expect(playingCount).toContainText('1')
  })

  test('should work offline', async ({ page, context }) => {
    // Service Workerでキャッシュされるまで待つ
    await page.reload()

    // オフライン状態をシミュレート
    await context.setOffline(true)
    await page.reload()

    // アプリが正常に動作することを確認
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible()
    await expect(
      page.locator('[data-testid="offline-indicator"]')
    ).toBeVisible()
  })

  test('should adjust volume', async ({ page }) => {
    const rainSound = await page.locator('[data-testid="sound-rain"]')
    const volumeSlider = await rainSound.locator(
      '[data-testid="volume-slider"]'
    )

    // ボリュームを75%に設定
    await volumeSlider.fill('75')

    // 表示の確認
    const volumeDisplay = await rainSound.locator(
      '[data-testid="volume-display"]'
    )
    await expect(volumeDisplay).toContainText('75%')
  })

  test('should save and load presets', async ({ page }) => {
    // 複数音源を再生状態にする
    await page.locator('[data-testid="sound-rain"]').click()
    await page.locator('[data-testid="sound-waves"]').click()

    // プリセット1に保存
    const preset1Button = await page.locator('[data-testid="preset-1"]')
    await preset1Button.click({ button: 'right' }) // 右クリックで保存

    // 音源を停止
    await page.locator('[data-testid="sound-rain"]').click()
    await page.locator('[data-testid="sound-waves"]').click()

    // プリセット1を読み込み
    await preset1Button.click()

    // 音源が再生状態になることを確認
    await expect(page.locator('[data-testid="sound-rain"]')).toHaveClass(
      /border-blue-500/
    )
    await expect(page.locator('[data-testid="sound-waves"]')).toHaveClass(
      /border-blue-500/
    )
  })
})
```

## CI/CD統合

```yaml
# .github/workflows/e2e-test.yml
name: PWA E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        browser: [chromium, firefox, webkit]

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright
        run: pnpm playwright install

      - name: Build PWA
        run: pnpm build

      - name: Start preview server
        run: pnpm preview &

      - name: Run E2E tests
        run: pnpm test:e2e --project=${{ matrix.browser }}

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report-${{ matrix.os }}-${{ matrix.browser }}
          path: playwright-report/
```

## 段階的導入計画

1. **Phase 1**: 基本的なPWA UI操作テスト
2. **Phase 2**: 音声再生の確認
3. **Phase 3**: プリセット機能のテスト
4. **Phase 4**: PWA機能テスト（オフライン、インストール）
5. **Phase 5**: パフォーマンステスト（Core Web Vitals）
6. **Phase 6**: クロスブラウザテスト
7. **Phase 7**: CI/CD統合
