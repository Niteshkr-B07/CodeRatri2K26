import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Shield,
  Play,
  Clock,
  Phone,
  MessageSquare,
  Users,
  AlertCircle,
  WifiOff,
  Navigation,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { GeoPoint, UserProfile, TrustedContact, TripSession, SafetyScoreData } from '../types';
import { PlaceAutocomplete } from './PlaceAutocomplete';

interface HomeScreenProps {
  user: UserProfile;
  currentLocation: GeoPoint;
  destination?: GeoPoint | null;
  onSelectDestination?: (dest: GeoPoint | null) => void;
  isGpsDenied: boolean;
  isOnline: boolean;
  isLocating?: boolean;
  onRetryGps: () => void;
  onRequestLocationModal?: () => void;
  onStartSafeTrip: () => void;
  onOpenScoreDetails: () => void;
  onOpenMap: () => void;
  onOpenContacts: () => void;
  recentTrips: TripSession[];
  trustedContacts: TrustedContact[];
  scoreData: SafetyScoreData;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  currentLocation,
  destination,
  onSelectDestination,
  isGpsDenied,
  isOnline,
  isLocating = false,
  onRetryGps,
  onRequestLocationModal,
  onStartSafeTrip,
  onOpenScoreDetails,
  onOpenMap,
  onOpenContacts,
  recentTrips,
  trustedContacts,
  scoreData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartSafeTrip();
  };

  const handleQuickCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
  };

  const handleQuickSms = (contact: TrustedContact) => {
    const text = encodeURIComponent(
      `Hi ${contact.name}, I am starting my journey from ${currentLocation.address || 'my current location'}. Tracking active on SafeTrip.`
    );
    window.location.href = `sms:${contact.phone.replace(/[^0-9+]/g, '')}?body=${text}`;
  };

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Offline Alert Banner if network is down */}
      {!isOnline && (
        <div className="p-3 bg-amber-950/80 border border-amber-600 rounded-xl text-amber-200 flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            You are currently offline. Trip Guardian timers and 112 emergency calls work locally, but live corridor sync is paused.
          </span>
        </div>
      )}

      {/* 2. GPS Disabled / Permission Denied Friendly Banner */}
      {isGpsDenied && (
        <div className="p-3.5 bg-slate-900 border border-amber-500/60 rounded-2xl text-slate-200 space-y-2.5 shadow-lg animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-xs">Location Permission Blocked</p>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                SafeTrip needs your GPS location to display your position on Google Maps and calculate accurate safety corridors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onRetryGps}
              disabled={isLocating}
              className="touch-target flex-1 min-h-[48px] py-2.5 px-3 bg-amber-600 hover:bg-amber-500 active:scale-95 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Retrying GPS...' : 'Retry Location Access'}</span>
            </button>

            {onRequestLocationModal && (
              <button
                onClick={onRequestLocationModal}
                className="touch-target min-h-[48px] px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-700 cursor-pointer transition-colors"
              >
                Help & Info
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Greeting Section */}
      <section className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          {getGreeting()}, {user.displayName.split(' ')[0]}
        </h1>
        <p className="text-slate-400 text-xs">
          Stay informed, connected, and protected on every journey.
        </p>
      </section>

      {/* 4. Current Location Card */}
      <section className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
              Current Location
            </span>
            <p className="font-semibold text-slate-100 truncate text-xs">
              {currentLocation.address || `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenMap}
          className="touch-target px-2.5 py-1 text-indigo-400 hover:text-indigo-300 font-medium text-xs flex items-center gap-0.5 shrink-0"
        >
          <span>View Map</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* 5. Destination Search with Google Places & Start Safe Trip Action */}
      <section className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-200">
            Where are you heading?
          </label>
          {destination && onSelectDestination && (
            <button
              onClick={() => onSelectDestination(null)}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-medium"
            >
              Clear Destination
            </button>
          )}
        </div>

        {destination ? (
          <div className="p-3 bg-slate-950/80 border border-rose-500/40 rounded-xl space-y-2">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block">
                  Target Destination
                </span>
                <p className="text-xs font-semibold text-slate-100 truncate">
                  {destination.address}
                </p>
              </div>
              <button
                onClick={onOpenMap}
                className="touch-target px-2.5 py-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-0.5"
              >
                <span>View Route</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <PlaceAutocomplete
            onSelectDestination={(dest) => {
              if (onSelectDestination) {
                onSelectDestination(dest);
              }
              onOpenMap();
            }}
            currentLocation={currentLocation}
            placeholder="Search destination, college, or station..."
            isOnline={isOnline}
          />
        )}

        {/* Primary CTA: Start Safe Trip (Min 48px touch target) */}
        <button
          type="button"
          onClick={onStartSafeTrip}
          className="touch-target w-full min-h-[48px] py-3.5 px-4 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-950/80 border border-rose-400/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Shield className="w-4 h-4" />
          <span>{destination ? 'Start Safe Trip to Destination' : 'Start Safe Trip'}</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </section>

      {/* 6. Safety Status Card (Advisory Only) */}
      <section className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold text-slate-200">Corridor Safety Status</span>
          </div>
          <button
            onClick={onOpenScoreDetails}
            className="text-indigo-400 hover:underline font-medium text-[11px]"
          >
            Explain Factors →
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl">
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px] block">Area Assessment:</span>
            <span className="font-bold text-slate-100 text-xs">
              {scoreData.score >= 75
                ? 'Fewer Reported Concerns'
                : scoreData.score >= 55
                ? 'Moderate Caution Recommended'
                : 'Elevated Caution Needed'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl font-mono font-bold text-emerald-400">{scoreData.score}</span>
            <span className="text-slate-400 text-xs">/100</span>
          </div>
        </div>

        {/* Mandatory Advisory Disclaimer Rule */}
        <p className="text-[11px] text-slate-400 leading-relaxed italic">
          * Safety information is advisory only. SafeTrip does not guarantee safety. Always trust your surroundings and personal intuition.
        </p>
      </section>

      {/* 7. Quick Contacts Rail */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Quick Emergency Contacts</span>
          </h2>
          <button
            onClick={onOpenContacts}
            className="text-[11px] text-slate-400 hover:text-slate-200"
          >
            Manage ({trustedContacts.length}) →
          </button>
        </div>

        {trustedContacts.length === 0 ? (
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400">
            <p>No trusted contacts added yet.</p>
            <button
              onClick={onOpenContacts}
              className="mt-1 text-indigo-400 font-semibold text-xs"
            >
              + Add a Contact
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {trustedContacts.map((contact) => (
              <div
                key={contact.id}
                className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3 shrink-0 min-w-[210px]"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-200 truncate">{contact.name}</p>
                  <p className="text-[10px] text-slate-400">{contact.relationship}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleQuickCall(contact.phone)}
                    className="touch-target p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title={`Call ${contact.name}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleQuickSms(contact)}
                    className="touch-target p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title={`Send SMS to ${contact.name}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 8. Recent Trips List */}
      <section className="space-y-2">
        <h2 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Recent Safe Trips</span>
        </h2>

        {recentTrips.length === 0 ? (
          <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-center text-slate-400 text-xs space-y-1">
            <p className="font-medium text-slate-300">No completed journeys yet</p>
            <p className="text-[11px]">
              When you complete a monitored trip with Trip Guardian, it will be safely logged here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTrips.slice(0, 3).map((trip) => (
              <div
                key={trip.id}
                className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-slate-200 truncate">
                      {trip.destination.address}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 ml-5 capitalize">
                    {trip.travelMode} · Check-in every {trip.checkInIntervalMinutes}m
                  </p>
                </div>

                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded shrink-0">
                  Completed
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
