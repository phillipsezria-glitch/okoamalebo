/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { arcadeSound } from '@/lib/arcadeSound';
import { ArcadeModal } from '@/components/ArcadeModal';
import { Brain, RotateCcw } from 'lucide-react';

interface Props {
  onClose: () => void;
  onFinish?: (score: number) => void;
}

interface MatrixCard {
  id: number;
  pairId: string;
  icon: string;
  name: string;
  color: string;
  flipped: boolean;
  matched: boolean;
}

const SYMBOLS = [
  { pairId: 'water', icon: '💧', name: 'Pure Hydration', color: '#0ea5e9' },
  { pairId: 'shield', icon: '🛡️', name: 'Iron Defense', color: '#64748b' },
  { pairId: 'sun', icon: '☀️', name: 'Morning Clarity', color: '#f59e0b' },
  { pairId: 'brain', icon: '🧠', name: 'Executive Mind', color: '#8b5cf6' },
  { pairId: 'run', icon: '🏃', name: 'Cardio Vitality', color: '#10b981' },
  { pairId: 'coin', icon: '🪙', name: 'Protected Wealth', color: '#eab308' },
  { pairId: 'tree', icon: '🌿', name: 'New Growth', color: '#22c55e' },
  { pairId: 'trophy', icon: '🏆', name: 'Sober Triumph', color: '#ec4899' },
];

