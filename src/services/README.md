# Audio Services

このディレクトリには音声再生関連のサービスが含まれています。

## AudioManager

`AudioManager` は Howler.js を使用した音声再生管理のシングルトンクラスです。

### 主な機能

- **音源の読み込みと管理**: 複数の音源を同時に管理
- **再生制御**: play(), stop(), fadeIn(), fadeOut()
- **音量調整**: 0-100%の範囲で個別に音量設定
- **ループ再生**: すべての音源は自動的にループ再生
- **メモリ管理**: 未使用音源の自動アンロード

### 使用方法

```typescript
import { audioManager } from '../services/AudioManager'
import { SOUND_SOURCES } from '../data/sounds'

// 音源を読み込む
const rainSound = SOUND_SOURCES.find((s) => s.id === 'rain')
audioManager.load(rainSound)

// 再生
audioManager.play('rain')

// 音量調整（0-100）
audioManager.setVolume('rain', 50)

// フェードイン（1秒）
audioManager.fadeIn('rain', 1000)

// フェードアウト（1秒）
audioManager.fadeOut('rain', 1000)

// 停止
audioManager.stop('rain')

// すべて停止
audioManager.stopAll()
```

### React Hook

`useAudioManager` フックを使用することで、React コンポーネントから簡単に AudioManager を利用できます。

```typescript
import { useAudioManager } from '../hooks/useAudioManager'

function MyComponent() {
  const { play, stop, setVolume, isPlaying } = useAudioManager()

  // 使用例
  const handlePlay = () => {
    play('rain')
  }
}
```

### エラーハンドリング

- 音源の読み込みエラー: コンソールにエラーログを出力
- 再生エラー: コンソールにエラーログを出力
- 存在しない音源の操作: 警告ログを出力（クラッシュはしない）

### パフォーマンス最適化

- HTML5 Audio を使用（Web Audio API より軽量）
- プリロード機能で初回再生時の遅延を防止
- 未使用音源の自動アンロードでメモリ使用量を最適化
