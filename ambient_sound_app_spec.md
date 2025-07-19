# AmbientFlow - 技術仕様書

## プロジェクト概要

**AmbientFlow**は、複数の環境音を同時再生し、各音源の音量を個別に調整できるProgressive Web Application (PWA)。操作性と安定性を最重視した設計とし、オフライン機能とインストール可能な設計を提供する。

## 技術選定

### フレームワーク・言語

- **メインフレームワーク**: Progressive Web Application (PWA)
- **フロントエンド**: React 19 + TypeScript 5.8
- **デプロイメント**: Cloudflare Workers
- **ビルドツール**: Vite + VitePWA

### UI・スタイリング

- **CSSフレームワーク**: TailwindCSS 4.x
- **アニメーション**: Motion (旧Framer Motion) 12.x
- **アイコン**: Lucide React
- **カラーパレット**: ダークテーマベース

### 音声処理

- **音声ライブラリ**: Howler.js 2.x
  - 安定性とクロスプラットフォーム対応
  - 豊富なエラーハンドリング
  - 複数音源同時再生対応
- **音声フォーマット**: MP3, OGG, WAV

### 状態管理・データ

- **状態管理**: Zustand 5.x
- **データ永続化**: LocalStorage + IndexedDB
- **PWA機能**: Service Worker + Workbox
- **設定ファイル**: JSON形式

## 機能要件

### コア機能

#### 音声再生機能

- 複数音源の同時再生（最大15音源）
- 各音源の独立した音量調整（0-100%）
- ワンクリックでの再生/停止切り替え
- ループ再生（デフォルト有効）
- フェードイン/アウト（250ms）
- オフライン再生対応

#### プリセット音源

**自然音**

- Rain（雨音）
- Storm（嵐）
- Wind（風音）
- Waves（波音）
- Stream（小川）
- Birds（鳥のさえずり）

**人工音**

- Train（電車音）
- Boat（船音）
- City（都市音）
- Coffee Shop（カフェ音）
- Fireplace（暖炉音）

**ノイズ**

- Pink Noise（ピンクノイズ）
- White Noise（ホワイトノイズ）
- Brown Noise（ブラウンノイズ）
- Summer Night（夏の夜音）

#### プリセット機能

- 音源組み合わせと音量設定の保存（3つのプリセットスロット）
- プリセットの読み込み
- プリセットの編集・削除
- 起動時の前回設定復元

#### PWA機能

- デスクトップ・モバイルデバイスへのインストール
- オフライン機能（Service Worker）
- バックグラウンド同期
- アプリ更新通知
- プッシュ通知（将来的な拡張）

### UI/UX要件

#### 操作性重視設計

**ワンタップ操作**

- 音源アイコンクリック → 即座に再生開始
- 再度クリック → 停止（トグル動作）
- スライダードラッグ → リアルタイム音量調整

**視覚的フィードバック**

- 再生中音源: アイコンのブルーグロー効果
- 停止中音源: グレーアウト表示
- 音量スライダー: リアルタイム値表示
- ホバー効果: 250ms のスムーズトランジション

**誤操作防止**

- 最小タッチエリア: 44px x 44px
- 明確な操作境界
- 操作状態の即座表示（100ms以内）

#### レスポンシブデザイン

- 全画面サイズ対応（モバイル・タブレット・デスクトップ）
- ビューポート適応型レイアウト
- 高DPI対応
- タッチ操作対応

### システム要件

#### パフォーマンス

- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **メモリ使用量**: < 150MB (ブラウザ環境)
- **起動時間**: < 2秒
- **操作レスポンス**: < 100ms
- **フレームレート**: 60fps維持
- **オフライン対応**: キャッシュヒット率 > 95%

#### 安定性対策

**エラーハンドリング**

- 音声ファイル読み込み失敗時の代替処理
- ネットワークエラーの適切な表示
- 予期しないエラーからの復旧機能
- オフライン状態の検知と表示

**メモリ管理**

- 使用していない音源の自動アンロード
- ガベージコレクション最適化
- メモリリーク防止機構
- Service Workerキャッシュ管理

**音声処理安定性**

- バッファアンダーラン防止
- 音声同期保証
- オーディオコンテキスト管理
- Cross-Origin制約の回避

## アーキテクチャ設計

### ディレクトリ構成

