/**
 * SafeTrip Persistent State & Seed Repository
 * Handles offline persistence, demo presets, contacts, and community reports.
 */

import { UserProfile, TrustedContact, SafetyReport, TripSession, AssistancePoint, GeoPoint, UserSettings, AuthSession, TravelerPersona } from '../types';

export const DEMO_CITIES: Record<string, { name: string; center: GeoPoint; presets: { origin: GeoPoint; dest: GeoPoint; title: string }[] }> = {
  pune: {
    name: 'Pune, Maharashtra',
    center: { lat: 18.5204, lng: 73.8567, address: 'Shivajinagar, Pune' },
    presets: [
      {
        title: 'College Campus → Home',
        origin: { lat: 18.5293, lng: 73.8324, address: 'COEP Technological University, Shivajinagar' },
        dest: { lat: 18.5679, lng: 73.9143, address: 'Viman Nagar, Pune' },
      },
      {
        title: 'IT Park → Railway Station',
        origin: { lat: 18.5913, lng: 73.7389, address: 'Hinjewadi Phase 1, Pune' },
        dest: { lat: 18.5284, lng: 73.8744, address: 'Pune Junction Railway Station' },
      },
    ],
  },
  bengaluru: {
    name: 'Bengaluru, Karnataka',
    center: { lat: 12.9716, lng: 77.5946, address: 'MG Road, Bengaluru' },
    presets: [
      {
        title: 'Office Hub → Koramangala',
        origin: { lat: 12.9719, lng: 77.6412, address: 'Indiranagar 100ft Road, Bengaluru' },
        dest: { lat: 12.9352, lng: 77.6245, address: 'Koramangala 4th Block, Bengaluru' },
      },
      {
        title: 'Metro Station → Tech Park',
        origin: { lat: 12.9784, lng: 77.6408, address: 'Swami Vivekananda Metro Station' },
        dest: { lat: 12.9698, lng: 77.7499, address: 'Whitefield Main Road' },
      },
    ],
  },
  delhi: {
    name: 'Delhi NCR',
    center: { lat: 28.6139, lng: 77.2090, address: 'Connaught Place, New Delhi' },
    presets: [
      {
        title: 'North Campus → Metro Hub',
        origin: { lat: 28.6892, lng: 77.2104, address: 'Delhi University North Campus' },
        dest: { lat: 28.6328, lng: 77.2197, address: 'Rajiv Chowk Metro Station' },
      },
      {
        title: 'Evening Commute to South Delhi',
        origin: { lat: 28.6304, lng: 77.2177, address: 'Barakhamba Road' },
        dest: { lat: 28.5494, lng: 77.2001, address: 'Hauz Khas Village' },
      },
    ],
  },
};

const INITIAL_CONTACTS: TrustedContact[] = [
  {
    id: 'c-1',
    userId: 'demo-user',
    name: 'Priya Sharma (Parent)',
    phone: '+91 98765 43210',
    relationship: 'Family',
    isDefaultGuardian: true,
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'c-2',
    userId: 'demo-user',
    name: 'Arjun Verma (Roommate)',
    phone: '+91 98111 22334',
    relationship: 'Roommate',
    isDefaultGuardian: true,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'c-3',
    userId: 'demo-user',
    name: 'Kavita Joshi (Colleague)',
    phone: '+91 94222 33445',
    relationship: 'Colleague',
    isDefaultGuardian: false,
    createdAt: Date.now() - 86400000 * 2,
  },
];

