/* eslint-disable react-hooks/refs */
import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { arcadeSound } from '@/lib/arcadeSound';
import { ArcadeModal } from '@/components/ArcadeModal';
import { ArrowLeft, ArrowRight, Sparkles, Heart, RefreshCw } from 'lucide-react';

interface Props {
  onClose: () => void;
  onFinish?: (score: number) => void;
}

interface FallingGardenItem {
  id: string;
  x: number; // percentage 10% to 90%
  y: number; // percentage 0% to 105%
  speed: number;
  type: 'good' | 'bad';
  icon: string;
  name: string;
  points: number;
  rotation: number;
  rotSpeed: number;
}

const GOOD_ITEMS = [
  { icon: '💧', name: 'Hydration Flask', points: 25 },
  { icon: '🍏', name: 'Fresh Nutrition', points: 20 },
  { icon: '👟', name: 'Morning Movement', points: 30 },
  { icon: '📞', name: 'Call a Friend', points: 35 },
  { icon: '🌙', name: 'Restful Sleep', points: 25 },
  { icon: '📖', name: 'Mindful Reading', points: 20 },
];

const BAD_ITEMS = [
  { icon: '🍾', name: 'Liquor Urge', points: -30 },
  { icon: '🍸', name: 'Bar Temptation', points: -25 },
  { icon: '🚬', name: 'Nicotine Trap', points: -20 },
  { icon: '🍺', name: 'Peer Pressure', points: -25 },
];

