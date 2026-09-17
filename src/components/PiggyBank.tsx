/**
 * Okoa Malebo - Piggy Bank Savings Component
 * Animated counter showing money saved with local purchasing equivalents
 */

'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';

export function PiggyBank() {
  const { totalSaved, equivalentValue } = useProfile();
  const [animatedValue, setAnimatedValue] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Animate the counter
  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const startValue = animatedValue;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.floor(startValue + (totalSaved - startValue) * eased);
      setAnimatedValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (totalSaved > startValue && totalSaved >= 200) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    };
    
    animate();
  }, [totalSaved, animatedValue]);

  // Milestone thresholds
  const milestones = [
    { amount: 200, label: '1 Packet of Milk + Loaf of Bread', icon: '🥛🍞' },
    { amount: 1500, label: '2kg Maize Flour for a week', icon: '🌽' },
    { amount: 5000, label: '1 Month House Token/Electricity', icon: '💡' },
    { amount: 25000, label: 'Good Quality Laptop / Dairy Goat', icon: '💻🐐' },
    { amount: 100000, label: 'Plot Deposit / SACCO Investment', icon: '🏠💰' },
  ];

  const nextMilestone = milestones.find(m => totalSaved < m.amount);
  const completedMilestones = milestones.filter(m => totalSaved >= m.amount);
  const progress = nextMilestone 
    ? (totalSaved / nextMilestone.amount) * 100 
    : 100;

  return (
    <div className="motion-panel bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <Confetti />
        </div>
      )}

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-lg font-semibold text-slate-800">Piggy Bank Savings</h3>
        <div className="text-4xl animate-bounce">🐷</div>
      </div>

      <div className="relative z-10 mb-6">
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-slate-500">KES</span>
          <span className="font-mono text-4xl font-bold text-emerald-700">
            {animatedValue.toLocaleString()}
          </span>
        </div>
        <p className="text-center text-sm text-slate-500 mt-1">{equivalentValue}</p>
      </div>

      {/* Progress to next milestone */}
      {nextMilestone && (
        <div className="relative z-10 mb-6">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progress to next milestone</span>
            <span>{Math.min(Math.round(progress), 100)}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1 text-center">
            Next: {nextMilestone.icon} {nextMilestone.label} at KES {nextMilestone.amount.toLocaleString()}
          </p>
        </div>
      )}

      {/* Completed milestones */}
      {completedMilestones.length > 0 && (
        <div className="relative z-10">
          <p className="text-xs text-slate-500 mb-2">Milestones reached:</p>
          <div className="flex flex-wrap gap-2">
            {completedMilestones.map((m, i) => (
              <span 
                key={m.amount}
                className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span>{m.icon}</span>
                {m.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {completedMilestones.length === 0 && !nextMilestone && (
        <p className="text-center text-slate-500 text-sm relative z-10">
          Keep going! Every shilling counts 💪
        </p>
      )}
    </div>
  );
}

function Confetti() {
  const colors = ['#059669', '#D97706', '#3B82F6', '#EC4899', '#8B5CF6'];
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <ConfettiPiece key={i} color={colors[i % colors.length]} />
      ))}
    </div>
  );
}

function ConfettiPiece({ color }: { color: string }) {
  const [{ left, delay, duration, size, rotation }] = useState(() => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1,
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));
  
  return (
    <div
      className="absolute top-0"
      style={{
        left: `${left}%`,
        backgroundColor: color,
        width: `${size}px`,
        height: `${size}px`,
        transform: `rotate(${rotation}deg)`,
        animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`,
      }}
    />
  );
}