const INITIAL_REPORTS: SafetyReport[] = [
  {
    id: 'rep-1',
    userId: 'user-88',
    userName: 'Karan M.',
    category: 'poor_lighting',
    severity: 'medium',
    description: 'Streetlights out for ~300m along the river bridge lane. Very dark after 8 PM.',
    location: {
      lat: 18.5320,
      lng: 73.8420,
      approxAddress: 'Near Bund Garden Bridge, Pune',
    },
    upvotes: 14,
    userUpvoted: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
    verified: true,
  },
  {
    id: 'rep-2',
    userId: 'user-42',
    userName: 'Ananya S.',
    category: 'isolated_area',
    severity: 'low',
    description: 'Bus stop after 9 PM has no kiosk or staff. Better to wait at the main junction 200m ahead.',
    location: {
      lat: 18.5550,
      lng: 73.8920,
      approxAddress: 'Airport Road Underpass, Pune',
    },
    upvotes: 8,
    userUpvoted: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 18,
    verified: true,
  },
  {
    id: 'rep-3',
    userId: 'user-19',
    userName: 'Rohan P.',
    category: 'stray_animals',
    severity: 'medium',
    description: 'Pack of aggressive stray dogs near back gate of tech park. Cyclists and walkers beware.',
    location: {
      lat: 18.5880,
      lng: 73.7420,
      approxAddress: 'Phase 1 Back Alley, Hinjewadi',
    },
    upvotes: 21,
    userUpvoted: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 36,
    verified: true,
  },
  {
    id: 'rep-4',
    userId: 'user-61',
    userName: 'Deepa T.',
    category: 'road_hazard',
    severity: 'low',
    description: 'Deep open trench for fiber cable without warning barrier.',
    location: {
      lat: 12.9680,
      lng: 77.6390,
      approxAddress: '100ft Road Corner, Indiranagar, Bengaluru',
    },
    upvotes: 11,
    userUpvoted: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    verified: true,
  },
  {
    id: 'rep-5',
    userId: 'user-77',
    userName: 'Vikram N.',
    category: 'harassment',
    severity: 'high',
    description: 'Group loitering near unlit ATM vestibule, making hostile remarks at passersby.',
    location: {
      lat: 28.6360,
      lng: 77.2140,
      approxAddress: 'Outer Circle Block B, Connaught Place, Delhi',
    },
    upvotes: 32,
    userUpvoted: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    verified: true,
  },
];

export const ASSISTANCE_POINTS: AssistancePoint[] = [
  {
    id: 'ast-1',
    name: 'Shivajinagar Police Station',
    type: 'police',
    lat: 18.5312,
    lng: 73.8499,
    address: 'FC Road, Shivajinagar, Pune',
    isOpen24h: true,
  },
  {
    id: 'ast-2',
    name: 'Sancheti 24x7 Emergency Hospital',
    type: 'hospital',
    lat: 18.5289,
    lng: 73.8521,
    address: 'Near Shimla Office, Pune',
    isOpen24h: true,
  },
  {
    id: 'ast-3',
    name: 'Indiranagar Metro Station Hub',
    type: 'transit_hub',
    lat: 12.9784,
    lng: 77.6408,
    address: 'CMH Road, Indiranagar, Bengaluru',
    isOpen24h: true,
  },
  {
    id: 'ast-4',
    name: 'Connaught Place Police Post',
    type: 'police',
    lat: 28.6315,
    lng: 77.2167,
    address: 'Radial Road 1, CP, New Delhi',
    isOpen24h: true,
  },
];

const STORAGE_KEYS = {
  USER: 'safetrip_user',
  AUTH_SESSION: 'safetrip_auth_session',
  CONTACTS: 'safetrip_contacts',
  REPORTS: 'safetrip_reports',
  ACTIVE_TRIP: 'safetrip_active_trip',
  TRIP_HISTORY: 'safetrip_trip_history',
  SELECTED_CITY: 'safetrip_selected_city',
  SETTINGS: 'safetrip_user_settings',
  SIMULATED_BATTERY: 'safetrip_simulated_battery',
};

