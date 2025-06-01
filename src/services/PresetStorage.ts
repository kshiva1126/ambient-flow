import type { Preset } from '../types/sound'

/**
 * プリセットストレージのインターフェース
 */
export interface PresetStorage {
  savePreset(preset: Preset): Promise<void>
  loadPresets(): Promise<Preset[]>
  deletePreset(id: string): Promise<void>
  clearAll(): Promise<void>
  getPreset(id: string): Promise<Preset | null>
}

/**
 * IndexedDBを使用したプリセットストレージの実装
 */
export class IndexedDBPresetStorage implements PresetStorage {
  private dbName = 'AmbientFlowDB'
  private dbVersion = 1
  private storeName = 'presets'
  private db: IDBDatabase | null = null

  /**
   * データベースを初期化
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error}`))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // プリセットストアを作成
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('name', 'name', { unique: false })
          store.createIndex('createdAt', 'createdAt', { unique: false })
          store.createIndex('updatedAt', 'updatedAt', { unique: false })
        }
      }
    })
  }

  /**
   * プリセットを保存
   */
  async savePreset(preset: Preset): Promise<void> {
    const db = await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)

      const request = store.put(preset)

      request.onsuccess = () => {
        console.log(`Preset saved: ${preset.name}`)
        resolve()
      }

      request.onerror = () => {
        reject(new Error(`Failed to save preset: ${request.error}`))
      }
    })
  }

  /**
   * すべてのプリセットを読み込み
   */
  async loadPresets(): Promise<Preset[]> {
    const db = await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)

      const request = store.getAll()

      request.onsuccess = () => {
        const presets = request.result as Preset[]
        // 作成日時の降順でソート
        presets.sort((a, b) => b.createdAt - a.createdAt)
        resolve(presets)
      }

      request.onerror = () => {
        reject(new Error(`Failed to load presets: ${request.error}`))
      }
    })
  }

  /**
   * 特定のプリセットを取得
   */
  async getPreset(id: string): Promise<Preset | null> {
    const db = await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)

      const request = store.get(id)

      request.onsuccess = () => {
        resolve(request.result || null)
      }

      request.onerror = () => {
        reject(new Error(`Failed to get preset: ${request.error}`))
      }
    })
  }

  /**
   * プリセットを削除
   */
  async deletePreset(id: string): Promise<void> {
    const db = await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)

      const request = store.delete(id)

      request.onsuccess = () => {
        console.log(`Preset deleted: ${id}`)
        resolve()
      }

      request.onerror = () => {
        reject(new Error(`Failed to delete preset: ${request.error}`))
      }
    })
  }

  /**
   * すべてのプリセットを削除
   */
  async clearAll(): Promise<void> {
    const db = await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)

      const request = store.clear()

      request.onsuccess = () => {
        console.log('All presets cleared')
        resolve()
      }

      request.onerror = () => {
        reject(new Error(`Failed to clear presets: ${request.error}`))
      }
    })
  }

  /**
   * データベースを閉じる
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

/**
 * LocalStorageを使用したフォールバック実装
 */
export class LocalStoragePresetStorage implements PresetStorage {
  private storageKey = 'ambient-flow-presets'

  async savePreset(preset: Preset): Promise<void> {
    try {
      const presets = await this.loadPresets()
      const existingIndex = presets.findIndex((p) => p.id === preset.id)

      if (existingIndex >= 0) {
        presets[existingIndex] = preset
      } else {
        presets.push(preset)
      }

      localStorage.setItem(this.storageKey, JSON.stringify(presets))
      console.log(`Preset saved to localStorage: ${preset.name}`)
    } catch (error) {
      throw new Error(`Failed to save preset to localStorage: ${error}`)
    }
  }

  async loadPresets(): Promise<Preset[]> {
    try {
      const data = localStorage.getItem(this.storageKey)
      if (!data) {
        return []
      }

      const presets = JSON.parse(data) as Preset[]
      // 作成日時の降順でソート
      return presets.sort((a, b) => b.createdAt - a.createdAt)
    } catch (error) {
      console.error('Failed to load presets from localStorage:', error)
      return []
    }
  }

  async getPreset(id: string): Promise<Preset | null> {
    const presets = await this.loadPresets()
    return presets.find((p) => p.id === id) || null
  }

  async deletePreset(id: string): Promise<void> {
    try {
      const presets = await this.loadPresets()
      const filteredPresets = presets.filter((p) => p.id !== id)
      localStorage.setItem(this.storageKey, JSON.stringify(filteredPresets))
      console.log(`Preset deleted from localStorage: ${id}`)
    } catch (error) {
      throw new Error(`Failed to delete preset from localStorage: ${error}`)
    }
  }

  async clearAll(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey)
      console.log('All presets cleared from localStorage')
    } catch (error) {
      throw new Error(`Failed to clear presets from localStorage: ${error}`)
    }
  }
}

/**
 * プリセットストレージファクトリー
 * IndexedDBが使用可能な場合はIndexedDBを、そうでなければLocalStorageを使用
 */
export function createPresetStorage(): PresetStorage {
  // IndexedDBサポートチェック
  if (typeof indexedDB !== 'undefined') {
    try {
      return new IndexedDBPresetStorage()
    } catch (error) {
      console.warn(
        'IndexedDB not available, falling back to localStorage:',
        error
      )
    }
  }

  // フォールバック: LocalStorage
  return new LocalStoragePresetStorage()
}

// シングルトンインスタンス
export const presetStorage = createPresetStorage()
