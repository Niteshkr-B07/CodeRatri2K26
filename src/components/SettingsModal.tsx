import React, { useState } from 'react';
import {
  X,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Clock,
  Shield,
  Zap,
  CheckCircle2,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { UserSettings, TravelerPersona, UserProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  currentBatteryLevel: number;
  onSimulateBattery: (level: number | null) => void;
  isSimulatedBattery: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  userProfile,
  onUpdateProfile,
  currentBatteryLevel,
  onSimulateBattery,
  isSimulatedBattery,
}) => {
  if (!isOpen) return null;

  const isBatteryLow = currentBatteryLevel <= settings.lowBatteryThreshold;
  const isBatterySaverEngaged = settings.batterySaverEnabled && isBatteryLow;

  const effectivePollingSeconds = isBatterySaverEngaged
    ? settings.batterySaverPollingIntervalSeconds
    : settings.normalPollingIntervalSeconds;

  const handleToggleSaver = () => {
    onUpdateSettings({
      ...settings,
      batterySaverEnabled: !settings.batterySaverEnabled,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">App Settings & Energy</h2>
              <p className="text-xs text-slate-400">Location polling & trip safety preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="touch-target p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          {/* PRIMARY REQUIREMENT: Smart Battery Saver Toggle */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">Smart Battery Saver</span>
                  {isBatterySaverEngaged && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-800/60 px-1.5 py-0.2 rounded">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Automatically reduces background location polling frequency from <strong>every 30 seconds</strong> to <strong>every 2 minutes</strong> when battery falls below 20%.
                </p>
              </div>

              {/* iOS / Mobile style toggle switch */}
              <button
                type="button"
                onClick={handleToggleSaver}
                className={`touch-target relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.batterySaverEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
                role="switch"
                aria-checked={settings.batterySaverEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.batterySaverEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Current Real-Time Polling Status */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                isBatterySaverEngaged
                  ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {isBatterySaverEngaged ? (
                  <BatteryWarning className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <div>
                  <span className="font-semibold block">
                    Current Polling Rate: {effectivePollingSeconds >= 60 ? `${effectivePollingSeconds / 60} minutes` : `${effectivePollingSeconds} seconds`}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isBatterySaverEngaged
                      ? 'Throttled to conserve critical power'
                      : 'Standard high-frequency journey tracking'}
                  </span>
                </div>
              </div>

              <div className="text-right font-mono font-bold text-xs">
                {currentBatteryLevel}%
              </div>
            </div>
          </div>

          {/* HACKATHON STAGE SIMULATOR: Battery Level Controls */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Battery for Demo Testing</span>
              </span>
              {isSimulatedBattery && (
                <span className="text-[10px] text-indigo-400 font-mono">Simulated</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Tap below to simulate low battery and verify the automated polling frequency throttle without draining your phone:
            </p>
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => onSimulateBattery(85)}
                className={`py-1.5 px-2 rounded-lg border text-center transition-colors cursor-pointer ${
                  currentBatteryLevel === 85 && isSimulatedBattery
                    ? 'bg-slate-800 border-indigo-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                85% (Normal)
              </button>
              <button
                type="button"
                onClick={() => onSimulateBattery(18)}
                className={`py-1.5 px-2 rounded-lg border text-center transition-colors cursor-pointer ${
                  currentBatteryLevel === 18 && isSimulatedBattery
                    ? 'bg-amber-950 border-amber-500 text-amber-200 font-bold'
                    : 'bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-300'
                }`}
              >
                18% (&lt; 20%)
              </button>
              <button
                type="button"
                onClick={() => onSimulateBattery(9)}
                className={`py-1.5 px-2 rounded-lg border text-center transition-colors cursor-pointer ${
                  currentBatteryLevel === 9 && isSimulatedBattery
                    ? 'bg-rose-950 border-rose-500 text-rose-200 font-bold'
                    : 'bg-slate-900 border-slate-800 text-rose-400 hover:text-rose-300'
                }`}
              >
                9% (Critical)
              </button>
              <button
                type="button"
                onClick={() => onSimulateBattery(null)}
                className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-center transition-colors cursor-pointer"
              >
                Reset Real
              </button>
            </div>
          </div>

          {/* User Profile & Safety Persona */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <span className="font-semibold text-slate-300 block">Traveler Profile</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Display Name</label>
                <input
                  type="text"
                  value={userProfile.displayName}
                  onChange={(e) => onUpdateProfile({ ...userProfile, displayName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Emergency PIN (Cancel SOS)</label>
                <input
                  type="password"
                  maxLength={4}
                  value={userProfile.emergencyPin}
                  onChange={(e) => onUpdateProfile({ ...userProfile, emergencyPin: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Done CTA */}
          <button
            onClick={onClose}
            className="touch-target w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