export const DEMO_USERS: Record<TravelerPersona, UserProfile & { passwordHint: string }> = {
  commuter: {
    uid: 'user-commuter',
    displayName: 'Aarav Patel',
    email: 'aarav.patel@safetrip.org',
    phoneNumber: '+91 98760 12345',
    persona: 'commuter',
    emergencyPin: '1234',
    createdAt: Date.now() - 86400000 * 45,
    tripsCompletedCount: 28,
    reportsFiledCount: 5,
    bio: 'Late-shift tech worker commuting across Hinjewadi / Shivajinagar.',
    emergencyMedicalInfo: 'Blood Group: B+ · No known drug allergies',
    passwordHint: 'safe123',
  },
  student: {
    uid: 'user-student',
    displayName: 'Riya Sen',
    email: 'riya.sen@college.edu.in',
    phoneNumber: '+91 98222 54321',
    persona: 'student',
    emergencyPin: '9900',
    createdAt: Date.now() - 86400000 * 60,
    tripsCompletedCount: 41,
    reportsFiledCount: 8,
    bio: 'Post-grad student navigating between campus library and North Campus hostel.',
    emergencyMedicalInfo: 'Asthma inhaler in backpack',
    passwordHint: 'safe123',
  },
  traveler: {
    uid: 'user-traveler',
    displayName: 'Maya Verma',
    email: 'maya.solo@traveler.com',
    phoneNumber: '+91 97654 32109',
    persona: 'traveler',
    emergencyPin: '4321',
    createdAt: Date.now() - 86400000 * 20,
    tripsCompletedCount: 15,
    reportsFiledCount: 4,
    bio: 'Solo backpacker and photographer exploring heritage lanes & metro hubs.',
    emergencyMedicalInfo: 'Blood Group: O- · Carries EpiPen',
    passwordHint: 'safe123',
  },
  runner: {
    uid: 'user-runner',
    displayName: 'Kabir Mehta',
    email: 'kabir.runner@fitness.in',
    phoneNumber: '+91 98333 44556',
    persona: 'runner',
    emergencyPin: '7788',
    createdAt: Date.now() - 86400000 * 30,
    tripsCompletedCount: 35,
    reportsFiledCount: 2,
    bio: 'Evening marathon runner logging 10k routes around city parks.',
    emergencyMedicalInfo: 'Blood Group: A+',
    passwordHint: 'safe123',
  },
  general: {
    uid: 'user-general',
    displayName: 'Devika Nair',
    email: 'devika.nair@commute.net',
    phoneNumber: '+91 98444 77889',
    persona: 'general',
    emergencyPin: '2468',
    createdAt: Date.now() - 86400000 * 15,
    tripsCompletedCount: 19,
    reportsFiledCount: 3,
    bio: 'Daily bus and metro commuter traveling during rush hours.',
    emergencyMedicalInfo: 'Contact lens wearer',
    passwordHint: 'safe123',
  },
};

class StorageService {
  getAuthSession(): AuthSession {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    const defaultUser = DEMO_USERS.commuter;
    const defaultSession: AuthSession = {
      user: defaultUser,
      token: 'demo-auth-token-' + defaultUser.uid,
      isAuthenticated: true,
    };
    this.saveAuthSession(defaultSession);
    return defaultSession;
  }

