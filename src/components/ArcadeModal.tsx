import React, { useEffect } from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';
import { arcadeSound } from '@/lib/arcadeSound';

interface ArcadeModalProps {
  title: string;
  subtitle: string;
  icon: string;
  onClose: () => void;
  children: React.ReactNode;
  headerStats?: React.ReactNode;
}

export function ArcadeModal({
  title,
  subtitle,
  icon,
  onClose,
  children,
  headerStats,
}: ArcadeModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        role="dialog" 
        aria-modal="true" 
        className="relative flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--paper)] shadow-[0_24px_70px_var(--shadow-color)] ring-1 ring-white/10"
      >
        {/* 3D Top Cabinet Marquee Bar */}
        <div className="relative flex items-center justify-between border-b border-[var(--line)] bg-[var(--ink)] px-5 py-3.5 select-none text-[var(--paper)] shadow-inner">
          {/* Subtle cabinet speaker slots texture */}
          <div className="absolute left-1/2 top-1.5 -translate-x-1/2 flex items-center gap-1 opacity-20 pointer-events-none">
            <div className="h-1 w-6 rounded-full bg-white" />
            <div className="h-1 w-6 rounded-full bg-white" />
            <div className="h-1 w-6 rounded-full bg-white" />
          </div>

          <div className="flex items-center gap-3 z-10">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl">
              <span role="img" aria-hidden="true" className="filter drop-shadow">{icon}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-display text-lg font-black uppercase tracking-wide text-[var(--paper)] drop-shadow">
                  {title}
                </h3>
                <span className="flex items-center gap-1 rounded bg-[var(--acid)] px-1.5 py-0.5 font-mono text-[9px] font-black uppercase text-[var(--ink)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e05d38] animate-ping" />
                  3D ACTIVE
                </span>
              </div>
              <p className="text-[11px] font-bold text-[var(--acid)] tracking-wide">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 z-10">
            <button
              onClick={() => {
                arcadeSound.setEnabled(!arcadeSound.enabled);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] shadow-sm hover:bg-[var(--surface-raised)] active:translate-y-1 active:shadow-none transition-all"
              title="Toggle Audio"
              aria-label="Toggle Audio"
            >
              {arcadeSound.enabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-slate-400" />}
            </button>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--clay)] bg-[var(--clay)] text-white shadow-sm hover:brightness-90 active:translate-y-1 active:shadow-none transition-all"
              title="Exit (ESC)"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Dynamic Header HUD Stats (Score, Time, Multiplier, Streak) */}
        {headerStats && (
          <div className="border-b border-[var(--line)] bg-[var(--surface-soft)] px-5 py-2 text-[var(--ink)] select-none shadow-sm">
            {headerStats}
          </div>
        )}

        {/* Modal Main Arena with 3D Depth */}
        <div className="relative flex-1 overflow-y-auto bg-[var(--surface-soft)] p-4 sm:p-6 flex flex-col items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
