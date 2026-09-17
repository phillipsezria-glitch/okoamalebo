/**
 * Okoa Malebo - SOS Hook
 * Emergency craving de-escalation and grounding
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { HALTState } from '@/types';
import { generateId, now, saveCravingLog } from '@/lib/storage';
import { audioManager } from '@/lib/audio';

export function useSOS(profileId: string | null) {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<'timer' | 'grounding' | 'hotlines'>('timer');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [groundingSteps, setGroundingSteps] = useState<Array<{ id: number; label: string; completed: boolean }>>([
    { id: 5, label: '5 things you can see', completed: false },
    { id: 4, label: '4 things you can feel', completed: false },
    { id: 3, label: '3 sounds you can hear', completed: false },
    { id: 2, label: '2 things you can smell', completed: false },
    { id: 1, label: '1 positive truth: "This feeling is temporary. It will pass."', completed: false },
  ]);
  const timerRef = useRef<number | null>(null);

  const openSOS = useCallback(() => {
    setIsOpen(true);
    setPhase('timer');
    setTimerSeconds(60);
    setGroundingSteps([
      { id: 5, label: '5 things you can see', completed: false },
      { id: 4, label: '4 things you can feel', completed: false },
      { id: 3, label: '3 sounds you can hear', completed: false },
      { id: 2, label: '2 things you can smell', completed: false },
      { id: 1, label: '1 positive truth: "This feeling is temporary. It will pass."', completed: false },
    ]);
    audioManager.play('button_click');
  }, []);

  const closeSOS = useCallback(() => {
    setIsOpen(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startTimer = useCallback(() => {
    timerRef.current = window.setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          setPhase('grounding');
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const toggleGroundingStep = useCallback((stepId: number) => {
    audioManager.play('button_click');

    setGroundingSteps(prev => {
      const updated = prev.map(step => 
        step.id === stepId ? { ...step, completed: !step.completed } : step
      );
      if (updated.every(s => s.completed)) {
        setTimeout(() => setPhase('hotlines'), 500);
      }
      return updated;
    });
  }, []);

  const goToHotlines = useCallback(() => {
    setPhase('hotlines');
  }, []);

  const logCravingAndClose = useCallback((
    cravingIntensity: number,
    haltState: HALTState,
    triggerType: string,
    deescalationToolUsed: string
  ) => {
    if (!profileId) return;
    
    const log = {
      id: generateId(),
      profileId,
      cravingIntensity,
      haltState,
      triggerType,
      deescalationToolUsed,
      wasRelapse: false,
      createdAt: now(),
    };
    saveCravingLog(log);
    closeSOS();
  }, [profileId, closeSOS]);

  // Auto-start timer when SOS opens
  useEffect(() => {
    if (isOpen && phase === 'timer') {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, phase, startTimer]);

  // Hotline numbers
  const hotlines = [
    { name: 'NACADA Toll-Free', number: '1192', description: 'National Authority for Campaign Against Alcohol & Drug Abuse' },
    { name: 'Kenya Red Cross Crisis', number: '1199', description: 'Emergency medical & psychological support' },
    { name: 'Befrienders Kenya', number: '+254 722 178 177', description: 'Emotional support & suicide prevention' },
  ];

  return {
    isOpen,
    phase,
    timerSeconds,
    groundingSteps,
    hotlines,
    openSOS,
    closeSOS,
    toggleGroundingStep,
    goToHotlines,
    logCravingAndClose,
  };
}