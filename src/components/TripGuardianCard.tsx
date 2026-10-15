import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Share2,
  XCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TripSession, TrustedContact } from '../types';
import { soundService } from '../services/sound';

interface TripGuardianCardProps {
  activeTrip: TripSession | null;
  onStartTripClick: () => void;
  onCheckIn: () => void;
  onEndTrip: () => void;
  onCancelTrip: () => void;
  onExtendTrip: (additionalMinutes: number) => void;
  onTriggerSOS: () => void;
  trustedContacts: TrustedContact[];
}

export const TripGuardianCard: React.FC<TripGuardianCardProps> = ({
  activeTrip,
  onStartTripClick,
  onCheckIn,
  onEndTrip,
  onCancelTrip,
  onExtendTrip,
  onTriggerSOS,
  trustedContacts,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isOverdue, setIsOverdue] = useState<boolean>(false);
  const [graceSecondsRemaining, setGraceSecondsRemaining] = useState<number>(60);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  // Autorun countdown timer when trip is active
  useEffect(() => {
    if (!activeTrip || activeTrip.status === 'completed' || activeTrip.status === 'cancelled') {
      soundService.stopUrgentAlert();
      setIsOverdue(false);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((activeTrip.nextCheckInDueAt - now) / 1000));
      setSecondsRemaining(diff);

      if (diff === 0) {
        setIsOverdue(true);
        // Play urgent alert when overdue
        soundService.startUrgentAlert();

        if (activeTrip.overdueGraceExpiresAt) {
          const graceDiff = Math.max(0, Math.floor((activeTrip.overdueGraceExpiresAt - now) / 1000));
          setGraceSecondsRemaining(graceDiff);
        }
      } else {
        if (isOverdue) {
          setIsOverdue(false);
          soundService.stopUrgentAlert();
        }
        // Warning sound 60s before check-in is due
        if (diff === 60) {
          soundService.playCheckInReminder();
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      soundService.stopUrgentAlert();
    };
  }, [activeTrip, isOverdue]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleManualCheckIn = () => {
    soundService.stopUrgentAlert();
    setIsOverdue(false);
    soundService.playCheckInSuccess();
    onCheckIn();
  };

  const handleEndWithCelebration = () => {
    soundService.stopUrgentAlert();
    setIsOverdue(false);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#06b6d4', '#6366f1'],
    });
    onEndTrip();
  };

  const handleShareLink = async () => {
    if (!activeTrip) return;
    const url = `https://safetrip.app/t/${activeTrip.shareToken}?dest=${encodeURIComponent(activeTrip.destination.address)}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'SafeTrip Live Journey Link',
          text: `I started a journey to ${activeTrip.destination.address}. Track my live status on SafeTrip:`,
          url,
        });
        return;
      } catch {
        // fallback
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  // If no trip is currently active, render the Start Trip Invitation Card
  if (!activeTrip) {
    const activeGuardians = trustedContacts.filter((c) => c.isDefaultGuardian);
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Guardian Ready
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Trip Guardian</h2>
            <p className="text-xs text-slate-400 max-w-sm">
              Wraps your walk, ride, or transit in scheduled check-ins and live tracking for your trusted contacts.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Selected Guardians Preview */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Active Guardians: <strong className="text-slate-200">{activeGuardians.length || 0} selected</strong>
          </span>
          <button
            onClick={onStartTripClick}
            className="touch-target px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/60 cursor-pointer transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Safe Trip</span>
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE TRIP STATE
  const totalIntervalSecs = activeTrip.checkInIntervalMinutes * 60;
  const progressRatio = totalIntervalSecs > 0 ? (totalIntervalSecs - secondsRemaining) / totalIntervalSecs : 0;
  const strokeDashoffset = 283 - 283 * Math.min(1, Math.max(0, progressRatio));

  return (
    <div
      className={`rounded-2xl p-5 shadow-xl transition-all border ${
        isOverdue
          ? 'bg-rose-950/90 border-rose-500 shadow-rose-950/80 animate-pulse'
          : 'bg-slate-900 border-indigo-500/40 shadow-slate-950'
      }`}
    >
      {/* Overdue Alert Banner if check-in was missed */}
      {isOverdue && (
        <div className="mb-4 p-3 bg-rose-600/30 border border-rose-500 rounded-xl text-rose-200 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Check-in Overdue ({graceSecondsRemaining}s grace left)</p>
              <p className="text-[11px] text-rose-200">Confirm you are safe or notify emergency contacts.</p>
            </div>
          </div>
        </div>
      )}

      {/* Destination & Mode Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
            <Navigation className="w-3.5 h-3.5" />
            <span>Heading to</span>
          </div>
          <h3 className="text-base font-bold text-white truncate max-w-[240px]">
            {activeTrip.destination.address}
          </h3>
          <p className="text-xs text-slate-400 capitalize">
            Mode: {activeTrip.travelMode} · Check-in every {activeTrip.checkInIntervalMinutes} min
          </p>
        </div>

        {/* Circular Countdown Gauge */}
        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              className="text-slate-800"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              className={isOverdue ? 'text-rose-500' : 'text-emerald-500'}
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Clock className={`w-3.5 h-3.5 mb-0.5 ${isOverdue ? 'text-rose-400' : 'text-slate-400'}`} />
            <span
              className={`font-mono text-xs font-bold tabular-nums ${
                isOverdue ? 'text-rose-300' : 'text-white'
              }`}
            >
              {formatTime(secondsRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Check-In Action Button */}
      <div className="mt-5 space-y-2">
        <button
          onClick={handleManualCheckIn}
          className={`touch-target w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-[0.98] ${
            isOverdue
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950 border border-rose-400/50'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60 border border-emerald-400/30'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>I&apos;m Safe — Check In Now</span>
        </button>

        {/* Overdue Split Actions */}
        {isOverdue && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onExtendTrip(15)}
              className="touch-target py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Extend (+15m)</span>
            </button>
            <button
              onClick={onTriggerSOS}
              className="touch-target py-2 px-3 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-950"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Alert Guardians</span>
            </button>
          </div>
        )}
      </div>

      {/* Secondary Controls: Share Link & Complete Trip */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <button
          onClick={handleShareLink}
          className="text-slate-400 hover:text-slate-200 flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{shareCopied ? 'Link Copied!' : 'Share Live Link'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancelTrip}
            className="text-slate-400 hover:text-rose-400 flex items-center gap-1 py-1.5 px-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleEndWithCelebration}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Arrived Safely
          </button>
        </div>
      </div>
    </div>
  );
};
