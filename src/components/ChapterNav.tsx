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
    const sections = CHAPTERS.map(chapter => document.getElementById(chapter.id)).filter(
      Boolean
    ) as HTMLElement[];

    // Set initial active chapter based on current scroll position
    const setInitialActive = () => {
      let bestChapter: ChapterId | null = null;
      let bestRatio = -1;

      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const viewportHeight =
          window.innerHeight || document.documentElement.clientHeight;
        // Calculate intersection ratio
        const top = Math.max(rect.top, 0);
        const bottom = Math.min(rect.bottom, viewportHeight);
        const height = Math.max(0, bottom - top);
        const ratio = height / rect.height;

        if (ratio > bestRatio && ratio >= 0.2) {
          bestRatio = ratio;
          bestChapter = section.id as ChapterId;
        }
      });

      if (bestChapter) setActive(bestChapter);
    };

    // Set initial active chapter
    setInitialActive();

    // Update active chapter on scroll
    const handleScroll = () => {
      setInitialActive();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Also observe sections for smooth updates
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(entry => entry.isIntersecting);
        if (visible.length > 0) {
          // Sort by intersection ratio, highest first
          const sorted = visible.sort(
            (first, second) => second.intersectionRatio - first.intersectionRatio
          );
          const id = sorted[0]?.target.id as ChapterId | undefined;
          if (id) setActive(id);
        }
      },
      { threshold: [0.3] }
    );

    sections.forEach(section => observer.observe(section));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      observer.disconnect();
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