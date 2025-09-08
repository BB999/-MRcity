import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface BuildingProps {
  position: [number, number, number]
  scale: [number, number, number]
  color: string
}

function Building({ position, scale, color }: BuildingProps) {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  useFrame((state, delta) => {
    if (meshRef.current) {
      // ホバー時の軽い浮遊効果
      if (hovered) {
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 + scale[1] / 2
      } else {
        meshRef.current.position.y = scale[1] / 2
      }
      
      // クリック時の回転効果
      if (clicked) {
        meshRef.current.rotation.y += delta * 2
      }
    }
  })

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* 建物本体 */}
      <mesh
        ref={meshRef}
        position={[0, scale[1] / 2, 0]}
        scale={scale}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(event) => {
          event.stopPropagation()
          setClicked(!clicked)
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={hovered ? '#ffffff' : color} 
          transparent
          opacity={hovered ? 0.8 : 1}
        />
      </mesh>

      {/* 窓を追加 */}
      {/* 前面の窓 */}
      {Array.from({ length: Math.max(1, Math.floor(scale[1] * 1.5)) }, (_, floor) =>
        Array.from({ length: Math.max(1, Math.floor(scale[0] * 2)) }, (_, col) => (
          <mesh
            key={`front-${floor}-${col}`}
            position={[
              (col - Math.floor(scale[0] * 2) / 2 + 0.5) * 0.3,
              0.3 + floor * 0.5,
              scale[2] / 2 + 0.01
            ]}
          >
            <planeGeometry args={[0.15, 0.2]} />
            <meshStandardMaterial 
              color={Math.random() > 0.3 ? "#87ceeb" : "#2c3e50"} 
              transparent 
              opacity={0.8}
            />
          </mesh>
        ))
      )}

      {/* 左側面の窓 */}
      {Array.from({ length: Math.max(1, Math.floor(scale[1] * 1.5)) }, (_, floor) =>
        Array.from({ length: Math.max(1, Math.floor(scale[2] * 2)) }, (_, col) => (
          <mesh
            key={`left-${floor}-${col}`}
            position={[
              -scale[0] / 2 - 0.01,
              0.3 + floor * 0.5,
              (col - Math.floor(scale[2] * 2) / 2 + 0.5) * 0.3
            ]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <planeGeometry args={[0.15, 0.2]} />
            <meshStandardMaterial 
              color={Math.random() > 0.3 ? "#87ceeb" : "#2c3e50"} 
              transparent 
              opacity={0.8}
            />
          </mesh>
        ))
      )}

      {/* 右側面の窓 */}
      {Array.from({ length: Math.max(1, Math.floor(scale[1] * 1.5)) }, (_, floor) =>
        Array.from({ length: Math.max(1, Math.floor(scale[2] * 2)) }, (_, col) => (
          <mesh
            key={`right-${floor}-${col}`}
            position={[
              scale[0] / 2 + 0.01,
              0.3 + floor * 0.5,
              (col - Math.floor(scale[2] * 2) / 2 + 0.5) * 0.3
            ]}
            rotation={[0, -Math.PI / 2, 0]}
          >
            <planeGeometry args={[0.15, 0.2]} />
            <meshStandardMaterial 
              color={Math.random() > 0.3 ? "#87ceeb" : "#2c3e50"} 
              transparent 
              opacity={0.8}
            />
          </mesh>
        ))
      )}
    </group>
  )
}

export default Building