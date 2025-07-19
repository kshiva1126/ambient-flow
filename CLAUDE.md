# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AmbientFlow is a Progressive Web Application (PWA) for ambient sound mixing, deployed on Cloudflare Workers. The app allows users to play multiple ambient sounds simultaneously with individual volume controls and preset management. It features offline capabilities and can be installed as a PWA on desktop and mobile devices.

**Current Status**: Fully implemented PWA with 15 ambient sound sources, complete with testing suite and deployment automation.

## Technology Stack

- **Frontend**: React 19 + TypeScript 5.8 + Vite
- **Styling**: TailwindCSS 4.x + Motion (animations)
- **Audio**: Howler.js 2.x
- **State Management**: Zustand 5.x
- **Icons**: Lucide React
- **PWA**: VitePWA plugin + Workbox
- **Deployment**: Cloudflare Workers + KV storage
- **Performance**: Core Web Vitals monitoring

## Development Commands

```bash
# Development
pnpm dev                # Start Vite development server
pnpm build              # Build for production
pnpm preview            # Preview production build

# Code Quality
pnpm lint               # Run ESLint
pnpm lint:fix           # Auto-fix ESLint issues
pnpm format             # Format code with Prettier
pnpm format:check       # Check code formatting
pnpm typecheck          # Run TypeScript type checking

# Testing
pnpm test               # Run unit tests with Vitest
pnpm test:ui            # Run tests with UI
pnpm test:coverage      # Run tests with coverage report
pnpm test:e2e           # Run E2E tests with Playwright
pnpm test:e2e:ui        # Run E2E tests with UI
pnpm test:e2e:debug     # Debug E2E tests

# Cloudflare Workers
pnpm cf:login           # Login to Cloudflare
pnpm cf:dev             # Start local Workers development
pnpm deploy             # Deploy to production
pnpm deploy:preview     # Deploy to preview environment
pnpm deploy:assets      # Upload assets to KV storage
pnpm deploy:full        # Full deployment (build + assets + deploy)
```

## Architecture

### Directory Structure

```
src/
├── components/         # React components
│   ├── SoundCard.tsx          # Individual sound source controls
│   ├── VolumeSlider.tsx       # Volume slider component
│   ├── PlayingCounter.tsx     # Counter for active sounds
│   ├── SoundIcon.tsx          # Sound type icons
│   ├── InstallPrompt.tsx      # PWA install prompts
│   ├── UpdateNotification.tsx # App update notifications
│   ├── OfflineIndicator.tsx   # Offline status indicator
│   └── LoadingStates.tsx      # Loading state components
├── hooks/              # Custom React hooks
│   ├── useAudioManager.ts     # Audio playback management
│   └── useAppUpdate.ts        # PWA update handling
├── stores/             # Zustand state stores
│   └── audioStore.ts          # Audio state management
├── services/           # Service layer
│   ├── AudioManager.ts        # Core audio management
│   ├── PresetStorage.ts       # Preset persistence
│   ├── AudioCacheManager.ts   # Audio caching
│   └── BackgroundSync.ts      # Background synchronization
├── utils/              # Utility functions
│   ├── performance.ts         # Performance optimization
│   ├── pwaHelpers.ts          # PWA utilities
│   ├── pwaMetrics.ts          # Performance metrics
│   └── serviceWorker.ts       # Service Worker management
├── types/              # TypeScript type definitions
│   ├── sound.ts              # Sound-related types
│   ├── store.ts              # Store types
│   ├── index.ts              # Shared types
│   └── global.d.ts           # Global type declarations
└── data/               # Static data
    └── sounds.ts              # Sound source definitions

worker/                 # Cloudflare Workers
├── index.ts           # Main worker script
└── assets-uploader.ts # Asset upload utility

e2e/                   # E2E tests
├── app.spec.ts        # Main application tests
├── audio-playback.spec.ts  # Audio functionality tests
├── performance.spec.ts     # Performance tests
└── volume-control.spec.ts  # Volume control tests
```

