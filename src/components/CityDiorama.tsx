import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import Building from './Building'
import Ground from './Ground'
import Road from './Road'

interface CityDioramaProps {
  scale?: number
}

function CityDiorama({ scale = 1 }: CityDioramaProps) {
  const groupRef = useRef<Group>(null)

  // ゆっくりと回転させる
  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1
    }
  })

  return (
    <group ref={groupRef} scale={[scale, scale, scale]} position={[0, 0, 0]}>
      {/* 地面 */}
      <Ground />
      
      {/* 道路 */}
      <Road />
      
      {/* 建物の配置 */}
      <Building position={[-3, 0, -3]} scale={[1, 2, 1]} color="#ff6b6b" />
      <Building position={[3, 0, -3]} scale={[0.8, 1.5, 0.8]} color="#4ecdc4" />
      <Building position={[-3, 0, 3]} scale={[1.2, 1.8, 1.2]} color="#45b7d1" />
      <Building position={[3, 0, 3]} scale={[0.9, 2.2, 0.9]} color="#f9ca24" />
      <Building position={[0, 0, -5]} scale={[1.5, 3, 1]} color="#6c5ce7" />
      <Building position={[-5, 0, 0]} scale={[0.7, 1.3, 0.7]} color="#fd79a8" />
      <Building position={[5, 0, 0]} scale={[1.1, 1.9, 1.1]} color="#fdcb6e" />
      
      {/* 小さな装飾オブジェクト */}
      <mesh position={[1, 0.5, 1]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshStandardMaterial color="#00b894" />
      </mesh>
      
      <mesh position={[-1, 0.3, -1]}>
        <coneGeometry args={[0.2, 1, 8]} />
        <meshStandardMaterial color="#2d3436" />
      </mesh>
    </group>
  )
}

export default CityDiorama