export function AkiliMatrixGame({ onClose, onFinish }: Props) {
  const [cards, setCards] = useState<MatrixCard[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [turns, setTurns] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Initialize and shuffle 16 cards (8 pairs)
  const initializeBoard = useCallback(() => {
    const deck: MatrixCard[] = [];
    let idCounter = 0;

    SYMBOLS.forEach(sym => {
      deck.push({
        id: idCounter++,
        pairId: sym.pairId,
        icon: sym.icon,
        name: sym.name,
        color: sym.color,
        flipped: false,
        matched: false,
      });
      deck.push({
        id: idCounter++,
        pairId: sym.pairId,
        icon: sym.icon,
        name: sym.name,
        color: sym.color,
        flipped: false,
        matched: false,
      });
    });

    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setSelectedIds([]);
    setTurns(0);
    setMatchedPairs(0);
    setIsProcessing(false);
    setTimerSeconds(0);
    setGameWon(false);
    setGameStarted(true);
  }, []);

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  // Game timer
  useEffect(() => {
    if (!gameStarted || gameWon) return;

    const interval = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, gameWon]);

  // Handle 3D card click
  const handleCardClick = (id: number) => {
    if (isProcessing) return;
    const clickedCard = cards.find(c => c.id === id);
    if (!clickedCard || clickedCard.flipped || clickedCard.matched) return;

    arcadeSound.playCardFlip();

    // Flip the clicked card
    const updatedCards = cards.map(c => (c.id === id ? { ...c, flipped: true } : c));
    setCards(updatedCards);

    const newSelected = [...selectedIds, id];
    setSelectedIds(newSelected);

    // If 2 cards are now open, compare them
    if (newSelected.length === 2) {
      setIsProcessing(true);
      setTurns(t => t + 1);

      const [firstId, secondId] = newSelected;
      const firstCard = updatedCards.find(c => c.id === firstId)!;
      const secondCard = updatedCards.find(c => c.id === secondId)!;

      if (firstCard.pairId === secondCard.pairId) {
        // Matched pair!
        setTimeout(() => {
          arcadeSound.playCoin();
          setCards(prev =>
            prev.map(c =>
              c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
            )
          );
          setSelectedIds([]);
          setIsProcessing(false);
          setMatchedPairs(mp => {
            const nextVal = mp + 1;
            if (nextVal === SYMBOLS.length) {
              // Completed all 8 pairs!
              setGameWon(true);
              arcadeSound.playSuccess();
              confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
              const calculatedScore = Math.max(
                50,
                300 - turns * 8 - Math.floor(timerSeconds * 1.5)
              );
              if (onFinish) onFinish(calculatedScore);
            }
            return nextVal;
          });
        }, 400);
      } else {
        // Mismatched pair - flip back
        setTimeout(() => {
          arcadeSound.playPop();
          setCards(prev =>
            prev.map(c =>
              c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c
            )
          );
          setSelectedIds([]);
          setIsProcessing(false);
        }, 850);
      }
    }
  };

  const finalScore = Math.max(50, 300 - turns * 8 - Math.floor(timerSeconds * 1.5));

  return (
    <ArcadeModal
      title="Focus Matrix"
      subtitle="Tactile Working-Memory Awakening"
      icon="🧠"
      onClose={onClose}
      headerStats={
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-violet-400" />
            <span>Pairs: <strong className="text-[#c8ef61]">{matchedPairs} / {SYMBOLS.length}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>Turns: <strong className="text-white">{turns}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>Time: <strong className="text-white">{timerSeconds}s</strong></span>
          </div>
        </div>
      }
    >
      <div className="relative w-full flex flex-col items-center">
        {/* 4x4 Grid of 3D Flip Cards */}
        <div
          style={{ perspective: '1200px' }}
          className="grid grid-cols-4 gap-3 sm:gap-4 p-2 w-full max-w-lg select-none"
        >
          {cards.map(card => {
            const isFlipped = card.flipped || card.matched;

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                style={{
                  perspective: '800px',
                  height: '84px',
                }}
                className="relative cursor-pointer group"
              >
                {/* 3D Card Container with preserve-3d */}
                <div
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg) translateZ(8px)' : 'rotateY(0deg)',
                    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
                  }}
                  className={`w-full h-full rounded-2xl relative shadow-[0_6px_0_#0f1715,0_10px_16px_rgba(0,0,0,0.2)] group-hover:shadow-[0_8px_0_#0f1715,0_14px_22px_rgba(0,0,0,0.3)] ${
                    card.matched ? 'opacity-85 ring-3 ring-[#c8ef61]' : ''
                  }`}
                >
                  {/* Card Back Face (Hidden when flipped) */}
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(0deg)',
                    }}
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-3 border-[#0f1715] bg-gradient-to-br from-[#1b2a24] via-[#16231e] to-[#0f1715] p-2 text-center"
                  >
                    {/* Golden Geometric Sobriety Rune */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/40 bg-black/40 text-amber-300 shadow-inner group-hover:scale-110 transition-transform">
                      <span className="font-mono text-sm font-black">⚡</span>
                    </div>
                    <span className="mt-1 font-mono text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                      FLIP
                    </span>
                  </div>

                  {/* Card Front Face (Visible when flipped) */}
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-3 border-[#0f1715] bg-white p-1 text-center shadow-inner"
                  >
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-2xl shadow-sm"
                      style={{ backgroundColor: card.color + '25' }}
                    >
                      <span className="select-none filter drop-shadow">{card.icon}</span>
                    </div>
                    <span className="mt-1 text-[9px] font-black uppercase text-[#0f1715] truncate max-w-full px-1 leading-tight">
                      {card.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Win Victory Overlay */}
        {gameWon && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md rounded-2xl p-6 text-center text-white">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#c8ef61] bg-[#c8ef61]/20 text-4xl mb-3">
              🏆
            </div>
            <h3 className="font-display text-2xl font-black uppercase text-[#c8ef61]">
              Executive Mind Restored!
            </h3>
            <p className="mt-1 max-w-xs text-xs text-slate-300">
              You matched all 8 recovery archetypes in <strong>{turns} turns</strong> and <strong>{timerSeconds} seconds</strong>.
            </p>

            <div className="my-4 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-mono text-xs">
              <div>Calculated Score: <strong className="text-white font-bold">{finalScore} pts</strong></div>
              <div className="mt-1">Tokens Earned: <strong className="text-[#c8ef61] font-bold">+{Math.max(10, Math.floor(finalScore / 15))} 🪙</strong></div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={initializeBoard}
                className="flex items-center gap-2 rounded-xl border-2 border-[#0f1715] bg-[#c8ef61] px-5 py-2.5 font-display text-xs font-black uppercase text-[#0f1715] shadow-[0_4px_0_#0f1715] hover:bg-[#bde64d] active:translate-y-1 active:shadow-none"
              >
                <RotateCcw size={14} />
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

        {/* Footnote instruction */}
        <div className="mt-4 flex items-center justify-between w-full text-[11px] font-mono text-slate-600 px-2">
          <span>🧠 Match two cards at a time.</span>
          <button
            onClick={initializeBoard}
            className="flex items-center gap-1 font-bold text-[#0f1715] hover:underline"
          >
            <RotateCcw size={12} />
            <span>Reset Deck</span>
          </button>
        </div>
      </div>
    </ArcadeModal>
  );
}
