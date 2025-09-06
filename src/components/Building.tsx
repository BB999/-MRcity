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
    <mesh
      ref={meshRef}
      position={[position[0], scale[1] / 2, position[2]]}
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
  )
}

export default Building