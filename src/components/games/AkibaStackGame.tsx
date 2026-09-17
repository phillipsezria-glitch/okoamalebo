/* eslint-disable react-hooks/refs, prefer-const */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { arcadeSound } from '@/lib/arcadeSound';
import { ArcadeModal } from '@/components/ArcadeModal';
import { Coins, ArrowDown, Award, RefreshCw, DollarSign } from 'lucide-react';

interface Props {
  onClose: () => void;
  onFinish?: (score: number) => void;
}

interface StackedCoin {
  x: number; // percentage center 15 to 85
  width: number;
  wobble: number;
}

const MILESTONES: string[] = [
  'Day 1 Solid Foundation',
  '$15 Saved: Nourishing Dinner',
  '$30 Saved: No Morning Hangover',
  '$45 Saved: Peace of Mind & Deep REM Sleep',
  '$60 Saved: Family Trust & Dignity',
  '$75 Saved: Liver & Cardiovascular Recovery',
  '$100 Saved: Personal Savings Milestone',
  '$125 Saved: Clean Energy & Mental Power',
  '$150+ Saved: Monument to Freedom!',
];

export function AkibaStackGame({ onClose, onFinish }: Props) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [coins, setCoins] = useState<StackedCoin[]>([]);
  const [sliderX, setSliderX] = useState<number>(50);
  const [sliderDirection, setSliderDirection] = useState<number>(1);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const animRef = useRef<number | null>(null);
  const sliderXRef = useRef(50);
  sliderXRef.current = sliderX;
  const coinsRef = useRef<StackedCoin[]>([]);
  coinsRef.current = coins;

  const COIN_WIDTH = 28; // percentage width

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    // Base foundation coin
    setCoins([{ x: 50, width: 34, wobble: 0 }]);
    setSliderX(50);
    setSliderDirection(1);
    arcadeSound.playCoin();
  };

  // Slider animation loop
  useEffect(() => {
    if (!isPlaying || gameOver) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let prevTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;

      setSliderX(curr => {
        let dir = sliderDirection;
        const speed = 42 + Math.min(coinsRef.current.length * 3.8, 55);
        let next = curr + dir * speed * dt;

        if (next >= 82) {
          next = 82;
          setSliderDirection(-1);
        } else if (next <= 18) {
          next = 18;
          setSliderDirection(1);
        }

        return next;
      });

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, gameOver, sliderDirection]);

  // Drop Coin Action
  const dropCoin = useCallback(() => {
    if (!isPlaying || gameOver) return;

    const currentX = sliderXRef.current;
    const topCoin = coinsRef.current[coinsRef.current.length - 1];

    if (!topCoin) return;

    const diff = currentX - topCoin.x;
    const allowedTolerance = (topCoin.width / 2) + 2;

    // Check if missed completely
    if (Math.abs(diff) > allowedTolerance) {
      // Missed the pedestal!
      arcadeSound.playSmash();
      setGameOver(true);
      setIsPlaying(false);
      const finalScore = coinsRef.current.length;
      if (onFinish) onFinish(finalScore);
      return;
    }

    // Hit the coin
    arcadeSound.playCoin();
    const isPerfect = Math.abs(diff) < 2.5;

    let newWidth = topCoin.width;
    let newX = currentX;

    if (!isPerfect) {
      // Trim slightly for realistic overhang
      const trimAmount = Math.abs(diff);
      newWidth = Math.max(14, topCoin.width - trimAmount);
      newX = currentX > topCoin.x ? topCoin.x + (trimAmount / 2) : topCoin.x - (trimAmount / 2);
    } else {
      arcadeSound.playSuccess();
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }

    const wobbleAngle = (diff / topCoin.width) * 12;

    const nextStack = [...coinsRef.current, { x: newX, width: newWidth, wobble: wobbleAngle }];
    setCoins(nextStack);

    // If reached 15+ coins
    if (nextStack.length % 5 === 0) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
    }
  }, [isPlaying, gameOver, onFinish]);

  const currentHeight = coins.length;
  const milestoneIndex = Math.min(Math.floor(currentHeight / 2), MILESTONES.length - 1);
  const currentMilestone = MILESTONES[milestoneIndex];

  return (
    <ArcadeModal
      title="Savings Stacker"
      subtitle="Drop coins carefully"
      icon="🪙"
      onClose={onClose}
      headerStats={
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Coins size={14} className="text-amber-400" />
            <span>Coins Stacked: <strong className="text-[#c8ef61]">{coins.length}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-emerald-400" />
            <span>Value Saved: <strong className="text-white">${coins.length * 15}</strong></span>
          </div>
        </div>
      }
    >
      <div className="relative w-full flex flex-col items-center">
        {/* 3D Stacking Arena */}
        <div
          style={{ perspective: '900px' }}
          className="game-arena relative min-h-[300px] h-[min(400px,58vh)] w-full rounded-2xl border-4 border-[#0f1715] overflow-hidden bg-gradient-to-b from-[#1b2b24] via-[#16231e] to-[#0f1715] shadow-[inset_0_10px_30px_rgba(0,0,0,0.7)] select-none cursor-pointer"
          onClick={dropCoin}
        >
          {/* Milestone Indicator Banner */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-xl border-2 border-amber-400/40 bg-black/80 px-4 py-1.5 font-mono text-xs font-bold text-amber-300 shadow-md">
            <Award size={14} className="text-amber-400" />
            <span>{currentMilestone}</span>
          </div>

          {/* Swinging Slider 3D Coin at Top */}
          {isPlaying && !gameOver && (
            <div
              style={{
                left: `${sliderX}%`,
                top: '60px',
                width: `${COIN_WIDTH}%`,
                transform: 'translateX(-50%) rotateX(25deg)',
                transformStyle: 'preserve-3d',
              }}
              className="absolute z-20 flex flex-col items-center pointer-events-none"
            >
              {/* Top Face */}
              <div className="relative flex h-8 w-full items-center justify-center rounded-full border-2 border-amber-200 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 shadow-[0_4px_0_#92400e,0_8px_16px_rgba(0,0,0,0.5)]">
                <span className="font-mono text-xs font-black text-amber-950">🪙 DROP</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-[9px] font-black uppercase text-amber-300 animate-bounce">
                <ArrowDown size={12} />
                <span>TAP TO DROP</span>
              </div>
            </div>
          )}

          {/* 3D Stack of Coins on Pedestal */}
          <div
            style={{
              transformStyle: 'preserve-3d',
              transform: 'rotateX(20deg)',
              bottom: '24px',
            }}
            className="absolute inset-x-0 flex flex-col-reverse items-center pointer-events-none"
          >
            {/* Wooden Base Pedestal */}
            <div className="relative h-10 w-48 rounded-full border-3 border-[#0f1715] bg-gradient-to-b from-[#78350f] via-[#92400e] to-[#451a03] shadow-[0_8px_0_#0f1715,0_12px_24px_rgba(0,0,0,0.8)] flex items-center justify-center">
              <span className="font-mono text-[10px] font-black uppercase tracking-wider text-amber-200/80">
                SOBRIETY FOUNDATION
              </span>
            </div>

            {/* Rendered Coins from bottom to top */}
            {coins.map((coin, index) => {
              // Camera shift: stack visible in center
              return (
                <div
                  key={index}
                  style={{
                    left: `${coin.x}%`,
                    width: `${coin.width}%`,
                    transform: `translateX(-50%) rotate(${coin.wobble}deg) translateZ(${index * 4}px)`,
                    marginBottom: '-12px',
                  }}
                  className="relative z-10 flex flex-col items-center transition-transform duration-100"
                >
                  {/* 3D Cylinder Coin Body */}
                  <div className="relative flex h-7 w-full items-center justify-center rounded-full border-2 border-amber-200 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_4px_0_#78350f,0_6px_12px_rgba(0,0,0,0.4)]">
                    <div className="absolute inset-1 rounded-full border border-amber-100/50 flex items-center justify-center">
                      <span className="font-mono text-[10px] font-black text-amber-950">
                        ${(index + 1) * 15}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Start Overlay */}
          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm p-6 text-center text-white">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-3 border-white/20 bg-amber-500 text-4xl shadow-[0_6px_0_#0f1715] mb-4">
                🪙
              </div>
              <h3 className="font-display text-2xl font-black uppercase text-white">
                Savings Stacker
              </h3>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-300">
                Drop each coin onto the stack. Keep it balanced as it grows.
              </p>

              <button
                onClick={e => {
                  e.stopPropagation();
                  startGame();
                }}
                className="mt-6 flex items-center gap-2 rounded-xl border-3 border-[#0f1715] bg-[#c8ef61] px-8 py-3 font-display text-sm font-black uppercase tracking-wider text-[#0f1715] shadow-[0_5px_0_#0f1715] hover:bg-[#bde64d] active:translate-y-1 active:shadow-none transition-all"
              >
                <Coins size={18} className="fill-[#0f1715]" />
                <span>START GAME</span>
              </button>
            </div>
          )}

          {/* Game Over Modal */}
          {gameOver && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6 text-center text-white">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-amber-400 bg-amber-500/20 text-3xl mb-3">
                🪙
              </div>
              <h3 className="font-display text-2xl font-black uppercase text-[#c8ef61]">
                Tower Stabilized!
              </h3>
              <p className="mt-1 text-xs text-slate-300">
                You successfully balanced <strong>{coins.length} coins</strong> representing <strong>${coins.length * 15}</strong> in saved capital.
              </p>

              <div className="my-4 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-mono text-xs">
                <span>Tokens Earned: <strong className="text-[#c8ef61] font-bold">+{Math.max(10, coins.length * 2)} 🪙</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    startGame();
                  }}
                  className="flex items-center gap-2 rounded-xl border-2 border-[#0f1715] bg-[#c8ef61] px-5 py-2.5 font-display text-xs font-black uppercase text-[#0f1715] shadow-[0_4px_0_#0f1715] hover:bg-[#bde64d] active:translate-y-1 active:shadow-none"
                >
                  <RefreshCw size={14} />
                  <span>PLAY AGAIN</span>
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="rounded-xl border-2 border-white/30 bg-white/10 px-5 py-2.5 font-display text-xs font-black uppercase text-white hover:bg-white/20"
                >
                  RETURN TO ARCADE
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tactile Big Drop Button */}
        <div className="mt-3 w-full">
          <button
            onClick={dropCoin}
            disabled={!isPlaying || gameOver}
            className="w-full flex items-center justify-center gap-2 rounded-xl border-3 border-[#0f1715] bg-[#eab308] py-3 font-display text-sm font-black uppercase tracking-wider text-[#0f1715] shadow-[0_5px_0_#0f1715] hover:bg-[#ca8a04] active:translate-y-1 active:shadow-none disabled:opacity-50 transition-all"
          >
            <ArrowDown size={18} />
            <span>DROP COIN</span>
          </button>
        </div>
      </div>
    </ArcadeModal>
  );
}
