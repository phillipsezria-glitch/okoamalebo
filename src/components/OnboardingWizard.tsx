/**
 * Okoa Malebo - Onboarding Wizard Component
 */

'use client';

import { useState, useCallback } from 'react';
import type { SubstanceType } from '@/types';
import { SUBSTANCE_LABELS } from '@/lib/storage';
import { BrandMark } from '@/components/BrandMark';

const SUBSTANCES: Array<{ value: SubstanceType; label: string; icon: string }> = [
  { value: 'alcohol', label: 'Pombe / Alcohol', icon: '🍺' },
  { value: 'bhang', label: 'Bhang / Cannabis', icon: '🌿' },
  { value: 'miraa', label: 'Miraa / Muguka', icon: '🌱' },
  { value: 'cigarettes', label: 'Cigarettes / Vapes', icon: '🚬' },
  { value: 'hard_drugs', label: 'Hard Drugs', icon: '💊' },
];

const QUIT_OPTIONS = [
  { value: 'now', label: 'Just now', description: 'Starting fresh today' },
  { value: 'yesterday', label: 'Yesterday', description: 'Already 1 day in' },
  { value: 'custom', label: 'Custom date', description: 'Pick your quit date' },
] as const;

type QuitOption = (typeof QUIT_OPTIONS)[number]['value'];

