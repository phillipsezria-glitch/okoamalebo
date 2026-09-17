import React, { useState, useRef } from 'react';
import { GameInfo, UserProfile } from '@/types';
import { Play, Trophy, Clock } from 'lucide-react';
import { arcadeSound } from '@/lib/arcadeSound';

interface Props {
  key?: React.Key;
  game: GameInfo;
  profile: UserProfile;
  onPlay: (gameId: GameInfo['id']) => void;
}

export function ArcadeCard({ game, profile, onPlay }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50, isHovered: false });

  const highScore = profile.highScores?.[game.id] || 0;
  const timesPlayed = profile.gamesPlayed?.[game.id] || 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Smooth 3D tilt angles
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    setTilt({
      x: rotateX,
      y: rotateY,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
      isHovered: true,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50, isHovered: false });
  };

  const handlePlayClick = () => {
    arcadeSound.playPop();
    onPlay(game.id);
  };

  return (
    <div
      style={{ perspective: '1200px' }}
      className="relative min-w-0"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: tilt.isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(12px)`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
          transition: tilt.isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out, box-shadow 0.3s ease',
          transformStyle: 'preserve-3d',
        }}
        className="group relative flex h-full min-h-[410px] flex-col justify-between overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-raised)] p-5 shadow-[0_16px_34px_var(--shadow-color)] hover:-translate-y-1 hover:shadow-[0_20px_40px_var(--shadow-color)]"
      >
        {/* Dynamic 3D Glare Lighting Sheen */}
        {tilt.isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-40 transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 65%)`,
            }}
          />
        )}

        {/* Top Header */}
        <div style={{ transform: 'translateZ(18px)' }} className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--line)] text-3xl shadow-sm group-hover:scale-105 transition-transform"
                style={{ backgroundColor: game.color + '25' }}
              >
                <span role="img" aria-label={game.title} className="select-none filter drop-shadow-md">
                  {game.icon}
                </span>
              </div>
              <div>
                <h3 className="font-display text-lg font-black uppercase text-[var(--ink)] leading-tight mt-1">
                  {game.title}
                </h3>
                <p className="text-[11px] font-bold text-[var(--clay)] tracking-wide">
                  {game.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Game Description in English */}
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
            {game.description}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-2.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
            <span>1 min reset</span>
            <span className="text-[var(--ink)]">How to play</span>
          </div>

          {/* Neuro Impact Chip */}
        </div>

        {/* Footer Metrics & 3D Tactile Play Action */}
        <div style={{ transform: 'translateZ(20px)' }} className="mt-5 border-t border-[var(--line)] pt-3">
          <div className="flex items-center justify-between font-mono text-[11px] text-[var(--muted)] mb-3.5">
            <div className="flex items-center gap-1">
              <Trophy size={13} className="text-amber-500" />
              <span>High: <strong className="text-[var(--ink)]">{highScore}</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={13} />
              <span>{game.estimatedDuration}</span>
            </div>
            <div>
              <span>Plays: <strong className="text-[var(--ink)]">{timesPlayed}</strong></span>
            </div>
          </div>

          {/* 3D Tactile Button */}
          <button
            onClick={handlePlayClick}
            className="group/btn relative w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] py-2.5 font-display text-xs font-black uppercase tracking-wider text-[var(--ink)] shadow-sm hover:border-[var(--clay)] active:translate-y-1 active:shadow-none transition-all duration-100"
          >
            <Play size={15} className="fill-[var(--ink)] transition-transform group-hover/btn:scale-125" />
            <span>PLAY GAME</span>
          </button>
        </div>
      </div>
    </div>
  );
}
