import { useState, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { XR, ARButton, createXRStore } from '@react-three/xr'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing'

// シンプルな光る球体コンポーネント
function GlowingSphere({ position, color, size = 0.3, xrMode }) {
  const meshRef = useRef()
  
  // ゆっくりとした回転アニメーション
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime()
      meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.1
      meshRef.current.rotation.y = Math.cos(time * 0.7) * 0.1
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={xrMode === 'ar' ? 2.0 : 1.2}
          transparent={xrMode !== 'ar'}
          opacity={xrMode === 'ar' ? 1.0 : 0.9}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      <pointLight
        color={color}
        intensity={xrMode === 'ar' ? 3.0 : 2.0}
        distance={6}
        decay={1}
      />
    </group>
  )
}

// シンプルな球体群
function SimpleSpheres({ xrMode }) {
  const spheres = [
    { position: [0, 1, -2], color: '#ff4444', size: 0.4 },
    { position: [-1, 0, -1], color: '#44ff44', size: 0.3 },
    { position: [1, 0, -1], color: '#4444ff', size: 0.35 },
    { position: [0, -1, 0], color: '#ffff44', size: 0.3 },
    { position: [-2, 0.5, -2], color: '#ff44ff', size: 0.25 },
  ]

  return (
    <group>
      {spheres.map((sphere, index) => (
        <GlowingSphere 
          key={index}
          position={sphere.position}
          color={sphere.color}
          size={sphere.size}
          xrMode={xrMode}
        />
      ))}
    </group>
  )
}

function App() {
  const [xrMode, setXrMode] = useState<'none' | 'ar'>('none')
  const store = useMemo(() => createXRStore({
    hand: true, // ハンドトラッキング有効化
  }), [])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, display: 'flex', gap: '10px' }}>
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
          MR モード
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

      {xrMode === 'ar' && <ARButton store={store} />}

      <Canvas 
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ background: xrMode === 'ar' ? 'transparent' : '#000033' }}
        gl={{ antialias: true, alpha: xrMode === 'ar' }}
      >
        <XR store={store}>
          {xrMode === 'none' && (
            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true}
              mouseButtons={{
                LEFT: null,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.ROTATE
              }}
              touches={{
                ONE: THREE.TOUCH.ROTATE,
                TWO: THREE.TOUCH.DOLLY_PAN
              }}
            />
          )}
          <ambientLight intensity={xrMode === 'ar' ? 1.0 : 0.4} />
          <directionalLight position={[10, 10, 5]} intensity={xrMode === 'ar' ? 1.5 : 0.5} />
          {xrMode !== 'ar' && <fog attach="fog" args={['#000011', 5, 50]} />}
          
          <SimpleSpheres xrMode={xrMode} />
          
          {/* MRモードでハンドトラッキングを表示 */}
          
          <EffectComposer>
            <Bloom 
              luminanceThreshold={0.4} 
              luminanceSmoothing={0.8}
              intensity={1.0}
              radius={0.7}
            />
            <Noise opacity={0.02} />
          </EffectComposer>
        </XR>
      </Canvas>
    </div>
  )
}

export default App