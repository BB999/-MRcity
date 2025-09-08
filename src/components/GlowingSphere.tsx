import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls, XRControllerModelFactory } from 'three-stdlib';

const GlowingSphere: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [isXRSupported, setIsXRSupported] = useState(false);
  const placedRef = useRef(false);
  const controllersRef = useRef<THREE.Group[]>([]);
  const SPHERE_COUNT = 24; // 12対 = 24個
  const INITIAL_DISTANCE = 0.08; // m: XR開始時の初期距離（より手前に）

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

    // 球体（複数）とライン
    const sphereGeometry = new THREE.SphereGeometry(0.08, 32, 16);
    const makeMaterial = (color: THREE.Color | number) => new THREE.MeshBasicMaterial({ color });
    const spheres: THREE.Mesh[] = [];
    const lines: { line: THREE.Line, a: number, b: number }[] = [];


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

    // XR コントローラ設定（掴み）
    const raycaster = new THREE.Raycaster();
    const tempMatrix = new THREE.Matrix4();
    const worldPos = new THREE.Vector3();
    const worldQuat = new THREE.Quaternion();

    const intersectWithSpheres = (controller: THREE.Object3D) => {
      tempMatrix.identity().extractRotation(controller.matrixWorld);
      const origin = new THREE.Vector3().setFromMatrixPosition(controller.matrixWorld);
      const direction = new THREE.Vector3(0, 0, -1).applyMatrix4(tempMatrix);
      raycaster.set(origin, direction);
      return raycaster.intersectObjects(spheres, false);
    };

    const lightenColor = (src: THREE.Color, factor: number) => {
      // HSL 空間で輝度を上げてハイライト
      const hsl = { h: 0, s: 0, l: 0 } as any;
      src.getHSL(hsl);
      hsl.l = Math.min(1, hsl.l * factor);
      const out = src.clone();
      out.setHSL(hsl.h, hsl.s, hsl.l);
      return out;
    };

    const onSelectStart = (event: any) => {
      const controller: THREE.Group = event.target;
      const intersections = intersectWithSpheres(controller);
      if (intersections.length > 0) {
        const picked = intersections[0].object as THREE.Mesh;
        controller.userData.selected = picked;
        // この掴みで影響を受けたインデックスを追跡
        (controller as any).userData.pulledIndices = new Set<number>();
        if ((picked.material as THREE.Material) && (picked.material as any).color) {
          // 基本色を保持していなければ保存
          if (!picked.userData.baseColor) {
            picked.userData.baseColor = ((picked.material as any).color as THREE.Color).clone();
          }
          const highlight = lightenColor(picked.userData.baseColor.clone(), 1.5);
          ((picked.material as any).color as THREE.Color).copy(highlight);
        }
        // 揺れを停止（掴み中）
        (picked as any).userData.grabbed = true;
        controller.attach(picked);
      }
    };

    const onSelectEnd = (event: any) => {
      const controller: THREE.Group = event.target;
      const selected: THREE.Object3D | undefined = controller.userData.selected;
      if (selected) {
        // ワールド変換を保持してからシーンに戻す
        selected.getWorldPosition(worldPos);
        selected.getWorldQuaternion(worldQuat);
        scene.add(selected);
        selected.position.copy(worldPos);
        (selected as any).quaternion.copy(worldQuat);
        if (((selected as any).material as THREE.Material) && ((selected as any).material as any).color) {
          const mesh = selected as THREE.Mesh;
          const base = (mesh.userData && mesh.userData.baseColor) ? mesh.userData.baseColor as THREE.Color : null;
          if (base) {
            (((selected as any).material as any).color as THREE.Color).copy(base);
          }
        }
        // 新しい基準位置に更新し、揺れを再開
        const mesh = selected as THREE.Mesh;
        if ((mesh as any).userData?.hover) {
          (mesh as any).userData.hover.base.copy(mesh.position);
        }
        (mesh as any).userData.grabbed = false;
        // この掴みで引っ張られた球体は、その位置を新しい基準に固定
        const pulled: Set<number> | undefined = (controller as any).userData?.pulledIndices;
        if (pulled && pulled.size > 0) {
          Array.from(pulled).forEach((idx) => {
            const n = spheres[idx];
            if (n && (n as any).userData?.hover) {
              (n as any).userData.hover.base.copy(n.position);
            }
          });
        }
        (controller as any).userData.pulledIndices = undefined;
        controller.userData.selected = undefined;
      }
    };

    const buildController = (index: number) => {
      const controller = renderer.xr.getController(index);
      (controller as any).addEventListener('selectstart', onSelectStart);
      (controller as any).addEventListener('selectend', onSelectEnd);
      scene.add(controller);

      // 可視レイ
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1),
      ]);
      const line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color: 0x00ff88 })
      );
      line.name = 'ray';
      line.scale.z = 0.2;
      controller.add(line);

      const controllerGrip = renderer.xr.getControllerGrip(index);
      const modelFactory = new XRControllerModelFactory();
      controllerGrip.add(modelFactory.createControllerModel(controllerGrip));
      scene.add(controllerGrip);

      controllersRef.current.push(controller);
    };

    buildController(0);
    buildController(1);

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
          const ctrl = controllersRef.current[0] || controllersRef.current[1];
          if (ctrl) {
            // 基準点: コントローラー先端
            tempMatrix.identity().extractRotation(ctrl.matrixWorld);
            const basePos = new THREE.Vector3().setFromMatrixPosition(ctrl.matrixWorld);
            const baseDir = new THREE.Vector3(0, 0, -1).applyMatrix4(tempMatrix).normalize();

            // ランダム配置（0.6m立方内、重なり回避）
            const placedPositions: THREE.Vector3[] = [];
            const tryPlace = () => {
              const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 0.6,
                (Math.random() - 0.3) * 0.4, // 少し上寄り
                (Math.random() - 0.2) * 0.6
              );
              // 先端から少し前方へベース距離
              const candidate = basePos.clone().add(baseDir.clone().multiplyScalar(INITIAL_DISTANCE + Math.random() * 0.2)).add(offset);
              // 最小間隔（直径の1.5倍）
              const minDist = 0.08 * 2 * 1.5;
              if (placedPositions.every(p => p.distanceTo(candidate) > minDist)) {
                placedPositions.push(candidate);
                return candidate;
              }
              return null;
            };

            for (let i = 0; i < SPHERE_COUNT; i++) {
              let pos: THREE.Vector3 | null = null;
              for (let t = 0; t < 200 && !pos; t++) pos = tryPlace();
              if (!pos) pos = basePos.clone().add(new THREE.Vector3(i * 0.15, 0, 0));
              // HSLで均等に色相を振って個性を付与
              const baseColor = new THREE.Color().setHSL((i / SPHERE_COUNT), 0.7, 0.5);
              const sphere = new THREE.Mesh(sphereGeometry, makeMaterial(baseColor));
              sphere.position.copy(pos);
              sphere.userData.baseColor = baseColor.clone();
              sphere.userData.idx = i;
              // ホバー（静かに揺れる）用の基準とパラメータ
              sphere.userData.hover = {
                base: pos.clone(),
                amp: new THREE.Vector3(
                  0.012 + Math.random() * 0.01,
                  0.016 + Math.random() * 0.012,
                  0.012 + Math.random() * 0.01
                ),
                phase: new THREE.Vector3(
                  Math.random() * Math.PI * 2,
                  Math.random() * Math.PI * 2,
                  Math.random() * Math.PI * 2
                ),
                speed: new THREE.Vector3(
                  0.3 + Math.random() * 0.2,
                  0.25 + Math.random() * 0.2,
                  0.28 + Math.random() * 0.2
                ),
              };
              spheres.push(sphere);
              scene.add(sphere);
            }

            // 連結（チェーン）：0-1-2-...-N （各球の次数<=2）
            for (let i = 0; i < SPHERE_COUNT - 1; i++) {
              const a = i;
              const b = i + 1;
              const geom = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(),
                new THREE.Vector3(),
              ]);
              const line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0xffffff }));
              scene.add(line);
              lines.push({ line, a, b });
            }

            placedRef.current = true;
          }
        }

        // 球体を静かに揺らす（掴まれていないもののみ）
        if (_time !== undefined) {
          const t = _time * 0.001; // ms -> s
          for (const s of spheres) {
            const hv = (s as any).userData?.hover;
            const grabbed = !!(s as any).userData?.grabbed;
            if (!hv || grabbed) continue;
            const px = hv.base.x + Math.sin(hv.speed.x * t + hv.phase.x) * hv.amp.x;
            const py = hv.base.y + Math.sin(hv.speed.y * t + hv.phase.y) * hv.amp.y;
            const pz = hv.base.z + Math.sin(hv.speed.z * t + hv.phase.z) * hv.amp.z;
            s.position.set(px, py, pz);
          }
        }

        // 掴んでいる球体があれば、±3（3つ先）にのみ減衰付きで引っ張り影響
        for (const ctrl of controllersRef.current) {
          const sel = (ctrl as any).userData?.selected as THREE.Mesh | undefined;
          if (!sel) continue;
          const selIdx: number | undefined = (sel as any).userData?.idx;
          if (selIdx === undefined) continue;
          const selWorld = new THREE.Vector3();
          sel.getWorldPosition(selWorld);
          const applyPull = (neighborIdx: number) => {
            if (neighborIdx < 0 || neighborIdx >= spheres.length) return;
            const n = spheres[neighborIdx];
            if ((n as any).userData?.grabbed) return;
            // 強めに引っ張る: 係数を上げ、距離減衰を緩める
            const baseWeight = 0.5; // 0.2 -> 0.5 に増強
            const nWorld = new THREE.Vector3();
            n.getWorldPosition(nWorld);
            const d = nWorld.distanceTo(selWorld);
            const distAtten = 1 / (1 + d * 1.0); // 2.5 -> 1.0 に緩和
            const alpha = Math.min(0.85, baseWeight * distAtten);
            // 現在位置を選択球に向けて補間
            n.position.lerp(selWorld, alpha);
            // 影響を受けたことを記録
            const set: Set<number> = (ctrl as any).userData.pulledIndices || new Set<number>();
            set.add(neighborIdx);
            (ctrl as any).userData.pulledIndices = set;
          };
          applyPull(selIdx - 3);
          applyPull(selIdx + 3);
        }

        // ラインの更新（毎フレーム）
        for (const { line, a, b } of lines) {
          const pa = new THREE.Vector3();
          const pb = new THREE.Vector3();
          spheres[a].getWorldPosition(pa);
          spheres[b].getWorldPosition(pb);
          const posAttr = line.geometry.getAttribute('position') as THREE.BufferAttribute;
          posAttr.setXYZ(0, pa.x, pa.y, pa.z);
          posAttr.setXYZ(1, pb.x, pb.y, pb.z);
          posAttr.needsUpdate = true;
        }
      } else {
        // 非XR時: 何もしない（必要ならデモ用アニメを入れられます）
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
      // コントローラのイベント解除
      controllersRef.current.forEach((c) => {
        (c as any).removeEventListener('selectstart', onSelectStart);
        (c as any).removeEventListener('selectend', onSelectEnd);
      });
      controllersRef.current = [];
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
      sphereGeometry.dispose();
      // マテリアルとラインの破棄
      scene.traverse((obj) => {
        if ((obj as any).isLine) {
          (obj as THREE.Line).geometry.dispose();
          ((obj as THREE.Line).material as THREE.Material).dispose();
        }
      });
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
