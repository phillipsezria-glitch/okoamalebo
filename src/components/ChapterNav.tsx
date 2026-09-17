'use client';

import { Compass, Gamepad2, HeartHandshake, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

type ChapterId = 'today-mission' | 'recovery' | 'arcade' | 'support';

const CHAPTERS: Array<{ id: ChapterId; label: string; icon: typeof Compass }> = [
  { id: 'today-mission', label: 'Today', icon: Compass },
  { id: 'recovery', label: 'Recovery', icon: Sparkles },
  { id: 'arcade', label: 'Reset', icon: Gamepad2 },
  { id: 'support', label: 'Support', icon: HeartHandshake },
];

export function ChapterNav() {
  const [active, setActive] = useState<ChapterId>('today-mission');

  useEffect(() => {
    const chapters = CHAPTERS.map(chapter => document.getElementById(chapter.id)).filter(Boolean) as HTMLElement[];

    const updateActiveChapter = () => {
      let current: ChapterId = 'today-mission';
      let closestDistance = Number.POSITIVE_INFINITY;

      chapters.forEach(section => {
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top - 80);

        if (distance < closestDistance) {
          closestDistance = distance;
          current = section.id as ChapterId;
        }
      });

      setActive(current);
    };

    let frameId = 0;
    const onScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateActiveChapter);
    };

    updateActiveChapter();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <nav className="chapter-nav" aria-label="Main sections">
      {CHAPTERS.map(chapter => {
        const Icon = chapter.icon;
        return (
          <a
            key={chapter.id}
            href={`#${chapter.id}`}
            className={`chapter-nav__item ${active === chapter.id ? 'chapter-nav__item--active' : ''}`}
            aria-current={active === chapter.id ? 'page' : undefined}
            title={chapter.label}
          >
            <Icon size={15} />
            <span>{chapter.label}</span>
          </a>
        );
      })}
    </nav>
  );
}