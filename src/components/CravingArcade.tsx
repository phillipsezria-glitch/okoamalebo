import React, { useState } from 'react';
import { GameId, GAMES_CATALOG } from '@/types';
import { useProfile } from '@/hooks/useProfile';
import { ArcadeCard } from './ArcadeCard';
import { arcadeSound } from '@/lib/arcadeSound';
import { Dices } from 'lucide-react';

// Import the 4 modular games
import { VunjaMaleboGame } from './games/VunjaMaleboGame';
import { GroundingGardenGame } from './games/GroundingGardenGame';
import { AkiliMatrixGame } from './games/AkiliMatrixGame';
import { AkibaStackGame } from './games/AkibaStackGame';

export function CravingArcade() {
  const { profile, recordGameScore } = useProfile();
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  // Launch random game for fast urge interruption
  const handleRandomGame = () => {
    arcadeSound.playPop();
    const randomIndex = Math.floor(Math.random() * GAMES_CATALOG.length);
    const selected = GAMES_CATALOG[randomIndex];
    setActiveGame(selected.id);
  };

  const handleFinishGame = (gameId: GameId, score: number) => {
    recordGameScore(gameId, score);
  };

  if (!profile) return null;

  return (
    <div className="game-section motion-panel flex flex-col gap-5 rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-5 shadow-[0_18px_40px_var(--shadow-color)] md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--clay)]">Quick reset</p>
          <h2 className="font-display text-3xl leading-none text-[var(--ink)]">Choose a distraction</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Short activities for the next few minutes.</p>
        </div>
        <button
          onClick={handleRandomGame}
          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2.5 font-display text-xs font-black uppercase tracking-wider text-[var(--ink)] shadow-sm hover:border-[var(--clay)] active:translate-y-1 transition-all"
          title="Launch a random game"
        >
          <Dices size={16} />
          <span>Random game</span>
        </button>
      </div>

      {/* Grid of Games */}
      <div className="game-card-rail motion-stagger grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-4">
        {GAMES_CATALOG.map(game => (
          <ArcadeCard
            key={game.id}
            game={game}
            profile={profile}
            onPlay={gameId => setActiveGame(gameId)}
          />
        ))}
      </div>

      {/* Active Game Modal Host */}
      {activeGame === 'vunja' && (
        <VunjaMaleboGame
          onClose={() => setActiveGame(null)}
          onFinish={score => handleFinishGame('vunja', score)}
        />
      )}

      {activeGame === 'garden' && (
        <GroundingGardenGame
          onClose={() => setActiveGame(null)}
          onFinish={score => handleFinishGame('garden', score)}
        />
      )}

      {activeGame === 'akili' && (
        <AkiliMatrixGame
          onClose={() => setActiveGame(null)}
          onFinish={score => handleFinishGame('akili', score)}
        />
      )}

      {activeGame === 'akiba' && (
        <AkibaStackGame
          onClose={() => setActiveGame(null)}
          onFinish={score => handleFinishGame('akiba', score)}
        />
      )}
    </div>
  );
}
