import React from 'react'
import './index.css'
import ImageUploader from './components/imageUploader'
import Header from './Header'

function App() {
  return (
    <div className="m-0 p-0">
      <div className="w-full h-full flex flex-col items-center py-6 gap-6">
        <Header />
        <ImageUploader />
      </div>
    </div>
  )
}

export default App
