import { useState, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { XR, ARButton, createXRStore } from '@react-three/xr'
import { OrbitControls } from '@react-three/drei'
import { Vector3 } from 'three'
import * as THREE from 'three'

// 3D座標上にランダムなノード群を生成
function NodeNetwork() {
  // ノードのデータ構造
  const networkData = useMemo(() => {
    const nodes = []
    const connections = []
    const nodeCount = 25
    const colors = [
      '#ff4444', '#44ff44', '#4444ff', '#ffaa44', '#ff44aa', 
      '#44aaff', '#aaff44', '#aa44ff', '#ffffff', '#ffff44',
      '#ff44ff', '#44ffff', '#88ff88', '#ff8888', '#8888ff'
    ]
    
    // ノード生成
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        id: i,
        position: [
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15
        ],
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 0.3 + 0.1,
        glow: Math.random() * 2 + 1
      })
    }
    
    // まず最短経路で全てのノードを接続
    const connected = new Set([0]) // 最初のノードを接続済みとする
    const unconnected = new Set(Array.from({ length: nodeCount }, (_, i) => i).slice(1))
    
    // 最小スパニングツリーのようにすべてのノードを接続
    while (unconnected.size > 0) {
      let closestPair = { from: -1, to: -1, distance: Infinity }
      
      // 接続済みのノードから未接続のノードへの最短距離を探す
      for (const connectedNode of connected) {
        for (const unconnectedNode of unconnected) {
          const distance = Math.sqrt(
            Math.pow(nodes[connectedNode].position[0] - nodes[unconnectedNode].position[0], 2) +
            Math.pow(nodes[connectedNode].position[1] - nodes[unconnectedNode].position[1], 2) +
            Math.pow(nodes[connectedNode].position[2] - nodes[unconnectedNode].position[2], 2)
          )
          
          if (distance < closestPair.distance) {
            closestPair = { from: connectedNode, to: unconnectedNode, distance }
          }
        }
      }
      
      // 最も近いペアを接続
      connections.push({
        from: closestPair.from,
        to: closestPair.to,
        color: Math.random() < 0.5 ? nodes[closestPair.from].color : nodes[closestPair.to].color,
        opacity: Math.random() * 0.4 + 0.5
      })
      
      connected.add(closestPair.to)
      unconnected.delete(closestPair.to)
    }
    
    return { nodes, connections }
  }, [])
  
  const groupRef = useRef<any>(null!)
  
  // ゆっくり回転させる
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1
      groupRef.current.rotation.x += delta * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {/* ノード（光る球体）を描画 */}
      {networkData.nodes.map((node) => (
        <group key={node.id} position={node.position}>
          {/* 光る球体 */}
          <mesh>
            <sphereGeometry args={[node.size, 16, 16]} />
            <meshStandardMaterial
              color={node.color}
              emissive={node.color}
              emissiveIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* グロー効果のための外側の球体 */}
          <mesh>
            <sphereGeometry args={[node.size * 1.5, 16, 16]} />
            <meshStandardMaterial
              color={node.color}
              emissive={node.color}
              emissiveIntensity={0.2}
              transparent
              opacity={0.3}
            />
          </mesh>
          {/* ポイントライト */}
          <pointLight
            color={node.color}
            intensity={node.glow}
            distance={3}
            decay={2}
          />
        </group>
      ))}
      
      {/* 接続線を描画（cylinderGeometryを使用） */}
      {networkData.connections.map((connection, index) => {
        const fromNode = networkData.nodes[connection.from]
        const toNode = networkData.nodes[connection.to]
        const fromPos = new Vector3(...fromNode.position)
        const toPos = new Vector3(...toNode.position)
        
        // 球体の表面から線が始まるように調整
        const direction = toPos.clone().sub(fromPos).normalize()
        const fromSurface = fromPos.clone().add(direction.clone().multiplyScalar(fromNode.size))
        const toSurface = toPos.clone().sub(direction.clone().multiplyScalar(toNode.size))
        
        const center = fromSurface.clone().add(toSurface).multiplyScalar(0.5)
        const distance = fromSurface.distanceTo(toSurface)
        
        // 2つのベクトル間の回転を計算
        const lineDirection = toSurface.clone().sub(fromSurface).normalize()
        const defaultDirection = new Vector3(0, 1, 0) // cylinderのデフォルト方向
        
        // クォータニオンを使って回転を計算
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(defaultDirection, lineDirection)
        const euler = new THREE.Euler().setFromQuaternion(quaternion)
        
        return (
          <mesh key={index} position={[center.x, center.y, center.z]} rotation={[euler.x, euler.y, euler.z]}>
            <cylinderGeometry args={[0.01, 0.01, distance, 8]} />
            <meshStandardMaterial
              color={connection.color}
              emissive={connection.color}
              emissiveIntensity={0.3}
              transparent
              opacity={connection.opacity}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function App() {
  const [xrMode, setXrMode] = useState<'none' | 'ar'>('none')
  const store = useMemo(() => createXRStore(), [])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setXrMode('ar')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          MR モード
        </button>
        <button
          onClick={() => setXrMode('none')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#636e72',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          通常モード
        </button>
      </div>

      {xrMode === 'ar' && <ARButton store={store} />}

      <Canvas 
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ background: '#000011' }}
      >
        <XR store={store}>
          {xrMode === 'none' && (
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          )}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          <NodeNetwork />
        </XR>
      </Canvas>
    </div>
  )
}

export default App