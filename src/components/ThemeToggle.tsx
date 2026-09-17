'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const updateTheme = window.setTimeout(() => {
      const savedTheme = localStorage.getItem('okoa_theme') as Theme | null;
      const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const nextTheme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : preferredTheme;
      setTheme(nextTheme);
      document.documentElement.dataset.theme = nextTheme;
    }, 0);

    return () => window.clearTimeout(updateTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.add('theme-transition');
    setTheme(nextTheme);
    localStorage.setItem('okoa_theme', nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle gravity-switch ${isDark ? 'gravity-switch--dark' : ''}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="gravity-switch__track" aria-hidden="true">
        <span className="gravity-switch__label gravity-switch__label--day">DAY</span>
        <span className="gravity-switch__label gravity-switch__label--night">NIGHT</span>
        <span className="gravity-switch__weight">
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </span>
      </span>
    </button>
  );
}
