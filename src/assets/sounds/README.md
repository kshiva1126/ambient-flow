# 音源ファイルについて

このディレクトリには環境音の音源ファイルを配置します。

## ファイル形式

- 形式: MP3またはOGG
- ビットレート: 128-192kbps（ファイルサイズと品質のバランス）
- ループ: シームレスループ対応

## 必要な音源ファイル

- rain.mp3 - 雨音
- waves.mp3 - 波音
- forest.mp3 - 森の環境音
- birds.mp3 - 鳥のさえずり
- thunder.mp3 - 雷鳴
- wind.mp3 - 風の音
- fireplace.mp3 - 暖炉の炎の音
- clock.mp3 - 時計の針音
- keyboard.mp3 - キーボードのタイピング音
- cafe.mp3 - カフェの環境音
- city.mp3 - 都市の環境音
- train.mp3 - 電車の走行音
- white-noise.mp3 - ホワイトノイズ
- brown-noise.mp3 - ブラウンノイズ

## 音源の入手方法

### 開発用プレースホルダー

開発中は以下の方法で仮の音源を生成できます：

```bash
# ffmpegを使用して無音ファイルを生成
for sound in rain waves forest birds thunder wind fireplace clock keyboard cafe city train white-noise brown-noise; do
  ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 10 -q:a 9 -acodec mp3 "$sound.mp3"
done
```

### 本番用音源

以下のサイトからロイヤリティフリーの音源を入手可能：

- [Freesound.org](https://freesound.org/) - CC0ライセンスの音源多数
- [Zapsplat.com](https://www.zapsplat.com/) - 無料登録で利用可能
- [Mixkit](https://mixkit.co/free-sound-effects/) - 商用利用可能な音源

## ライセンス

使用する音源のライセンスを必ず確認し、適切なクレジット表記を行ってください。
