/**
 * Okoa Malebo - SOS Emergency Modal Component
 * 60-second panic timer, 5-4-3-2-1 grounding, hotline dialers
 */

'use client';

import { useEffect } from 'react';
import { useSOS } from '@/hooks/useSOS';
import { useProfile } from '@/hooks/useProfile';
import type { HALTState } from '@/types';

type SOSController = ReturnType<typeof useSOS>;

export function SOSModal({ controller }: { controller?: SOSController }) {
  const { profile } = useProfile();
  const localController = useSOS(profile?.id || null);
  const {
    isOpen, 
    phase, 
    timerSeconds, 
    groundingSteps, 
    hotlines,
    closeSOS,
    toggleGroundingStep,
    goToHotlines,
    logCravingAndClose,
  } = controller || localController;

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeSOS();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeSOS]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="sos-title">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
          <h2 id="sos-title" className="text-white text-xl font-bold flex items-center gap-2">
            🚨 DHARURA / SOS
          </h2>
          <button
            onClick={closeSOS}
            className="text-white/80 hover:text-white text-2xl leading-none p-1"
            aria-label="Close SOS"
          >
            ×
          </button>
        </div>

        {/* Phase indicator */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex gap-2">
            {['timer', 'grounding', 'hotlines'].map((p, i) => (
              <div key={p} className="flex-1 flex items-center gap-1">
                <div 
                  className={`flex-1 h-1.5 rounded transition-colors ${
                    phase === p || (phase === 'grounding' && p === 'timer') || (phase === 'hotlines' && p !== 'hotlines')
                      ? 'bg-emerald-500' 
                      : 'bg-slate-200'
                  }`} 
                />
                {i < 2 && <span className={`text-xs font-medium ${phase === p || (phase === 'grounding' && p === 'timer') || (phase === 'hotlines' && p !== 'hotlines') ? 'text-emerald-600' : 'text-slate-400'}`}>•</span>}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>60s Timer</span>
            <span>5-4-3-2-1 Grounding</span>
            <span>Hotlines</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {phase === 'timer' && <TimerPhase seconds={timerSeconds} />}
          {phase === 'grounding' && <GroundingPhase steps={groundingSteps} onToggle={toggleGroundingStep} onComplete={goToHotlines} />}
          {phase === 'hotlines' && <HotlinesPhase hotlines={hotlines} onClose={closeSOS} onLogCraving={logCravingAndClose} />}
        </div>
      </div>
    </div>
  );
}

function TimerPhase({ seconds }: { seconds: number }) {
  const progress = seconds / 60;

  return (
    <div className="text-center space-y-6">
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="#ef4444"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={553}
            strokeDashoffset={553 * (1 - progress)}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-5xl font-bold text-red-600">{seconds}</span>
          <span className="text-sm text-slate-500">seconds</span>
        </div>
      </div>

      <div className="space-y-3 text-slate-600">
        <p className="text-lg font-medium">&quot;A neurochemical craving surge lasts ~15 minutes.&quot;</p>
        <p className="text-lg font-medium">Delay consumption for this single minute.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-amber-800 text-sm font-medium">
          💡 Tip: Start the 4-7-8 breathing while you wait. Inhale 4s, hold 7s, exhale 8s.
        </p>
      </div>
    </div>
  );
}

function GroundingPhase({ 
  steps, 
  onToggle, 
  onComplete 
}: { 
  steps: Array<{ id: number; label: string; completed: boolean }>;
  onToggle: (id: number) => void;
  onComplete: () => void;
}) {
  const allCompleted = steps.every(s => s.completed);

  return (
    <div className="space-y-4">
      <p className="text-center text-slate-600 mb-2">
        Complete the 5-4-3-2-1 sensory grounding exercise:
      </p>

      <div className="space-y-3">
        {steps.map(step => (
          <button
            key={step.id}
            onClick={() => onToggle(step.id)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              step.completed
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
            }`}
            aria-pressed={step.completed}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step.completed
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {step.completed ? '✓' : step.id}
              </div>
              <span className={`font-medium ${step.completed ? 'text-emerald-700' : 'text-slate-700'}`}>
                {step.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {allCompleted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center animate-in fade-in">
          <p className="text-emerald-800 font-medium">All steps complete! 🎉</p>
          <p className="text-emerald-600 text-sm mt-1">You&apos;ve grounded yourself in the present moment.</p>
          <button
            onClick={onComplete}
            className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-emerald-700"
          >
            Continue to Hotlines
          </button>
        </div>
      )}
    </div>
  );
}

function HotlinesPhase({ 
  hotlines, 
  onClose, 
  onLogCraving 
}: { 
  hotlines: Array<{ name: string; number: string; description: string }>;
  onClose: () => void;
  onLogCraving: (intensity: number, haltState: HALTState, trigger: string, tool: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-center text-slate-600 mb-2">
        Need human support? Tap to call directly:
      </p>

      <div className="space-y-3">
        {hotlines.map((hotline, index) => (
          <a
            key={index}
            href={`tel:${hotline.number}`}
            className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 text-xl">
              📞
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">{hotline.name}</p>
              <p className="text-lg font-mono font-bold text-emerald-700">{hotline.number}</p>
              <p className="text-xs text-slate-500">{hotline.description}</p>
            </div>
          </a>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-200 space-y-3">
        <p className="text-center text-sm text-slate-500">
          Craving passed? Log it to track your progress:
        </p>
        <button
          onClick={() => {
            onLogCraving(5, 'none', 'SOS Triggered', 'SOS Modal');
            onClose();
          }}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700"
        >
          Log Craving & Close
        </button>
        <button
          onClick={onClose}
          className="w-full border-2 border-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50"
        >
          Just Close
        </button>
      </div>
    </div>
  );
}

// Floating SOS Button
export function SOSButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-red-600 text-white shadow-[0_18px_36px_rgba(220,38,38,0.35)] transition-transform hover:scale-105 active:scale-95"
      aria-label="Open 60-second craving support and grounding"
      title="Open 60-second craving support and grounding"
    >
      <span className="text-xl leading-none">🚨</span>
      <span className="text-[9px] font-black uppercase tracking-[0.12em]">SOS</span>
    </button>
  );
}