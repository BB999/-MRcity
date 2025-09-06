function Road() {
  return (
    <group>
      {/* 水平の道路 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[16, 2]} />
        <meshStandardMaterial color="#636e72" />
      </mesh>
      
      {/* 垂直の道路 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[2, 16]} />
        <meshStandardMaterial color="#636e72" />
      </mesh>
      
      {/* 道路の中央線（白い線） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <planeGeometry args={[16, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <planeGeometry args={[0.1, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

export default Road