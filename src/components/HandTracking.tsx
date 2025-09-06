import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useXR } from '@react-three/xr'
import { Group, Mesh } from 'three'

function HandTracking() {
  const leftHandRef = useRef<Group>(null)
  const rightHandRef = useRef<Group>(null)
  const { player } = useXR()

  useFrame(() => {
    if (player && player.controllers) {
      const leftController = player.controllers[0]
      const rightController = player.controllers[1]

      if (leftHandRef.current && leftController) {
        leftHandRef.current.position.copy(leftController.grip.position)
        leftHandRef.current.quaternion.copy(leftController.grip.quaternion)
      }

      if (rightHandRef.current && rightController) {
        rightHandRef.current.position.copy(rightController.grip.position)
        rightHandRef.current.quaternion.copy(rightController.grip.quaternion)
      }
    }
  })

  return (
    <>
      {/* 左手のビジュアライザー */}
      <group ref={leftHandRef}>
        <mesh>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#ff6b6b" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* 右手のビジュアライザー */}
      <group ref={rightHandRef}>
        <mesh>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#4ecdc4" transparent opacity={0.7} />
        </mesh>
      </group>
    </>
  )
}

export default HandTracking