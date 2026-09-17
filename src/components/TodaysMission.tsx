'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronRight, Compass, Flame, Sparkles } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { saveCravingLog, generateId, now } from '@/lib/storage';

type MissionStep = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  href: string;
};

const PROMPTS = [
  'What usually happens in the 30 minutes before a craving?',
  'Which person makes it easier to choose tomorrow?',
  'What will you do with the money you protect this week?',
  'What is one place you can go where using is harder?',
];

const MISSIONS: MissionStep[] = [
  {
    id: 'check-in',
    eyebrow: '01 / NOTICE',
    title: 'Name your state',
    detail: 'A two-minute mood and HALT check can reveal what the craving is really asking for.',
    href: '#check-in',
  },
  {
    id: 'move',
    eyebrow: '02 / INTERRUPT',
    title: 'Change the scene',
    detail: 'Walk outside, drink water, or play one short round before making any decision.',
    href: '#arcade',
  },
  {
    id: 'connect',
    eyebrow: '03 / CONNECT',
    title: 'Leave a trace',
    detail: 'Write one honest line in your private notes so tomorrow-you has something to stand on.',
    href: '#notes',
  },
];

function getMissionKey() {
  return `okoa_mission_${new Date().toISOString().slice(0, 10)}`;
}

export function TodaysMission() {
  const { profile } = useProfile();
  const [completed, setCompleted] = useState<string[]>([]);
  const [prompt, setPrompt] = useState(PROMPTS[0]);

  useEffect(() => {
    const missionKey = getMissionKey();
    const saved = localStorage.getItem(missionKey);
    const promptIndex = Math.floor(Date.now() / 86400000) % PROMPTS.length;
    const hydrateMission = window.setTimeout(() => {
      try {
        const parsed = saved ? JSON.parse(saved) : [];
        setCompleted(Array.isArray(parsed) ? parsed : []);
      } catch {
        setCompleted([]);
      }
      setPrompt(PROMPTS[promptIndex]);
    }, 0);
    return () => window.clearTimeout(hydrateMission);
  }, []);

  const toggleStep = (stepId: string) => {
    const next = completed.includes(stepId)
      ? completed.filter(id => id !== stepId)
      : [...completed, stepId];

    setCompleted(next);
    localStorage.setItem(getMissionKey(), JSON.stringify(next));

    if (!completed.includes(stepId) && profile) {
      saveCravingLog({
        id: generateId(),
        profileId: profile.id,
        cravingIntensity: 0,
        haltState: 'none',
        triggerType: `Daily mission: ${stepId}`,
        deescalationToolUsed: 'Todays Mission',
        wasRelapse: false,
        createdAt: now(),
      });
    }
  };

  const allComplete = completed.length === MISSIONS.length;

  return (
    <section className="motion-panel overflow-hidden rounded-[1.75rem] border border-[var(--mission-bg)] bg-[var(--mission-bg)] text-[var(--mission-fg)] shadow-[0_18px_50px_var(--shadow-color)]" aria-labelledby="mission-title">
      <div className="grid gap-8 p-5 md:grid-cols-[0.9fr_1.1fr] md:p-7">
        <div className="flex flex-col justify-between gap-8">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--mission-accent)]">
              <Compass size={14} /> A small plan for today
            </p>
            <h2 id="mission-title" className="font-display max-w-md text-4xl leading-[0.95] tracking-[-0.04em] md:text-5xl">
              Make the next choice easier.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--mission-muted)]">
              No perfect streak required. Complete one step, then let the next step become obvious.
            </p>
          </div>

          <div className="border-l-2 border-[var(--mission-accent)] pl-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--mission-accent)]">
              <Sparkles size={13} /> Carry this question
            </div>
            <p className="mt-2 font-display text-xl leading-tight text-[var(--mission-fg)]">{prompt}</p>
          </div>
        </div>

        <div className="space-y-3">
          {MISSIONS.map(step => {
            const isComplete = completed.includes(step.id);
            return (
              <div key={step.id} className={`rounded-2xl border p-4 transition-colors ${isComplete ? 'border-[var(--mission-accent)] bg-[var(--mission-accent)]/15' : 'border-[var(--mission-line)] bg-[var(--mission-step-bg)]'}`}>
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleStep(step.id)}
                    aria-label={`${isComplete ? 'Uncomplete' : 'Complete'} ${step.title}`}
                    aria-pressed={isComplete}
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${isComplete ? 'border-[var(--mission-accent)] bg-[var(--mission-accent)] text-[var(--mission-fg)]' : 'border-[var(--mission-line)] text-transparent hover:border-[var(--mission-accent)]'}`}
                  >
                    <Check size={15} strokeWidth={3} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--mission-accent)]">{step.eyebrow}</p>
                    <h3 className={`mt-1 font-display text-2xl leading-none ${isComplete ? 'text-[var(--mission-fg)] line-through decoration-[var(--mission-accent)]' : 'text-[var(--mission-fg)]'}`}>{step.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--mission-muted)]">{step.detail}</p>
                  </div>
                  <a href={step.href} aria-label={`Open ${step.title}`} className="mt-1 text-[var(--mission-muted)] transition-colors hover:text-[var(--mission-accent)]">
                    <ChevronRight size={18} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`flex items-center gap-3 border-t border-[var(--mission-line)] px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] md:px-7 ${allComplete ? 'text-[var(--mission-accent)]' : 'text-[var(--mission-muted)]'}`}>
        <Flame size={15} />
        {allComplete ? 'Today is yours. Come back tomorrow for a new plan.' : `${completed.length} of ${MISSIONS.length} steps complete`}
      </div>
    </section>
  );
}
