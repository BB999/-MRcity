import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

export default function GlowingSphere() {
  const meshRef = useRef<Mesh>(null!)

  // アニメーション：ゆっくり回転と発光の強度変化
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // ゆっくり回転
    meshRef.current.rotation.x = time * 0.2
    meshRef.current.rotation.y = time * 0.3
    
    // 発光の強度を波のように変化
    const intensity = 1 + Math.sin(time * 2) * 0.3
    if (meshRef.current.material && 'emissiveIntensity' in meshRef.current.material) {
      meshRef.current.material.emissiveIntensity = intensity
    }
    
    // 少し上下に浮遊
    meshRef.current.position.y = Math.sin(time) * 0.2
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color="#4a90e2"
        emissive="#1a4d80"
        emissiveIntensity={1}
        transparent={true}
        opacity={0.8}
      />
    </mesh>
  )
}