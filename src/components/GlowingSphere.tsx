import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

const GlowingSphere: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [isXRSupported, setIsXRSupported] = useState(false);
  const placedRef = useRef(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // シーン、カメラ、レンダラーの設定
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.xr.enabled = true;
    // AR でカメラ映像を透過表示するため背景を透明に
    renderer.setClearColor(0x000000, 0);
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // 立方体のジオメトリとマテリアル
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
    });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);


    camera.position.z = 5;

    // OrbitControlsを追加
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // WebXRサポートチェック
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported('immersive-ar').then((supported: boolean) => {
        setIsXRSupported(supported);
      });
    }

    // アニメーション
    const animate = (_time?: number, _frame?: XRFrame) => {
      // controlsをアップデート（XRモードでない場合のみ）
      if (!renderer.xr.isPresenting) {
        controls.update();
      }
      
      // XR中は一度だけカメラ前方に配置して以後は固定
      if (renderer.xr.isPresenting) {
        if (!placedRef.current) {
          const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
          cube.position.copy(camera.position).add(dir.multiplyScalar(0.6));
          cube.quaternion.copy(camera.quaternion);
          placedRef.current = true;
        }
      } else {
        // 非XR時は軽く漂わせる
        const time = Date.now() * 0.001;
        cube.position.x = Math.sin(time) * 0.5;
        cube.position.y = Math.cos(time * 1.2) * 0.3;
        cube.position.z = Math.sin(time * 0.8) * 0.2;

        // ゆっくりとした回転
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.003;
        cube.rotation.z += 0.002;
      }
      
      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);


    // ウィンドウリサイズ対応
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // DOMエレメントをローカル変数に保存
    const currentMount = mountRef.current;

    // クリーンアップ
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.setAnimationLoop(null);
      placedRef.current = false;
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  const startXRSession = async () => {
    if (rendererRef.current && 'xr' in navigator) {
      try {
        // AR に適した reference space を指定
        rendererRef.current.xr.setReferenceSpaceType('local');
        const session = await (navigator as any).xr?.requestSession('immersive-ar', {
          requiredFeatures: ['local'],
          optionalFeatures: ['dom-overlay'],
          domOverlay: { root: document.body }
        });
        placedRef.current = false;
        await rendererRef.current.xr.setSession(session);
        session.addEventListener('end', () => {
          placedRef.current = false;
        });
      } catch (error) {
        console.error('XRセッション開始エラー:', error);
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      {isXRSupported && (
        <button
          onClick={startXRSession}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            padding: '12px 24px',
            backgroundColor: '#00ff88',
            color: 'black',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 1000,
          }}
        >
          MRモード
        </button>
      )}
    </div>
  );
};

export default GlowingSphere;
