import { useState } from 'react'
import { useHitTest, Interactive } from '@react-three/xr'
import CityDiorama from './CityDiorama'

interface MRPlacementProps {
  xrMode: string
}

function MRPlacement({ xrMode }: MRPlacementProps) {
  const [placed, setPlaced] = useState(false)
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0])

  useHitTest((hitMatrix, hit) => {
    if (!placed && xrMode === 'mr') {
      // ヒットテスト結果から位置を取得
      const pos = hitMatrix.elements
      setPosition([pos[12], pos[13], pos[14]])
    }
  })

  const handlePlacement = () => {
    setPlaced(true)
  }

  if (xrMode !== 'mr') {
    return <CityDiorama scale={0.5} />
  }

  return (
    <group>
      {!placed ? (
        // 配置前：ヒットテスト結果の位置にプレビューを表示
        <Interactive onSelect={handlePlacement}>
          <group position={position}>
            <mesh>
              <planeGeometry args={[0.3, 0.3]} />
              <meshBasicMaterial color="white" transparent opacity={0.8} />
            </mesh>
            <CityDiorama scale={0.15} position={[0, 0.01, 0]} />
          </group>
        </Interactive>
      ) : (
        // 配置後：固定された位置に表示
        <group position={position}>
          <CityDiorama scale={0.15} />
        </group>
      )}
    </group>
  )
}

export default MRPlacement