'use client';

import { useEffect, useRef } from 'react';

export function ScrollProgress() {
  const frameRef = useRef<number | null>(null);
  const scrollRef = useRef<number>(0);

  useEffect(() => {
    const updateProgress = () => {
      frameRef.current = null;
      const scrollable =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const progress =
        scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      // Only update if progress changed significantly to avoid flicker
      if (Math.abs(progress - scrollRef.current) > 0.01) {
        scrollRef.current = progress;
        document.documentElement.style.setProperty('--scroll-progress', `${progress}`);
      }
    };

    const handleScroll = () => {
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(updateProgress);
      }
    };

    // Initial update after a small delay to ensure DOM is ready
    const initDelay = setTimeout(() => {
      updateProgress();
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      clearTimeout(initDelay);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className="scroll-orbit" aria-hidden="true">
      <span className="scroll-orbit__label">RECOVERY / PATH</span>
      <span className="scroll-orbit__track"><span className="scroll-orbit__fill" /></span>
      <span className="scroll-orbit__index">SCROLL</span>
    </div>
  );
}