// Generate pseudo handle - defined outside component to avoid recreation
function generatePseudoHandle(): string {
  const prefixes = ['Simba', 'Mwewe', 'Chui', 'Twiga', 'Kifaru', 'Nyati', 'Punda', 'Kobe'];
  const suffixes = ['Safi', 'Shujaa', 'Mwangaza', 'Amani', 'Ujasiri', 'Upendo', 'Tumaini', 'Nguvu'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const num = Math.floor(Math.random() * 100);
  return `${prefix}_${suffix}_${num}`;
}

type OnboardingWizardProps = {
  onComplete?: () => void;
  createProfile?: (
    pseudoHandle: string,
    primarySubstance: SubstanceType,
    dailyBudgetKes: number,
    sobrietyStartTime: number
  ) => unknown;
};

export function OnboardingWizard({ onComplete, createProfile }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [substance, setSubstance] = useState<SubstanceType>('alcohol');
  const [dailyBudget, setDailyBudget] = useState(500);
  const [quitOption, setQuitOption] = useState<QuitOption>('now');
  const [customDate, setCustomDate] = useState('');
  const [pseudoHandle, setPseudoHandle] = useState('');
  const [suggestedHandle, setSuggestedHandle] = useState(generatePseudoHandle);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let sobrietyStartTime = Date.now();
    if (quitOption === 'yesterday') {
      sobrietyStartTime = Date.now() - 24 * 60 * 60 * 1000;
    } else if (quitOption === 'custom' && customDate) {
      sobrietyStartTime = new Date(customDate).getTime();
    }

    // Use the pseudoHandle state (which tracks user input or generated handle)
    const handle = pseudoHandle.trim() || suggestedHandle;

    if (createProfile) {
      createProfile(handle, substance, dailyBudget, sobrietyStartTime);
    }

    setIsSubmitting(false);
    onComplete?.();
  }, [createProfile, substance, dailyBudget, quitOption, customDate, pseudoHandle, suggestedHandle, onComplete]);

  const handleGenerateAnother = useCallback(() => {
    const newHandle = generatePseudoHandle();
    setSuggestedHandle(newHandle);
    setPseudoHandle(newHandle);
  }, []);

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (step === 1) {
    return (
      <div className="onboarding-card max-w-md mx-auto p-6 space-y-6">
        <div className="mb-8 text-center">
          <BrandMark size="lg" />
          <h1 className="mt-4 font-display text-4xl text-[var(--ink)]">Okoa Malebo</h1>
          <p className="mt-2 text-[var(--muted)]">Ponda Raha, Sio Malebo</p>
        </div>

        <div className="mb-8 flex justify-center gap-2">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className={`h-2 w-8 rounded-full transition-colors ${
              n <= step ? 'bg-[var(--clay)]' : 'bg-[var(--line)]'
            }`} />
          ))}
        </div>

        <h2 className="text-center text-xl font-semibold text-[var(--ink)]">Step 1: What are you quitting?</h2>
        <p className="text-center text-sm text-[var(--muted)]">Select your primary substance</p>

        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Select substance">
          {SUBSTANCES.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSubstance(value)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                substance === value
                  ? 'border-[var(--clay)] bg-[var(--surface-soft)] ring-2 ring-[color:color-mix(in_srgb,var(--clay)_30%,transparent)]'
                  : 'border-[var(--line)] bg-[var(--paper)]/70 hover:border-[var(--clay)]'
              }`}
              role="radio"
              aria-checked={substance === value}
            >
              <div className="mb-2 text-3xl">{icon}</div>
              <div className="font-medium text-[var(--ink)]">{label}</div>
            </button>
          ))}
        </div>

        <button
          onClick={nextStep}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
        >
          Continue
        </button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="onboarding-card max-w-md mx-auto p-6 space-y-6">
        <div className="mb-8 flex justify-center gap-2">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className={`h-2 w-8 rounded-full transition-colors ${
              n <= step ? 'bg-[var(--clay)]' : 'bg-[var(--line)]'
            }`} />
          ))}
        </div>

        <h2 className="text-center text-xl font-semibold text-[var(--ink)]">Step 2: Daily spend?</h2>
        <p className="text-center text-sm text-[var(--muted)]">How much do you spend per day on <span className="font-medium text-[var(--ink)]">{SUBSTANCE_LABELS[substance]}</span>?</p>

        <div className="rounded-xl bg-[var(--surface-soft)] p-6">
          <div className="mb-4 flex items-baseline justify-center gap-2">
            <span className="text-5xl font-bold text-[var(--clay)]">KES {dailyBudget.toLocaleString()}</span>
            <span className="text-[var(--muted)]">/ day</span>
          </div>
          <input
            type="range"
            min="100"
            max="10000"
            step="50"
            value={dailyBudget}
            onChange={(e) => setDailyBudget(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            aria-label="Daily budget in KES"
          />
          <div className="mt-2 flex justify-between text-xs text-[var(--muted)]">
            <span>KES 100</span>
            <span>KES 10,000</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={prevStep} className="flex-1 rounded-xl border-2 border-[var(--line)] py-3 font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-soft)]">
            Back
          </button>
          <button onClick={nextStep} className="flex-1 rounded-xl bg-[var(--clay)] py-3 font-semibold text-[var(--paper)] transition-colors hover:opacity-95">
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="onboarding-card max-w-md mx-auto p-6 space-y-6">
        <div className="mb-8 flex justify-center gap-2">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className={`h-2 w-8 rounded-full transition-colors ${
              n <= step ? 'bg-[var(--clay)]' : 'bg-[var(--line)]'
            }`} />
          ))}
        </div>

        <h2 className="text-center text-xl font-semibold text-[var(--ink)]">Step 3: When did you quit?</h2>
        <p className="text-center text-sm text-[var(--muted)]">Your sobriety start date</p>

        <div className="space-y-3" role="radiogroup" aria-label="Select quit date">
          {QUIT_OPTIONS.map(({ value, label, description }) => (
            <label key={value} className={`flex cursor-pointer items-center rounded-xl border-2 p-4 transition-all ${
              quitOption === value
                ? 'border-[var(--clay)] bg-[var(--surface-soft)]'
                : 'border-[var(--line)] bg-[var(--paper)]/65 hover:border-[var(--clay)]'
            }`}>
              <input
                type="radio"
                name="quitOption"
                value={value}
                checked={quitOption === value}
                onChange={() => setQuitOption(value)}
                className="h-5 w-5 border-[var(--line)] text-[var(--clay)] focus:ring-[var(--clay)]"
              />
              <div className="ml-3">
                <div className="font-medium text-[var(--ink)]">{label}</div>
                <div className="text-sm text-[var(--muted)]">{description}</div>
              </div>
            </label>
          ))}
        </div>

        {quitOption === 'custom' && (
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-[var(--ink)]">Select date</label>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full rounded-xl border-2 border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-[var(--ink)] focus:border-[var(--clay)] focus:outline-none"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={prevStep} className="flex-1 rounded-xl border-2 border-[var(--line)] py-3 font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-soft)]">
            Back
          </button>
          <button onClick={nextStep} className="flex-1 rounded-xl bg-[var(--clay)] py-3 font-semibold text-[var(--paper)] transition-colors hover:opacity-95">
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="onboarding-card max-w-md mx-auto p-6 space-y-6">
        <div className="mb-8 flex justify-center gap-2">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className={`h-2 w-8 rounded-full transition-colors ${
              n <= step ? 'bg-[var(--clay)]' : 'bg-[var(--line)]'
            }`} />
          ))}
        </div>

        <h2 className="text-center text-xl font-semibold text-[var(--ink)]">Step 4: Your anonymous handle</h2>
        <p className="text-center text-sm text-[var(--muted)]">This is the name attached to your private recovery notes (optional)</p>

        <div className="mb-4 rounded-xl border-2 border-[var(--line)] bg-[var(--surface-soft)] p-4">
          <div className="mb-1 text-sm text-[var(--clay)]">Suggested:</div>
          <div className="font-mono text-lg font-semibold text-[var(--ink)]" id="suggested-handle">
            {suggestedHandle}
          </div>
          <button
            type="button"
            onClick={handleGenerateAnother}
            className="mt-2 text-sm text-[var(--clay)] hover:underline"
          >
            Generate another
          </button>
        </div>

        <div>
          <label htmlFor="pseudoHandle" className="mb-2 block text-sm font-medium text-[var(--ink)]">
            Or choose your own:
          </label>
          <input
            id="pseudoHandle"
            type="text"
            value={pseudoHandle}
            onChange={(e) => setPseudoHandle(e.target.value)}
            placeholder="e.g., Simba_Safi_23"
            maxLength={32}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
          />
          <p className="text-xs text-slate-500 mt-1">Letters, numbers, underscores only. Max 32 characters.</p>
        </div>

        <div className="flex gap-3">
          <button onClick={prevStep} className="flex-1 border-2 border-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Starting...' : 'Anza Safari Yangu'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}