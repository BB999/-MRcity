import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'

function Clouds() {
  const cloudsRef = useRef<Group>(null)

  // 雲をゆっくり移動させる
  useFrame((_state, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.children.forEach((cloud, index) => {
        cloud.position.x += delta * 0.2 * (index % 2 === 0 ? 1 : -1)
        
        // 画面外に出たら反対側に移動
        if (cloud.position.x > 15) {
          cloud.position.x = -15
        } else if (cloud.position.x < -15) {
          cloud.position.x = 15
        }
      })
    }
  })

  return (
    <group ref={cloudsRef}>
      {/* 複数の雲を配置 */}
      <Cloud position={[-5, 6, -3]} scale={1} />
      <Cloud position={[4, 8, -5]} scale={0.8} />
      <Cloud position={[-2, 7, 2]} scale={1.2} />
      <Cloud position={[6, 6, 1]} scale={0.9} />
      <Cloud position={[0, 9, -6]} scale={1.1} />
      <Cloud position={[-7, 7, 4]} scale={0.7} />
    </group>
  )
}

// 単体の雲コンポーネント
function Cloud({ position, scale }: { position: [number, number, number], scale: number }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 複数の球を組み合わせて雲の形を作る */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.6, 0.8, 1.2]} />
        <meshStandardMaterial color="#2c2c2c" opacity={0.7} transparent />
      </mesh>
      
      <mesh position={[0.7, 0.2, 0.3]}>
        <boxGeometry args={[1.2, 0.6, 0.9]} />
        <meshStandardMaterial color="#2c2c2c" opacity={0.7} transparent />
      </mesh>
      
      <mesh position={[-0.6, 0.1, -0.2]}>
        <boxGeometry args={[1.4, 0.7, 1.0]} />
        <meshStandardMaterial color="#2c2c2c" opacity={0.7} transparent />
      </mesh>
      
      <mesh position={[0.2, 0.5, 0.1]}>
        <boxGeometry args={[1.0, 0.5, 0.8]} />
        <meshStandardMaterial color="#2c2c2c" opacity={0.7} transparent />
      </mesh>
      
      <mesh position={[-0.3, 0.3, 0.4]}>
        <boxGeometry args={[0.8, 0.4, 0.6]} />
        <meshStandardMaterial color="#2c2c2c" opacity={0.7} transparent />
      </mesh>
    </group>
  )
}

export default Clouds