export function GroundingGardenGame({ onClose, onFinish }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [basketX, setBasketX] = useState(50); // percentage 15 to 85
  const [basketTilt, setBasketTilt] = useState(0); // degrees
  const [timeLeft, setTimeLeft] = useState(45);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [items, setItems] = useState<FallingGardenItem[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);

  const animRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const basketXRef = useRef(50);
  basketXRef.current = basketX;
  const scoreRef = useRef(0);
  scoreRef.current = score;

  const courtRef = useRef<HTMLDivElement>(null);

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setStreak(0);
    setTimeLeft(45);
    setItems([]);
    setBasketX(50);
    setBasketTilt(0);
    lastSpawnRef.current = performance.now();
    arcadeSound.playPop();
  };

  // Countdown timer
  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsPlaying(false);
          setGameOver(true);
          arcadeSound.playSuccess();
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          if (onFinish) onFinish(scoreRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, onFinish]);

  // Keyboard navigation
  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setBasketX(x => Math.max(14, x - 7));
        setBasketTilt(-12);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setBasketX(x => Math.min(86, x + 7));
        setBasketTilt(12);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) {
        setBasketTilt(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying]);

  // Pointer drag on court for smooth touch and mouse controls
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPlaying || !courtRef.current) return;
    const rect = courtRef.current.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(14, Math.min(86, relativeX));
    const delta = clamped - basketXRef.current;
    setBasketTilt(Math.max(-15, Math.min(15, delta * 2)));
    setBasketX(clamped);
  };

  // Main 3D Physics Loop
  useEffect(() => {
    if (!isPlaying || gameOver) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let prevTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;

      // Spawn new 3D falling items
      if (now - lastSpawnRef.current > 780) {
        lastSpawnRef.current = now;
        const isGood = Math.random() > 0.35;
        const template = isGood
          ? GOOD_ITEMS[Math.floor(Math.random() * GOOD_ITEMS.length)]
          : BAD_ITEMS[Math.floor(Math.random() * BAD_ITEMS.length)];

        const newItem: FallingGardenItem = {
          id: Math.random().toString(36).substring(2, 9),
          x: 15 + Math.random() * 70,
          y: 0,
          speed: 16 + Math.random() * 12,
          type: isGood ? 'good' : 'bad',
          icon: template.icon,
          name: template.name,
          points: template.points,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 80,
        };

        setItems(prev => [...prev, newItem]);
      }

      // Update positions and detect catches
      setItems(prev => {
        const next: FallingGardenItem[] = [];
        const currentBasketX = basketXRef.current;
        const catchZoneY = 88; // collision line
        const catchThresholdX = 13; // half width of 3D basket

        for (const item of prev) {
          const updatedY = item.y + item.speed * dt;
          const updatedRot = item.rotation + item.rotSpeed * dt;

          // Catch check
          if (updatedY >= catchZoneY && updatedY <= catchZoneY + 10) {
            const distance = Math.abs(item.x - currentBasketX);
            if (distance < catchThresholdX) {
              // Item caught!
              if (item.type === 'good') {
                arcadeSound.playCoin();
                setScore(s => s + item.points);
                setStreak(st => st + 1);
                setFeedback({ text: `+${item.points} ${item.name}!`, color: '#c8ef61' });
              } else {
                arcadeSound.playSmash();
                setScore(s => Math.max(0, s + item.points));
                setStreak(0);
                setFeedback({ text: `${item.points} Avoid ${item.name}!`, color: '#f87171' });
              }
              continue; // Caught, don't keep falling
            }
          }

          // Discard fallen past bottom
          if (updatedY < 110) {
            next.push({
              ...item,
              y: updatedY,
              rotation: updatedRot,
            });
          }
        }
        return next;
      });

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, gameOver]);

  return (
    <ArcadeModal
      title="Grounding Garden"
      subtitle="Catch healthy choices"
      icon="🌱"
      onClose={onClose}
      headerStats={
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#c8ef61]" />
            <span>Score: <strong className="text-[#c8ef61]">{score}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Heart size={14} className="text-rose-400" />
            <span>Streak: <strong className="text-white">{streak}x</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>Time: <strong className={timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-white'}>{timeLeft}s</strong></span>
          </div>
        </div>
      }
    >
      <div className="relative w-full flex flex-col items-center">
        {/* 3D Perspective Court Stage */}
        <div
          ref={courtRef}
          onPointerMove={handlePointerMove}
          style={{ perspective: '850px' }}
          className="game-arena relative min-h-[300px] h-[min(400px,58vh)] w-full rounded-2xl border-4 border-[#0f1715] overflow-hidden bg-gradient-to-b from-[#11241a] via-[#163524] to-[#0c1f15] shadow-[inset_0_10px_30px_rgba(0,0,0,0.8)] select-none cursor-ew-resize touch-none"
        >
          {/* 3D Perspective Depth Grid Plane */}
          <div
            style={{
              transform: 'rotateX(28deg) translateY(-20px)',
              transformOrigin: 'bottom center',
            }}
            className="absolute inset-0 pointer-events-none opacity-25"
          >
            <div className="h-full w-full bg-[linear-gradient(to_right,#c8ef61_1px,transparent_1px),linear-gradient(to_bottom,#c8ef61_1px,transparent_1px)] bg-[size:4rem_3rem]" />
          </div>

          {/* Feedback floating banner */}
          {feedback && (
            <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-20 rounded-xl border-2 border-[#0f1715] bg-[#0f1715] px-4 py-1.5 font-display text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_0_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-150">
              <span style={{ color: feedback.color }}>{feedback.text}</span>
            </div>
          )}

          {/* Falling 3D Items */}
          {items.map(item => {
            // Depth scaling: objects get slightly larger and cast a clearer shadow as they descend
            const depthScale = 0.75 + (item.y / 100) * 0.4;
            const shadowOpacity = Math.min(0.7, (item.y / 100) * 0.9);

            return (
              <div
                key={item.id}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: `translate(-50%, -50%) scale(${depthScale}) rotate(${item.rotation}deg)`,
                }}
                className="absolute z-10 flex flex-col items-center pointer-events-none transition-transform duration-75"
              >
                {/* 3D Simulated Ground Shadow */}
                <div
                  style={{
                    opacity: shadowOpacity,
                    transform: `translateY(${28 * depthScale}px) scaleX(1.4) scaleY(0.4)`,
                  }}
                  className="absolute h-4 w-8 rounded-full bg-black/70 blur-[2px]"
                />

                {/* 3D Item Sphere */}
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white/40 shadow-[0_6px_12px_rgba(0,0,0,0.5)] ${
                    item.type === 'good'
                      ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-300'
                      : 'bg-gradient-to-tr from-rose-700 via-rose-600 to-amber-500'
                  }`}
                >
                  <span className="text-2xl filter drop-shadow select-none">{item.icon}</span>
                </div>
                <span className="mt-1 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white whitespace-nowrap shadow">
                  {item.name}
                </span>
              </div>
            );
          })}

          {/* 3D Catcher Basket */}
          <div
            style={{
              left: `${basketX}%`,
              bottom: '18px',
              transform: `translateX(-50%) rotate(${basketTilt}deg) translateZ(20px)`,
              transition: 'transform 0.05s ease-out',
            }}
            className="absolute z-20 flex flex-col items-center pointer-events-none"
          >
            {/* Basket Shadow */}
            <div className="absolute -bottom-2 h-4 w-28 rounded-full bg-black/80 blur-[4px]" />

            {/* 3D Basket Body */}
            <div className="relative flex h-14 w-28 items-center justify-center rounded-2xl border-3 border-[#0f1715] bg-gradient-to-b from-[#f59e0b] to-[#b45309] shadow-[0_6px_0_#451a03,0_10px_20px_rgba(0,0,0,0.6)]">
              {/* Basket rim & weave highlight */}
              <div className="absolute top-1 inset-x-2 h-2 rounded-full bg-amber-200/50" />
              <div className="flex items-center gap-1 font-display text-xs font-black uppercase tracking-wider text-white drop-shadow">
                <span>🧺 CATCH</span>
              </div>
            </div>
          </div>

          {/* Pre-Game Start Overlay */}
          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm p-6 text-center text-white">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-3 border-white/20 bg-emerald-600 text-4xl shadow-[0_6px_0_#0f1715] mb-4">
                🌱
              </div>
              <h3 className="font-display text-2xl font-black uppercase text-white">
                Grounding Garden
              </h3>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-300">
                Drag the basket to catch healthy choices and avoid triggers.
              </p>

              <div className="mt-4 flex items-center justify-center gap-4 text-xs font-mono text-slate-300">
                <span className="text-[#c8ef61]">● Catch: Water, Fruits, Friends (+20 to +35)</span>
                <span className="text-rose-400">● Avoid: Alcohol, Cigarettes (-20 to -30)</span>
              </div>

              <button
                onClick={startGame}
                className="mt-6 flex items-center gap-2 rounded-xl border-3 border-[#0f1715] bg-[#c8ef61] px-8 py-3 font-display text-sm font-black uppercase tracking-wider text-[#0f1715] shadow-[0_5px_0_#0f1715] hover:bg-[#bde64d] active:translate-y-1 active:shadow-none transition-all"
              >
                <Sparkles size={18} className="fill-[#0f1715]" />
                <span>START GAME</span>
              </button>
            </div>
          )}

          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6 text-center text-white">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-emerald-400 bg-emerald-500/20 text-3xl mb-3">
                🌿
              </div>
              <h3 className="font-display text-2xl font-black uppercase text-[#c8ef61]">
                Garden Grounded!
              </h3>
              <p className="mt-1 text-xs text-slate-300">
                You collected healthy choices and finished with <strong>{score} points</strong>.
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

        {/* Tactile On-Screen Arrow Controls for Touch */}
        <div className="mt-3 flex items-center justify-between w-full">
          <button
            onPointerDown={() => {
              setBasketX(x => Math.max(14, x - 10));
              setBasketTilt(-12);
            }}
            onPointerUp={() => setBasketTilt(0)}
            className="flex items-center gap-1.5 rounded-xl border-2 border-[#0f1715] bg-white px-5 py-2 font-display text-xs font-black uppercase text-[#0f1715] shadow-[0_3px_0_#0f1715] active:translate-y-1 active:shadow-none"
          >
            <ArrowLeft size={16} />
            <span>LEFT</span>
          </button>
          <span className="font-mono text-[11px] text-slate-600 hidden sm:inline">
            Drag or use the arrow buttons
          </span>
          <button
            onPointerDown={() => {
              setBasketX(x => Math.min(86, x + 10));
              setBasketTilt(12);
            }}
            onPointerUp={() => setBasketTilt(0)}
            className="flex items-center gap-1.5 rounded-xl border-2 border-[#0f1715] bg-white px-5 py-2 font-display text-xs font-black uppercase text-[#0f1715] shadow-[0_3px_0_#0f1715] active:translate-y-1 active:shadow-none"
          >
            <span>RIGHT</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </ArcadeModal>
  );
}
