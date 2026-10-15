import React from 'react';
import { Shield, AlertTriangle, MapPin, BatteryCharging, Battery, BatteryWarning, Sparkles, SlidersHorizontal, User } from 'lucide-react';
import { DEMO_CITIES } from '../services/storage';

interface TopNavProps {
  currentCityKey: string;
  onSelectCity: (cityKey: string) => void;
  onOpenSOS: () => void;
  onOpenFlutterSpecs: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  userDisplayName: string;
  batteryLevel: number | null;
  isTripActive: boolean;
  isBatterySaverActive: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentCityKey,
  onSelectCity,
  onOpenSOS,
  onOpenFlutterSpecs,
  onOpenSettings,
  onOpenProfile,
  userDisplayName,
  batteryLevel,
  isTripActive,
  isBatterySaverActive,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-white">SafeTrip</span>
              {isTripActive && (
                <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                  Guardian Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Universal Journey Protection</p>
          </div>
        </div>

        {/* Zone 2: City Selector & Status Controls */}
        <div className="flex items-center gap-2">
          {/* City / Region selector */}
          <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <select
              value={currentCityKey}
              onChange={(e) => onSelectCity(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="live" className="bg-slate-900 text-slate-100">
                Live Device GPS
              </option>
              {Object.entries(DEMO_CITIES).map(([key, city]) => (
                <option key={key} value={key} className="bg-slate-900 text-slate-100">
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Battery & Battery-Saver Pill */}
          {batteryLevel !== null && (
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                isBatterySaverActive
                  ? 'bg-amber-950/60 border-amber-600/60 text-amber-300'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Battery & Location Polling Settings"
            >
              {isBatterySaverActive ? (
                <BatteryWarning className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              ) : batteryLevel <= 20 ? (
                <Battery className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="font-mono tabular-nums font-semibold">{batteryLevel}%</span>
              {isBatterySaverActive && (
                <span className="text-[10px] hidden md:inline font-bold bg-amber-900/80 px-1 rounded text-amber-200">
                  2m Saver
                </span>
              )}
            </button>
          )}

          {/* Settings Trigger Icon */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="User Settings & Battery Saver"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* User Profile Avatar Trigger */}
          <button
            onClick={onOpenProfile}
            className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white hover:bg-indigo-600/50 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
            title={`Profile: ${userDisplayName}`}
          >
            {userDisplayName ? userDisplayName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
          </button>

          {/* Flutter Architecture Specs Trigger */}
          <button
            onClick={onOpenFlutterSpecs}
            className="hidden sm:flex items-center gap-1 text-xs text-indigo-300 hover:text-white bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-800/50 px-2.5 py-1.5 rounded-lg transition-colors"
            title="View Mobile Flutter & Firebase Architecture Specification"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span className="font-medium">Flutter Blueprint</span>
          </button>
        </div>

        {/* Zone 3: 1-Tap Emergency SOS Trigger */}
        <button
          onClick={onOpenSOS}
          className="touch-target relative flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-rose-950/50 border border-rose-400/40 transition-all shrink-0 cursor-pointer"
          aria-label="Emergency SOS - 1 tap to emergency actions"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping opacity-75" />
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="tracking-wide">SOS 112</span>
        </button>
      </div>
    </header>
  );
};
