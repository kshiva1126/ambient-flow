# AmbientFlow

AmbientFlowは、複数の環境音を同時再生し、各音源の音量を個別に調整できるクロスプラットフォーム対応デスクトップアプリケーションです。操作性と安定性を最重視した設計となっています。

## ✨ 主な機能

- 🎵 **複数音源の同時再生** - 最大14種類の環境音を同時に再生
- 🎚️ **個別音量調整** - 各音源の音量を0-100%で独立して調整
- 💾 **プリセット機能** - 音源の組み合わせと音量設定を保存・読み込み
- 🌙 **ダークテーマUI** - 目に優しいダークインターフェース
- ⚡ **高パフォーマンス** - CPU使用率<5%、メモリ使用量<150MB
- 🔒 **固定ウィンドウサイズ** - 1200x800pxの最適化されたレイアウト

## 🎶 音源ラインナップ

### 自然音

- Rain（雨音）
- Storm（嵐）
- Wind（風音）
- Waves（波音）
- Stream（小川）
- Birds（鳥のさえずり）

### 人工音

- Train（電車音）
- Boat（船音）
- City（都市音）
- Coffee Shop（カフェ音）
- Fireplace（暖炉音）

### ノイズ

- Pink Noise（ピンクノイズ）
- White Noise（ホワイトノイズ）
- Summer Night（夏の夜音）

## 🛠️ 技術スタック

### フレームワーク・言語

- **メインフレームワーク**: Tauri v2.x
- **フロントエンド**: React 19 + TypeScript 5.8
- **バックエンド**: Rust
- **ビルドツール**: Vite 6.x

### UI・スタイリング

- **CSSフレームワーク**: TailwindCSS 4.x
- **アニメーション**: Motion (旧Framer Motion) 12.x
- **アイコン**: Lucide React
- **テーマ**: ダークテーマベース

### 音声処理

- **音声ライブラリ**: Howler.js 2.x
- **対応フォーマット**: MP3, OGG, WAV

### 状態管理・データ

- **状態管理**: Zustand 5.x
- **データ永続化**: Tauri v2 store API

### 開発ツール

- **Linter**: ESLint 9.x + Clippy
- **Formatter**: Prettier + rustfmt
- **Pre-commit**: Husky + lint-staged

## 🚀 セットアップ

### 前提条件

- **Node.js**: v18以上
- **pnpm**: v8以上
- **Rust**: v1.77.2以上（Tauri用）

### インストール手順

1. **リポジトリのクローン**

   ```bash
   git clone https://github.com/kshiva1126/ambient-flow.git
   cd ambient-flow
   ```

2. **依存関係のインストール**

   ```bash
   pnpm install
   ```

3. **Rustセットアップ（初回のみ）**

   ```bash
   # Rustのインストール（未インストールの場合）
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env

   # Tauri CLIのインストール
   cargo install tauri-cli --version "^2.0.0"
   ```

4. **開発サーバーの起動**
   ```bash
   pnpm tauri dev
   ```

## 💻 開発コマンド

### 基本コマンド

```bash
# 開発サーバー起動
pnpm dev                # Vite開発サーバー
pnpm tauri dev          # Tauri開発モード（推奨）

# ビルド
pnpm build              # フロントエンドビルド
pnpm tauri build        # アプリケーションビルド

# プレビュー
pnpm preview            # Viteプレビューサーバー
```

### コード品質管理

```bash
# TypeScript/JavaScript
pnpm lint               # ESLintチェック
pnpm lint:fix           # ESLint自動修正
pnpm format             # Prettierフォーマット実行
pnpm format:check       # Prettierフォーマットチェック
pnpm typecheck          # TypeScript型チェック

# Rust
pnpm rust:fmt           # Rustフォーマット実行
pnpm rust:fmt:check     # Rustフォーマットチェック
pnpm rust:clippy        # Rustコード品質チェック
pnpm rust:check         # Rustコンパイルチェック
```

## 📝 開発ガイドライン

### コーディング規約

- **TypeScript**: 厳格な型チェック（strict: true）
- **関数型コンポーネント**: Reactコンポーネントは関数型で実装
- **カスタムフック**: ロジックの分離にカスタムフックを活用
- **Rustコード**: clippyのpedantic/nurseryレベルに準拠

### コミット規約

- **Pre-commitフック**: 自動的にlint・formatが実行されます
- **コミットメッセージ**: conventional commitsに従う
- **ブランチ運用**: feature/issue-{番号}-{説明} の形式

### 開発フロー

1. **Issue作成**: GitHub Issuesで課題を管理
2. **ブランチ作成**: `feature/issue-{番号}-{説明}`
3. **実装**: コーディング規約に従って実装
4. **プルリクエスト**: 実装完了後にPR作成
5. **レビュー**: コードレビュー後にマージ

## 🏗️ プロジェクト構造

```
ambient-flow/
├── src/                    # フロントエンドソース
│   ├── components/         # Reactコンポーネント
│   ├── hooks/             # カスタムフック
│   ├── stores/            # Zustand状態管理
│   ├── types/             # TypeScript型定義
│   ├── utils/             # ユーティリティ関数
│   └── assets/            # 静的ファイル
├── src-tauri/             # Tauriバックエンド
│   ├── src/               # Rustソースコード
│   ├── icons/             # アプリアイコン
│   ├── Cargo.toml         # Rust設定
│   ├── rustfmt.toml       # Rustフォーマット設定
│   └── clippy.toml        # Clippy設定
├── public/                # 公開ファイル
├── docs/                  # ドキュメント
├── .husky/                # Pre-commitフック
├── package.json           # Node.js設定
├── tsconfig.json          # TypeScript設定
├── vite.config.ts         # Vite設定
├── tailwind.config.js     # TailwindCSS設定
└── README.md              # このファイル
```

## 🎯 パフォーマンス目標

### 応答性

- UI操作レスポンス: < 100ms
- 音声開始遅延: < 200ms
- プリセット切り替え: < 500ms

### リソース効率

- メモリ使用量: < 150MB
- CPU使用率: < 5%（再生時）
- バッテリー消費: 最小限

### 安定性

- 連続稼働時間: 24時間以上
- クラッシュ率: < 0.1%
- エラー復旧: 自動

## 📖 ドキュメント

- **[開発ガイド](./CLAUDE.md)**: 詳細な開発ガイドライン
- **[アプリ仕様書](./ambient_sound_app_spec.md)**: 機能仕様の詳細
- **[作業ログ](./work-log.txt)**: 開発作業の記録

## 🤝 貢献ガイドライン

1. **Issues**: バグ報告や機能提案はGitHub Issuesをご利用ください
2. **Pull Requests**: 実装前にIssueでの議論をお願いします
3. **コーディング規約**: 既存のコードスタイルに従ってください
4. **テスト**: 新機能には適切なテストを追加してください

## 📄 ライセンス

このプロジェクトのライセンスは検討中です。

## 🔗 関連リンク

- [Tauri Documentation](https://tauri.app/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [TailwindCSS Documentation](https://tailwindcss.com/)

---

AmbientFlowで快適な作業・リラックス環境を作りましょう！ 🎵
