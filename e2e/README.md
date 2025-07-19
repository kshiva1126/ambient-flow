# E2Eテスト

このディレクトリには、AmbientFlow PWAアプリケーションのEnd-to-End (E2E) テストが含まれています。

## 概要

PlaywrightとViteを使用してProgressive Web Application (PWA)としてのE2Eテストを実装しています。
PWA機能（Service Worker、オフライン動作、インストール機能）を含む包括的なテストを実施します。

## テストファイル

### app.spec.ts

基本的なアプリケーションの動作をテスト

- アプリタイトルの表示
- 音源カードの表示（15個）
- 初期状態の確認
- ボリュームコントロールの表示

### audio-playback.spec.ts

音源再生機能のテスト

- 音源のクリックによる再生/停止
- 複数音源の同時再生（15音源まで）
- 再生状態の視覚的フィードバック
- 再生カウントの更新
- オフライン状態での音声再生

### volume-control.spec.ts

ボリューム調整機能のテスト

- スライダーによる音量調整
- 音量表示の更新
- 各音源の独立した音量管理
- エッジケースのテスト

### performance.spec.ts

パフォーマンステスト

- Core Web Vitalsテスト（LCP, FID, CLS）
- 複数音源の同時再生
- 頻繁な操作への応答性
- ストレステスト（全15音源の同時再生）
- メモリリーク検出
- Service Workerキャッシュパフォーマンス

## 実行方法

```bash
# すべてのE2Eテストを実行
pnpm test:e2e

# UIモードで実行（デバッグ用）
pnpm test:e2e:ui

# デバッグモードで実行
pnpm test:e2e:debug

# 特定のテストファイルのみ実行
pnpm test:e2e e2e/app.spec.ts

# ヘッドレスモードで実行
pnpm test:e2e --headed
```

## PWA機能テスト

### 追加テストファイル

- **pwa-install.spec.ts**: PWAインストール機能のテスト
- **offline-functionality.spec.ts**: オフライン動作のテスト
- **service-worker.spec.ts**: Service Worker機能のテスト
- **responsive-design.spec.ts**: レスポンシブデザインのテスト

## テスト用データ属性

E2Eテストでは、要素の特定にdata-testid属性を使用しています：

- `playing-counter`: 再生中の音源数表示
- `sound-{soundId}`: 各音源のカード
- `volume-slider`: 各音源のボリュームスライダー
- `volume-display`: 各音源のボリューム表示
- `install-prompt`: PWAインストールプロンプト
- `offline-indicator`: オフライン状態表示
- `preset-1`, `preset-2`, `preset-3`: プリセットボタン

## 制限事項

### 現在の実装

- Progressive Web Application (PWA)としての包括的テスト
- Service Worker、キャッシュ、オフライン機能のテスト
- クロスブラウザテスト（Chrome, Firefox, Safari, Edge）
- レスポンシブデザインテスト（モバイル・デスクトップ）

### 将来の拡張予定

- 実際の音声再生テスト（Web Audio APIモニタリング）
- モバイルデバイスでの実機テスト
- パフォーマンスベンチマークの自動化
- 長時間動作テスト（24時間連続再生）

## CI/CD統合

GitHub Actionsでの実行例：

```yaml
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
        run: pnpm playwright install --with-deps
      - name: Build PWA
        run: pnpm build
      - name: Run E2E tests
        run: pnpm test:e2e --project=${{ matrix.browser }}
```

## トラブルシューティング

### よくある問題

1. **Viteサーバー起動エラー**

   - `pnpm dev` でサーバーが正常に起動することを確認
   - ポート5173が他のプロセスで使用されていないか確認
   - Service Workerの登録を待つための十分なタイムアウト設定

2. **ブラウザインストールエラー**

   - `pnpm playwright install` を実行
   - システムの依存関係を確認（特にLinux）

3. **テストタイムアウト**

   - ヘッドレスモードで実行（`--headed` フラグを削除）
   - ワーカー数を減らす（`--workers=1`）

4. **要素が見つからない**
   - data-testid属性が正しく設定されているか確認
   - ページが完全に読み込まれているか確認
