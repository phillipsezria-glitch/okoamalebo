import React, { useState } from 'react';
import { X, AlertTriangle, PhoneCall } from 'lucide-react';
import { audioManager } from '@/lib/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCravingResisted: () => void;
}

const GROUNDING_STEPS = [
  { count: '5', label: 'Look around for 5 physical objects', desc: 'Identify 5 distinct shapes, colors, or textures in your immediate room.', icon: '👀' },
  { count: '4', label: 'Physically touch 4 items', desc: 'Feel 4 surfaces (fabric on your clothes, table wood, cool glass, your watch).', icon: '✋' },
  { count: '3', label: 'Listen for 3 distinct sounds', desc: 'Focus your auditory senses on 3 quiet sounds (ambient breeze, clock tick, hum).', icon: '👂' },
  { count: '2', label: 'Notice 2 aromas or deep breaths', desc: 'Inhale two deep diaphragmatic breaths through your nose to trigger parasympathetic tone.', icon: '👃' },
  { count: '1', label: 'Drink 1 glass of cold water', desc: 'Take a long sip of ice-cold water and affirm your commitment to sobriety and clarity.', icon: '💧' },
];

export function EmergencySOSModal({ isOpen, onClose, onCravingResisted }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [markedBroken, setMarkedBroken] = useState(false);

  if (!isOpen) return null;

  const handleStepComplete = () => {
    audioManager.play('button_click');
    if (currentStep < GROUNDING_STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      setMarkedBroken(true);
      onCravingResisted();
      audioManager.play('victory');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl border-4 border-[var(--color-ink)] bg-[var(--color-paper)] p-6 shadow-[0_16px_0_var(--color-ink),0_25px_50px_rgba(0,0,0,0.5)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-clay)] p-1.5 text-white shadow-[0_2px_0_var(--color-ink)] hover:bg-amber-700 active:translate-y-0.5 transition-all"
          aria-label="Close emergency modal"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-5 flex items-center gap-3 border-b-4 border-[var(--color-ink)] pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-3 border-[var(--color-ink)] bg-[var(--color-clay)] text-white shadow-[0_4px_0_var(--color-ink)] animate-pulse">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-display text-xl font-black uppercase text-[var(--color-ink)]">
              Urge SOS Protocol
            </h3>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-clay)]">
              60-Second Autonomic Reset
            </p>
          </div>
        </div>

        {/* Motivational Anchor Quote */}
        <div className="mb-5 rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-acid)] p-3.5 text-xs font-bold text-[var(--color-ink)] shadow-[0_4px_0_var(--color-ink)]">
          <p className="italic">&quot;A chemical neuro-craving wave peaks within 90 to 180 seconds. You do not have to obey it—you only need to surf it.&quot;</p>
          <p className="mt-1 text-[10px] font-mono uppercase text-[var(--color-ink)]/70">— Urge Surfing Principle (Dr. Alan Marlatt)</p>
        </div>

        {!markedBroken ? (
          <div>
            {/* Mammalian Dive Reflex Prompt */}
            <div className="mb-4 rounded-xl border-2 border-[var(--color-ink)] bg-sky-100 p-3 text-xs text-sky-950">
              <span className="font-black uppercase text-sky-900 flex items-center gap-1">
                🧊 Instant Sensory Shock (Dive Reflex):
              </span>
              <p className="mt-1 leading-relaxed">
                Splash ice-cold water onto your eyes and cheekbones or hold an ice cube. This stimulates the vagus nerve and drops your heart rate within 10 seconds.
              </p>
            </div>

            {/* 5-4-3-2-1 Grounding Card */}
            <div className="mb-5 rounded-2xl border-3 border-[var(--color-ink)] bg-white p-4 shadow-[0_6px_0_var(--color-ink)]">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2 mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-[var(--color-clay)]">
                  5-4-3-2-1 Sensory Grounding
                </span>
                <span className="font-mono text-xs font-black text-[var(--color-ink)]">
                  Step {currentStep + 1} of 5
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <span className="text-4xl filter drop-shadow">{GROUNDING_STEPS[currentStep].icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-ink)] font-mono text-xs font-bold text-[var(--color-acid)]">
                      {GROUNDING_STEPS[currentStep].count}
                    </span>
                    <h4 className="font-display text-sm font-black text-[var(--color-ink)]">
                      {GROUNDING_STEPS[currentStep].label}
                    </h4>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-normal">
                    {GROUNDING_STEPS[currentStep].desc}
                  </p>
                </div>
              </div>

              <button
                onClick={handleStepComplete}
                className="mt-4 w-full rounded-xl border-3 border-[var(--color-ink)] bg-[var(--color-acid)] py-2.5 font-display text-xs font-black uppercase tracking-wider text-[var(--color-ink)] shadow-[0_4px_0_var(--color-ink)] active:translate-y-1 active:shadow-none hover:bg-green-300 transition-all"
              >
                {currentStep < 4 ? 'COMPLETE STEP (NEXT)' : 'I BROKE THE CRAVING!'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-5 rounded-2xl border-3 border-[var(--color-ink)] bg-white p-5 text-center shadow-[0_6px_0_var(--color-ink)]">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-acid)] text-3xl shadow-[0_3px_0_var(--color-ink)]">
              🏆
            </div>
            <h4 className="font-display text-xl font-black uppercase text-[var(--color-ink)]">
              Urge Conquered!
            </h4>
            <p className="mt-1 text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              You chose health, autonomy, and presence over a transient chemical trigger. +10 Power Tokens added to your profile!
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={onClose}
                className="rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-ink)] px-6 py-2.5 font-display text-xs font-black uppercase text-[var(--color-acid)] shadow-[0_3px_0_var(--color-clay)]"
              >
                RETURN TO DASHBOARD
              </button>
            </div>
          </div>
        )}

        {/* Free Helpline Support Notice */}
        <div className="border-t-2 border-[var(--color-ink)]/20 pt-3 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 text-[var(--color-ink)] font-bold">
            <PhoneCall size={14} className="text-emerald-700" />
            <span>Need confidential crisis counseling right now?</span>
          </div>
          <p className="mt-1 leading-normal font-mono text-[10px]">
            • <strong>US / Canada:</strong> Dial 988 (Substance & Mental Health Hotline)
            <br />
            • <strong>UK:</strong> 111 (NHS Mental Health Support)
            <br />
            • <strong>Kenya NACADA Helpline:</strong> 1192 (Toll Free 24/7)
          </p>
        </div>
      </div>
    </div>
  );
}
