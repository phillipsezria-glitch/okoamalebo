'use client';

import { Compass, Gamepad2, HeartHandshake, Sparkles } from 'lucide-react';

export type ChapterId = 'today-mission' | 'recovery' | 'arcade' | 'support';

const CHAPTERS: Array<{ id: ChapterId; label: string; icon: typeof Compass }> = [
  { id: 'today-mission', label: 'Today', icon: Compass },
  { id: 'recovery', label: 'Recovery', icon: Sparkles },
  { id: 'arcade', label: 'Reset', icon: Gamepad2 },
  { id: 'support', label: 'Support', icon: HeartHandshake },
];

export function ChapterNav({
  active,
  onSelect,
}: {
  active: ChapterId;
  onSelect: (chapter: ChapterId) => void;
}) {
  return (
    <nav className="chapter-nav" aria-label="Main sections">
      {CHAPTERS.map(chapter => {
        const Icon = chapter.icon;
        return (
          <button
            key={chapter.id}
            type="button"
            onClick={() => onSelect(chapter.id)}
            className={`chapter-nav__item ${active === chapter.id ? 'chapter-nav__item--active' : ''}`}
            aria-pressed={active === chapter.id}
            title={chapter.label}
          >
            <Icon size={15} />
            <span>{chapter.label}</span>
          </button>
        );
      })}
    </nav>
  );
}