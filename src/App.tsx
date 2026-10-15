/**
 * SafeTrip — Mobile-First Women & Travel Safety Platform
 * UI Shell & Navigation Architecture
 */

import React, { useState, useEffect, useRef } from 'react';
import { TopNav } from './components/TopNav';
import { BottomTabBar, TabType } from './components/BottomTabBar';
import { FloatingEmergencyButton } from './components/FloatingEmergencyButton';
import { HomeScreen } from './components/HomeScreen';
import { TripGuardianCard } from './components/TripGuardianCard';
import { InteractiveMap } from './components/InteractiveMap';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { StartTripModal } from './components/StartTripModal';
import { SafetyScoreModal } from './components/SafetyScoreModal';
import { CommunityReportsView } from './components/CommunityReportsView';
import { TrustedContactsView } from './components/TrustedContactsView';
import { FlutterArchitectureModal } from './components/FlutterArchitectureModal';
import { SettingsModal } from './components/SettingsModal';
import { BatterySaverBanner } from './components/BatterySaverBanner';
import { LoginPage } from './components/LoginPage';
import { ProfilePage } from './components/ProfilePage';
import { LocationPermissionModal, LocationErrorInfo } from './components/LocationPermissionModal';
import { APIProvider } from '@vis.gl/react-google-maps';
import { storageService, DEMO_CITIES } from './services/storage';
import { computeSafetyScore } from './services/scoring';
import { firebaseLogout, firebaseUpdateProfile } from './services/firebase';
import {
  TripSession,
  TrustedContact,
  SafetyReport,
  GeoPoint,
  TravelMode,
  TravelerPersona,
  UserSettings,
  UserProfile,
} from './types';
import { Shield, Sparkles, Bell, Clock } from 'lucide-react';

