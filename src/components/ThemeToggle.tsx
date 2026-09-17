'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [isPulling, setIsPulling] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('okoa_theme') as Theme | null;
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const nextTheme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : preferredTheme;
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  const applyTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    localStorage.setItem('okoa_theme', nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  };

  const toggleTheme = () => {
    if (isPulling) return;
    setIsPulling(true);
    document.documentElement.classList.remove('theme-glow-active');
    void document.documentElement.offsetWidth;
    document.documentElement.classList.add('theme-glow-active');
    window.setTimeout(() => {
      const nextTheme = theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    }, 220);
    window.setTimeout(() => {
      document.documentElement.classList.remove('theme-glow-active');
      setIsPulling(false);
    }, 700);
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`theme-switcher ${isDark ? 'theme-switcher--dark' : 'theme-switcher--light'} ${isPulling ? 'theme-switcher--pulling' : ''}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
    >
      <span className="theme-switcher__cord" aria-hidden="true" />
      <span className="theme-switcher__flash" aria-hidden="true" />
      <span className="theme-switcher__fixture" aria-hidden="true">
        <span className="theme-switcher__knob">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </span>
      </span>
    </button>
  );
}
