/**
 * Okoa Malebo - Sobriety Odometer Component
 * Real-time ticking clock showing days, hours, minutes, seconds
 */

'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { calculateSobrietyDuration } from '@/lib/storage';

export function SobrietyOdometer() {
  const { profile, healthImprovements, nextMilestone } = useProfile();
  const [liveDuration, setLiveDuration] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Update every second - use profile's stable start time
  useEffect(() => {
    if (!profile) return;
    
    const updateDuration = () => {
      setLiveDuration(calculateSobrietyDuration(profile.sobrietyStartTime));
    };
    
    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [profile]);

  const currentHealth = healthImprovements[healthImprovements.length - 1];
  const nextHealth = healthImprovements[healthImprovements.length] || null;

  return (
    <div className="motion-panel bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Sobriety Odometer</h3>
        {nextMilestone && (
          <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
            Next: {nextMilestone.replace('_', ' ')}
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <TimeUnit value={liveDuration.days} label="Days" />
        <TimeUnit value={liveDuration.hours} label="Hours" />
        <TimeUnit value={liveDuration.minutes} label="Minutes" />
        <TimeUnit value={liveDuration.seconds} label="Seconds" />
      </div>

      {currentHealth && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 text-emerald-700 mb-1">
            <span className="text-lg">✅</span>
            <span className="font-medium">{currentHealth.timeline}</span>
          </div>
          <p className="text-emerald-800 text-sm">{currentHealth.metric}</p>
        </div>
      )}

      {nextHealth && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-700 mb-1">
            <span className="text-lg">🎯</span>
            <span className="font-medium">Coming up: {nextHealth.timeline}</span>
          </div>
          <p className="text-amber-800 text-sm">{nextHealth.metric}</p>
        </div>
      )}
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 text-center">
      <div className="counter-pop font-mono text-3xl font-bold text-slate-800">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}