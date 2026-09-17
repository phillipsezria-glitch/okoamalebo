/**
 * Okoa Malebo - Type Definitions
 * Client-side only, zero-backend dependency
 */

export type SubstanceType = 
  | 'alcohol' 
  | 'bhang' 
  | 'miraa' 
  | 'cigarettes' 
  | 'hard_drugs';

export type HALTState = 'hungry' | 'angry' | 'lonely' | 'tired' | 'none';

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface UserProfile {
  id: string;
  pseudoHandle: string;
  name?: string;
  primarySubstance: SubstanceType;
  dailyBudgetKes: number;
  moneySavedPerDay?: number;
  currencySymbol?: string;
  sobrietyStartTime: number; // Unix timestamp in milliseconds
  createdAt: number;
  updatedAt: number;
  nguvuTokens?: number;
  cravingsResisted?: number;
  dailyStreak?: number;
  gamesPlayed?: Record<string, number>;
  highScores?: Record<string, number>;
  totalPlayTimeSeconds?: number;
  setbacks?: number;
  lastSetbackAt?: number;
  lastActiveDate?: string;
  soundEnabled?: boolean;
}

export interface CravingLog {
  id: string;
  profileId: string;
  cravingIntensity: number; // 1-10
  haltState: HALTState;
  triggerType: string;
  deescalationToolUsed?: string;
  wasRelapse: boolean;
  encryptedNotes?: string;
  createdAt: number;
}

export interface MilestoneAchievement {
  id: string;
  profileId: string;
  badgeKey: BadgeKey;
  totalMoneySavedKes: number;
  achievedAt: number;
}

export type BadgeKey = 
  | '24_HOURS' 
  | '7_DAYS' 
  | '30_DAYS' 
  | '90_DAYS' 
  | '1_YEAR';

export type GameId = 'vunja' | 'garden' | 'akili' | 'akiba';

export interface GameInfo {
  id: GameId;
  title: string;
  subtitle: string;
  badgeTag: string;
  icon: string;
  description: string;
  neuroImpact: string;
  color: string;
  category: 'Kinetic' | 'Mindfulness' | 'Cognitive';
  estimatedDuration: string;
  dimensionLabel: string;
}

export const GAMES_CATALOG: GameInfo[] = [
  {
    id: 'vunja',
    title: 'Bottle Shatter',
    subtitle: 'Tap bottles',
    badgeTag: 'Kinetic 3D',
    icon: '🍾',
    description: 'Smash falling bottles to release tension and interrupt the craving loop.',
    neuroImpact: 'Motor Urge Disruption & Somatic Venting',
    color: '#cf634d',
    category: 'Kinetic',
    estimatedDuration: '60s',
    dimensionLabel: 'WebGL 3D Physics',
  },
  {
    id: 'garden',
    title: 'Grounding Garden',
    subtitle: 'Catch good choices',
    badgeTag: 'Depth Arena',
    icon: '🌱',
    description: 'Catch healthy choices for hydration, movement, and steadiness.',
    neuroImpact: 'Dopamine Re-anchoring & Choice Conditioning',
    color: '#10b981',
    category: 'Mindfulness',
    estimatedDuration: '60s',
    dimensionLabel: '3D Perspective Field',
  },
  {
    id: 'akili',
    title: 'Focus Matrix',
    subtitle: 'Match pairs',
    badgeTag: '3D Card Flip',
    icon: '🧠',
    description: 'Match recovery symbols to redirect attention from an impulsive loop.',
    neuroImpact: 'Working Memory Re-activation',
    color: '#6f8fca',
    category: 'Cognitive',
    estimatedDuration: '45s - 90s',
    dimensionLabel: 'CSS 3D Depth',
  },
  {
    id: 'akiba',
    title: 'Savings Stacker',
    subtitle: 'Stack coins',
    badgeTag: '3D Stacking',
    icon: '🪙',
    description: 'Stack coins as a reminder of money protected through recovery.',
    neuroImpact: 'Concrete Reward Materialization',
    color: '#d49a3a',
    category: 'Cognitive',
    estimatedDuration: '60s',
    dimensionLabel: '3D Cylinder Physics',
  },
];

export interface WallOfHopePost {
  id: string;
  pseudoHandle: string;
  content: string;
  daysSober: number;
  substance: SubstanceType;
  reactions: {
    chapaLuku: number;
    simamaImara: number;
    barikiwa: number;
  };
  createdAt: number;
}

export interface CareFacility {
  id: string;
  name: string;
  county: string;
  subCounty: string;
  type: FacilityType;
  nacadaAccredited: boolean;
  shaNhifSupported: boolean;
  contactPhone: string;
  whatsappNumber?: string;
  latitude?: number;
  longitude?: number;
  estimatedMonthlyCostKes: number;
  isVerified: boolean;
  tags: FacilityTag[];
}

export type FacilityType = 
  | 'INPATIENT_REHAB' 
  | 'OUTPATIENT_CLINIC' 
  | 'MAT_METHADONE' 
  | 'AA_MEETING' 
  | 'NA_MEETING';

export type FacilityTag = 
  | 'NACADA_VERIFIED' 
  | 'SHA_NHIF_SUPPORTED' 
  | 'FREE_ENTRY';

export interface SobrietyMetrics {
  soberDuration: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  financials: {
    currency: 'KES';
    totalSaved: number;
    equivalentValue: string;
  };
  healthImprovements: HealthImprovement[];
  nextMilestoneBadge: BadgeKey | null;
}

export interface HealthImprovement {
  timeline: string;
  metric: string;
}

export interface SOSDispatch {
  dispatchType: 'BUDDY_ALERT' | 'NACADA_1192' | 'RED_CROSS_1199' | 'IN_APP_GROUNDING';
  clientCurrentState: 'ACUTE_CRAVING' | 'WITHDRAWAL_SYMPTOMS' | 'RELAPSE_IMMINENT' | 'PANIC_ATTACK';
  includeAssignedSponsor: boolean;
}

export interface SOSResponse {
  status: 'dispatched';
  interventionId: string;
  timestamp: string;
  hotlineFallback: string;
  actionPayload: string;
}

// LocalStorage keys
export const STORAGE_KEYS = {
  PROFILE: 'okoa_profile',
  CRAVING_LOGS: 'okoa_craving_logs',
  MILESTONES: 'okoa_milestones',
  WALL_POSTS: 'okoa_wall_posts',
  SETTINGS: 'okoa_settings',
} as const;

export interface AppSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'sw' | 'sheng';
}