import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import Building from './Building'
import Ground from './Ground'
import Road from './Road'
import Clouds from './Clouds'
import SkyTree from './SkyTree'
import Car from './Car'
import Car2 from './Car2'

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
      
      {/* 雲 */}
      <Clouds />
      
      {/* スカイツリー */}
      <SkyTree position={[2, 0, -2]} scale={0.8} />
      
      {/* 建物の配置 */}
      <Building position={[-3, 0, -3]} scale={[1, 2, 1]} color="#ff6b6b" />
      <Building position={[3, 0, -3]} scale={[0.8, 1.5, 0.8]} color="#4ecdc4" />
      <Building position={[-3, 0, 3]} scale={[1.2, 1.8, 1.2]} color="#45b7d1" />
      <Building position={[3, 0, 3]} scale={[0.9, 2.2, 0.9]} color="#f9ca24" />
      <Building position={[-2, 0, -5]} scale={[1.5, 3, 1]} color="#6c5ce7" />
      <Building position={[-5, 0, -2]} scale={[0.7, 1.3, 0.7]} color="#fd79a8" />
      <Building position={[5, 0, 2]} scale={[1.1, 1.9, 1.1]} color="#fdcb6e" />
      
      {/* 追加の建物 */}
      <Building position={[-7, 0, -7]} scale={[0.6, 2.5, 0.6]} color="#a29bfe" />
      <Building position={[7, 0, -7]} scale={[1.3, 1.2, 1.3]} color="#fd79a8" />
      <Building position={[-7, 0, 7]} scale={[0.8, 1.6, 0.8]} color="#00cec9" />
      <Building position={[7, 0, 7]} scale={[1.0, 2.8, 1.0]} color="#e17055" />
      <Building position={[3, 0, 8]} scale={[1.2, 1.4, 1.2]} color="#74b9ff" />
      <Building position={[-8, 0, 3]} scale={[0.9, 2.1, 0.9]} color="#55a3ff" />
      <Building position={[8, 0, -3]} scale={[0.5, 3.2, 0.5]} color="#ff7675" />
      <Building position={[-3, 0, -8]} scale={[1.4, 1.7, 1.4]} color="#00b894" />
      <Building position={[4, 0, -8]} scale={[0.7, 2.3, 0.7]} color="#fdcb6e" />
      
      {/* さらに多くの建物 */}
      <Building position={[-10, 0, -5]} scale={[0.8, 3.5, 0.8]} color="#6c5ce7" />
      <Building position={[-10, 0, 0]} scale={[1.1, 2.7, 1.1]} color="#fd79a8" />
      <Building position={[-10, 0, 5]} scale={[0.9, 1.8, 0.9]} color="#00cec9" />
      <Building position={[-5, 0, -10]} scale={[1.3, 2.2, 1.3]} color="#e17055" />
      <Building position={[0, 0, -10]} scale={[0.7, 4.1, 0.7]} color="#74b9ff" />
      <Building position={[5, 0, -10]} scale={[1.0, 1.5, 1.0]} color="#55a3ff" />
      <Building position={[10, 0, -5]} scale={[1.2, 2.9, 1.2]} color="#ff7675" />
      <Building position={[10, 0, 0]} scale={[0.6, 3.8, 0.6]} color="#00b894" />
      <Building position={[10, 0, 5]} scale={[1.4, 1.9, 1.4]} color="#fdcb6e" />
      <Building position={[-5, 0, 10]} scale={[0.8, 2.6, 0.8]} color="#a29bfe" />
      <Building position={[0, 0, 10]} scale={[1.1, 3.3, 1.1]} color="#fd79a8" />
      <Building position={[5, 0, 10]} scale={[0.9, 1.7, 0.9]} color="#00cec9" />
      
      {/* 角の建物 */}
      <Building position={[-12, 0, -8]} scale={[0.7, 2.4, 0.7]} color="#e17055" />
      <Building position={[-12, 0, 8]} scale={[1.0, 3.1, 1.0]} color="#74b9ff" />
      <Building position={[12, 0, -8]} scale={[0.8, 1.6, 0.8]} color="#55a3ff" />
      <Building position={[12, 0, 8]} scale={[1.3, 2.8, 1.3]} color="#ff7675" />
      <Building position={[-8, 0, -12]} scale={[0.9, 3.7, 0.9]} color="#00b894" />
      <Building position={[8, 0, -12]} scale={[1.1, 2.1, 1.1]} color="#fdcb6e" />
      <Building position={[-8, 0, 12]} scale={[0.6, 4.0, 0.6]} color="#a29bfe" />
      <Building position={[8, 0, 12]} scale={[1.2, 1.8, 1.2]} color="#fd79a8" />
      
      {/* 街灯 - 道路の脇に配置 */}
      <group position={[1.5, 0, 4]}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2]} />
          <meshStandardMaterial color="#2d3436" />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.3} />
        </mesh>
        <pointLight position={[0, 2.2, 0]} intensity={0.8} color="#fff" distance={8} />
      </group>
      
      <group position={[-1.5, 0, 4]}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2]} />
          <meshStandardMaterial color="#2d3436" />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.3} />
        </mesh>
        <pointLight position={[0, 2.2, 0]} intensity={0.8} color="#fff" distance={8} />
      </group>
      
      <group position={[-4, 0, 1.5]}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2]} />
          <meshStandardMaterial color="#2d3436" />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.3} />
        </mesh>
        <pointLight position={[0, 2.2, 0]} intensity={0.8} color="#fff" distance={8} />
      </group>
      
      <group position={[-4, 0, -1.5]}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2]} />
          <meshStandardMaterial color="#2d3436" />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.3} />
        </mesh>
        <pointLight position={[0, 2.2, 0]} intensity={0.8} color="#fff" distance={8} />
      </group>
      
      <group position={[4, 0, 1.5]}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2]} />
          <meshStandardMaterial color="#2d3436" />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.3} />
        </mesh>
        <pointLight position={[0, 2.2, 0]} intensity={0.8} color="#fff" distance={8} />
      </group>
      
      <group position={[4, 0, -1.5]}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2]} />
          <meshStandardMaterial color="#2d3436" />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.3} />
        </mesh>
        <pointLight position={[0, 2.2, 0]} intensity={0.8} color="#fff" distance={8} />
      </group>
      
      <group position={[1.5, 0, -4]}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2]} />
          <meshStandardMaterial color="#2d3436" />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.3} />
        </mesh>
        <pointLight position={[0, 2.2, 0]} intensity={0.8} color="#fff" distance={8} />
      </group>
      
      <group position={[-1.5, 0, -4]}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2]} />
          <meshStandardMaterial color="#2d3436" />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.3} />
        </mesh>
        <pointLight position={[0, 2.2, 0]} intensity={0.8} color="#fff" distance={8} />
      </group>

      {/* 小さな装飾オブジェクト */}
      <mesh position={[1, 0.5, 1]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshStandardMaterial color="#00b894" />
      </mesh>
      
      <mesh position={[-1, 0.3, -1]}>
        <coneGeometry args={[0.2, 1, 8]} />
        <meshStandardMaterial color="#2d3436" />
      </mesh>
      
      {/* 3D車モデル - 道路の上を走行 */}
      <Car 
        path={[
          [0, 0.15, -6],
          [0, 0.15, -4],
          [0, 0.15, -2],
          [0, 0.15, -1],
          [0, 0.15, 0],
          [0, 0.15, 1],
          [0, 0.15, 2],
          [0, 0.15, 4],
          [0, 0.15, 6],
          [1, 0.15, 6],
          [2, 0.15, 6],
          [4, 0.15, 6],
          [6, 0.15, 6],
          [6, 0.15, 4],
          [6, 0.15, 2],
          [6, 0.15, 1],
          [6, 0.15, 0],
          [6, 0.15, -1],
          [6, 0.15, -2],
          [6, 0.15, -4],
          [6, 0.15, -6],
          [4, 0.15, -6],
          [2, 0.15, -6],
          [1, 0.15, -6],
          [0, 0.15, -6]
        ]}
        speed={0.3}
      />
      
      {/* 2台目の車（青いSUV） - 逆回り */}
      <Car2 
        path={[
          [6, 0.15, 6],
          [4, 0.15, 6],
          [2, 0.15, 6],
          [1, 0.15, 6],
          [0, 0.15, 6],
          [0, 0.15, 4],
          [0, 0.15, 2],
          [0, 0.15, 1],
          [0, 0.15, 0],
          [0, 0.15, -1],
          [0, 0.15, -2],
          [0, 0.15, -4],
          [0, 0.15, -6],
          [1, 0.15, -6],
          [2, 0.15, -6],
          [4, 0.15, -6],
          [6, 0.15, -6],
          [6, 0.15, -4],
          [6, 0.15, -2],
          [6, 0.15, -1],
          [6, 0.15, 0],
          [6, 0.15, 1],
          [6, 0.15, 2],
          [6, 0.15, 4],
          [6, 0.15, 6]
        ]}
        speed={0.4}
      />
      
    </group>
  )
}

export default CityDiorama