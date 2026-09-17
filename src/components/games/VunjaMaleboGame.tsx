/* eslint-disable react-hooks/refs, react-hooks/immutability, react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { arcadeSound } from '@/lib/arcadeSound';
import { ArcadeModal } from '@/components/ArcadeModal';
import { Flame, Trophy, Zap, RefreshCw } from 'lucide-react';

interface Props {
  onClose: () => void;
  onFinish?: (score: number) => void;
}

interface BottleObject {
  id: string;
  mesh: THREE.Group;
  velocity: THREE.Vector3;
  rotSpeed: THREE.Vector3;
  type: 'beer' | 'liquor' | 'wine' | 'bonus_water';
  points: number;
}

interface ShardObject {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotSpeed: THREE.Vector3;
  life: number;
  maxLife: number;
}

interface FloatingLabel {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

export function VunjaMaleboGame({ onClose, onFinish }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [timeLeft, setTimeLeft] = useState(45);
  const [bottlesSmashed, setBottlesSmashed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [floatLabels, setFloatLabels] = useState<FloatingLabel[]>([]);

  const scoreRef = useRef(0);
  scoreRef.current = score;
  const comboRef = useRef(1);
  comboRef.current = combo;
  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bottlesListRef = useRef<BottleObject[]>([]);
  const shardsListRef = useRef<ShardObject[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef(0);
  const shakeIntensityRef = useRef(0);

  // Materials Cache
  const materialsRef = useRef<{ [key: string]: THREE.Material }>({});

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 550;
    const height = Math.min(window.innerHeight * 0.58, 480);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x131e1a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffeedd, 1.4);
    dirLight1.position.set(6, 12, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xc8ef61, 0.8);
    dirLight2.position.set(-6, -6, 8);
    scene.add(dirLight2);

    // Decorative 3D backplate grid
    const gridHelper = new THREE.GridHelper(24, 16, 0x22352c, 0x182821);
    gridHelper.position.set(0, -6, 0);
    scene.add(gridHelper);

    // Initialize bottle materials
    materialsRef.current = {
      beer: new THREE.MeshStandardMaterial({
        color: 0xc87018,
        roughness: 0.15,
        metalness: 0.1,
      }),
      liquor: new THREE.MeshStandardMaterial({
        color: 0x991b1b,
        roughness: 0.2,
        metalness: 0.15,
      }),
      wine: new THREE.MeshStandardMaterial({
        color: 0x065f46,
        roughness: 0.18,
        metalness: 0.1,
      }),
      bonus_water: new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.1,
        metalness: 0.3,
        emissive: 0x0284c7,
        emissiveIntensity: 0.35,
      }),
      cap: new THREE.MeshStandardMaterial({
        color: 0xd4d4d8,
        metalness: 0.8,
        roughness: 0.3,
      }),
      label: new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        roughness: 0.8,
      }),
    };

    // Animation Loop
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Handle Camera Shake
      if (shakeIntensityRef.current > 0.001) {
        camera.position.x = (Math.random() - 0.5) * shakeIntensityRef.current * 1.5;
        camera.position.y = (Math.random() - 0.5) * shakeIntensityRef.current * 1.5;
        shakeIntensityRef.current *= 0.88;
      } else {
        camera.position.x = 0;
        camera.position.y = 0;
      }

      // Game Logic updates when playing
      if (isPlayingRef.current) {
        // Spawn bottles periodically
        if (now - lastSpawnTimeRef.current > 750) {
          spawnBottle();
          lastSpawnTimeRef.current = now;
        }

        // Update bottles
        for (let i = bottlesListRef.current.length - 1; i >= 0; i--) {
          const b = bottlesListRef.current[i];
          b.mesh.position.addScaledVector(b.velocity, dt);
          b.mesh.rotation.x += b.rotSpeed.x * dt;
          b.mesh.rotation.y += b.rotSpeed.y * dt;
          b.mesh.rotation.z += b.rotSpeed.z * dt;

          // Remove if fallen past bottom
          if (b.mesh.position.y < -8) {
            scene.remove(b.mesh);
            bottlesListRef.current.splice(i, 1);
            // Missed bottle resets combo
            comboRef.current = 1;
            setCombo(1);
          }
        }
      }

      // Update exploding shards
      for (let j = shardsListRef.current.length - 1; j >= 0; j--) {
        const shard = shardsListRef.current[j];
        shard.velocity.y -= 14 * dt; // gravity
        shard.mesh.position.addScaledVector(shard.velocity, dt);
        shard.mesh.rotation.x += shard.rotSpeed.x * dt;
        shard.mesh.rotation.y += shard.rotSpeed.y * dt;

        shard.life -= dt;
        const scaleFactor = Math.max(0, shard.life / shard.maxLife);
        shard.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

        if (shard.life <= 0) {
          scene.remove(shard.mesh);
          shardsListRef.current.splice(j, 1);
        }
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Resize listener
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = Math.min(window.innerHeight * 0.58, 480);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Helper: Create a 3D Bottle Group
  const createBottleMesh = (type: 'beer' | 'liquor' | 'wine' | 'bonus_water'): THREE.Group => {
    const group = new THREE.Group();
    const mat = materialsRef.current[type] || materialsRef.current.beer;

    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.75, 0.75, 2.2, 16);
    const body = new THREE.Mesh(bodyGeo, mat);
    body.position.y = 0;
    body.castShadow = true;
    group.add(body);

    // Shoulder
    const shoulderGeo = new THREE.CylinderGeometry(0.38, 0.75, 0.8, 16);
    const shoulder = new THREE.Mesh(shoulderGeo, mat);
    shoulder.position.y = 1.45;
    group.add(shoulder);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.3, 0.35, 1.1, 16);
    const neck = new THREE.Mesh(neckGeo, mat);
    neck.position.y = 2.3;
    group.add(neck);

    // Cap
    const capGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.3, 16);
    const cap = new THREE.Mesh(capGeo, materialsRef.current.cap);
    cap.position.y = 2.95;
    group.add(cap);

    // Label on beer / liquor
    if (type !== 'bonus_water') {
      const labelGeo = new THREE.CylinderGeometry(0.76, 0.76, 1.0, 16);
      const label = new THREE.Mesh(labelGeo, materialsRef.current.label);
      label.position.y = 0;
      group.add(label);
    } else {
      // Glow ring for bonus water
      const ringGeo = new THREE.TorusGeometry(0.85, 0.08, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
    }

    group.scale.set(0.9, 0.9, 0.9);
    return group;
  };

  // Spawn bottle
  const spawnBottle = () => {
    if (!sceneRef.current) return;

    const types: Array<'beer' | 'liquor' | 'wine' | 'bonus_water'> = [
      'beer',
      'beer',
      'liquor',
      'wine',
      'bonus_water',
    ];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    const mesh = createBottleMesh(chosenType);

    // Random X between -5.5 and 5.5
    const spawnX = (Math.random() - 0.5) * 11;
    mesh.position.set(spawnX, 8.5, (Math.random() - 0.5) * 2);

    const fallSpeed = 3.5 + Math.random() * 2.2;
    const bObj: BottleObject = {
      id: Math.random().toString(36).substring(2, 9),
      mesh,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.8, -fallSpeed, 0),
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 2
      ),
      type: chosenType,
      points: chosenType === 'bonus_water' ? 30 : 15,
    };

    sceneRef.current.add(mesh);
    bottlesListRef.current.push(bObj);
  };

  // Explode bottle into 3D polygon shards
  const explodeBottle = (pos: THREE.Vector3, type: string) => {
    if (!sceneRef.current) return;
    const shardCount = 24;
    const baseColor =
      type === 'beer'
        ? 0xc87018
        : type === 'liquor'
        ? 0x991b1b
        : type === 'bonus_water'
        ? 0x38bdf8
        : 0x065f46;

    const shardGeo = new THREE.TetrahedronGeometry(0.28, 0);

    for (let i = 0; i < shardCount; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.2,
        metalness: 0.1,
      });
      const shardMesh = new THREE.Mesh(shardGeo, mat);
      shardMesh.position.copy(pos);
      shardMesh.scale.set(
        0.5 + Math.random() * 0.8,
        0.5 + Math.random() * 0.8,
        0.5 + Math.random() * 0.8
      );

      // Spherical burst velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 4 + Math.random() * 7;
      const velocity = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.abs(Math.sin(phi) * Math.sin(theta)) * speed + 2,
        Math.cos(phi) * speed
      );

      sceneRef.current.add(shardMesh);
      shardsListRef.current.push({
        mesh: shardMesh,
        velocity,
        rotSpeed: new THREE.Vector3(
          Math.random() * 12,
          Math.random() * 12,
          Math.random() * 12
        ),
        life: 0.9 + Math.random() * 0.4,
        maxLife: 1.3,
      });
    }

    // Trigger Camera Shake
    shakeIntensityRef.current = 0.4;
  };

  // Click & Touch Raycaster Smash
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPlaying || !cameraRef.current || !rendererRef.current || !sceneRef.current) return;

    const rect = rendererRef.current.domElement.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    // Gather all meshes in active bottles
    const candidates: THREE.Object3D[] = [];
    bottlesListRef.current.forEach(b => {
      b.mesh.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.userData = { parentBottleId: b.id };
          candidates.push(child);
        }
      });
    });

    const intersects = raycaster.intersectObjects(candidates, true);

    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      const bottleId = hitObj.userData.parentBottleId;
      const index = bottlesListRef.current.findIndex(b => b.id === bottleId);

      if (index !== -1) {
        const bottle = bottlesListRef.current[index];
        const worldPos = bottle.mesh.position.clone();

        // Remove from scene and list
        sceneRef.current.remove(bottle.mesh);
        bottlesListRef.current.splice(index, 1);

        // Sound effect
        if (bottle.type === 'bonus_water') {
          arcadeSound.playCoin();
        } else {
          arcadeSound.playSmash();
        }

        // 3D Glass Explosion
        explodeBottle(worldPos, bottle.type);

        // Compute points & combo
        const currentCombo = comboRef.current;
        const ptsGained = bottle.points * currentCombo;
        setScore(prev => prev + ptsGained);
        setBottlesSmashed(prev => prev + 1);

        // Increase combo
        const nextCombo = Math.min(currentCombo + 1, 5);
        comboRef.current = nextCombo;
        setCombo(nextCombo);

        // Spawn floating indicator on screen
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const labelId = Math.random().toString(36).substring(2, 7);
        setFloatLabels(prev => [
          ...prev,
          {
            id: labelId,
            x: screenX,
            y: screenY,
            text: `+${ptsGained} ${currentCombo > 1 ? `(${currentCombo}x COMBO!)` : ''}`,
            color: bottle.type === 'bonus_water' ? '#38bdf8' : '#c8ef61',
          },
        ]);

        setTimeout(() => {
          setFloatLabels(prev => prev.filter(l => l.id !== labelId));
        }, 800);
      }
    } else {
      // Missed click
      arcadeSound.playPop();
    }
  };

  // Start game countdown
  const startGame = () => {
    // Clear existing bottles
    if (sceneRef.current) {
      bottlesListRef.current.forEach(b => sceneRef.current?.remove(b.mesh));
      shardsListRef.current.forEach(s => sceneRef.current?.remove(s.mesh));
    }
    bottlesListRef.current = [];
    shardsListRef.current = [];

    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setCombo(1);
    setTimeLeft(45);
    setBottlesSmashed(0);
    setFloatLabels([]);
    arcadeSound.playSuccess();
  };

  // Timer effect
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsPlaying(false);
          setGameOver(true);
          arcadeSound.playSuccess();
          confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
          if (onFinish) onFinish(scoreRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, onFinish]);

  return (
    <ArcadeModal
      title="Bottle Shatter"
      subtitle="Tap the bottles"
      icon="🍾"
      onClose={onClose}
      headerStats={
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-amber-400" />
            <span>Score: <strong className="text-[#c8ef61]">{score}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Flame size={14} className="text-[#e05d38]" />
            <span>Multiplier: <strong className="text-amber-400">{combo}x</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>Smashed: <strong className="text-white">{bottlesSmashed}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>Time: <strong className={timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-white'}>{timeLeft}s</strong></span>
          </div>
        </div>
      }
    >
      <div className="relative w-full flex flex-col items-center">
        {/* 3D WebGL Canvas Container */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          className="game-arena relative min-h-[300px] h-[min(420px,58vh)] w-full rounded-2xl border-4 border-[#0f1715] overflow-hidden shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)] cursor-crosshair select-none touch-none"
        >
          {/* Floating score text labels */}
          {floatLabels.map(lbl => (
            <div
              key={lbl.id}
              style={{ left: lbl.x, top: lbl.y }}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 font-display text-base font-black uppercase tracking-wider drop-shadow-md animate-out fade-out slide-out-to-top duration-700"
            >
              <span style={{ color: lbl.color }}>{lbl.text}</span>
            </div>
          ))}

          {/* Pre-Game Start Overlay */}
          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm p-6 text-center text-white">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-3 border-white/20 bg-[#e05d38] text-4xl shadow-[0_6px_0_#0f1715] mb-4">
                🍾
              </div>
              <h3 className="font-display text-2xl font-black uppercase tracking-wide text-white">
                Shatter the urge
              </h3>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-300">
                Tap the bottles before they fall. Keep your streak going for a higher score.
              </p>

              <div className="mt-4 flex items-center gap-4 text-[11px] font-mono text-slate-300">
                <span className="flex items-center gap-1.5"><span className="text-amber-400">●</span> Beer / Wine: +15</span>
                <span className="flex items-center gap-1.5"><span className="text-sky-400">●</span> Hydration Flask: +30</span>
              </div>

              <button
                onClick={startGame}
                className="mt-6 flex items-center gap-2 rounded-xl border-3 border-[#0f1715] bg-[#c8ef61] px-8 py-3 font-display text-sm font-black uppercase tracking-wider text-[#0f1715] shadow-[0_5px_0_#0f1715] hover:bg-[#bde64d] active:translate-y-1 active:shadow-none transition-all"
              >
                <Zap size={18} className="fill-[#0f1715]" />
                <span>START GAME</span>
              </button>
            </div>
          )}

          {/* Game Over Modal */}
          {gameOver && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6 text-center text-white">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-amber-400 bg-amber-500/20 text-3xl mb-3">
                🏆
              </div>
              <h3 className="font-display text-2xl font-black uppercase text-[#c8ef61]">
                Urge Loop Broken!
              </h3>
              <p className="mt-1 text-xs text-slate-300">
                You shattered <strong>{bottlesSmashed} temptation bottles</strong> and scored <strong>{score} points</strong>.
              </p>

              <div className="my-4 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-mono text-xs">
                <span>Tokens Earned: <strong className="text-[#c8ef61] font-bold">+{Math.max(10, Math.floor(score / 15))} 🪙</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 rounded-xl border-2 border-[#0f1715] bg-[#c8ef61] px-5 py-2.5 font-display text-xs font-black uppercase text-[#0f1715] shadow-[0_4px_0_#0f1715] hover:bg-[#bde64d] active:translate-y-1 active:shadow-none"
                >
                  <RefreshCw size={14} />
                  <span>PLAY AGAIN</span>
                </button>
                <button
                  onClick={onClose}
                  className="rounded-xl border-2 border-white/30 bg-white/10 px-5 py-2.5 font-display text-xs font-black uppercase text-white hover:bg-white/20"
                >
                  RETURN TO ARCADE
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tactile guidance footnote */}
        <div className="mt-3 flex items-center justify-between w-full text-[11px] font-mono text-slate-600 px-2">
          <span>⚡ <strong>Tip:</strong> Tap quickly to build your streak.</span>
        </div>
      </div>
    </ArcadeModal>
  );
}
