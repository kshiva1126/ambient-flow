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

## Work Log

作業内容は`work-log.txt`に記録します。すべての作業（issue対応、環境構築、実装、バグ修正など）を都度追記してください。

記載内容の例：
- 日付とタイトル
- 実施した作業の詳細
- 使用したコマンド
- 発生した問題と解決方法
- 作成・更新したファイル