# Cloudflare Workers Deployment Guide

このガイドでは、AmbientFlow PWAをCloudflare Workersにデプロイする手順を説明します。

## 前提条件

- Cloudflareアカウント
- Wrangler CLI (`pnpm install`で自動インストール済み)
- GitHub Actionsのシークレット設定

## 1. Cloudflareの初期設定

### 1.1 Cloudflareにログイン

```bash
pnpm cf:login
```

ブラウザが開き、Cloudflareアカウントでログインしてください。

### 1.2 KVネームスペースの作成

キャッシュ用のKVネームスペースを作成：

```bash
# 本番用
pnpm cf:kv:create

# プレビュー用
pnpm cf:kv:create:preview
```

コマンド実行後、出力されるKVネームスペースIDを`wrangler.toml`の該当箇所に設定してください。

## 2. wrangler.tomlの設定

`wrangler.toml`ファイル内の以下の項目を実際の値に更新してください：

```toml
# KVネームスペースIDを更新
[[kv_namespaces]]
binding = "CACHE_KV"
id = "your-kv-namespace-id"              # ←実際のID
preview_id = "your-preview-kv-namespace-id"  # ←実際のID

[[kv_namespaces]]
binding = "ANALYTICS_KV"
id = "your-analytics-kv-namespace-id"    # ←実際のID
preview_id = "your-preview-analytics-kv-namespace-id"  # ←実際のID

# ドメイン設定（必要に応じて）
[env.production]
routes = [
  { pattern = "ambient-flow.your-domain.com/*", zone_name = "your-domain.com" }
]
```

## 3. ローカルでのテスト

### 3.1 アプリケーションのビルド

```bash
pnpm build
```

### 3.2 ローカルでWorkerを実行

```bash
pnpm cf:dev
```

ブラウザで`http://localhost:8787`にアクセスして動作確認。

## 4. 手動デプロイ

### 4.1 アセットのアップロード

環境変数を設定してアセットをKVにアップロード：

```bash
export CLOUDFLARE_API_TOKEN="your-api-token"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export CLOUDFLARE_KV_NAMESPACE_ID="your-kv-namespace-id"

pnpm deploy:assets
```

### 4.2 Workerのデプロイ

```bash
# 本番環境
pnpm deploy

# プレビュー環境
pnpm deploy:preview

# フルデプロイ（ビルド + アセット + Worker）
pnpm deploy:full
```

## 5. GitHub Actionsの設定

### 5.1 GitHubシークレットの追加

リポジトリの設定で以下のシークレットを追加：

- `CLOUDFLARE_API_TOKEN`: CloudflareのAPIトークン
- `CLOUDFLARE_ACCOUNT_ID`: CloudflareアカウントID
- `CLOUDFLARE_KV_NAMESPACE_ID`: 本番用KVネームスペースID
- `CLOUDFLARE_KV_NAMESPACE_PREVIEW_ID`: プレビュー用KVネームスペースID

### 5.2 APIトークンの取得方法

1. [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)にアクセス
2. "Create Token"をクリック
3. "Cloudflare Workers:Edit"テンプレートを選択
4. 必要な権限を設定：
   - `Account:Cloudflare Workers:Edit`
   - `Zone:Zone:Read`
   - `Account:Account:Read`

### 5.3 自動デプロイの動作

- **プルリクエスト**: プレビュー環境にデプロイ
- **mainブランチプッシュ**: 本番環境にデプロイ

## 6. トラブルシューティング

### 6.1 KVアップロードエラー

```bash
# KVネームスペースの確認
wrangler kv:namespace list

# KVの内容確認
wrangler kv:key list --binding CACHE_KV
```

### 6.2 Workerのログ確認

```bash
# リアルタイムログ
wrangler tail

# 過去のログ
wrangler tail --format=pretty
```

### 6.3 設定の確認

```bash
# 現在の設定確認
wrangler whoami

# デプロイ可能性のチェック
wrangler deploy --dry-run
```

## 7. パフォーマンス最適化

### 7.1 アセットの最適化

- 画像の圧縮（WebP形式推奨）
- JavaScript/CSSの最小化（自動）
- Gzip圧縮（Cloudflareが自動処理）

### 7.2 キャッシュ戦略

- 静的アセット: 1年キャッシュ（ハッシュ付きファイル名）
- 音声ファイル: 30日キャッシュ
- HTMLファイル: 1時間キャッシュ（再検証あり）

### 7.3 モニタリング

Worker内のアナリティクス機能で以下を追跡：

- リクエスト数
- レスポンス時間
- エラー率
- 地理的分散

## 8. カスタムドメインの設定

### 8.1 DNSの設定

Cloudflare DNSでCNAMEレコードを追加：

```
ambient-flow.your-domain.com -> your-worker.your-subdomain.workers.dev
```

### 8.2 SSL証明書

Cloudflareが自動的にSSL証明書を提供します。

## 9. 継続的なメンテナンス

### 9.1 定期的なタスク

- アナリティクスデータのクリーンアップ（自動実行）
- パフォーマンスメトリクスの確認
- セキュリティアップデート

### 9.2 監視とアラート

Cloudflare Dashboardで以下を監視：

- Worker実行時間
- リクエストエラー率
- KV操作の成功率

---

## サポート

デプロイに関する問題が発生した場合：

1. [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
2. [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
3. プロジェクトのIssueトラッカー
