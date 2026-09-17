import { RotateCcw, ShieldCheck } from 'lucide-react';

interface JourneySupportProps {
  setbacks: number;
  onRestart: () => void;
}

export function JourneySupport({ setbacks, onRestart }: JourneySupportProps) {
  const handleRestart = () => {
    if (window.confirm('Restart your sober timer from now? Your profile and recovery notes will be kept.')) {
      onRestart();
    }
  };

  return (
    <section className="motion-panel min-w-0 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-5">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" size={20} />
          <div className="min-w-0">
            <h2 className="break-words font-display text-2xl text-[var(--ink)]">A setback is not the end.</h2>
            <p className="mt-1 max-w-2xl break-words text-sm leading-relaxed text-[var(--muted)]">
              If you used again, be honest with yourself and restart safely. This keeps your notes and support history while starting a new sober timer from now.
            </p>
            {setbacks > 0 && (
              <p className="mt-2 break-words text-xs font-bold uppercase tracking-[0.12em] text-[var(--clay)]">
                Restarted journeys: {setbacks}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleRestart}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-[var(--ink)] bg-[var(--clay)] px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-[3px_3px_0_var(--ink)] transition-all hover:-translate-y-0.5 hover:bg-[var(--ink)] hover:shadow-[4px_4px_0_var(--clay)] active:translate-y-0.5 active:shadow-none"
        >
          <RotateCcw size={15} />
          Restart timer
        </button>
      </div>
    </section>
  );
}