### Core Features

- 15 ambient sound sources (rain, waves, fireplace, etc.)
- Individual volume controls (0-100%)
- Preset save/load functionality (3 preset slots)
- Dark theme UI with animated glow effects for active sounds
- PWA installation and offline capabilities
- Automatic caching and background sync
- Performance monitoring with Core Web Vitals

### Audio Architecture

- **AudioManager**: Centralized audio control using Howler.js
- **AudioCacheManager**: Intelligent audio file caching for offline use
- **BackgroundSync**: Background synchronization of audio assets
- **State Management**: Zustand store for global audio state
- **Error Handling**: Comprehensive error recovery for audio loading failures

### Performance Requirements

- **Core Web Vitals**:
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1
- **Audio Performance**:
  - Audio start delay: < 200ms
  - Simultaneous playback: up to 15 sounds
  - Memory usage: optimized with automatic cleanup
- **PWA Performance**:
  - Cache hit rate: > 95%
  - Offline functionality: 100%
  - Service worker update: automatic with user notification

## Key Considerations

### Audio Implementation

- **Howler.js Integration**: All audio operations use Howler.js for cross-browser compatibility
- **State Synchronization**: Audio state must stay synchronized between AudioManager and Zustand store
- **Error Handling**: Robust error recovery for audio loading failures with user feedback
- **Memory Management**: Automatic cleanup of unused audio instances to prevent memory leaks
- **Performance**: Audio preloading and caching for immediate playback response

### PWA Requirements

- **Service Worker**: Must handle offline scenarios and cache audio files efficiently
- **Manifest**: PWA manifest configuration for proper installation experience
- **Update Strategy**: Background updates with user notification for new versions
- **Offline First**: Core functionality must work without internet connectivity

### Testing Strategy

- **Unit Tests**: All service classes, hooks, and utilities must have comprehensive tests
- **E2E Tests**: Critical user flows including audio playback, volume control, and preset management
- **Performance Tests**: Regular monitoring of Core Web Vitals and audio performance metrics
- **Cross-browser Testing**: Ensure compatibility across modern browsers

## Development Guidelines

### 開発方針

- プロジェクトの開発方針に関わる決定事項はすべてCLAUDE.mdに記載する
- 新しい技術選定や設計決定を行った場合は即座に文書化する
- チーム開発を想定し、明確で一貫性のあるガイドラインを維持する

### コーディング規約

- TypeScriptの厳格な型チェックを有効化（strict: true）
- ESLintとPrettierによる自動フォーマット
- コンポーネントは関数型で実装
- カスタムフックによるロジックの分離

### テスト品質管理

#### テストカバレッジ方針

- **100%カバレッジ目標**: すべての新規コンポーネント・関数にテストを実装
- **Test-Driven Development (TDD)**: 可能な限りテストファーストで開発
- **包括的テスト**: 機能テスト、エッジケース、エラーハンドリングを網羅

#### テスト種別

**単体テスト (Vitest + Testing Library)**

- すべてのコンポーネント、フック、サービスクラス
- プロパティ、イベント処理、スタイル適用、エッジケース
- カバレッジレポート: `pnpm test:coverage`

**E2Eテスト (Playwright)**

- ユーザーシナリオ、パフォーマンス、ブラウザ互換性
- 音声再生、音量制御、複数音源同時再生
- 実行: `pnpm test:e2e`

#### 新機能開発時の必須要件

1. **実装前**: 対象機能のテスト要件定義
2. **実装中**: 各コンポーネント/関数のテスト実装
3. **実装後**: カバレッジ確認とテスト実行
4. **コミット前**: 全テスト成功を確認

### コード品質管理

#### Pre-commit フック

コミット前に自動的にlintとformatが実行されます：

**フロントエンド (TypeScript/JavaScript)**

- **ESLint**: JavaScriptとTypeScriptのコード品質チェック
- **Prettier**: コードフォーマットの統一

**ツール管理**

- **husky + lint-staged**: pre-commitフックの管理

