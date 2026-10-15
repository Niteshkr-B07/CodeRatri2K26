import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, AlertOctagon, Share2, Volume2, VolumeX, Eye, X, Check, ShieldAlert } from 'lucide-react';
import { soundService } from '../services/sound';
import { GeoPoint, TrustedContact } from '../types';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: GeoPoint;
  batteryLevel: number | null;
  trustedContacts: TrustedContact[];
  shareToken?: string;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  batteryLevel,
  trustedContacts,
  shareToken = 'active',
}) => {
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isStrobeActive, setIsStrobeActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (isSirenActive) {
        soundService.toggleDeterrentSiren(false);
        setIsSirenActive(false);
      }
      setIsStrobeActive(false);
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const liveTrackingUrl = `https://safetrip.app/t/${shareToken}?lat=${currentLocation.lat.toFixed(4)}&lng=${currentLocation.lng.toFixed(4)}`;

  const emergencySmsBody = encodeURIComponent(
    `EMERGENCY: I need help. My current location is: ${currentLocation.address || 'GPS ' + currentLocation.lat.toFixed(4) + ', ' + currentLocation.lng.toFixed(4)}. Battery: ${batteryLevel ? batteryLevel + '%' : 'N/A'}. Live Tracker: ${liveTrackingUrl}`
  );

  const phoneNumbersList = trustedContacts.map((c) => c.phone.replace(/[^0-9+]/g, '')).filter(Boolean);
  const smsRecipient = phoneNumbersList.length > 0 ? phoneNumbersList[0] : '';
  const smsUrl = `sms:${smsRecipient}?body=${emergencySmsBody}`;

  const handleCall112 = () => {
    setStatusMessage('Launching device phone dialer for National Emergency Number 112...');
    window.location.href = 'tel:112';
  };

  const handleSendEmergencySMS = () => {
    setStatusMessage('Launching native SMS composer with pre-filled live coordinates and tracking link...');
    window.location.href = smsUrl;
  };

  const handleShareLink = async () => {
    const text = `EMERGENCY ALERT from SafeTrip: My live GPS position is ${currentLocation.address || 'Coordinates ' + currentLocation.lat + ',' + currentLocation.lng}. Live tracking: ${liveTrackingUrl}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'SafeTrip Emergency SOS Alert',
          text,
          url: liveTrackingUrl,
        });
        setStatusMessage('Shared via device native share sheet.');
        return;
      } catch {
        // user cancelled or share failed, fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setStatusMessage('Emergency link and coordinates copied to clipboard.');
    } catch {
      setStatusMessage('Emergency link ready for sharing.');
    }
  };

  const toggleSiren = () => {
    const next = !isSirenActive;
    setIsSirenActive(next);
    soundService.toggleDeterrentSiren(next);
  };

  const toggleStrobe = () => {
    setIsStrobeActive(!isStrobeActive);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4">
      {/* Optional full-screen strobe effect for outdoor deterrent */}
      {isStrobeActive && (
        <div className="fixed inset-0 z-10 bg-white animate-ping opacity-90 pointer-events-none" />
      )}

      <div className="relative z-20 w-full max-w-lg bg-slate-900 border border-rose-500/50 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Emergency SOS Hub</h2>
              <p className="text-xs text-rose-300 font-medium">India National Emergency: 112</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="touch-target p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Close emergency modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Location & Battery Card */}
        <div className="my-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Your Live Coordinates</span>
            {batteryLevel !== null && (
              <span className="font-mono text-slate-300">Device Battery: {batteryLevel}%</span>
            )}
          </div>
          <p className="font-medium text-slate-200 truncate">{currentLocation.address || 'Active GPS Pin'}</p>
          <p className="font-mono text-[11px] text-slate-400">
            {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
          </p>
        </div>

        {/* Primary Action 1: Call 112 */}
        <div className="space-y-2.5">
          <button
            onClick={handleCall112}
            className="touch-target w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-rose-950/80 border border-rose-400/40 cursor-pointer transition-all"
          >
            <Phone className="w-5 h-5 shrink-0" />
            <span>Call 112 (Police / Emergency)</span>
          </button>
          <p className="text-[11px] text-slate-400 text-center">
            Opens phone dialer with 112 preloaded. Will not place silent or accidental calls.
          </p>

          {/* Primary Action 2: Send SOS SMS to Guardians */}
          <button
            onClick={handleSendEmergencySMS}
            className="touch-target w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md border border-amber-400/40 cursor-pointer transition-all"
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Send SOS SMS to Guardians ({trustedContacts.length})</span>
          </button>

          {/* Primary Action 3: Copy / Share Live Tracker Link */}
          <button
            onClick={handleShareLink}
            className="touch-target w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-all"
          >
            <Share2 className="w-4 h-4 text-slate-300" />
            <span>Share / Copy Live Tracking Link</span>
          </button>
        </div>

        {/* Deterrent Tools: Loud Siren & Strobe */}
        <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
          <button
            onClick={toggleSiren}
            className={`touch-target py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isSirenActive
                ? 'bg-rose-950 text-rose-300 border-rose-500 shadow-md animate-pulse'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {isSirenActive ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSirenActive ? 'Stop Siren' : 'Loud Siren'}</span>
          </button>

          <button
            onClick={toggleStrobe}
            className={`touch-target py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isStrobeActive
                ? 'bg-amber-950 text-amber-200 border-amber-500 shadow-md animate-pulse'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{isStrobeActive ? 'Stop Strobe' : 'Strobe Flash'}</span>
          </button>
        </div>

        {/* Status Feedback Message */}
        {statusMessage && (
          <div className="mt-3 p-2 bg-emerald-950/60 border border-emerald-800/60 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="mt-3 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
          <AlertOctagon className="w-3 h-3 text-slate-500" />
          <span>No automated silent calls. You remain in authoritative control of all dispatches.</span>
        </div>
      </div>
    </div>
  );
};
