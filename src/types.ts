/**
 * SafeTrip — Universal Travel & Commuter Safety Platform
 * Shared TypeScript Domain Models
 */

export type TravelerPersona = 'student' | 'commuter' | 'traveler' | 'runner' | 'general';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  persona: TravelerPersona;
  emergencyPin: string;
  createdAt: number;
  tripsCompletedCount?: number;
  reportsFiledCount?: number;
  bio?: string;
  emergencyMedicalInfo?: string;
}

export interface AuthSession {
  user: UserProfile;
  token: string;
  isAuthenticated: boolean;
}

export interface TrustedContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: 'Family' | 'Roommate' | 'Colleague' | 'Friend' | 'Partner' | 'Other';
  isDefaultGuardian: boolean;
  createdAt: number;
}

export type HazardCategory =
  | 'poor_lighting'
  | 'isolated_area'
  | 'road_hazard'
  | 'stray_animals'
  | 'harassment'
  | 'broken_infrastructure'
  | 'other';

export type HazardSeverity = 'low' | 'medium' | 'high';

export interface SafetyReport {
  id: string;
  userId: string;
  userName: string;
  category: HazardCategory;
  severity: HazardSeverity;
  description: string;
  location: {
    lat: number;
    lng: number;
    approxAddress: string;
  };
  upvotes: number;
  userUpvoted?: boolean;
  createdAt: number;
  verified: boolean;
  imageUrl?: string;
}

export type TripStatus =
  | 'idle'
  | 'active'
  | 'paused'
  | 'check_in_due'
  | 'overdue_alert'
  | 'completed'
  | 'cancelled';

export type TravelMode = 'walking' | 'transit' | 'cab' | 'cycling' | 'driving';

export interface GeoPoint {
  lat: number;
  lng: number;
  address: string;
}

export interface TripSession {
  id: string;
  userId: string;
  origin: GeoPoint;
  destination: GeoPoint;
  travelMode: TravelMode;
  status: TripStatus;
  startedAt: number;
  expectedDurationMinutes: number;
  checkInIntervalMinutes: number;
  lastCheckInAt: number;
  nextCheckInDueAt: number;
  overdueGraceExpiresAt?: number;
  selectedContactIds: string[];
  shareToken: string;
}

export interface SafetyFactor {
  id: string;
  title: string;
  impact: number; // e.g. +10, -15
  status: 'positive' | 'warning' | 'negative';
  description: string;
}

export interface SafetyScoreData {
  score: number; // 0 to 100
  ratingLabel: 'Low Concerns' | 'Moderate Concerns' | 'Elevated Caution';
  confidence: 'Low' | 'Medium' | 'High';
  factors: SafetyFactor[];
  disclaimer: string;
  policeStationsNearby: number;
  verifiedHazardsCount: number;
  isNightTime: boolean;
}

export interface AssistancePoint {
  id: string;
  name: string;
  type: 'police' | 'hospital' | 'transit_hub' | 'safe_spot';
  lat: number;
  lng: number;
  address: string;
  isOpen24h: boolean;
}

export interface UserSettings {
  batterySaverEnabled: boolean;
  lowBatteryThreshold: number; // 20%
  normalPollingIntervalSeconds: number; // 30s
  batterySaverPollingIntervalSeconds: number; // 120s (2m)
}

