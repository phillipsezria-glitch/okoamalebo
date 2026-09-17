/**
 * Okoa Malebo - Profile Hook
 * Manages user profile state and persistence
 */

import { useState, useEffect, useCallback } from 'react';
import type { UserProfile, SubstanceType, AppSettings } from '@/types';
import { 
  getProfile, 
  saveProfile, 
  clearProfile, 
  getSettings, 
  saveSettings,
  calculateSobrietyDuration,
  calculateTotalSaved,
  getEquivalentValue,
  getHealthImprovements,
  getNextMilestoneBadge,
  checkAndAwardMilestones,
  STORAGE_KEYS
} from '@/lib/storage';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    soundEnabled: true,
    hapticsEnabled: true,
    theme: 'system',
    language: 'en',
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load profile and settings on mount
  useEffect(() => {
    const loadState = window.setTimeout(() => {
      setProfile(getProfile());
      setSettings(getSettings());
      setIsLoaded(true);
    }, 0);
    const handleProfileUpdate = () => setProfile(getProfile());
    window.addEventListener('okoa-profile-updated', handleProfileUpdate);
    return () => {
      window.clearTimeout(loadState);
      window.removeEventListener('okoa-profile-updated', handleProfileUpdate);
    };
  }, []);

  // Create new profile
  const createProfile = useCallback((
    pseudoHandle: string,
    primarySubstance: SubstanceType,
    dailyBudgetKes: number,
    sobrietyStartTime: number
  ): UserProfile => {
    const newProfile: UserProfile = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pseudoHandle,
      primarySubstance,
      dailyBudgetKes,
      sobrietyStartTime,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveProfile(newProfile);
    setProfile(newProfile);
    return newProfile;
  }, []);

  // Update profile
  const updateProfile = useCallback((updates: Partial<UserProfile>): void => {
    if (!profile) return;
    const updated = { ...profile, ...updates, updatedAt: Date.now() };
    saveProfile(updated);
    setProfile(updated);
    window.dispatchEvent(new Event('okoa-profile-updated'));
  }, [profile]);

  const addTokens = useCallback((amount: number) => {
    if (!profile) return;
    updateProfile({ nguvuTokens: (profile.nguvuTokens || 0) + amount });
  }, [profile, updateProfile]);

  const recordGameScore = useCallback((gameId: string, score: number, playTimeSeconds = 60) => {
    if (!profile) return;
    const currentHigh = profile.highScores?.[gameId] || 0;
    updateProfile({
      nguvuTokens: (profile.nguvuTokens || 0) + Math.max(5, Math.floor(score / 15)),
      totalPlayTimeSeconds: (profile.totalPlayTimeSeconds || 0) + playTimeSeconds,
      gamesPlayed: {
        ...profile.gamesPlayed,
        [gameId]: (profile.gamesPlayed?.[gameId] || 0) + 1,
      },
      highScores: {
        ...profile.highScores,
        [gameId]: Math.max(currentHigh, score),
      },
    });
  }, [profile, updateProfile]);

  // Delete profile (zero footprint)
  const deleteProfile = useCallback((): void => {
    clearProfile();
    // Clear all other storage
    Object.values(STORAGE_KEYS).forEach(key => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    });
    setProfile(null);
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<AppSettings>): void => {
    const updated = { ...settings, ...newSettings };
    saveSettings(updated);
    setSettings(updated);
  }, [settings]);

  // Computed values
  const sobrietyDuration = profile 
    ? calculateSobrietyDuration(profile.sobrietyStartTime)
    : { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const totalSaved = profile 
    ? calculateTotalSaved(profile.dailyBudgetKes, profile.sobrietyStartTime)
    : 0;

  const equivalentValue = getEquivalentValue(totalSaved);

  const healthImprovements = profile 
    ? getHealthImprovements(sobrietyDuration.days)
    : [];

  const nextMilestone = profile 
    ? getNextMilestoneBadge(sobrietyDuration.days)
    : null;

  const isOnboarded = !!profile;

  return {
    profile,
    settings,
    isLoaded,
    isOnboarded,
    sobrietyDuration,
    totalSaved,
    equivalentValue,
    healthImprovements,
    nextMilestone,
    createProfile,
    updateProfile,
    addTokens,
    recordGameScore,
    deleteProfile,
    updateSettings,
    checkAndAwardMilestones: () => profile ? checkAndAwardMilestones(profile) : [],
  };
}