```
src/
├── components/           # React コンポーネント
│   ├── SoundCard.tsx           # 音源コントロール
│   ├── VolumeSlider.tsx        # 音量スライダー
│   ├── PlayingCounter.tsx      # 再生中音源カウンター
│   ├── SoundIcon.tsx           # 音源アイコン
│   ├── InstallPrompt.tsx       # PWAインストールプロンプト
│   ├── UpdateNotification.tsx  # アプリ更新通知
│   ├── OfflineIndicator.tsx    # オフライン状態表示
│   └── LoadingStates.tsx       # ローディング状態
├── hooks/               # カスタムフック
│   ├── useAudioManager.ts      # 音声管理フック
│   └── useAppUpdate.ts         # PWA更新フック
├── stores/              # Zustand ストア
│   └── audioStore.ts           # 音声状態管理
├── services/            # サービス層
│   ├── AudioManager.ts         # 音声管理サービス
│   ├── PresetStorage.ts        # プリセット永続化
│   ├── AudioCacheManager.ts    # 音声キャッシュ管理
│   └── BackgroundSync.ts       # バックグラウンド同期
├── utils/               # ユーティリティ
│   ├── performance.ts          # パフォーマンス最適化
│   ├── pwaHelpers.ts          # PWAヘルパー
│   ├── pwaMetrics.ts          # パフォーマンス計測
│   └── serviceWorker.ts        # Service Worker管理
├── types/               # TypeScript 型定義
├── data/                # 静的データ
│   └── sounds.ts              # 音源定義
└── assets/              # 音源ファイル・画像

worker/                  # Cloudflare Workers
├── index.ts            # メインワーカースクリプト
└── assets-uploader.ts  # アセットアップロード

public/
├── assets/sounds/      # 音源ファイル
├── pwa-*.png          # PWAアイコン
└── manifest.json      # PWAマニフェスト
```

### 状態管理設計

```typescript
interface AppState {
  // 音源状態
  audioSources: AudioSource[]
  isPlaying: Record<string, boolean>
  volumes: Record<string, number>

  // プリセット
  presets: Preset[]
  currentPreset: string | null

  // UI状態
  isLoading: boolean
  error: string | null
}
```

### 音声管理アーキテクチャ

- **AudioManager**: 全体音声制御 (Howler.js統合)
- **AudioCacheManager**: 音声ファイルキャッシング
- **BackgroundSync**: バックグラウンド同期
- **PresetStorage**: プリセット永続化

## 開発・テスト戦略

### 開発フェーズ

1. **Phase 1**: 基本音声再生機能
2. **Phase 2**: UI実装・音量制御
3. **Phase 3**: プリセット機能
4. **Phase 4**: PWA機能実装 (Service Worker, マニフェスト)
5. **Phase 5**: 最適化・安定性向上

### テスト戦略

**ユニットテスト**

- 音声制御ロジック
- 状態管理機能
- ユーティリティ関数

**統合テスト**

- 音声再生・停止
- 複数音源同時再生
- プリセット保存・復元
- PWA機能（インストール、オフライン動作）

**パフォーマンステスト**

- Core Web Vitals測定
- 長時間稼働テスト（24時間）
- メモリリークテスト
- ブラウザ互換性テスト

### 品質保証

- TypeScript型安全性
- ESLint + Prettier
- Husky pre-commit hooks
- 自動ビルドテスト

## デプロイメント

### ビルド設定

- **ターゲット**: Cloudflare Workers + KV Storage
- **配信**: CDN経由での高速配信
- **PWAマニフェスト**: デスクトップ・モバイルインストール対応
- **Service Worker**: Workboxによる自動キャッシュ管理
- **自動更新**: PWA標準更新メカニズム

### リリース戦略

- **バージョニング**: Semantic Versioning
- **リリースサイクル**: 月次
- **ホットフィックス**: 緊急時のみ
- **環境**: プレビュー環境での事前テスト

## パフォーマンス目標

### 応答性

- UI操作レスポンス: < 100ms
- 音声開始遅延: < 200ms
- プリセット切り替え: < 500ms

### リソース効率

- メモリ使用量: < 150MB (ブラウザ環境)
- ネットワーク使用量: 初回ロード後は最小限
- バッテリー消費: 最小限
- キャッシュ効率: オフライン動作対応

### 安定性

- 連続稼働時間: 24時間以上
- クラッシュ率: < 0.1%
- エラー復旧: 自動
