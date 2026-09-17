'use client';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { useEffect, useState } from 'react';
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
import { ChapterNav, type ChapterId } from '@/components/ChapterNav';

const dashboardContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 26, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 240,
      damping: 24,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 6 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 420, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 4,
    transition: { duration: 0.16, ease: 'easeOut' },
  },
};

export default function Dashboard() {
  const { profile, isLoaded, isOnboarded, sobrietyDuration, createProfile, updateProfile } = useProfile();
  const sos = useSOS(profile?.id || null);
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<ChapterId>('today-mission');

  useEffect(() => {
    if (!isLoaded) return;

    const timer = window.setTimeout(() => setShowSplash(false), 1200);
    const handleSkip = () => setShowSplash(false);

    window.addEventListener('pointerdown', handleSkip, { passive: true, once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', handleSkip);
    };
  }, [isLoaded]);

  if (!isLoaded || showSplash) {
    return <SplashScreen onSkip={() => setShowSplash(false)} />;
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

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'today-mission':
        return (
          <>
            <motion.header
              variants={dashboardContainerVariants}
              initial="hidden"
              animate="show"
              className="relative z-0 border-b border-[var(--line)] bg-[linear-gradient(135deg,var(--header-start),var(--header-end))]"
            >
              <div className="px-3 pb-4 pt-3">
                <motion.div variants={cardVariants} className="flex items-center justify-between gap-3 rounded-full border border-[var(--line)] bg-[var(--paper)]/75 px-3 py-2 shadow-[0_6px_18px_var(--shadow-color)] backdrop-blur-md">
                  <div className="flex min-w-0 items-center gap-3">
                    <BrandMark />
                    <div className="min-w-0">
                      <p className="text-base font-semibold leading-none text-[var(--ink)]">Okoa Malebo</p>
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Private recovery space</p>
                    </div>
                  </div>
                  <ThemeToggle />
                </motion.div>

                <div className="mt-3 space-y-3">
                  <motion.div variants={cardVariants} className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--paper)]/75 p-3 shadow-[0_10px_20px_var(--shadow-color)] backdrop-blur-md">
                    <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[var(--clay)]">Kenya / one day at a time</p>
                    <h1 className="mt-2 text-[2rem] font-semibold leading-[0.94] tracking-[-0.05em] text-[var(--ink)]">
                      A clearer
                      <span className="mt-1 block text-[var(--ink)]">next step</span>
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                      Tools for the next ten minutes, the next honest conversation, and the next day without substances.
                    </p>
                  </motion.div>

                  <motion.div variants={cardVariants} className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--paper)]/80 p-3 shadow-[0_10px_20px_var(--shadow-color)] backdrop-blur-md">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Your journey</p>
                      <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--clay)]">Live</span>
                    </div>
                    <p className="mt-2 text-2xl font-semibold leading-none text-[var(--ink)]">{profile?.pseudoHandle}</p>
                    <div className="mt-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-3">
                      <div className="flex items-end justify-between gap-3">
                        <span className="text-xs font-medium text-[var(--muted)]">Current streak</span>
                        <span className="font-mono text-lg font-bold text-[var(--ink)]">{sobrietyDuration.days}d {sobrietyDuration.hours}h</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.header>

            <motion.section
              key="today-mission"
              variants={sectionVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="space-y-3 px-3 py-3"
            >
              <ChapterHeader number="01" eyebrow="Today" title="One choice at a time." />
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-3 shadow-[0_10px_30px_var(--shadow-color)]">
                <TodaysMission />
              </div>
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-3 shadow-[0_10px_30px_var(--shadow-color)]">
                <RecoveryToolkit />
              </div>
            </motion.section>
          </>
        );
      case 'recovery':
        return (
          <motion.section
            key="recovery"
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="space-y-3 px-3 py-3"
          >
            <ChapterHeader number="02" eyebrow="Recovery" title="Notice the progress." />
            <div className="motion-stagger grid grid-cols-1 gap-4">
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-3 shadow-[0_10px_30px_var(--shadow-color)]">
                <SobrietyOdometer />
              </div>
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-3 shadow-[0_10px_30px_var(--shadow-color)]">
                <PiggyBank />
              </div>
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
          </motion.section>
        );
      case 'arcade':
        return (
          <motion.section
            key="arcade"
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="space-y-3 px-3 py-3"
          >
            <ChapterHeader number="03" eyebrow="Reset" title="Change the signal." />
            <CravingArcade />
          </motion.section>
        );
      case 'support':
        return (
          <motion.section
            key="support"
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="space-y-3 px-3 py-3"
          >
            <ChapterHeader number="04" eyebrow="Support" title="You do not do this alone." />
            <div id="notes" className="grid scroll-mt-6 grid-cols-1 gap-4">
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-3 shadow-[0_10px_30px_var(--shadow-color)]">
                <MoodCheckIn />
              </div>
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-3 shadow-[0_10px_30px_var(--shadow-color)]">
                <WallOfHope />
              </div>
            </div>
            <CountyDirectory />
          </motion.section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] pb-28 text-[var(--foreground)]">
      <CursorConstellation />

      <div className="px-3 pb-0 pt-3">
        <ChapterNav active={activeTab} onSelect={setActiveTab} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={sectionVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className="min-h-[20rem]"
        >
          {renderActiveSection()}
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ y: 90 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 290, damping: 28, delay: 0.18 }}
      >
        <SOSButton onClick={sos.openSOS} />
      </motion.div>
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

function SplashScreen({ onSkip }: { onSkip: () => void }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="splash-screen"
        className="splash-screen"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeInOut' } }}
        onPointerDown={onSkip}
      >
        <motion.div
          className="splash-screen__backdrop"
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
        />

        <div className="splash-screen__content">
          <motion.div
            className="splash-core"
            initial={{ opacity: 0, scale: 0.78, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="splash-core__pulse"
              initial={{ scale: 0.9, opacity: 0.3 }}
              animate={{ scale: [0.9, 1.28, 1.42], opacity: [0.3, 0.85, 0.1] }}
              transition={{ duration: 1.5, ease: 'easeOut', repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.15 }}
            />
            <motion.div
              className="splash-core__ring"
              initial={{ scale: 0.8, opacity: 0.2 }}
              animate={{ scale: [0.8, 1.1, 1.26], opacity: [0.2, 0.75, 0.15] }}
              transition={{ duration: 1.6, ease: 'easeOut', repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.1 }}
            />
            <div className="splash-core__icon">
              <BrandMark size="lg" />
            </div>
          </motion.div>

          <motion.div
            className="splash-screen__text"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
          >
            <p className="splash-screen__eyebrow">Okoa Malebo</p>
            <h1 className="splash-screen__title">One day at a time</h1>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
