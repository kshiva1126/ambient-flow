# E2Eテスト

このディレクトリには、AmbientFlowアプリケーションのEnd-to-End (E2E) テストが含まれています。

## 概要

PlaywrightとViteを使用してWebアプリケーションとしてのE2Eテストを実装しています。
実際のTauriアプリケーションのテストも可能ですが、開発中は軽量なWebテストで基本的な動作を確認します。

## テストファイル

### app.spec.ts

基本的なアプリケーションの動作をテスト

- アプリタイトルの表示
- 音源カードの表示（15個）
- 初期状態の確認
- ボリュームコントロールの表示

### audio-playbook.spec.ts

音源再生機能のテスト

- 音源のクリックによる再生/停止
- 複数音源の同時再生
- 再生状態の視覚的フィードバック
- 再生カウントの更新

### volume-control.spec.ts

ボリューム調整機能のテスト

- スライダーによる音量調整
- 音量表示の更新
- 各音源の独立した音量管理
- エッジケースのテスト

### performance.spec.ts

パフォーマンステスト

- 複数音源の同時再生
- 頻繁な操作への応答性
- ストレステスト（全15音源の同時再生）
- メモリリーク検出

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

## テスト用データ属性

E2Eテストでは、要素の特定にdata-testid属性を使用しています：

- `playing-count`: 再生中の音源数表示
- `sound-{soundId}`: 各音源のカード
- `volume-{soundId}`: 各音源のボリュームスライダー
- `volume-display-{soundId}`: 各音源のボリューム表示

## 制限事項

### 現在の実装

- WebアプリケーションとしてのテストのみHy
- 実際の音声再生はモック（AudioManagerでモック済み）
- ブラウザ環境での動作確認

### 将来の拡張予定

- Tauri WebDriver を使用した実際のデスクトップアプリテスト
- 実際の音声再生テスト（オーディオデバイス必要）
- クロスプラットフォームテスト（Windows/Mac/Linux）
- 長時間動作テスト（24時間連続再生）

## CI/CD統合

GitHub Actionsでの実行例：

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: pnpm install
      - name: Install Playwright
        run: pnpm playwright install --with-deps
      - name: Run E2E tests
        run: pnpm test:e2e
```

## トラブルシューティング

### よくある問題

1. **Viteサーバー起動エラー**

   - `pnpm dev` でサーバーが正常に起動することを確認
   - ポート5173が他のプロセスで使用されていないか確認

2. **ブラウザインストールエラー**

   - `pnpm playwright install` を実行
   - システムの依存関係を確認（特にLinux）

3. **テストタイムアウト**

   - ヘッドレスモードで実行（`--headed` フラグを削除）
   - ワーカー数を減らす（`--workers=1`）

4. **要素が見つからない**
   - data-testid属性が正しく設定されているか確認
   - ページが完全に読み込まれているか確認
