import { Canvas } from '@react-three/fiber'
import { createXRStore, XR } from '@react-three/xr'
import { OrbitControls } from '@react-three/drei'
import GlowingSphere from './components/GlowingSphere'

const store = createXRStore()

function App() {
  return (
    <XR store={store}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          zIndex: 1 
        }}
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} />
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        
        <GlowingSphere />
      </Canvas>
    </XR>
  )
}

export default App