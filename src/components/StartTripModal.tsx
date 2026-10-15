import React, { useState, useEffect } from 'react';
import { X, Navigation, Clock, Shield, Users, Check, AlertCircle, MapPin, ArrowRight } from 'lucide-react';
import { GeoPoint, TravelMode, TrustedContact, SafetyReport } from '../types';
import { DEMO_CITIES } from '../services/storage';
import { computeSafetyScore } from '../services/scoring';
import { PlaceAutocomplete } from './PlaceAutocomplete';

interface StartTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: GeoPoint;
  currentCityKey: string;
  initialDestination?: GeoPoint | null;
  initialTravelMode?: TravelMode;
  initialDurationMinutes?: number;
  trustedContacts: TrustedContact[];
  reports: SafetyReport[];
  isOnline?: boolean;
  onStartTrip: (params: {
    destination: GeoPoint;
    travelMode: TravelMode;
    durationMinutes: number;
    intervalMinutes: number;
    contactIds: string[];
  }) => void;
}

export const StartTripModal: React.FC<StartTripModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  currentCityKey,
  initialDestination,
  initialTravelMode = 'walking',
  initialDurationMinutes = 25,
  trustedContacts,
  reports,
  isOnline = true,
  onStartTrip,
}) => {
  const cityConfig = DEMO_CITIES[currentCityKey] || DEMO_CITIES.pune;
  const initialPreset = cityConfig.presets[0];

  const [destinationPoint, setDestinationPoint] = useState<GeoPoint>(
    initialDestination || (initialPreset ? initialPreset.dest : {
      lat: currentLocation.lat + 0.02,
      lng: currentLocation.lng + 0.02,
      address: 'Symbiosis Campus Library',
    })
  );

  const [travelMode, setTravelMode] = useState<TravelMode>(initialTravelMode);
  const [durationMinutes, setDurationMinutes] = useState<number>(initialDurationMinutes);
  const [intervalMinutes, setIntervalMinutes] = useState<number>(10);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>(
    trustedContacts.filter((c) => c.isDefaultGuardian).map((c) => c.id)
  );

  // Sync props when modal opens or initial values change
  useEffect(() => {
    if (isOpen) {
      if (initialDestination) {
        setDestinationPoint(initialDestination);
      }
      if (initialTravelMode) {
        setTravelMode(initialTravelMode);
      }
      if (initialDurationMinutes) {
        setDurationMinutes(initialDurationMinutes);
      }
    }
  }, [isOpen, initialDestination, initialTravelMode, initialDurationMinutes]);

  if (!isOpen) return null;

  // Compute live preview of route safety score
  const scoreData = computeSafetyScore(currentLocation, destinationPoint, reports);

  const handleSelectPreset = (preset: { title: string; dest: GeoPoint }) => {
    setDestinationPoint(preset.dest);
  };

  const toggleContact = (id: string) => {
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter((cid) => cid !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartTrip({
      destination: destinationPoint,
      travelMode,
      durationMinutes,
      intervalMinutes,
      contactIds: selectedContactIds,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-3 sm:zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Start Safe Trip</h2>
              <p className="text-xs text-slate-400">Set route & check-in parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="touch-target p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Destination Search with Google Places Autocomplete */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Destination (Google Places)
            </label>

            <PlaceAutocomplete
              onSelectDestination={(dest) => setDestinationPoint(dest)}
              currentLocation={currentLocation}
              placeholder="Search destination, college, or landmark..."
              initialValue={destinationPoint.address}
              isOnline={isOnline}
            />

            {/* Selected Destination Tag */}
            <div className="mt-2 p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-[11px] text-slate-300 truncate flex-1">
                Selected: <span className="text-white font-semibold">{destinationPoint.address}</span>
              </span>
            </div>

            {/* Quick Presets */}
            {cityConfig.presets.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400">Quick Presets:</span>
                {cityConfig.presets.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="touch-target text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Travel Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">Travel Mode</label>
            <div className="grid grid-cols-5 gap-1.5">
              {(['walking', 'transit', 'cab', 'cycling', 'driving'] as TravelMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTravelMode(mode)}
                  className={`touch-target py-2 px-1 rounded-xl text-xs font-medium capitalize text-center border transition-all cursor-pointer ${
                    travelMode === mode
                      ? 'bg-rose-600/30 border-rose-500 text-white font-semibold shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Check-In Intervals */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Expected Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value={15}>15 minutes</option>
                <option value={25}>25 minutes</option>
                <option value={35}>35 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                <Shield className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                Check-in Interval
              </label>
              <select
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value={5}>Every 5 minutes (Elevated alert)</option>
                <option value={10}>Every 10 minutes (Recommended)</option>
                <option value={15}>Every 15 minutes</option>
                <option value={30}>Every 30 minutes</option>
              </select>
            </div>
          </div>

          {/* Trusted Contacts to notify */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              <Users className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              Notify Guardians on Start ({selectedContactIds.length} selected)
            </label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 no-scrollbar">
              {trustedContacts.map((contact) => {
                const isSelected = selectedContactIds.includes(contact.id);
                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => toggleContact(contact.id)}
                    className={`touch-target w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-rose-950/30 border-rose-600/50 text-slate-100'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-slate-200">{contact.name}</span>
                      <span className="text-slate-400 ml-1.5">({contact.relationship})</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        isSelected ? 'bg-rose-600 border-rose-500 text-white' : 'border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explainable Route Safety Score Preview */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Corridor Safety Assessment</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-sm font-bold font-mono tabular-nums ${
                    scoreData.score >= 70
                      ? 'text-emerald-400'
                      : scoreData.score >= 50
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {scoreData.score}/100
                </span>
                <span className="text-[10px] text-slate-400">({scoreData.ratingLabel})</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              * Safety information is advisory only. SafeTrip does not guarantee travel safety.
            </p>
          </div>

          {/* Start Safe Trip Button (Min 48px touch target) */}
          <button
            type="submit"
            className="touch-target w-full min-h-[48px] py-3.5 px-4 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-950/80 border border-rose-400/40 flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
          >
            <Shield className="w-4 h-4" />
            <span>Begin Monitored Journey</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