export default function App() {
  // Authentication State
  const initialSession = storageService.getAuthSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialSession.isAuthenticated);
  const [userProfile, setUserProfile] = useState<UserProfile>(initialSession.user);

  // Navigation State: default to 'home'
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentCityKey, setCurrentCityKey] = useState<string>('pune');
  const [currentLocation, setCurrentLocation] = useState<GeoPoint>(DEMO_CITIES.pune.center);
  const [batteryLevel, setBatteryLevel] = useState<number>(78);
  const [isSimulatedBattery, setIsSimulatedBattery] = useState<boolean>(false);

  // Network & Hardware Status
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isGpsDenied, setIsGpsDenied] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [locationErrorInfo, setLocationErrorInfo] = useState<LocationErrorInfo | null>(null);

  // App Settings
  const [settings, setSettings] = useState<UserSettings>(storageService.getUserSettings());

  // App Data State (Persistent)
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([]);
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [activeTrip, setActiveTrip] = useState<TripSession | null>(null);
  const [recentTrips, setRecentTrips] = useState<TripSession[]>([]);

  // Destination & Real Route Configuration
  const [destination, setDestination] = useState<GeoPoint | null>(null);
  const [pendingTripMode, setPendingTripMode] = useState<TravelMode>('walking');
  const [pendingTripDuration, setPendingTripDuration] = useState<number>(25);

  // Background Location Polling Heartbeat State
  const [lastLocationPollTime, setLastLocationPollTime] = useState<string>('Just now');
  const pollCountRef = useRef<number>(0);

  // Modals & Sheets
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isStartTripOpen, setIsStartTripOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isFlutterSpecsOpen, setIsFlutterSpecsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load initial data & network listeners
  useEffect(() => {
    const savedContacts = storageService.getContacts();
    const savedReports = storageService.getReports();
    const savedTrip = storageService.getActiveTrip();
    const savedHistory = storageService.getTripHistory();
    const savedCity = storageService.getSelectedCity();
    const session = storageService.getAuthSession();
    const userSettings = storageService.getUserSettings();
    const simulated = storageService.getSimulatedBattery();

    setTrustedContacts(savedContacts);
    setReports(savedReports);
    setActiveTrip(savedTrip);
    setRecentTrips(savedHistory);
    setUserProfile(session.user);
    setIsAuthenticated(session.isAuthenticated);
    setSettings(userSettings);

    if (savedCity && DEMO_CITIES[savedCity]) {
      setCurrentCityKey(savedCity);
      setCurrentLocation(DEMO_CITIES[savedCity].center);
    }

    if (simulated !== null) {
      setBatteryLevel(simulated);
      setIsSimulatedBattery(true);
    } else {
      storageService.getDeviceBatteryLevel().then((lvl) => {
        if (lvl !== null) setBatteryLevel(lvl);
      });
    }

    // Online / Offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Compute Battery Saver Status
  const isBatterySaverActive = Boolean(
    settings.batterySaverEnabled && batteryLevel <= settings.lowBatteryThreshold
  );

  // Effective Location Polling Interval: 120s if Saver is active, else 30s
  const effectivePollingIntervalSeconds = isBatterySaverActive
    ? settings.batterySaverPollingIntervalSeconds // 120s (2m)
    : settings.normalPollingIntervalSeconds; // 30s

  // Background Location Polling Effect
  useEffect(() => {
    setLastLocationPollTime(new Date().toLocaleTimeString());

    const intervalId = setInterval(() => {
      pollCountRef.current += 1;
      const nowStr = new Date().toLocaleTimeString();
      setLastLocationPollTime(nowStr);

      if (currentCityKey === 'live' && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setIsGpsDenied(false);
            setCurrentLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              address: 'Current Live GPS Location',
            });
          },
          (err) => {
            if (err.code === 1) {
              setIsGpsDenied(true);
            }
          },
          { enableHighAccuracy: !isBatterySaverActive }
        );
      }
    }, effectivePollingIntervalSeconds * 1000);

    return () => clearInterval(intervalId);
  }, [effectivePollingIntervalSeconds, currentCityKey, isBatterySaverActive]);

  // Auth Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setUserProfile(user);
    setIsAuthenticated(true);
    setActiveTab('home');
  };

  const handleLogout = async () => {
    try {
      await firebaseLogout();
    } catch {
      // ignore
    }
    storageService.logout();
    setIsAuthenticated(false);
  };

  const handleSwitchPersona = (persona: TravelerPersona) => {
    const user = storageService.loginAsPreset(persona);
    setUserProfile(user);
  };

  // Live Location and Geolocation Permission Manager
  const requestUserLocation = (showExplainerModal = false) => {
    if (showExplainerModal) {
      setLocationErrorInfo(null);
      setIsLocationModalOpen(true);
      return;
    }

    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setIsGpsDenied(true);
      setLocationErrorInfo({
        code: 'POSITION_UNAVAILABLE',
        title: 'Geolocation Not Supported',
        message: 'Your browser or device does not support GPS Geolocation.',
        instructions: ['Please open SafeTrip on a modern mobile or desktop browser like Chrome or Safari.'],
      });
      setIsLocationModalOpen(true);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setIsGpsDenied(false);
        setLocationErrorInfo(null);
        setIsLocationModalOpen(false);
        setCurrentCityKey('live');
        storageService.setSelectedCity('live');
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: `Live GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
        });
      },
      (err: GeolocationPositionError) => {
        setIsLocating(false);
        setIsGpsDenied(true);
        if (err.code === 1) {
          // PERMISSION_DENIED
          setLocationErrorInfo({
            code: 'PERMISSION_DENIED',
            title: 'Location Permission Denied',
            message: 'SafeTrip was denied access to your device location. Your browser has blocked GPS coordinates.',
            instructions: [
              'Click the lock or site settings icon (🔒 / ⚙️) in your browser address bar.',
              'Change the Location permission to "Allow".',
              'Tap the Retry Location Access button to display your real-time position on Google Maps.',
            ],
          });
        } else if (err.code === 2) {
          // POSITION_UNAVAILABLE
          setLocationErrorInfo({
            code: 'POSITION_UNAVAILABLE',
            title: 'GPS Signal Unavailable',
            message: 'Device location or GPS service is currently turned off or unable to acquire a satellite fix.',
            instructions: [
              'Ensure Location / GPS is turned ON in your device system quick settings.',
              'If you are indoors, connect to Wi-Fi to help determine your location.',
              'Tap Retry once GPS is enabled, or select a city below.',
            ],
          });
        } else if (err.code === 3) {
          // TIMEOUT
          setLocationErrorInfo({
            code: 'TIMEOUT',
            title: 'Location Request Timed Out',
            message: 'Acquiring GPS coordinates took too long.',
            instructions: [
              'Check your network and GPS connectivity.',
              'Tap Retry to send another location request.',
            ],
          });
        } else {
          setLocationErrorInfo({
            code: 'UNKNOWN',
            title: 'Unable to Retrieve Location',
            message: 'An unexpected error occurred while obtaining your GPS position.',
            instructions: ['Check that location permissions are enabled and try again.'],
          });
        }
        setIsLocationModalOpen(true);
      },
      {
        enableHighAccuracy: !isBatterySaverActive,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  // City / Live GPS Selector
  const handleSelectCity = (cityKey: string) => {
    setCurrentCityKey(cityKey);
    storageService.setSelectedCity(cityKey);

    if (cityKey === 'live') {
      requestUserLocation(false);
    } else if (DEMO_CITIES[cityKey]) {
      setIsGpsDenied(false);
      setLocationErrorInfo(null);
      setCurrentLocation(DEMO_CITIES[cityKey].center);
    }
  };

  const handleRetryGps = () => {
    requestUserLocation(false);
  };

  // Battery Simulation Handler
  const handleSimulateBattery = (level: number | null) => {
    storageService.setSimulatedBattery(level);
    if (level !== null) {
      setBatteryLevel(level);
      setIsSimulatedBattery(true);
    } else {
      setIsSimulatedBattery(false);
      storageService.getDeviceBatteryLevel().then((lvl) => {
        if (lvl !== null) setBatteryLevel(lvl);
      });
    }
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    storageService.saveUserSettings(newSettings);
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    storageService.saveUser(newProfile);
    firebaseUpdateProfile(newProfile).catch((err) => {
      console.warn('Sync profile to Firestore:', err);
    });
  };

  // Trip Guardian Handlers
  const handleStartTrip = ({
    destination,
    travelMode,
    durationMinutes,
    intervalMinutes,
    contactIds,
  }: {
    destination: GeoPoint;
    travelMode: TravelMode;
    durationMinutes: number;
    intervalMinutes: number;
    contactIds: string[];
  }) => {
    const now = Date.now();
    const newTrip: TripSession = {
      id: 'trip-' + now.toString(36),
      userId: userProfile.uid,
      origin: currentLocation,
      destination,
      travelMode,
      status: 'active',
      startedAt: now,
      expectedDurationMinutes: durationMinutes,
      checkInIntervalMinutes: intervalMinutes,
      lastCheckInAt: now,
      nextCheckInDueAt: now + intervalMinutes * 60 * 1000,
      overdueGraceExpiresAt: now + (intervalMinutes * 60 + 60) * 1000,
      selectedContactIds: contactIds,
      shareToken: Math.random().toString(36).substring(2, 9),
    };

    setActiveTrip(newTrip);
    storageService.saveActiveTrip(newTrip);
    setIsStartTripOpen(false);
    setActiveTab('trips');
  };

  const handleCheckIn = () => {
    if (!activeTrip) return;
    const now = Date.now();
    const updated: TripSession = {
      ...activeTrip,
      status: 'active',
      lastCheckInAt: now,
      nextCheckInDueAt: now + activeTrip.checkInIntervalMinutes * 60 * 1000,
      overdueGraceExpiresAt: now + (activeTrip.checkInIntervalMinutes * 60 + 60) * 1000,
    };
    setActiveTrip(updated);
    storageService.saveActiveTrip(updated);
  };

  const handleEndTrip = () => {
    if (!activeTrip) return;
    const completedTrip: TripSession = {
      ...activeTrip,
      status: 'completed',
    };
    storageService.archiveTrip(completedTrip);
    setRecentTrips(storageService.getTripHistory());
    setActiveTrip(null);
  };

  const handleCancelTrip = () => {
    if (!activeTrip) return;
    storageService.saveActiveTrip(null);
    setActiveTrip(null);
  };

  const handleExtendTrip = (additionalMinutes: number) => {
    if (!activeTrip) return;
    const now = Date.now();
    const updated: TripSession = {
      ...activeTrip,
      status: 'active',
      nextCheckInDueAt: now + additionalMinutes * 60 * 1000,
      overdueGraceExpiresAt: now + (additionalMinutes * 60 + 60) * 1000,
    };
    setActiveTrip(updated);
    storageService.saveActiveTrip(updated);
  };

  // Hackathon Stage Simulation Trigger: Fast forward to Overdue Check-In
  const handleSimulateOverdue = () => {
    if (!activeTrip) {
      const now = Date.now();
      const demoTrip: TripSession = {
        id: 'trip-test',
        userId: userProfile.uid,
        origin: currentLocation,
        destination: {
          lat: currentLocation.lat + 0.015,
          lng: currentLocation.lng + 0.015,
          address: 'Central Metro Station',
        },
        travelMode: 'walking',
        status: 'active',
        startedAt: now - 1000 * 60 * 15,
        expectedDurationMinutes: 20,
        checkInIntervalMinutes: 1,
        lastCheckInAt: now - 1000 * 60 * 1,
        nextCheckInDueAt: now - 5000,
        overdueGraceExpiresAt: now + 55000,
        selectedContactIds: trustedContacts.map((c) => c.id),
        shareToken: 'demo-test',
      };
      setActiveTrip(demoTrip);
      storageService.saveActiveTrip(demoTrip);
      setActiveTab('trips');
      return;
    }

    const now = Date.now();
    const overdueTrip: TripSession = {
      ...activeTrip,
      nextCheckInDueAt: now - 1000,
      overdueGraceExpiresAt: now + 59000,
    };
    setActiveTrip(overdueTrip);
    storageService.saveActiveTrip(overdueTrip);
    setActiveTab('trips');
  };

  // Safety Reports Handlers
  const handleAddReport = (
    newReportData: Omit<SafetyReport, 'id' | 'createdAt' | 'upvotes' | 'verified'>
  ) => {
    storageService.addReport({
      ...newReportData,
      userId: userProfile.uid,
      userName: userProfile.displayName,
    });
    setReports(storageService.getReports());
  };

  const handleUpvoteReport = (reportId: string) => {
    const updated = storageService.toggleUpvote(reportId);
    setReports(updated);
  };

  // Contacts Handlers
  const handleAddContact = (contactData: Omit<TrustedContact, 'id' | 'createdAt'>) => {
    storageService.addContact(contactData);
    setTrustedContacts(storageService.getContacts());
  };

  const handleDeleteContact = (id: string) => {
    storageService.deleteContact(id);
    setTrustedContacts(storageService.getContacts());
  };

  const handleToggleContactDefault = (id: string) => {
    const updated = trustedContacts.map((c) => {
      if (c.id === id) {
        return { ...c, isDefaultGuardian: !c.isDefaultGuardian };
      }
      return c;
    });
    setTrustedContacts(updated);
    storageService.saveContacts(updated);
  };

  // Compute live corridor score
  const activeDestination = destination || (activeTrip ? activeTrip.destination : null);
  const scoreData = computeSafetyScore(
    currentLocation,
    activeDestination || {
      lat: currentLocation.lat + 0.015,
      lng: currentLocation.lng + 0.015,
      address: 'Nearby Transit Hub',
    },
    reports
  );

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // If user is not authenticated, show full Login Page
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <APIProvider apiKey={apiKey} libraries={['places', 'routes', 'geometry']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-28">
      {/* Top Header */}
      <TopNav
        currentCityKey={currentCityKey}
        onSelectCity={handleSelectCity}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenFlutterSpecs={() => setIsFlutterSpecsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setActiveTab('profile')}
        userDisplayName={userProfile.displayName}
        batteryLevel={batteryLevel}
        isTripActive={!!activeTrip}
        isBatterySaverActive={isBatterySaverActive}
      />

      {/* Persistent Battery Saver Notification Banner */}
      <BatterySaverBanner
        batteryLevel={batteryLevel}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onEnableSaver={() => handleUpdateSettings({ ...settings, batterySaverEnabled: true })}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-3 space-y-4">
        {/* Persona & Fast Demo Mode Switcher Strip */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Traveler:</span>
            <select
              value={userProfile.persona}
              onChange={(e) => {
                const next = e.target.value as TravelerPersona;
                handleSwitchPersona(next);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 font-medium focus:outline-none capitalize"
            >
              <option value="commuter">Late Commuter</option>
              <option value="student">Campus Student</option>
              <option value="traveler">Solo Traveler</option>
              <option value="runner">Evening Runner</option>
              <option value="general">Daily Transit</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Live Location Heartbeat Rate Status */}
            <div
              onClick={() => setIsSettingsOpen(true)}
              className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 cursor-pointer"
              title="Location Polling Interval"
            >
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>Poll: {isBatterySaverActive ? '2m' : '30s'}</span>
            </div>

            {/* Judge / Stage Demo Overdue Check-in Simulator */}
            <button
              onClick={handleSimulateOverdue}
              className="text-[11px] text-amber-300 hover:text-amber-200 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/60 px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              title="Fast forward to test the missed check-in audible grace period on stage"
            >
              <Bell className="w-3 h-3 text-amber-400" />
              <span>Alarm</span>
            </button>
          </div>
        </section>

        {/* SCREEN 1: HOME DASHBOARD */}
        {activeTab === 'home' && (
          <HomeScreen
            user={userProfile}
            currentLocation={currentLocation}
            destination={destination}
            onSelectDestination={(dest) => {
              setDestination(dest);
              if (dest) {
                setActiveTab('map');
              }
            }}
            isGpsDenied={isGpsDenied}
            isOnline={isOnline}
            isLocating={isLocating}
            onRetryGps={handleRetryGps}
            onRequestLocationModal={() => requestUserLocation(true)}
            onStartSafeTrip={() => setIsStartTripOpen(true)}
            onOpenScoreDetails={() => setIsScoreModalOpen(true)}
            onOpenMap={() => setActiveTab('map')}
            onOpenContacts={() => setActiveTab('contacts')}
            recentTrips={recentTrips}
            trustedContacts={trustedContacts}
            scoreData={scoreData}
          />
        )}

        {/* SCREEN 2: MAP */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Safe Corridor Radar & Route</h2>
                <p className="text-[11px] text-slate-400">Search destination to plot route with real distance and ETA</p>
              </div>
              <button
                onClick={() => setIsScoreModalOpen(true)}
                className="touch-target text-xs text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Score: {scoreData.score}/100</span>
              </button>
            </div>

            <InteractiveMap
              currentLocation={currentLocation}
              destination={activeDestination}
              onSelectDestination={(dest) => setDestination(dest)}
              onStartSafeTripWithRoute={(dest, mode, duration) => {
                setDestination(dest);
                setPendingTripMode(mode);
                setPendingTripDuration(duration);
                setIsStartTripOpen(true);
              }}
              activeTrip={activeTrip}
              reports={reports}
              isGpsDenied={isGpsDenied}
              onRetryGps={handleRetryGps}
              onUpvoteReport={handleUpvoteReport}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onOpenScoreDetails={() => setIsScoreModalOpen(true)}
              onRequestLocationModal={() => requestUserLocation(true)}
              isOnline={isOnline}
            />
          </div>
        )}

        {/* SCREEN 3: TRIPS (TRIP GUARDIAN) */}
        {activeTab === 'trips' && (
          <div className="space-y-4">
            <TripGuardianCard
              activeTrip={activeTrip}
              onStartTripClick={() => setIsStartTripOpen(true)}
              onCheckIn={handleCheckIn}
              onEndTrip={handleEndTrip}
              onCancelTrip={handleCancelTrip}
              onExtendTrip={handleExtendTrip}
              onTriggerSOS={() => setIsSOSOpen(true)}
              trustedContacts={trustedContacts}
            />

            {/* How Trip Guardian Works */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs space-y-2">
              <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Trip Guardian Journey Monitoring</span>
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Trip Guardian monitors your journey on an active heartbeat. If you do not check in, SafeTrip gives you an audible 60-second grace window to extend.
              </p>
              <ul className="text-slate-400 space-y-1 list-disc list-inside">
                <li>Never auto-calls police silently (prevents false emergency dispatches).</li>
                <li>Prefills SMS with GPS coordinates, battery level, and medical note.</li>
                <li>
                  Background location heartbeat: <strong>{effectivePollingIntervalSeconds}s</strong>{' '}
                  {isBatterySaverActive && '(Smart Battery Saver throttled)'}.
                </li>
                <li>Last GPS sync: {lastLocationPollTime}.</li>
              </ul>
            </div>
          </div>
        )}

        {/* SCREEN 4: HAZARD REPORTS */}
        {activeTab === 'report' && (
          <CommunityReportsView
            reports={reports}
            currentLocation={currentLocation}
            onAddReport={handleAddReport}
            onUpvoteReport={handleUpvoteReport}
            isModalOpen={isReportModalOpen}
            onOpenModal={() => setIsReportModalOpen(true)}
            onCloseModal={() => setIsReportModalOpen(false)}
          />
        )}

        {/* SCREEN 5: USER PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <ProfilePage
            user={userProfile}
            onUpdateProfile={handleUpdateProfile}
            trustedContactsCount={trustedContacts.length}
            reportsCount={reports.length}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenContacts={() => setActiveTab('contacts')}
            onLogout={handleLogout}
            onSwitchPersona={handleSwitchPersona}
          />
        )}

        {/* SCREEN 6: TRUSTED CONTACTS SUBVIEW */}
        {activeTab === 'contacts' && (
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('home')}
              className="text-xs text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>← Back to Home</span>
            </button>
            <TrustedContactsView
              contacts={trustedContacts}
              onAddContact={handleAddContact}
              onDeleteContact={handleDeleteContact}
              onToggleDefault={handleToggleContactDefault}
            />
          </div>
        )}
      </main>

      {/* FLOATING RED EMERGENCY BUTTON: Visible on EVERY Screen */}
      <FloatingEmergencyButton onTriggerSOS={() => setIsSOSOpen(true)} />

      {/* Bottom Navigation Bar: Home, Map, Trips, Report, Profile */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isTripActive={!!activeTrip}
        reportsCount={reports.length}
      />

      {/* MODAL 1: Emergency SOS Workflow (Reachable in 1 tap from anywhere) */}
      <EmergencySOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        currentLocation={currentLocation}
        batteryLevel={batteryLevel}
        trustedContacts={trustedContacts}
        shareToken={activeTrip?.shareToken}
      />

      {/* MODAL 2: Start Trip Wizard */}
      <StartTripModal
        isOpen={isStartTripOpen}
        onClose={() => setIsStartTripOpen(false)}
        currentLocation={currentLocation}
        currentCityKey={currentCityKey}
        initialDestination={destination}
        initialTravelMode={pendingTripMode}
        initialDurationMinutes={pendingTripDuration}
        trustedContacts={trustedContacts}
        reports={reports}
        isOnline={isOnline}
        onStartTrip={handleStartTrip}
      />

      {/* MODAL 3: Explainable Safety Score Breakdown */}
      <SafetyScoreModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        scoreData={scoreData}
      />

      {/* MODAL 4: Flutter Architecture Blueprint */}
      <FlutterArchitectureModal
        isOpen={isFlutterSpecsOpen}
        onClose={() => setIsFlutterSpecsOpen(false)}
      />

      {/* MODAL 5: User Settings & Battery Saver */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
        currentBatteryLevel={batteryLevel}
        onSimulateBattery={handleSimulateBattery}
        isSimulatedBattery={isSimulatedBattery}
      />

      {/* MODAL 6: Location Permission Explainer & Error Recovery */}
      <LocationPermissionModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onRequestPermission={() => requestUserLocation(false)}
        isLocating={isLocating}
        errorInfo={locationErrorInfo}
        onSelectCityFallback={(key) => handleSelectCity(key)}
      />
      </div>
    </APIProvider>
  );
}
