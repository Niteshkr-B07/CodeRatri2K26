import React from 'react';
import { BatteryWarning, Battery, ArrowRight, ShieldAlert, Check } from 'lucide-react';
import { UserSettings } from '../types';

interface BatterySaverBannerProps {
  batteryLevel: number;
  settings: UserSettings;
  onOpenSettings: () => void;
  onEnableSaver?: () => void;
}

export const BatterySaverBanner: React.FC<BatterySaverBannerProps> = ({
  batteryLevel,
  settings,
  onOpenSettings,
  onEnableSaver,
}) => {
  // Only show when battery drops below or equal to threshold (20%)
  if (batteryLevel > settings.lowBatteryThreshold) {
    return null;
  }

  const isSaverActive = settings.batterySaverEnabled;

  return (
    <aside
      role="alert"
      aria-live="polite"
      className="sticky top-[53px] z-35 bg-gradient-to-r from-amber-950/95 via-amber-900/90 to-amber-950/95 backdrop-blur-md border-b border-amber-500/50 px-3.5 py-2 text-amber-100 shadow-md transition-all animate-fadeIn"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 text-xs">
        {/* Left: Icon & Description */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
            <BatteryWarning className="w-4 h-4 animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-white text-[12px] tracking-tight">
                {isSaverActive
                  ? `Battery Saver Active (${batteryLevel}%)`
                  : `Low Battery Alert (${batteryLevel}%)`}
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-900/90 border border-amber-600/50 text-amber-200">
                {isSaverActive ? '2m Interval' : '30s Normal'}
              </span>
            </div>

            <p className="text-[11px] text-amber-200/90 truncate sm:whitespace-normal leading-tight mt-0.5">
              {isSaverActive ? (
                <>
                  Location polling frequency is <strong>actively extended to 2 minutes</strong> to prevent phone shutdown.
                </>
              ) : (
                <>
                  Battery below 20%. Polling still running at 30s. Tap to enable 2-minute saver.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Button */}
        <div className="shrink-0 flex items-center gap-2">
          {!isSaverActive && onEnableSaver ? (
            <button
              onClick={onEnableSaver}
              className="touch-target px-2.5 py-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>Enable</span>
            </button>
          ) : (
            <button
              onClick={onOpenSettings}
              className="touch-target px-2.5 py-1 bg-amber-900/60 hover:bg-amber-800/80 active:scale-95 text-amber-200 border border-amber-600/50 hover:text-white font-medium text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
              title="Configure battery saver settings"
            >
              <span>Settings</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
