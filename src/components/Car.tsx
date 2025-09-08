import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Group } from 'three'

interface CarProps {
  position?: [number, number, number]
  color?: string
  path?: Array<[number, number, number]>
  speed?: number
}

function Car({ position = [0, 0, 0], color = "#ff0000", path, speed = 2 }: CarProps) {
  const carRef = useRef<Group>(null)
  const { scene } = useGLTF('/hunyuan3d_ab3ef7b7.glb')
  
  // シーンを複製して複数のインスタンスで使えるようにする
  const clonedScene = scene.clone()

  // 道路を走るアニメーション
  useFrame((state, delta) => {
    if (carRef.current && path) {
      const time = state.clock.elapsedTime * speed
      const pathIndex = Math.floor(time) % path.length
      const nextIndex = (pathIndex + 1) % path.length
      const progress = time - Math.floor(time)
      
      const currentPos = path[pathIndex]
      const nextPos = path[nextIndex]
      
      // 線形補間で位置を計算
      const x = currentPos[0] + (nextPos[0] - currentPos[0]) * progress
      const y = currentPos[1] + (nextPos[1] - currentPos[1]) * progress
      const z = currentPos[2] + (nextPos[2] - currentPos[2]) * progress
      
      carRef.current.position.set(x, y, z)
      
      // 進行方向を向くように回転
      const dirX = nextPos[0] - currentPos[0]
      const dirZ = nextPos[2] - currentPos[2]
      carRef.current.rotation.y = Math.atan2(dirX, dirZ)
    }
  })

  return (
    <group ref={carRef} position={position}>
      <primitive object={clonedScene} scale={[0.5, 0.5, 0.5]} rotation={[0, Math.PI / 2, 0]} />
    </group>
  )
}

export default Car