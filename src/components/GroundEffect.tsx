import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointsMaterial } from 'three'
import * as THREE from 'three'

function GroundEffect() {
  const pointsRef = useRef<Points>(null)
  const materialRef = useRef<PointsMaterial>(null)

  // パーティクルの位置を生成
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(100 * 3) // 100個のパーティクル
    
    for (let i = 0; i < 100; i++) {
      // 地面の範囲内でランダムに配置
      positions[i * 3] = (Math.random() - 0.5) * 10     // x
      positions[i * 3 + 1] = 0                          // y (地面)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 // z
    }
    
    return positions
  }, [])

  // アニメーション
  useFrame((state) => {
    if (pointsRef.current && materialRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
      
      // パーティクルを上に移動
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += 0.01 // y軸方向に移動
        
        // 上まで行ったらリセット
        if (positions[i + 1] > 3) {
          positions[i + 1] = 0
          // 新しい位置に再配置
          positions[i] = (Math.random() - 0.5) * 10
          positions[i + 2] = (Math.random() - 0.5) * 10
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true
      
      // 色をアニメーション
      materialRef.current.color.setHSL(
        (Math.sin(state.clock.elapsedTime * 0.5) + 1) * 0.5 * 0.6 + 0.1, // 色相
        0.8, // 彩度
        0.6  // 明度
      )
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={100}
          array={particlePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.05}
        transparent
        opacity={0.8}
        color="#00ff88"
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default GroundEffect