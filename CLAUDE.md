# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AmbientFlow is a cross-platform desktop application for ambient sound mixing, built with Tauri v2.x (Rust + React). The app allows users to play multiple ambient sounds simultaneously with individual volume controls and preset management.

**Current Status**: Specification phase - no implementation exists yet. Only `ambient_sound_app_spec.md` is present.

## Technology Stack

- **Framework**: Tauri v2.x (Rust backend + Web frontend)
- **Frontend**: React 19 + TypeScript 5.8 + Vite
- **Styling**: TailwindCSS 4.x + Motion (animations)
- **Audio**: Howler.js 2.x
- **State Management**: Zustand 5.x
- **Icons**: Lucide React

## Development Commands

Since the project hasn't been initialized yet, here are the commands to use once implementation begins:

```bash
# Initial setup (after Tauri/React project creation)
pnpm install            # Install dependencies
pnpm dev                # Start development server
pnpm build              # Build for production
pnpm lint               # Run ESLint
pnpm typecheck          # Run TypeScript type checking
pnpm test               # Run tests
pnpm tauri dev          # Run Tauri in development mode
pnpm tauri build        # Build Tauri app for distribution
```

## Architecture

### Directory Structure (Planned)

```
src/
├── components/         # React components
│   ├── AudioControl/   # Sound source controls
│   ├── VolumeSlider/   # Volume sliders
│   └── PresetManager/  # Preset management
├── hooks/             # Custom React hooks
├── stores/            # Zustand state stores
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
├── assets/            # Audio files & images
└── styles/            # Style definitions

src-tauri/
├── src/               # Rust source code
└── icons/             # App icons
```

### Core Features

- 14 ambient sound sources (rain, waves, fireplace, etc.)
- Individual volume controls (0-100%)
- Preset save/load functionality
- Dark theme UI with blue glow effects for active sounds
- 1200x800px fixed window size

### Performance Requirements

- CPU usage: <5% during playback
- Memory usage: <150MB
- UI response time: <100ms
- Support 24-hour continuous operation

## Implementation Phases

1. **Phase 1**: Basic audio playback functionality
2. **Phase 2**: UI implementation and volume controls
3. **Phase 3**: Preset functionality
4. **Phase 4**: Optimization and stability improvements

## Key Considerations

- All audio operations should use Howler.js for cross-platform compatibility
- State management with Zustand should follow the AppState interface defined in the spec
- UI must provide immediate visual feedback (100ms response time)
- Error handling is critical for audio file loading failures
- Memory management: unused audio sources should be automatically unloaded

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

**Rust (src-tauri)**

- **rustfmt**: Rustコードの自動フォーマット
- **clippy**: Rustコードの静的解析とLint

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

# Rust
pnpm rust:fmt           # Rustフォーマット実行
pnpm rust:fmt:check     # Rustフォーマットチェック
pnpm rust:clippy        # Rustコード品質チェック
pnpm rust:check         # Rustコンパイルチェック
```

**重要**: コミット前にこれらのチェックが自動実行されるため、エラーがある場合はコミットできません。

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
# 例: git checkout -b feature/issue-3-tauri-setup

# 作業完了後：プルリクエストを作成
gh pr create --title "タイトル" --body "本文"
```

### ブランチ命名規則

- `feature/*` - 新機能開発
- `fix/*` - バグ修正
- `docs/*` - ドキュメント更新
- `refactor/*` - リファクタリング
- `test/*` - テスト追加・修正
