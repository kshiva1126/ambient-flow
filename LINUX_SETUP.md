# Linux環境でのセットアップガイド

## 必要な依存関係

### Manjaro/Arch Linux

```bash
sudo pacman -S --needed webkit2gtk-4.1 base-devel curl wget file openssl appmenu-gtk-module gtk3 libappindicator-gtk3 librsvg libvips
```

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

## Wayland環境での実行

Wayland環境で「Protocol error」が発生する場合は、以下の環境変数を設定してください：

```bash
# オプション1: コンポジティングモードを無効化
WEBKIT_DISABLE_COMPOSITING_MODE=1 pnpm tauri dev

# オプション2: X11バックエンドを強制使用
GDK_BACKEND=x11 pnpm tauri dev

# オプション3: 両方を組み合わせる
GDK_BACKEND=x11 WEBKIT_DISABLE_COMPOSITING_MODE=1 pnpm tauri dev
```

## トラブルシューティング

### WebKit依存関係エラー

エラーメッセージ例：

```
The system library `webkit2gtk-4.1` required by crate `webkit2gtk-sys` was not found.
```

解決方法：

1. 上記の依存関係をインストール
2. `pkg-config --list-all | grep webkit`で確認
3. webkit2gtk-4.1が表示されることを確認

### Waylandプロトコルエラー

エラーメッセージ例：

```
Gdk-Message: Error 71 (プロトコルエラー) dispatching to Wayland display.
```

解決方法：

- 上記の環境変数を設定して実行

## 開発時の推奨設定

`.bashrc`または`.zshrc`に以下を追加すると便利です：

```bash
# Tauri開発用エイリアス
alias tauri-dev='WEBKIT_DISABLE_COMPOSITING_MODE=1 pnpm tauri dev'
```
