import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function AnimatedCube() {
  const meshRef = useRef()

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.01
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 2.5, 0]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial color="#ff6b6b" />
    </mesh>
  )
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshLambertMaterial color="#90EE90" />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      {/* 照明 */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* 地面 */}
      <Ground />

      {/* キューブ */}
      <AnimatedCube />
    </>
  )
}

export default Scene