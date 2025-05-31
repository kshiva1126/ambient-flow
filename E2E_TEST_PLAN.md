# E2Eテスト計画

## テストツールの選択肢

### 1. Playwright + Tauri Driver (推奨)

- Tauriアプリ専用のWebDriverプロトコル実装
- クロスプラットフォーム対応
- ヘッドレステスト可能

### 2. WebdriverIO + Tauri Plugin

- Tauri v2対応
- 豊富なアサーション機能
- CI/CD統合が容易

## テストシナリオ

### 基本機能テスト

1. **アプリケーション起動**

   - ウィンドウサイズ（1200x800）の確認
   - 初期表示の確認

2. **音源再生テスト**

   - 各音源のクリックで再生開始
   - 再生中の視覚的フィードバック確認
   - 複数音源の同時再生

3. **ボリューム調整テスト**

   - スライダー操作
   - 音量値の表示更新
   - 実際の音量変化（可能であれば）

4. **プリセット機能テスト**（実装後）
   - プリセット保存
   - プリセット読み込み
   - プリセット削除

### パフォーマンステスト

1. **長時間動作テスト**

   - 24時間連続再生
   - メモリリーク確認
   - CPU使用率監視

2. **負荷テスト**
   - 全音源同時再生
   - 頻繁な操作

### クロスプラットフォームテスト

- Windows 10/11
- macOS 12+
- Ubuntu 22.04+

## 実装例（Playwright）

```typescript
import { test, expect } from '@playwright/test'
import { spawn } from 'child_process'

test.describe('AmbientFlow E2E Tests', () => {
  let app

  test.beforeAll(async () => {
    // Tauriアプリを起動
    app = spawn('pnpm', ['tauri', 'dev'])
    await new Promise((resolve) => setTimeout(resolve, 5000))
  })

  test.afterAll(async () => {
    app.kill()
  })

  test('should start with correct window size', async ({ page }) => {
    await page.goto('http://localhost:1420')
    const viewport = await page.viewportSize()
    expect(viewport.width).toBe(1200)
    expect(viewport.height).toBe(800)
  })

  test('should play sound when clicked', async ({ page }) => {
    await page.goto('http://localhost:1420')

    // 雨音をクリック
    const rainSound = await page.locator('[data-testid="sound-rain"]')
    await rainSound.click()

    // 再生中の視覚的確認
    await expect(rainSound).toHaveClass(/border-blue-500/)

    // 再生中カウントの確認
    const playingCount = await page.locator('text=/再生中: \\d+ 個の音源/')
    await expect(playingCount).toContainText('再生中: 1 個の音源')
  })

  test('should adjust volume', async ({ page }) => {
    await page.goto('http://localhost:1420')

    const rainSound = await page.locator('[data-testid="sound-rain"]')
    const volumeSlider = await rainSound.locator('input[type="range"]')

    // ボリュームを75%に設定
    await volumeSlider.fill('75')

    // 表示の確認
    const volumeDisplay = await rainSound.locator('text=/\\d+%/')
    await expect(volumeDisplay).toContainText('75%')
  })
})
```

## CI/CD統合

```yaml
# .github/workflows/e2e-test.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright
        run: pnpm playwright install

      - name: Run E2E tests
        run: pnpm test:e2e
```

## 段階的導入計画

1. **Phase 1**: 基本的なUI操作テスト
2. **Phase 2**: 音声再生の確認（モック使用）
3. **Phase 3**: プリセット機能のテスト
4. **Phase 4**: パフォーマンステスト
5. **Phase 5**: CI/CD統合
