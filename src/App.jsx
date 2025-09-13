import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Scene from './Scene'
import './App.css'

function App() {
  return (
    <div className="App">
      <Canvas
        camera={{ position: [3, 2, 3], fov: 75 }}
        shadows
        style={{ width: '100vw', height: '100vh' }}
      >
        <color attach="background" args={['#87CEEB']} />
        <Scene />
        <OrbitControls />
      </Canvas>
    </div>
  )
}

export default App