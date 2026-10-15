import React from 'react';
import {
  MapPin,
  Navigation,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  X,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { DEMO_CITIES } from '../services/storage';

export interface LocationErrorInfo {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN';
  title: string;
  message: string;
  instructions: string[];
}

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestPermission: () => void;
  isLocating: boolean;
  errorInfo: LocationErrorInfo | null;
  onSelectCityFallback: (cityKey: string) => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onClose,
  onRequestPermission,
  isLocating,
  errorInfo,
  onSelectCityFallback,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                errorInfo
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                  : 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400'
              }`}
            >
              {errorInfo ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Navigation className="w-5 h-5 animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {errorInfo ? errorInfo.title : 'Enable Live GPS Location'}
              </h3>
              <p className="text-xs text-slate-400">Google Maps Real-Time Navigation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State 1: Error handling (Permission denied, GPS off, Timeout) */}
        {errorInfo ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-200 text-xs leading-relaxed space-y-1.5">
              <p className="font-semibold text-amber-300">{errorInfo.message}</p>
              <div className="pt-2 border-t border-amber-500/20 text-slate-300">
                <span className="font-medium text-slate-200 block mb-1">
                  How to resolve:
                </span>
                <ul className="space-y-1 text-[11px] list-disc list-inside">
                  {errorInfo.instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={onRequestPermission}
                disabled={isLocating}
                className="w-full min-h-[48px] py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Detecting GPS...' : 'Retry Location Access'}</span>
              </button>

              <div className="text-center pt-2">
                <p className="text-[11px] text-slate-400 mb-2">Or choose a city to explore without GPS:</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.entries(DEMO_CITIES).map(([key, city]) => (
                    <button
                      key={key}
                      onClick={() => {
                        onSelectCityFallback(key);
                        onClose();
                      }}
                      className="px-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 cursor-pointer text-center truncate"
                    >
                      {city.name.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* State 2: Permission explanation & Request */
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                SafeTrip uses your real-time location to display your position on Google Maps, calculate safety scores along your travel corridor, and send verified emergency coordinates to your trusted contacts if needed.
              </p>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Live Google Maps:</strong> Pinpoints your current location on street-level maps.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Safe Corridor Guidance:</strong> Warns about poorly lit areas and alerts nearby safety hubs.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Emergency Accuracy:</strong> Prefills 112 SOS texts with exact GPS coordinates.
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Privacy first: advisory only, never sold.</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={onRequestPermission}
                disabled={isLocating}
                className="w-full min-h-[48px] py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Requesting GPS...' : 'Allow Live Location'}</span>
              </button>

              <button
                onClick={onClose}
                className="w-full min-h-[44px] py-2.5 px-4 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium cursor-pointer transition-colors"
              >
                Not Now (Use Selected City)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