  saveAuthSession(session: AuthSession | null): void {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(session.user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      }
    } catch {
      // ignore
    }
  }

  getUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    const session = this.getAuthSession();
    return session.user;
  }

  saveUser(user: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      const session = this.getAuthSession();
      if (session && session.user.uid === user.uid) {
        this.saveAuthSession({ ...session, user });
      }
    } catch {
      // ignore
    }
  }

  loginAsPreset(persona: TravelerPersona): UserProfile {
    const user = DEMO_USERS[persona] || DEMO_USERS.commuter;
    const session: AuthSession = {
      user,
      token: 'demo-auth-token-' + user.uid,
      isAuthenticated: true,
    };
    this.saveAuthSession(session);
    return user;
  }

  loginWithEmail(email: string): UserProfile {
    const found = Object.values(DEMO_USERS).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    const user: UserProfile = found || {
      uid: 'user-' + Date.now().toString(36),
      displayName: email.split('@')[0],
      email,
      phoneNumber: '+91 98000 11223',
      persona: 'commuter',
      emergencyPin: '1234',
      createdAt: Date.now(),
      tripsCompletedCount: 1,
      reportsFiledCount: 0,
    };

    const session: AuthSession = {
      user,
      token: 'auth-token-' + user.uid,
      isAuthenticated: true,
    };
    this.saveAuthSession(session);
    return user;
  }

  signupUser(params: Partial<UserProfile>): UserProfile {
    const newUser: UserProfile = {
      uid: 'user-' + Date.now().toString(36),
      displayName: params.displayName || 'Traveler',
      email: params.email || 'traveler@safetrip.org',
      phoneNumber: params.phoneNumber || '+91 98000 11223',
      persona: params.persona || 'commuter',
      emergencyPin: params.emergencyPin || '1234',
      createdAt: Date.now(),
      tripsCompletedCount: 0,
      reportsFiledCount: 0,
      bio: params.bio || 'SafeTrip journey explorer',
      emergencyMedicalInfo: params.emergencyMedicalInfo || 'None specified',
    };

    const session: AuthSession = {
      user: newUser,
      token: 'auth-token-' + newUser.uid,
      isAuthenticated: true,
    };
    this.saveAuthSession(session);
    return newUser;
  }

  logout(): void {
    this.saveAuthSession({
      user: DEMO_USERS.commuter,
      token: '',
      isAuthenticated: false,
    });
  }

  getContacts(): TrustedContact[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    this.saveContacts(INITIAL_CONTACTS);
    return INITIAL_CONTACTS;
  }

  saveContacts(contacts: TrustedContact[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    } catch {
      // ignore
    }
  }

  addContact(contact: Omit<TrustedContact, 'id' | 'createdAt'>): TrustedContact {
    const contacts = this.getContacts();
    const newContact: TrustedContact = {
      ...contact,
      id: 'c-' + Date.now().toString(36),
      createdAt: Date.now(),
    };
    contacts.push(newContact);
    this.saveContacts(contacts);
    return newContact;
  }

  deleteContact(id: string): void {
    const contacts = this.getContacts().filter((c) => c.id !== id);
    this.saveContacts(contacts);
  }

  getReports(): SafetyReport[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    this.saveReports(INITIAL_REPORTS);
    return INITIAL_REPORTS;
  }

  saveReports(reports: SafetyReport[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    } catch {
      // ignore
    }
  }

  addReport(report: Omit<SafetyReport, 'id' | 'createdAt' | 'upvotes' | 'verified'>): SafetyReport {
    const reports = this.getReports();
    const newReport: SafetyReport = {
      ...report,
      id: 'rep-' + Date.now().toString(36),
      upvotes: 1,
      userUpvoted: true,
      verified: true, // auto-verified for demo
      createdAt: Date.now(),
    };
    reports.unshift(newReport);
    this.saveReports(reports);
    return newReport;
  }

  toggleUpvote(reportId: string): SafetyReport[] {
    const reports = this.getReports().map((r) => {
      if (r.id === reportId) {
        const isUpvoted = !!r.userUpvoted;
        return {
          ...r,
          upvotes: isUpvoted ? r.upvotes - 1 : r.upvotes + 1,
          userUpvoted: !isUpvoted,
        };
      }
      return r;
    });
    this.saveReports(reports);
    return reports;
  }

  getActiveTrip(): TripSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_TRIP);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return null;
  }

  saveActiveTrip(trip: TripSession | null): void {
    try {
      if (trip) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TRIP, JSON.stringify(trip));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_TRIP);
      }
    } catch {
      // ignore
    }
  }

  getTripHistory(): TripSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRIP_HISTORY);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return [];
  }

  archiveTrip(trip: TripSession): void {
    const history = this.getTripHistory();
    history.unshift(trip);
    try {
      localStorage.setItem(STORAGE_KEYS.TRIP_HISTORY, JSON.stringify(history.slice(0, 20)));
    } catch {
      // ignore
    }
    this.saveActiveTrip(null);
  }

  getSelectedCity(): string {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_CITY) || 'pune';
  }

  setSelectedCity(cityKey: string): void {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CITY, cityKey);
  }

  getUserSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    const defaultSettings: UserSettings = {
      batterySaverEnabled: true,
      lowBatteryThreshold: 20,
      normalPollingIntervalSeconds: 30,
      batterySaverPollingIntervalSeconds: 120,
    };
    this.saveUserSettings(defaultSettings);
    return defaultSettings;
  }

  saveUserSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }

  getSimulatedBattery(): number | null {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.SIMULATED_BATTERY);
      if (val !== null) return Number(val);
    } catch {
      // ignore
    }
    return null;
  }

  setSimulatedBattery(level: number | null): void {
    try {
      if (level !== null) {
        localStorage.setItem(STORAGE_KEYS.SIMULATED_BATTERY, String(level));
      } else {
        localStorage.removeItem(STORAGE_KEYS.SIMULATED_BATTERY);
      }
    } catch {
      // ignore
    }
  }

  async getDeviceBatteryLevel(): Promise<number | null> {
    const simulated = this.getSimulatedBattery();
    if (simulated !== null) {
      return simulated;
    }

    if (typeof window !== 'undefined' && 'getBattery' in navigator) {
      try {
        const battery = await (navigator as unknown as { getBattery: () => Promise<{ level: number }> }).getBattery();
        return Math.round(battery.level * 100);
      } catch {
        return 78; // realistic mobile baseline if browser blocks battery API
      }
    }
    return 78;
  }
}

export const storageService = new StorageService();
