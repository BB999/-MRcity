import { useState, useMemo, useRef } from 'react'
import * as React from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { XR, ARButton, createXRStore, useXREvent } from '@react-three/xr'
import { OrbitControls } from '@react-three/drei'
import { Vector3 } from 'three'
import * as THREE from 'three'
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing'

// ドラッグ可能なノードコンポーネント
function DraggableNode({ node, onPositionChange, isXR }) {
  const meshRef = useRef()
  const { gl, camera, raycaster, viewport } = useThree()
  const [isDragging, setIsDragging] = useState(false)
  const [isGrabbed, setIsGrabbed] = useState(false)
  const [dragPlane] = useState(() => new THREE.Plane())
  const [intersection] = useState(() => new THREE.Vector3())
  const [offset] = useState(() => new THREE.Vector3())
  
  const handlePointerDown = (e) => {
    e.stopPropagation()
    setIsDragging(true)
    gl.domElement.style.cursor = 'grabbing'
    
    // ノードの位置から、カメラ方向に垂直な平面を作成
    const nodePos = new THREE.Vector3(...node.position)
    const cameraDirection = new THREE.Vector3()
    camera.getWorldDirection(cameraDirection)
    dragPlane.setFromNormalAndCoplanarPoint(cameraDirection, nodePos)
    
    // マウス位置からレイを飛ばして、現在のオフセットを計算
    const mouse = new THREE.Vector2()
    mouse.x = (e.nativeEvent.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(e.nativeEvent.clientY / window.innerHeight) * 2 + 1
    
    raycaster.setFromCamera(mouse, camera)
    raycaster.ray.intersectPlane(dragPlane, intersection)
    
    if (intersection) {
      offset.subVectors(nodePos, intersection)
    }
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    gl.domElement.style.cursor = 'grab'
  }

  // グローバルなマウス移動をリスンする
  React.useEffect(() => {
    if (isDragging) {
      const handleGlobalPointerMove = (e) => {
        // 現在のマウス位置を取得
        const mouse = new THREE.Vector2()
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
        
        // マウスからレイを飛ばして平面との交点を求める
        raycaster.setFromCamera(mouse, camera)
        raycaster.ray.intersectPlane(dragPlane, intersection)
        
        if (intersection) {
          // オフセットを適用した新しい位置
          const newPosition = intersection.add(offset)
          onPositionChange(node.id, [newPosition.x, newPosition.y, newPosition.z])
        }
      }
      
      const handleGlobalPointerUp = () => {
        setIsDragging(false)
        gl.domElement.style.cursor = 'auto'
      }
      
      gl.domElement.addEventListener('pointermove', handleGlobalPointerMove)
      gl.domElement.addEventListener('pointerup', handleGlobalPointerUp)
      
      return () => {
        gl.domElement.removeEventListener('pointermove', handleGlobalPointerMove)
        gl.domElement.removeEventListener('pointerup', handleGlobalPointerUp)
      }
    }
  }, [isDragging, dragPlane, intersection, offset, node.id, camera, raycaster, gl, onPositionChange])

  // XRでのハンドトラッキング対応
  const handleSelectStart = (e) => {
    if (isXR) {
      setIsGrabbed(true)
      const handPosition = e.target.position
      offset.subVectors(new THREE.Vector3(...node.position), handPosition)
    }
  }

  const handleSelectEnd = () => {
    if (isXR) {
      setIsGrabbed(false)
    }
  }

  const handleMove = (e) => {
    if (isXR && isGrabbed) {
      const handPosition = e.target.position
      const newPosition = handPosition.clone().add(offset)
      onPositionChange(node.id, [newPosition.x, newPosition.y, newPosition.z])
    }
  }

  return (
    <group
      ref={meshRef}
      position={node.position}
      onPointerOver={() => !isXR && (gl.domElement.style.cursor = 'grab')}
      onPointerOut={() => !isXR && !isDragging && (gl.domElement.style.cursor = 'auto')}
    >
      <mesh
        onPointerDown={!isXR ? handlePointerDown : undefined}
        onSelectStart={isXR ? handleSelectStart : undefined}
        onSelectEnd={isXR ? handleSelectEnd : undefined}
        onPointerMove={isXR ? handleMove : undefined}
        ref={(ref) => {
          if (ref) {
            // 各球体に微妙な個別の回転を追加
            const animate = () => {
              const time = Date.now() * 0.001
              ref.rotation.x = Math.sin(time * 0.7 + node.id) * 0.1
              ref.rotation.y = Math.cos(time * 0.5 + node.id) * 0.1
              ref.rotation.z = Math.sin(time * 0.3 + node.id) * 0.05
              requestAnimationFrame(animate)
            }
            animate()
          }
        }}
      >
        <sphereGeometry args={[node.size, 32, 32]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={1.2}
          transparent
          opacity={0.9}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      <pointLight
        color={node.color}
        intensity={node.glow}
        distance={6}
        decay={1}
      />
      
    </group>
  )
}

// 3D座標上にランダムなノード群を生成
function NodeNetwork({ xrMode }) {
  // ノードの状態を管理
  const [nodes, setNodes] = useState(() => {
    const initialNodes = []
    const nodeCount = 25
    const colors = [
      '#ff4444', '#44ff44', '#4444ff', '#ffaa44', '#ff44aa', 
      '#44aaff', '#aaff44', '#aa44ff', '#ffffff', '#ffff44',
      '#ff44ff', '#44ffff', '#88ff88', '#ff8888', '#8888ff'
    ]
    
    // ノード生成
    for (let i = 0; i < nodeCount; i++) {
      initialNodes.push({
        id: i,
        position: [
          (Math.random() - 0.5) * (xrMode === 'ar' ? 3 : 15),
          (Math.random() - 0.5) * (xrMode === 'ar' ? 3 : 15),
          (Math.random() - 0.5) * (xrMode === 'ar' ? 3 : 15)
        ],
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 0.3 + 0.1,
        glow: Math.random() * 2 + 1
      })
    }
    return initialNodes
  })

  // 固定の接続データを初期化時のみ作成
  const [connections, setConnections] = useState(() => {
    const connectionsList = []
    const initialNodes = nodes
    
    // まず最短経路で全てのノードを接続
    const connected = new Set([0]) // 最初のノードを接続済みとする
    const unconnected = new Set(Array.from({ length: initialNodes.length }, (_, i) => i).slice(1))
    
    // 最小スパニングツリーのようにすべてのノードを接続
    while (unconnected.size > 0) {
      let closestPair = { from: -1, to: -1, distance: Infinity }
      
      // 接続済みのノードから未接続のノードへの最短距離を探す
      for (const connectedNode of connected) {
        for (const unconnectedNode of unconnected) {
          const distance = Math.sqrt(
            Math.pow(initialNodes[connectedNode].position[0] - initialNodes[unconnectedNode].position[0], 2) +
            Math.pow(initialNodes[connectedNode].position[1] - initialNodes[unconnectedNode].position[1], 2) +
            Math.pow(initialNodes[connectedNode].position[2] - initialNodes[unconnectedNode].position[2], 2)
          )
          
          if (distance < closestPair.distance) {
            closestPair = { from: connectedNode, to: unconnectedNode, distance }
          }
        }
      }
      
      // 最も近いペアを接続
      connectionsList.push({
        from: closestPair.from,
        to: closestPair.to,
        color: Math.random() < 0.5 ? initialNodes[closestPair.from].color : initialNodes[closestPair.to].color,
        opacity: Math.random() * 0.4 + 0.5
      })
      
      connected.add(closestPair.to)
      unconnected.delete(closestPair.to)
    }
    
    return connectionsList
  })
  
  const groupRef = useRef<any>(null!)
  
  // ゆっくりとした呼吸のような回転
  useFrame((state, delta) => {
    if (groupRef.current) {
      // 非常にゆっくりした回転
      groupRef.current.rotation.y += delta * 0.02
      groupRef.current.rotation.x += delta * 0.015
      groupRef.current.rotation.z += delta * 0.01
    }
  })

  // ノードの位置更新ハンドラ（接続されたノードも影響を受ける）
  const handlePositionChange = (nodeId, newPosition) => {
    setNodes(prevNodes => {
      const updatedNodes = [...prevNodes]
      const draggedNode = updatedNodes.find(node => node.id === nodeId)
      const oldPosition = draggedNode.position
      
      // ドラッグされたノードの位置を更新
      draggedNode.position = newPosition
      
      // 移動量を計算
      const deltaX = newPosition[0] - oldPosition[0]
      const deltaY = newPosition[1] - oldPosition[1]
      const deltaZ = newPosition[2] - oldPosition[2]
      
      // 接続されたノードを見つけて、少し引っ張る
      connections.forEach(connection => {
        let connectedNodeId = null
        let influence = 0.2 // 影響の強さ（20%）
        
        if (connection.from === nodeId) {
          connectedNodeId = connection.to
        } else if (connection.to === nodeId) {
          connectedNodeId = connection.from
        }
        
        if (connectedNodeId !== null) {
          const connectedNode = updatedNodes.find(node => node.id === connectedNodeId)
          if (connectedNode) {
            // 接続されたノードを少し引っ張る
            connectedNode.position = [
              connectedNode.position[0] + deltaX * influence,
              connectedNode.position[1] + deltaY * influence,
              connectedNode.position[2] + deltaZ * influence
            ]
          }
        }
      })
      
      return updatedNodes
    })
  }

  return (
    <group ref={groupRef}>
      {/* ドラッグ可能なノード群 */}
      {nodes.map((node) => (
        <DraggableNode 
          key={node.id} 
          node={node} 
          onPositionChange={handlePositionChange}
          connections={connections}
          isXR={xrMode === 'ar'}
        />
      ))}
      
      {/* 接続線を描画（cylinderGeometryを使用） */}
      {connections.map((connection, index) => {
        const fromNode = nodes[connection.from]
        const toNode = nodes[connection.to]
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
              emissiveIntensity={0.9}
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
  const store = useMemo(() => createXRStore({
    hand: true, // ハンドトラッキング有効化
  }), [])

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
        style={{ background: xrMode === 'ar' ? 'transparent' : '#000033' }}
        gl={{ antialias: true, alpha: xrMode === 'ar' }}
      >
        <XR store={store}>
          {xrMode === 'none' && (
            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true}
              mouseButtons={{
                LEFT: null,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.ROTATE
              }}
              touches={{
                ONE: THREE.TOUCH.ROTATE,
                TWO: THREE.TOUCH.DOLLY_PAN
              }}
            />
          )}
          <ambientLight intensity={xrMode === 'ar' ? 1.0 : 0.4} />
          <directionalLight position={[10, 10, 5]} intensity={xrMode === 'ar' ? 1.5 : 0.5} />
          {xrMode !== 'ar' && <fog attach="fog" args={['#000011', 5, 50]} />}
          
          <NodeNetwork xrMode={xrMode} />
          
          {/* MRモードでハンドトラッキングを表示 */}
          
          <EffectComposer>
            <Bloom 
              luminanceThreshold={0.4} 
              luminanceSmoothing={0.8}
              intensity={1.0}
              radius={0.7}
            />
            <Noise opacity={0.02} />
          </EffectComposer>
        </XR>
      </Canvas>
    </div>
  )
}

export default App