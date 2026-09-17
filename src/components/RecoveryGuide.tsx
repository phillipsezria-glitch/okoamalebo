import { BookOpen, CheckCircle2, HeartPulse, PhoneCall, ShieldCheck } from 'lucide-react';

const CRAVING_CYCLE = [
  {
    number: '01',
    title: 'Notice',
    text: 'Name what is happening: "I am having a craving." A craving is a feeling and body response, not an instruction.',
  },
  {
    number: '02',
    title: 'Interrupt',
    text: 'Change your setting for ten minutes. Drink water, move to a public or safer space, and put distance between you and the substance.',
  },
  {
    number: '03',
    title: 'Connect',
    text: 'Tell one trusted person what you need: company, a call, transport, or help reaching a professional service.',
  },
];

const TEN_MINUTE_PLAN = [
  'Take six slow breaths and relax your shoulders.',
  'Drink a glass of water and eat something if you have not eaten.',
  'Walk, stretch, shower, or stand somewhere with other people.',
  'Delay the decision for ten minutes, then repeat the plan.',
];

export function RecoveryGuide() {
  return (
    <section className="motion-panel rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] px-5 py-7 shadow-[0_18px_50px_var(--shadow-color)] md:px-7">
      <div className="mb-8 grid gap-5 md:grid-cols-[1fr_300px] md:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--clay)]">
            <BookOpen size={14} /> Recovery notes
          </p>
          <h2 className="font-display text-4xl leading-[0.95] tracking-[-0.04em] text-[var(--ink)] md:text-5xl">
            More than willpower.
          </h2>
        </div>
        <p className="border-l-4 border-[var(--acid)] pl-3 text-sm font-bold leading-relaxed text-[var(--ink)]">
          Dependence changes the brain and body. Support, treatment, and small repeatable actions can change the direction.
        </p>
      </div>

      <div className="recovery-cycle rounded-2xl border border-[var(--line)] md:grid md:grid-cols-3 md:gap-0 md:overflow-hidden">
        {CRAVING_CYCLE.map(step => (
          <article key={step.number} className="recovery-cycle__card border border-[var(--line)] bg-[var(--surface-raised)] p-5 md:border-b-0 md:border-l-0 md:first:border-l-0 md:last:border-r-0">
            <span className="font-mono text-xs font-bold text-[var(--clay)]">{step.number}</span>
            <h3 className="mt-6 font-display text-2xl text-[var(--ink)]">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.text}</p>
          </article>
        ))}
      </div>

      <div className="recovery-support mt-8 lg:grid lg:grid-cols-[1fr_0.9fr] lg:gap-6">
        <div className="recovery-support__card rounded-2xl border border-[var(--line)] bg-[var(--plan-bg)] p-5 text-[var(--plan-fg)]">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} />
            <h3 className="font-display text-xl text-[var(--plan-fg)]">Your next 10 minutes</h3>
          </div>
          <ol className="space-y-3 text-sm font-medium leading-relaxed text-[var(--plan-fg)]">
            {TEN_MINUTE_PLAN.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="min-w-7 font-mono text-xs font-bold text-[var(--plan-accent)]">0{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="recovery-support__card rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-5">
          <div className="mb-4 flex items-center gap-2">
            <HeartPulse size={18} className="text-[#c96f52]" />
            <h3 className="font-display text-xl text-[#17231e]">Recovery is support</h3>
          </div>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            A clinician, counsellor, peer group, or trusted person can help you make a plan that fits your substance use, health, home, and finances. You do not need to wait for a crisis to ask for help.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--ink)]">
            <span className="border border-[var(--line)] px-2 py-1">Confidential</span>
            <span className="border border-[var(--line)] px-2 py-1">No shame</span>
            <span className="border border-[var(--line)] px-2 py-1">One step at a time</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 border-t border-[var(--line)] pt-5 md:grid-cols-2">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" size={19} />
          <p className="text-xs leading-relaxed text-[var(--muted)]">
            <strong className="text-[var(--ink)]">Urgent safety:</strong> If someone is unconscious, having trouble breathing, having a seizure, severely confused, or at immediate risk, call emergency services and stay with them. Do not leave them alone.
          </p>
        </div>
        <div className="flex gap-3">
          <PhoneCall className="mt-0.5 shrink-0 text-[#c96f52]" size={19} />
          <p className="text-xs leading-relaxed text-[var(--muted)]">
            <strong className="text-[var(--ink)]">Kenya support:</strong> Use the SOS button for grounding and the directory below for care facilities. NACADA helpline: <a className="font-bold text-[var(--clay)] underline" href="tel:1192">1192</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
