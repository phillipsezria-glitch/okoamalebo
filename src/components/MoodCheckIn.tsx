/**
 * Okoa Malebo - Mood & HALT Check-in Component
 * Daily mood slider, HALT selector, coping suggestions
 */

'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { saveCravingLog, generateId, now, HALT_LABELS, MOOD_LABELS } from '@/lib/storage';
import type { HALTState, MoodLevel } from '@/types';

export function MoodCheckIn() {
  const { profile } = useProfile();
  const [mood, setMood] = useState<MoodLevel>(3);
  const [haltStates, setHaltStates] = useState<HALTState[]>([]);
  const [showSuggestion, setShowSuggestion] = useState<{ type: HALTState; message: string } | null>(null);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  // Check if already checked in today
  useEffect(() => {
    if (profile) {
      const today = new Date().toDateString();
      const lastCheckIn = localStorage.getItem(`okoa_last_checkin_${profile.id}`);
      const updateCheckInState = window.setTimeout(() => {
        setHasCheckedInToday(lastCheckIn === today);
      }, 0);
      return () => window.clearTimeout(updateCheckInState);
    }
  }, [profile]);

  const toggleHALT = (state: HALTState) => {
    setHaltStates(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  const handleSubmit = () => {
    if (!profile) return;

    // Log the check-in as a craving log entry
    const log = {
      id: generateId(),
      profileId: profile.id,
      cravingIntensity: 6 - mood, // Inverse: mood 5 = low craving
      haltState: haltStates[0] || 'none',
      triggerType: 'Daily Check-in',
      deescalationToolUsed: 'Mood Check-in',
      wasRelapse: false,
      createdAt: now(),
    };
    saveCravingLog(log);

    // Mark as checked in today
    localStorage.setItem(`okoa_last_checkin_${profile.id}`, new Date().toDateString());
    setHasCheckedInToday(true);

    // Show coping suggestion based on HALT states
    if (haltStates.includes('hungry')) {
      setShowSuggestion({ 
        type: 'hungry', 
        message: 'Kunywa maji baridi na ukule snack sasa hivi kabla hujafanya uamuzi.' 
      });
    } else if (haltStates.includes('angry')) {
      setShowSuggestion({ 
        type: 'angry', 
        message: 'Anger detected. Use the SOS grounding steps to release tension.' 
      });
    } else if (haltStates.includes('lonely')) {
      setShowSuggestion({ 
        type: 'lonely', 
        message: 'Feeling lonely? Write a note here or reach out to a trusted person.' 
      });
    } else if (haltStates.includes('tired')) {
      setShowSuggestion({ 
        type: 'tired', 
        message: 'Rest is recovery. Take a 20-minute power nap or practice the 4-7-8 breathing.' 
      });
    } else {
      setShowSuggestion({ 
        type: 'none', 
        message: 'Great! No HALT triggers detected. Keep up the good work!' 
      });
    }
  };

  if (hasCheckedInToday) {
    return (
      <div className="mood-checkin-panel motion-panel min-w-0 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5 shadow-[0_8px_20px_var(--shadow-color)] sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Daily Check-in</h3>
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
            ✅ Done today
          </span>
        </div>
        <p className="py-4 text-center text-slate-600">
          You&apos;ve already checked in today. Come back tomorrow.
        </p>
        <button
          onClick={() => setHasCheckedInToday(false)}
          className="w-full text-sm font-medium text-emerald-700 hover:underline"
        >
          Check in again (for testing)
        </button>
      </div>
    );
  }

  return (
    <div className="mood-checkin-panel motion-panel min-w-0 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5 shadow-[0_8px_20px_var(--shadow-color)] sm:p-6">
      <h3 className="mb-6 text-lg font-semibold text-slate-800">Daily Mood & HALT Check-in</h3>

      {/* Mood Slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-3">How do you feel right now?</label>
        <div className="mood-options flex items-center justify-between gap-2">
          {([1, 2, 3, 4, 5] as MoodLevel[]).map(level => (
            <button
              key={level}
              onClick={() => setMood(level)}
              className={`flex-1 rounded-xl border p-3 text-center transition-all ${
                mood === level
                  ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/40'
              }`}
              aria-pressed={mood === level}
            >
              <div className="mb-2 text-2xl">{getMoodEmoji(level)}</div>
              <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-600">{MOOD_LABELS[level].split(' ')[0]}</div>
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-slate-500 mt-2">{MOOD_LABELS[mood]}</p>
      </div>

      {/* HALT Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-3">What are you feeling right now? (Select all that apply)</label>
        <div className="grid min-w-0 grid-cols-2 gap-3">
          {(['hungry', 'angry', 'lonely', 'tired'] as HALTState[]).map(state => (
            <button
              key={state}
              onClick={() => toggleHALT(state)}
              className={`rounded-xl border p-3 text-left transition-all ${
                haltStates.includes(state)
                  ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/40'
              }`}
              aria-pressed={haltStates.includes(state)}
            >
              <div className="font-medium text-slate-700">{HALT_LABELS[state].split(' ')[0]}</div>
              <div className="mt-1 text-[11px] text-slate-500">{HALT_LABELS[state].split('(')[1]?.replace(')', '')}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="mb-4 w-full rounded-xl bg-emerald-700 py-3 font-semibold text-white transition-colors hover:bg-emerald-800"
      >
        Submit Check-in
      </button>

      {/* Coping Suggestion */}
      {showSuggestion && (
        <div className={`p-4 rounded-xl border-l-4 animate-in slide-in-from-top-2 ${
          showSuggestion.type === 'angry' 
            ? 'bg-red-50 border-red-500 text-red-800'
            : showSuggestion.type === 'hungry'
            ? 'bg-amber-50 border-amber-500 text-amber-800'
            : showSuggestion.type === 'lonely'
            ? 'bg-blue-50 border-blue-500 text-blue-800'
            : showSuggestion.type === 'tired'
            ? 'bg-purple-50 border-purple-500 text-purple-800'
            : 'bg-emerald-50 border-emerald-500 text-emerald-800'
        }`}>
          <p className="font-medium">{showSuggestion.message}</p>
        </div>
      )}
    </div>
  );
}

function getMoodEmoji(level: MoodLevel): string {
  switch (level) {
    case 1: return '😔';
    case 2: return '😕';
    case 3: return '😐';
    case 4: return '🙂';
    case 5: return '😄';
  }
}