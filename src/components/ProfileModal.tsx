import React from 'react';
import { UserProfile } from '@/types';
import { X, Flame, Coins, ShieldCheck, RotateCcw } from 'lucide-react';

interface Props {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
}

export function ProfileModal({ profile, isOpen, onClose, onReset }: Props) {
  if (!isOpen) return null;

  const moneySavedEstimate = (profile.cravingsResisted || 0) * (profile.moneySavedPerDay || 0);
  const currency = profile.currencySymbol || '$';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border-4 border-[var(--color-ink)] bg-[var(--color-paper)] p-6 shadow-[0_16px_0_var(--color-ink),0_25px_50px_rgba(0,0,0,0.5)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-clay)] p-1.5 text-white shadow-[0_2px_0_var(--color-ink)] hover:bg-amber-700 active:translate-y-0.5 transition-all"
          aria-label="Close profile"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center gap-3.5 border-b-4 border-[var(--color-ink)] pb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-3 border-[var(--color-ink)] bg-[var(--color-acid)] text-3xl shadow-[0_4px_0_var(--color-ink)]">
            🦁
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-2xl font-black uppercase tracking-tight text-[var(--color-ink)]">
                {profile.name || profile.pseudoHandle}
              </h3>
              <span className="rounded-md bg-[var(--color-ink)] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[var(--color-acid)]">
                SOBER RESILIENCE
              </span>
            </div>
            <p className="text-xs text-[var(--color-clay)] font-bold mt-0.5">
              Recovery Support • Personal Dashboard
            </p>
          </div>
        </div>

        {/* Core Stats Bento */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border-3 border-[var(--color-ink)] bg-white p-3.5 shadow-[0_4px_0_var(--color-ink)]">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[var(--color-clay)]">
              <Coins size={14} />
              <span>Power Tokens</span>
            </div>
            <p className="mt-1 font-mono text-2xl font-black text-[var(--color-ink)]">
              {profile.nguvuTokens || 0}
            </p>
          </div>

          <div className="rounded-2xl border-3 border-[var(--color-ink)] bg-white p-3.5 shadow-[0_4px_0_var(--color-ink)]">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-700">
              <ShieldCheck size={14} />
              <span>Urges Broken</span>
            </div>
            <p className="mt-1 font-mono text-2xl font-black text-[var(--color-ink)]">
              {profile.cravingsResisted || 0}
            </p>
          </div>

          <div className="rounded-2xl border-3 border-[var(--color-ink)] bg-white p-3.5 shadow-[0_4px_0_var(--color-ink)]">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-700">
              <Flame size={14} />
              <span>Clean Streak</span>
            </div>
            <p className="mt-1 font-mono text-2xl font-black text-[var(--color-ink)]">
              {profile.dailyStreak || 0} Days
            </p>
          </div>

          {/* Cash Saved Banner */}
          <div className="col-span-2 rounded-2xl border-3 border-[var(--color-ink)] bg-[var(--color-acid)] p-4 shadow-[0_5px_0_var(--color-ink)] sm:col-span-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-ink)]/80">
                  Estimated Financial Capital Preserved
                </p>
                <p className="font-mono text-2xl font-black text-[var(--color-ink)] mt-0.5">
                  {currency}{moneySavedEstimate.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-700 font-medium mt-1">
                  Based on {currency}{profile.moneySavedPerDay || 0}/day unspent on toxic substances.
                </p>
              </div>
              <span className="text-4xl filter drop-shadow">💰</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t-2 border-slate-200 pt-4">
          <button
            onClick={() => {
              if (window.confirm('Reset all profile progress and statistics?')) {
                onReset();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-900"
          >
            <RotateCcw size={14} />
            <span>Reset Data</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-ink)] px-6 py-2.5 font-display text-xs font-black uppercase tracking-wider text-white shadow-[0_3px_0_var(--color-clay)] hover:bg-black active:translate-y-0.5 transition-all"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
