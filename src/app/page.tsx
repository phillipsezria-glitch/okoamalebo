'use client';
import { useProfile } from '@/hooks/useProfile';
import { useSOS } from '@/hooks/useSOS';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { SobrietyOdometer } from '@/components/SobrietyOdometer';
import { PiggyBank } from '@/components/PiggyBank';
import { RecoveryGuide } from '@/components/RecoveryGuide';
import { CravingArcade } from '@/components/CravingArcade';
import { JourneySupport } from '@/components/JourneySupport';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MoodCheckIn } from '@/components/MoodCheckIn';
import { WallOfHope } from '@/components/WallOfHope';
import { CountyDirectory } from '@/components/CountyDirectory';
import { SOSModal, SOSButton } from '@/components/SOSModal';
import { TodaysMission } from '@/components/TodaysMission';
import { CursorConstellation } from '@/components/CursorConstellation';
import { RecoveryToolkit } from '@/components/RecoveryToolkit';
import { BrandMark } from '@/components/BrandMark';
import { ScrollProgress } from '@/components/ScrollProgress';
import { ScrollComet } from '@/components/ScrollComet';
import { ChapterNav } from '@/components/ChapterNav';

export default function Dashboard() {
  const { profile, isLoaded, isOnboarded, sobrietyDuration, createProfile, updateProfile } = useProfile();
  const sos = useSOS(profile?.id || null);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="text-4xl mb-4">🌿</div>
          <p className="text-[var(--muted)]">Loading Okoa Malebo...</p>
        </div>
      </div>
    );
  }

  if (!isOnboarded) {
    return (
      <div className="relative min-h-screen bg-[var(--background)]">
        <div className="absolute right-5 top-5 z-10">
          <ThemeToggle />
        </div>
        <OnboardingWizard
          createProfile={createProfile}
          onComplete={() => {}} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 text-[var(--foreground)]">
      <CursorConstellation />
      <ScrollProgress />
      <ChapterNav />
      <header className="relative overflow-hidden border-b border-[var(--line)] bg-[linear-gradient(120deg,var(--header-start),var(--header-end))]">
        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full border-[28px] border-white/20" />
        <div className="mx-auto max-w-6xl px-5 pb-10 pt-5 md:px-8 md:pb-14">
          <div className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandMark />
              <div>
                <p className="font-display text-lg leading-none">Okoa Malebo</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Private recovery space</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_300px] md:items-end">
            <div className="relative z-10">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--clay)]">Kenya / one day at a time</p>
              <h1 className="font-display max-w-3xl text-6xl leading-[0.86] tracking-[-0.06em] text-[var(--ink)] md:text-8xl">A clearer<br />next step<span className="text-[var(--clay)]">.</span></h1>
              <p className="mt-6 max-w-lg text-sm font-medium leading-relaxed text-[var(--ink)]/80 md:text-base">Tools for the next ten minutes, the next honest conversation, and the next day without substances.</p>
            </div>
            <div className="relative z-10 rounded-3xl border border-white/30 bg-white/20 p-5 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Your journey</p>
              <p className="font-display mt-2 text-3xl leading-none text-[var(--ink)]">{profile?.pseudoHandle}</p>
              <div className="mt-5 flex items-end justify-between border-t border-[var(--ink)]/15 pt-4">
                <span className="text-xs font-medium text-[var(--muted)]">Current streak</span>
                <span className="font-mono text-lg font-bold text-[var(--ink)]">{sobrietyDuration.days}d {sobrietyDuration.hours}h</span>
              </div>
            </div>
          </div>
          <ScrollComet />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 overflow-hidden px-4 py-8 sm:px-5 md:space-y-10 md:px-8 md:py-12">
        <section id="today-mission" className="chapter-section chapter-section--today scroll-mt-6" data-chapter="01 / TODAY">
          <ChapterHeader number="01" eyebrow="Today" title="One choice at a time." />
          <TodaysMission />
          <RecoveryToolkit />
        </section>

        <section id="recovery" className="chapter-section chapter-section--recovery" data-chapter="02 / RECOVERY">
          <ChapterHeader number="02" eyebrow="Recovery" title="Notice the progress." />
          <div className="motion-stagger grid grid-cols-1 gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-start">
            <SobrietyOdometer />
            <PiggyBank />
          </div>
          <div id="check-in" className="scroll-mt-6">
            <RecoveryGuide />
          </div>
          <JourneySupport
            setbacks={profile?.setbacks || 0}
            onRestart={() => updateProfile({
              sobrietyStartTime: Date.now(),
              setbacks: (profile?.setbacks || 0) + 1,
              lastSetbackAt: Date.now(),
            })}
          />
        </section>

        <section id="arcade" className="chapter-section chapter-section--reset scroll-mt-6" data-chapter="03 / RESET">
          <ChapterHeader number="03" eyebrow="Reset" title="Change the signal." />
          <CravingArcade />
        </section>

        <section id="support" className="chapter-section chapter-section--support" data-chapter="04 / SUPPORT">
          <ChapterHeader number="04" eyebrow="Support" title="You do not do this alone." />
          <div id="notes" className="grid scroll-mt-6 grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <MoodCheckIn />
            <WallOfHope />
          </div>
          <CountyDirectory />
        </section>
      </main>

      {/* SOS Button & Modal */}
      <SOSButton onClick={sos.openSOS} />
      <SOSModal controller={{
        isOpen: sos.isOpen,
        phase: sos.phase,
        timerSeconds: sos.timerSeconds,
        groundingSteps: sos.groundingSteps,
        hotlines: sos.hotlines,
        openSOS: sos.openSOS,
        closeSOS: sos.closeSOS,
        toggleGroundingStep: sos.toggleGroundingStep,
        goToHotlines: sos.goToHotlines,
        logCravingAndClose: sos.logCravingAndClose,
      }} />
    </div>
  );
}

function ChapterHeader({ number, eyebrow, title }: { number: string; eyebrow: string; title: string }) {
  return (
    <div className="chapter-header">
      <span className="chapter-header__number">{number}</span>
      <div>
        <p className="chapter-header__eyebrow">{eyebrow}</p>
        <h2 className="chapter-header__title">{title}</h2>
      </div>
    </div>
  );
}
