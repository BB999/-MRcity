import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { XR, VRButton, ARButton, XRButton } from '@react-three/xr'
import { OrbitControls, Environment } from '@react-three/drei'
import CityDiorama from './components/CityDiorama'
import HandTracking from './components/HandTracking'

function App() {
  const [xrMode, setXrMode] = useState<'none' | 'vr' | 'ar'>('none')

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setXrMode('vr')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4ecdc4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          VR モード
        </button>
        <button
          onClick={() => setXrMode('ar')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          AR モード
        </button>
        <button
          onClick={() => setXrMode('none')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#636e72',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          通常モード
        </button>
      </div>

      {xrMode === 'vr' && <VRButton />}
      {xrMode === 'ar' && <ARButton />}

      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <XR referenceSpace="local-floor">
          {xrMode === 'none' && (
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          )}
          <Environment preset={xrMode === 'ar' ? 'apartment' : 'sunset'} />
          <ambientLight intensity={xrMode === 'ar' ? 0.2 : 0.5} />
          <directionalLight position={[10, 10, 5]} intensity={xrMode === 'ar' ? 0.5 : 1} />
          <CityDiorama scale={xrMode === 'ar' ? 0.3 : 1} />
          {(xrMode === 'vr' || xrMode === 'ar') && <HandTracking />}
        </XR>
      </Canvas>
    </div>
  )
}

export default App