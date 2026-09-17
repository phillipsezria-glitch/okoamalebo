/**
 * Okoa Malebo - LocalStorage Data Layer
 * Zero-backend, client-side only persistence
 */

import type {
  UserProfile,
  CravingLog,
  MilestoneAchievement,
  WallOfHopePost,
  CareFacility,
  AppSettings,
  BadgeKey,
  SubstanceType,
  HALTState,
  MoodLevel,
  FacilityType,
  FacilityTag,
} from '@/types';

// LocalStorage keys
export const STORAGE_KEYS = {
  PROFILE: 'okoa_profile',
  CRAVING_LOGS: 'okoa_craving_logs',
  MILESTONES: 'okoa_milestones',
  WALL_POSTS: 'okoa_wall_posts',
  SETTINGS: 'okoa_settings',
} as const;

// Generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get current timestamp
export function now(): number {
  return Date.now();
}

// LocalStorage helpers
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save to localStorage (${key}):`, error);
  }
}

// Profile management
export function getProfile(): UserProfile | null {
  return getFromStorage<UserProfile | null>(STORAGE_KEYS.PROFILE, null);
}

export function saveProfile(profile: UserProfile): void {
  setToStorage(STORAGE_KEYS.PROFILE, profile);
}

export function clearProfile(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  }
}

// Craving logs
export function getCravingLogs(): CravingLog[] {
  return getFromStorage<CravingLog[]>(STORAGE_KEYS.CRAVING_LOGS, []);
}

export function saveCravingLog(log: CravingLog): void {
  const logs = getCravingLogs();
  logs.unshift(log);
  setToStorage(STORAGE_KEYS.CRAVING_LOGS, logs);
}

// Milestones
export function getMilestones(): MilestoneAchievement[] {
  return getFromStorage<MilestoneAchievement[]>(STORAGE_KEYS.MILESTONES, []);
}

export function saveMilestone(milestone: MilestoneAchievement): void {
  const milestones = getMilestones();
  milestones.push(milestone);
  setToStorage(STORAGE_KEYS.MILESTONES, milestones);
}

export function hasMilestone(badgeKey: BadgeKey): boolean {
  const milestones = getMilestones();
  return milestones.some(m => m.badgeKey === badgeKey);
}

// Wall of Hope posts
export function getWallPosts(): WallOfHopePost[] {
  return getFromStorage<WallOfHopePost[]>(STORAGE_KEYS.WALL_POSTS, getDefaultWallPosts());
}

export function saveWallPost(post: WallOfHopePost): void {
  const posts = getWallPosts();
  posts.unshift(post);
  setToStorage(STORAGE_KEYS.WALL_POSTS, posts);
}

export function updateWallPostReactions(
  postId: string, 
  reactionType: 'chapaLuku' | 'simamaImara' | 'barikiwa'
): void {
  const posts = getWallPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.reactions[reactionType]++;
    setToStorage(STORAGE_KEYS.WALL_POSTS, posts);
  }
}

// Settings
export function getSettings(): AppSettings {
  return getFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS, {
    soundEnabled: true,
    hapticsEnabled: true,
    theme: 'system',
    language: 'en',
  });
}

export function saveSettings(settings: Partial<AppSettings>): void {
  const current = getSettings();
  setToStorage(STORAGE_KEYS.SETTINGS, { ...current, ...settings });
}

// Utility functions for calculations
export function calculateSobrietyDuration(startTime: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const diff = Math.max(0, now() - startTime);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

export function calculateTotalSaved(dailyBudgetKes: number, startTime: number): number {
  const { days, hours } = calculateSobrietyDuration(startTime);
  const totalHours = days * 24 + hours;
  return Math.floor((dailyBudgetKes / 24) * totalHours);
}

export function getEquivalentValue(totalSaved: number): string {
  if (totalSaved >= 100000) return 'Plot Deposit / SACCO Investment';
  if (totalSaved >= 25000) return 'Good Quality Laptop / Dairy Goat';
  if (totalSaved >= 5000) return '1 Month House Token/Electricity';
  if (totalSaved >= 1500) return '2kg Maize Flour for a week';
  if (totalSaved >= 200) return '1 Packet of Milk + Loaf of Bread';
  return 'Keep going! Every shilling counts';
}

export function getHealthImprovements(days: number): Array<{ timeline: string; metric: string }> {
  const improvements = [
    { timeline: '24 Hours', metric: 'Heart rate & blood pressure normalize', threshold: 1 },
    { timeline: '48 Hours', metric: 'Taste & smell senses sharpen, nerve endings heal', threshold: 2 },
    { timeline: '72 Hours', metric: 'Energy levels surge, breathing becomes easy', threshold: 3 },
    { timeline: '14 Days', metric: 'Liver fat reduction starts, deep REM sleep returns', threshold: 14 },
    { timeline: '30 Days', metric: 'Dopamine baseline resets, brain fog disappears', threshold: 30 },
  ];
  return improvements.filter(i => days >= i.threshold);
}

export function getNextMilestoneBadge(days: number): BadgeKey | null {
  if (days < 1) return '24_HOURS';
  if (days < 7) return '7_DAYS';
  if (days < 30) return '30_DAYS';
  if (days < 90) return '90_DAYS';
  if (days < 365) return '1_YEAR';
  return null;
}

export function checkAndAwardMilestones(profile: UserProfile): MilestoneAchievement[] {
  const { days } = calculateSobrietyDuration(profile.sobrietyStartTime);
  const totalSaved = calculateTotalSaved(profile.dailyBudgetKes, profile.sobrietyStartTime);
  const newMilestones: MilestoneAchievement[] = [];
  
  const milestonesToCheck: Array<{ badge: BadgeKey; threshold: number }> = [
    { badge: '24_HOURS', threshold: 1 },
    { badge: '7_DAYS', threshold: 7 },
    { badge: '30_DAYS', threshold: 30 },
    { badge: '90_DAYS', threshold: 90 },
    { badge: '1_YEAR', threshold: 365 },
  ];

  for (const { badge, threshold } of milestonesToCheck) {
    if (days >= threshold && !hasMilestone(badge)) {
      const milestone: MilestoneAchievement = {
        id: generateId(),
        profileId: profile.id,
        badgeKey: badge,
        totalMoneySavedKes: totalSaved,
        achievedAt: now(),
      };
      saveMilestone(milestone);
      newMilestones.push(milestone);
    }
  }

  return newMilestones;
}

// Default/sample data
function getDefaultWallPosts(): WallOfHopePost[] {
  return [
    {
      id: 'default-1',
      pseudoHandle: 'Simba_Safi_23',
      content: 'Day 5 sober from Keg. Leo nimeamka bila hangover for the first time in 2 years!',
      daysSober: 5,
      substance: 'alcohol',
      reactions: { chapaLuku: 42, simamaImara: 18, barikiwa: 95 },
      createdAt: now() - 86400000 * 2,
    },
    {
      id: 'default-2',
      pseudoHandle: 'Mwewe_Shujaa',
      content: 'Craving ilikuwa kali saa nne jioni, nikacheza ile game ya chupa, nikaipita. Tuko pamoja!',
      daysSober: 12,
      substance: 'bhang',
      reactions: { chapaLuku: 28, simamaImara: 35, barikiwa: 67 },
      createdAt: now() - 86400000 * 5,
    },
    {
      id: 'default-3',
      pseudoHandle: 'Pesa_Za_Malebo',
      content: 'Saved KES 14,000 this month. Just bought my daughter a school bicycle!',
      daysSober: 30,
      substance: 'alcohol',
      reactions: { chapaLuku: 89, simamaImara: 56, barikiwa: 134 },
      createdAt: now() - 86400000 * 10,
    },
  ];
}

// Care facilities data for Kenya
export const CARE_FACILITIES: CareFacility[] = [
  // Nairobi
  {
    id: 'nairobi-1',
    name: 'NACADA Treatment Centre - Nairobi',
    county: 'Nairobi',
    subCounty: 'Westlands',
    type: 'INPATIENT_REHAB',
    nacadaAccredited: true,
    shaNhifSupported: true,
    contactPhone: '0800 720 047',
    whatsappNumber: '254722123456',
    latitude: -1.2645,
    longitude: 36.8062,
    estimatedMonthlyCostKes: 45000,
    isVerified: true,
    tags: ['NACADA_VERIFIED', 'SHA_NHIF_SUPPORTED'],
  },
  {
    id: 'nairobi-2',
    name: 'Mathari National Teaching & Referral Hospital',
    county: 'Nairobi',
    subCounty: 'Mathare',
    type: 'OUTPATIENT_CLINIC',
    nacadaAccredited: true,
    shaNhifSupported: true,
    contactPhone: '020 239 1390',
    latitude: -1.2543,
    longitude: 36.8678,
    estimatedMonthlyCostKes: 5000,
    isVerified: true,
    tags: ['NACADA_VERIFIED', 'SHA_NHIF_SUPPORTED'],
  },
  {
    id: 'nairobi-3',
    name: 'AA Nairobi Central Group',
    county: 'Nairobi',
    subCounty: 'Starehe',
    type: 'AA_MEETING',
    nacadaAccredited: false,
    shaNhifSupported: false,
    contactPhone: '0722 123 456',
    whatsappNumber: '254722123456',
    latitude: -1.2833,
    longitude: 36.8167,
    estimatedMonthlyCostKes: 0,
    isVerified: true,
    tags: ['FREE_ENTRY'],
  },
  {
    id: 'nairobi-4',
    name: 'Retreat Healthcare - Karen',
    county: 'Nairobi',
    subCounty: 'Karen',
    type: 'INPATIENT_REHAB',
    nacadaAccredited: true,
    shaNhifSupported: true,
    contactPhone: '0700 123 456',
    whatsappNumber: '254700123456',
    latitude: -1.3197,
    longitude: 36.7158,
    estimatedMonthlyCostKes: 120000,
    isVerified: true,
    tags: ['NACADA_VERIFIED', 'SHA_NHIF_SUPPORTED'],
  },
  // Mombasa
  {
    id: 'mombasa-1',
    name: 'Coast General Hospital - MAT Clinic',
    county: 'Mombasa',
    subCounty: 'Mvita',
    type: 'MAT_METHADONE',
    nacadaAccredited: true,
    shaNhifSupported: true,
    contactPhone: '041 231 2044',
    latitude: -4.0435,
    longitude: 39.6682,
    estimatedMonthlyCostKes: 8000,
    isVerified: true,
    tags: ['NACADA_VERIFIED', 'SHA_NHIF_SUPPORTED'],
  },
  {
    id: 'mombasa-2',
    name: 'AA Mombasa Serenity Group',
    county: 'Mombasa',
    subCounty: 'Nyali',
    type: 'AA_MEETING',
    nacadaAccredited: false,
    shaNhifSupported: false,
    contactPhone: '0733 456 789',
    whatsappNumber: '254733456789',
    latitude: -4.0156,
    longitude: 39.7123,
    estimatedMonthlyCostKes: 0,
    isVerified: true,
    tags: ['FREE_ENTRY'],
  },
  // Kiambu
  {
    id: 'kiambu-1',
    name: 'Asumbi Treatment Centre - Kiambu Branch',
    county: 'Kiambu',
    subCounty: 'Kiambu Town',
    type: 'INPATIENT_REHAB',
    nacadaAccredited: true,
    shaNhifSupported: true,
    contactPhone: '0720 123 456',
    whatsappNumber: '254720123456',
    latitude: -1.1667,
    longitude: 36.8333,
    estimatedMonthlyCostKes: 60000,
    isVerified: true,
    tags: ['NACADA_VERIFIED', 'SHA_NHIF_SUPPORTED'],
  },
  // Nakuru
  {
    id: 'nakuru-1',
    name: 'Nakuru Level 5 Hospital - Addiction Unit',
    county: 'Nakuru',
    subCounty: 'Nakuru East',
    type: 'OUTPATIENT_CLINIC',
    nacadaAccredited: true,
    shaNhifSupported: true,
    contactPhone: '051 221 4141',
    latitude: -0.3031,
    longitude: 36.0800,
    estimatedMonthlyCostKes: 3000,
    isVerified: true,
    tags: ['NACADA_VERIFIED', 'SHA_NHIF_SUPPORTED'],
  },
  {
    id: 'nakuru-2',
    name: 'AA Nakuru Fellowship',
    county: 'Nakuru',
    subCounty: 'Nakuru West',
    type: 'AA_MEETING',
    nacadaAccredited: false,
    shaNhifSupported: false,
    contactPhone: '0711 234 567',
    whatsappNumber: '254711234567',
    latitude: -0.2833,
    longitude: 36.0667,
    estimatedMonthlyCostKes: 0,
    isVerified: true,
    tags: ['FREE_ENTRY'],
  },
  // Kisumu
  {
    id: 'kisumu-1',
    name: 'Jaramogi Oginga Odinga Teaching Hospital - Addiction Clinic',
    county: 'Kisumu',
    subCounty: 'Kisumu Central',
    type: 'OUTPATIENT_CLINIC',
    nacadaAccredited: true,
    shaNhifSupported: true,
    contactPhone: '057 202 2000',
    latitude: -0.0917,
    longitude: 34.7680,
    estimatedMonthlyCostKes: 4000,
    isVerified: true,
    tags: ['NACADA_VERIFIED', 'SHA_NHIF_SUPPORTED'],
  },
  // Uasin Gishu
  {
    id: 'uasin-gishu-1',
    name: 'Moi Teaching & Referral Hospital - AMPATH Clinic',
    county: 'Uasin Gishu',
    subCounty: 'Ainabkoi',
    type: 'OUTPATIENT_CLINIC',
    nacadaAccredited: true,
    shaNhifSupported: true,
    contactPhone: '053 203 3000',
    latitude: 0.5143,
    longitude: 35.2698,
    estimatedMonthlyCostKes: 3500,
    isVerified: true,
    tags: ['NACADA_VERIFIED', 'SHA_NHIF_SUPPORTED'],
  },
  // Kilifi
  {
    id: 'kilifi-1',
    name: 'Kilifi County Hospital - Substance Use Clinic',
    county: 'Kilifi',
    subCounty: 'Kilifi North',
    type: 'OUTPATIENT_CLINIC',
    nacadaAccredited: true,
    shaNhifSupported: true,
    contactPhone: '041 752 2000',
    latitude: -3.6305,
    longitude: 39.8499,
    estimatedMonthlyCostKes: 2500,
    isVerified: true,
    tags: ['NACADA_VERIFIED', 'SHA_NHIF_SUPPORTED'],
  },
  // Machakos
  {
    id: 'machakos-1',
    name: 'Machakos Level 5 Hospital - Addiction Services',
    county: 'Machakos',
    subCounty: 'Machakos Town',
    type: 'OUTPATIENT_CLINIC',
    nacadaAccredited: true,
    shaNhifSupported: true,
    contactPhone: '044 202 0000',
    latitude: -1.5167,
    longitude: 37.2667,
    estimatedMonthlyCostKes: 3000,
    isVerified: true,
    tags: ['NACADA_VERIFIED', 'SHA_NHIF_SUPPORTED'],
  },
];

export function getFacilitiesByCounty(county: string): CareFacility[] {
  return CARE_FACILITIES.filter(f => 
    f.county.toLowerCase() === county.toLowerCase()
  );
}

export function getAllCounties(): string[] {
  const counties = new Set(CARE_FACILITIES.map(f => f.county));
  return Array.from(counties).sort();
}

// Substance display names
export const SUBSTANCE_LABELS: Record<SubstanceType, string> = {
  alcohol: 'Pombe / Alcohol',
  bhang: 'Bhang / Cannabis',
  miraa: 'Miraa / Muguka',
  cigarettes: 'Cigarettes / Vapes',
  hard_drugs: 'Hard Drugs (Heroin, Cocaine, etc.)',
};

// HALT labels
export const HALT_LABELS: Record<HALTState, string> = {
  hungry: 'Njaa (Hungry)',
  angry: 'Hasira (Angry)',
  lonely: 'Upweke (Lonely)',
  tired: 'Kuchoka (Tired)',
  none: 'Siwezi kusema (None)',
};

// Mood labels
export const MOOD_LABELS: Record<MoodLevel, string> = {
  1: 'Chini Kabisa 😔',
  2: 'Si Vizuri 😕',
  3: 'Niko Tu 😐',
  4: 'Niko Sawa 🙂',
  5: 'Nimesimama Imara 😄',
};

// Badge labels
export const BADGE_LABELS: Record<BadgeKey, { label: string; description: string }> = {
  '24_HOURS': { label: '24 Hours', description: 'First day clean - The hardest step!' },
  '7_DAYS': { label: '7 Days', description: 'One week strong - Withdrawal easing' },
  '30_DAYS': { label: '30 Days', description: 'One month - Brain healing begins' },
  '90_DAYS': { label: '90 Days', description: 'Three months - New habits formed' },
  '1_YEAR': { label: '1 Year', description: 'Full year - A new life chapter' },
};

// Facility type labels
export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  INPATIENT_REHAB: 'Inpatient Rehab',
  OUTPATIENT_CLINIC: 'Outpatient Clinic',
  MAT_METHADONE: 'MAT / Methadone Clinic',
  AA_MEETING: 'AA Meeting',
  NA_MEETING: 'NA Meeting',
};

// Facility tag labels
export const FACILITY_TAG_LABELS: Record<FacilityTag, string> = {
  NACADA_VERIFIED: 'NACADA Verified',
  SHA_NHIF_SUPPORTED: 'SHA/NHIF Supported',
  FREE_ENTRY: 'Free Entry',
};