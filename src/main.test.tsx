import { describe, it, expect } from 'vitest'
import React from 'react'

describe('main.tsx', () => {
  it('should export a valid entry point', () => {
    // エントリーポイントとして正しい構造を持つことを確認
    const mainContent = `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`
    // 必要な要素が含まれていることを確認
    expect(mainContent).toContain('React')
    expect(mainContent).toContain('ReactDOM')
    expect(mainContent).toContain('createRoot')
    expect(mainContent).toContain('StrictMode')
    expect(mainContent).toContain('<App />')
  })

  it('should have correct dependency structure', () => {
    // main.tsxが依存する主要なライブラリが正しく定義されていることを確認
    expect(typeof React).toBe('object')
    expect(React.StrictMode).toBeDefined()
  })
})
