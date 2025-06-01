/**
 * Background Sync implementation for offline preset synchronization
 */

// import { presetStorage } from './PresetStorage' // 将来のサーバー同期用
import type { Preset } from '../types/sound'

interface SyncTask {
  id: string
  type: 'save-preset' | 'delete-preset' | 'update-preset'
  data: unknown
  timestamp: number
  retryCount: number
}

const SYNC_TAG = 'preset-sync'
const MAX_RETRY_COUNT = 3

class BackgroundSyncManager {
  private pendingTasks: Map<string, SyncTask> = new Map()
  private isOnline: boolean = navigator.onLine

  constructor() {
    this.setupEventListeners()
    this.loadPendingTasks()
  }

  /**
   * セットアップ
   */
  private setupEventListeners() {
    // オンライン/オフライン状態の監視
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processPendingTasks()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })

    // Service Workerからのメッセージ受信
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_COMPLETE') {
          this.handleSyncComplete(event.data.taskId)
        }
      })
    }
  }

  /**
   * 保留中のタスクを読み込み
   */
  private async loadPendingTasks() {
    try {
      const stored = localStorage.getItem('pendingSyncTasks')
      if (stored) {
        const tasks = JSON.parse(stored) as SyncTask[]
        tasks.forEach((task) => {
          this.pendingTasks.set(task.id, task)
        })
      }
    } catch (error) {
      console.error('Failed to load pending sync tasks:', error)
    }
  }

  /**
   * 保留中のタスクを保存
   */
  private savePendingTasks() {
    try {
      const tasks = Array.from(this.pendingTasks.values())
      localStorage.setItem('pendingSyncTasks', JSON.stringify(tasks))
    } catch (error) {
      console.error('Failed to save pending sync tasks:', error)
    }
  }

  /**
   * 同期タスクを追加
   */
  async addSyncTask(type: SyncTask['type'], data: unknown): Promise<void> {
    const task: SyncTask = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    }

    this.pendingTasks.set(task.id, task)
    this.savePendingTasks()

    // オンラインなら即座に同期
    if (this.isOnline) {
      await this.processSyncTask(task)
    } else {
      // Background Sync APIを登録
      await this.registerBackgroundSync()
    }
  }

  /**
   * Background Sync APIに登録
   */
  private async registerBackgroundSync(): Promise<void> {
    if (
      'serviceWorker' in navigator &&
      'sync' in ServiceWorkerRegistration.prototype
    ) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register(SYNC_TAG)
        console.log('Background sync registered')
      } catch (error) {
        console.error('Failed to register background sync:', error)
      }
    }
  }

  /**
   * 保留中のタスクを処理
   */
  async processPendingTasks(): Promise<void> {
    const tasks = Array.from(this.pendingTasks.values())

    for (const task of tasks) {
      if (task.retryCount < MAX_RETRY_COUNT) {
        await this.processSyncTask(task)
      } else {
        // 最大リトライ回数を超えたらタスクを削除
        this.pendingTasks.delete(task.id)
        console.error('Max retry count exceeded for task:', task.id)
      }
    }

    this.savePendingTasks()
  }

  /**
   * 同期タスクを処理
   */
  private async processSyncTask(task: SyncTask): Promise<void> {
    try {
      switch (task.type) {
        case 'save-preset':
          await this.syncSavePreset(task.data)
          break
        case 'update-preset':
          await this.syncUpdatePreset(task.data)
          break
        case 'delete-preset':
          await this.syncDeletePreset(task.data)
          break
      }

      // 成功したらタスクを削除
      this.pendingTasks.delete(task.id)
      this.savePendingTasks()
    } catch (error) {
      // エラーの場合はリトライカウントを増やす
      task.retryCount++
      this.pendingTasks.set(task.id, task)
      this.savePendingTasks()
      console.error('Sync task failed:', error)
    }
  }

  /**
   * プリセット保存の同期
   */
  private async syncSavePreset(preset: Preset): Promise<void> {
    // ここでサーバーに同期する処理を実装
    // 現在はローカルストレージのみなので、特に処理なし
    console.log('Syncing preset save:', preset.name)
  }

  /**
   * プリセット更新の同期
   */
  private async syncUpdatePreset(data: {
    id: string
    preset: Preset
  }): Promise<void> {
    console.log('Syncing preset update:', data.preset.name)
  }

  /**
   * プリセット削除の同期
   */
  private async syncDeletePreset(presetId: string): Promise<void> {
    console.log('Syncing preset deletion:', presetId)
  }

  /**
   * 同期完了の処理
   */
  private handleSyncComplete(taskId: string) {
    this.pendingTasks.delete(taskId)
    this.savePendingTasks()
  }

  /**
   * 同期状態を取得
   */
  getSyncStatus(): {
    isOnline: boolean
    pendingTaskCount: number
    tasks: SyncTask[]
  } {
    return {
      isOnline: this.isOnline,
      pendingTaskCount: this.pendingTasks.size,
      tasks: Array.from(this.pendingTasks.values()),
    }
  }
}

// シングルトンインスタンス
export const backgroundSync = new BackgroundSyncManager()

// Service Worker側の処理
export const handleBackgroundSync = async (event: Event & { tag: string }) => {
  if (event.tag === SYNC_TAG) {
    console.log('Processing background sync...')

    // クライアントにメッセージを送信
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_START',
      })
    })

    // 同期処理（実際のサーバー通信はここで実装）
    try {
      // 成功時
      clients.forEach((client) => {
        client.postMessage({
          type: 'BACKGROUND_SYNC_COMPLETE',
        })
      })
    } catch (error) {
      // 失敗時は自動的にリトライされる
      console.error('Background sync error:', error)
      throw error
    }
  }
}
