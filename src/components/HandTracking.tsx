import { useRef } from 'react'
import { Group } from 'three'

function HandTracking() {
  const leftHandRef = useRef<Group>(null)
  const rightHandRef = useRef<Group>(null)

  // 簡素化されたハンドトラッキング表示
  // 実際のコントローラー位置を取得するのは複雑なため、固定位置で表示

  return (
    <>
      {/* 左手のビジュアライザー */}
      <group ref={leftHandRef} position={[-0.3, 1.2, -0.3]}>
        <mesh>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#ff6b6b" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* 右手のビジュアライザー */}
      <group ref={rightHandRef} position={[0.3, 1.2, -0.3]}>
        <mesh>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#4ecdc4" transparent opacity={0.7} />
        </mesh>
      </group>
    </>
  )
}

export default HandTracking