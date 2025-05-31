import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <h1 className="text-5xl font-bold text-white mb-4">AmbientFlow</h1>
      <p className="text-xl text-gray-300 mb-8">Ambient Sound Mixer</p>
      <div className="p-8">
        <button 
          onClick={() => setCount((count) => count + 1)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          count is {count}
        </button>
      </div>
      <p className="text-gray-500 text-sm mt-8">
        React 19 + TypeScript 5.8 + Vite + Tauri v2
      </p>
    </div>
  )
}

export default App