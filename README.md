# AmbientFlow 🎵

AmbientFlowは、複数の環境音を同時再生できるプログレッシブWebアプリ（PWA）です。Cloudflare Workersでエッジ配信され、高速で安定した環境音体験を提供します。

[![Deploy to Cloudflare Workers](https://github.com/kshiva1126/ambient-flow/actions/workflows/deploy.yml/badge.svg)](https://github.com/kshiva1126/ambient-flow/actions/workflows/deploy.yml)

## ✨ 主な機能

- 🎵 **複数音源の同時再生** - 最大15種類の環境音を同時に再生
- 🎚️ **個別音量調整** - 各音源の音量を0-100%で独立して調整
- 💾 **プリセット機能** - 音源の組み合わせと音量設定を保存・読み込み
- 📱 **PWA対応** - ホーム画面に追加してアプリのように使用可能
- 🌐 **オフライン対応** - インターネット接続なしでも利用可能
- 🌙 **ダークテーマUI** - 目に優しいダークインターフェース
- ⚡ **エッジ配信** - Cloudflare Workersによる高速配信
- 🔄 **自動更新** - 新バージョンの自動通知・更新

## 🎶 音源ラインナップ

### 🌿 自然音

- **Rain**（雨音） - 穏やかな雨音
- **Waves**（波音） - 海岸の波音
- **Stream**（小川） - 小川のせせらぎ
- **Birds**（鳥） - 鳥のさえずり
- **Thunder**（雷雨） - 雷雨と嵐
- **Wind**（風） - そよ風の音
- **Summer Night**（夏の夜） - 虫の音が響く夏の夜

### 🏠 室内音

- **Fireplace**（暖炉） - 暖炉の炎の音

### 🏙️ 都市音

- **Cafe**（カフェ） - カフェの環境音
- **City**（都市） - 都市の環境音
- **Train**（電車） - 電車の走行音
- **Boat**（ボート） - ボートのエンジン音

### 🎵 ノイズ

- **White Noise**（ホワイトノイズ） - 集中力を高めるホワイトノイズ
- **Pink Noise**（ピンクノイズ） - 心地よいピンクノイズ
- **Brown Noise**（ブラウンノイズ） - 深いリラックスのためのブラウンノイズ

## 🌐 アプリを使用する

### オンライン版

**[AmbientFlow を開く](https://ambient-flow.kshiva1126.workers.dev)** - ブラウザですぐに利用

### PWAインストール

1. 上記URLにアクセス
2. ブラウザの「ホーム画面に追加」またはインストールプロンプトをクリック
3. デスクトップアプリのように使用可能

## 🛠️ 技術スタック

### フロントエンド

- **フレームワーク**: React 19 + TypeScript 5.8
- **ビルドツール**: Vite 6.x
- **PWA**: VitePWA + Workbox
- **音声**: Howler.js 2.x
- **状態管理**: Zustand 5.x

### UI・スタイリング

- **CSSフレームワーク**: TailwindCSS 4.x
- **アニメーション**: Motion 12.x
- **アイコン**: Lucide React
- **テーマ**: ダークテーマベース

### インフラ・デプロイ

- **ホスティング**: Cloudflare Workers
- **エッジキャッシング**: Cloudflare KV
- **CI/CD**: GitHub Actions
- **パフォーマンス監視**: Core Web Vitals

### 開発ツール

- **Linter**: ESLint 9.x
- **Formatter**: Prettier 3.x
- **Pre-commit**: Husky + lint-staged
- **テスト**: Vitest + Testing Library
- **E2E**: Playwright

## 🚀 開発セットアップ

### 前提条件

- **Node.js**: v20以上
- **pnpm**: v9以上

### セットアップ手順

1. **リポジトリのクローン**

   ```bash
   git clone https://github.com/kshiva1126/ambient-flow.git
   cd ambient-flow
   ```

2. **依存関係のインストール**

   ```bash
   pnpm install
   ```

3. **開発サーバーの起動**

   ```bash
   pnpm dev
   ```

4. **ブラウザでアクセス**
   ```
   http://localhost:5173
   ```

## 💻 開発コマンド

### 基本コマンド

```bash
# 開発サーバー起動
pnpm dev                    # Vite開発サーバー

# ビルド
pnpm build                  # 本番ビルド
pnpm preview                # ビルド結果のプレビュー
```

### コード品質管理

```bash
# Lint & Format
pnpm lint                   # ESLintチェック
pnpm lint:fix              # ESLint自動修正
pnpm format                # Prettierフォーマット実行
pnpm format:check          # Prettierフォーマットチェック
pnpm typecheck             # TypeScript型チェック
```

### テスト

```bash
# 単体テスト
pnpm test                  # Vitestテスト実行
pnpm test:ui               # テストUIで実行
pnpm test:coverage         # カバレッジ付きテスト

# E2Eテスト
pnpm test:e2e              # Playwrightテスト実行
pnpm test:e2e:ui           # テストUIで実行
pnpm test:e2e:debug        # デバッグモードで実行
```

### Cloudflare Workers

```bash
# ログイン・設定
pnpm cf:login              # Cloudflareにログイン
pnpm cf:dev                # ローカルWorker開発サーバー

# デプロイ
pnpm deploy                # 本番デプロイ
pnpm deploy:preview        # プレビューデプロイ
pnpm deploy:assets         # アセットのみアップロード
```

## 🏗️ プロジェクト構造

```
ambient-flow/
├── src/                    # フロントエンドソース
│   ├── components/         # Reactコンポーネント
│   ├── hooks/             # カスタムフック
│   ├── stores/            # Zustand状態管理
│   ├── services/          # サービスクラス
│   ├── types/             # TypeScript型定義
│   ├── utils/             # ユーティリティ関数
│   └── assets/            # 静的ファイル
├── public/                # 公開ファイル
│   └── assets/           # PWA用アセット
├── worker/               # Cloudflare Workers
│   ├── index.ts          # メインWorkerスクリプト
│   └── assets-uploader.ts # アセットアップローダー
├── .github/              # GitHub Actions
│   └── workflows/        # CI/CDワークフロー
├── e2e/                  # E2Eテスト
├── deployment-guide.md   # デプロイガイド
├── wrangler.toml         # Cloudflare Workers設定
└── README.md             # このファイル
```

## 📊 パフォーマンス目標

### Core Web Vitals

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### PWA目標

- **キャッシュヒット率**: > 95%
- **オフライン利用率**: 100%
- **インストール率**: > 30%

### 音声処理

- **音声開始遅延**: < 200ms
- **音質**: ロスレス配信
- **同時再生**: 最大15音源

## 🔧 設定・カスタマイズ

### 環境変数

```bash
# Cloudflare Workers用（本番のみ）
CLOUDFLARE_API_TOKEN=your-api-token
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_KV_NAMESPACE_ID=your-kv-namespace-id
```

### PWA設定

- **manifest.json**: PWAメタデータ
- **Service Worker**: オフライン対応とキャッシング
- **アイコン**: 192x192, 512x512 PWAアイコン

## 🚀 デプロイ

### 自動デプロイ（推奨）

1. **GitHub Secrets設定**: Cloudflare認証情報を追加
2. **mainブランチプッシュ**: 自動的に本番デプロイ
3. **PRマージ**: プレビュー環境でテスト

### 手動デプロイ

詳細は [deployment-guide.md](./deployment-guide.md) を参照

## 📖 ドキュメント

- **[開発ガイド](./CLAUDE.md)**: 詳細な開発ガイドライン
- **[デプロイガイド](./deployment-guide.md)**: Cloudflare Workersデプロイ手順
- **[E2Eテストガイド](./E2E_TEST_PLAN.md)**: E2Eテスト実行方法
- **[統合テスト](./INTEGRATION_TEST_CHECKLIST.md)**: 統合テストチェックリスト

## 🤝 貢献方法

1. **Issues**: バグ報告や機能提案はGitHub Issuesで
2. **Fork & PR**: 実装はフォーク後にプルリクエスト
3. **テスト**: 新機能にはテストを追加
4. **ドキュメント**: 機能追加時はドキュメントも更新

### 開発フロー

1. Issue作成 → 2. ブランチ作成 → 3. 実装 → 4. テスト → 5. PR作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](./LICENSE) ファイルを参照

## 🔗 関連リンク

- **[Live Demo](https://ambient-flow.kshiva1126.workers.dev)** - 本番環境
- **[GitHub Issues](https://github.com/kshiva1126/ambient-flow/issues)** - バグ報告・機能要望
- **[GitHub Actions](https://github.com/kshiva1126/ambient-flow/actions)** - CI/CD状況

### 技術ドキュメント

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [PWA Guidelines](https://web.dev/progressive-web-apps/)

---

**🎵 AmbientFlowで理想的な音環境を作りましょう！**

作業・勉強・リラックス・睡眠など、あらゆるシーンに最適な環境音をお楽しみください。