設定済みのコマンド：

```bash
# TypeScript/JavaScript
pnpm format:check       # フォーマットチェック
pnpm format             # フォーマット実行
pnpm lint               # Lintチェック
pnpm lint:fix           # Lint自動修正
pnpm typecheck          # 型チェック
```

**重要**: コミット前にこれらのチェックが自動実行されるため、エラーがある場合はコミットできません。

### Cloudflare Workers Development

Cloudflare Workers関連の開発では以下のファイルが重要です：

- `worker/index.ts`: メインWorkerスクリプト（アセット配信、キャッシング、PWA対応）
- `worker/assets-uploader.ts`: 本番環境へのアセットアップロード
- `wrangler.toml`: Workers設定（KVネームスペース、環境変数等）
- `deployment-guide.md`: デプロイメント手順の詳細

#### Workersローカル開発

```bash
pnpm cf:dev              # ローカルWorkers開発サーバー起動
```

#### デプロイメント

```bash
pnpm deploy:full         # フルデプロイ（推奨）
pnpm deploy              # Workerのみデプロイ
pnpm deploy:preview      # プレビュー環境デプロイ
```

## Issue Management

課題管理はGitHub Issuesで行います。以下のコマンドで操作できます：

```bash
# issueの一覧表示
gh issue list --repo kshiva1126/ambient-flow

# 新しいissueの作成
gh issue create --repo kshiva1126/ambient-flow --title "タイトル" --body "本文"

# issueの詳細表示
gh issue view <issue番号> --repo kshiva1126/ambient-flow

# issueのステータス更新
gh issue close <issue番号> --repo kshiva1126/ambient-flow
gh issue reopen <issue番号> --repo kshiva1126/ambient-flow
```

### ステータス管理（ラベル＋アサイン方式）

作業状況はステータスラベルとアサインの組み合わせで管理します：

#### ステータスラベル

- `status: todo` - 未着手（黄色）
- `status: in progress` - 作業中（オレンジ）
- `status: review` - レビュー待ち（緑）
- `status: done` - 完了（青）

#### 管理方法

```bash
# 作業開始時：自分にアサイン＋作業中ラベル
gh issue edit <issue番号> --add-assignee @me --add-label "status: in progress" --repo kshiva1126/ambient-flow

# レビュー待ち状態に変更
gh issue edit <issue番号> --remove-label "status: in progress" --add-label "status: review" --repo kshiva1126/ambient-flow

# 作業完了時：完了ラベルに変更（アサインは維持）
gh issue edit <issue番号> --remove-label "status: review" --add-label "status: done" --repo kshiva1126/ambient-flow

# ステータス別にissueを確認
gh issue list --label "status: in progress" --repo kshiva1126/ambient-flow
gh issue list --assignee @me --label "status: in progress" --repo kshiva1126/ambient-flow
```

## Work Log

作業内容は`work-log.txt`に記録します。すべての作業（issue対応、環境構築、実装、バグ修正など）を都度追記してください。

記載内容の例：

- 日付とタイトル
- 実施した作業の詳細
- 使用したコマンド
- 発生した問題と解決方法
- 作成・更新したファイル

## Git管理

### コミット&プッシュのタイミング

以下のタイミングで適度にコミット&プッシュを行ってください：

- 機能の実装が一段落したとき
- ドキュメントの更新が完了したとき
- 設定ファイルの重要な変更を行ったとき
- 作業を中断・終了するとき
- issue対応が完了したとき

### ブランチ運用

```bash
# issue対応開始時：featureブランチを作成
git checkout -b feature/issue-<issue番号>-<簡潔な説明>
# 例: git checkout -b feature/issue-3-pwa-optimization

# 作業完了後：プルリクエストを作成
gh pr create --title "タイトル" --body "本文"
```

### ブランチ命名規則

- `feature/*` - 新機能開発
- `fix/*` - バグ修正
- `docs/*` - ドキュメント更新
- `refactor/*` - リファクタリング
- `test/*` - テスト追加・修正
