import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'

interface SkyTreeProps {
  position: [number, number, number]
  scale?: number
}

function SkyTree({ position, scale = 1 }: SkyTreeProps) {
  const treeRef = useRef<Group>(null)

  // わずかに光る効果
  useFrame((state) => {
    if (treeRef.current) {
      // 軽やかな発光効果
      const intensity = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2
      treeRef.current.children.forEach((child: any) => {
        if (child.material && child.material.emissive) {
          child.material.emissiveIntensity = intensity * 0.3
        }
      })
    }
  })

  return (
    <group ref={treeRef} position={position} scale={[scale, scale, scale]}>
      {/* メインタワー部分 */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 6, 8]} />
        <meshStandardMaterial 
          color="#e8f4ff" 
          emissive="#4a90e2" 
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* 中間部分の膨らみ */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.3, 0.25, 1, 8]} />
        <meshStandardMaterial 
          color="#e8f4ff" 
          emissive="#4a90e2" 
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* 下部構造 */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 2, 8]} />
        <meshStandardMaterial 
          color="#e8f4ff" 
          emissive="#4a90e2" 
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* 頂上のアンテナ */}
      <mesh position={[0, 6.8, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 6]} />
        <meshStandardMaterial 
          color="#ff4757" 
          emissive="#ff4757" 
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* 展望台部分 */}
      <mesh position={[0, 4.5, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.3, 8]} />
        <meshStandardMaterial 
          color="#ffd700" 
          emissive="#ffcc00" 
          emissiveIntensity={0.4}
          transparent
          opacity={0.9}
        />
      </mesh>

      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.3, 8]} />
        <meshStandardMaterial 
          color="#ffd700" 
          emissive="#ffcc00" 
          emissiveIntensity={0.4}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* ライトアップ用のリング */}
      {[1.5, 2.5, 3.5, 4.5, 5.5].map((height, index) => (
        <mesh key={index} position={[0, height, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.3, 0.02, 8, 16]} />
          <meshStandardMaterial 
            color="#00d2d3" 
            emissive="#00d2d3" 
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}

      {/* 基盤構造 */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 0.4, 8]} />
        <meshStandardMaterial color="#636e72" />
      </mesh>
    </group>
  )
}

export default SkyTree