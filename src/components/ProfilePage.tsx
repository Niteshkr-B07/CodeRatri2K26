import React, { useState } from 'react';
import {
  User,
  Shield,
  Phone,
  Mail,
  KeyRound,
  SlidersHorizontal,
  LogOut,
  Edit3,
  HeartPulse,
  Award,
  AlertTriangle,
  Users,
  Check,
  Lock,
} from 'lucide-react';
import { UserProfile, TravelerPersona, TrustedContact } from '../types';
import { DEMO_USERS } from '../services/storage';

interface ProfilePageProps {
  user: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  trustedContactsCount: number;
  reportsCount: number;
  onOpenSettings: () => void;
  onOpenContacts: () => void;
  onLogout: () => void;
  onSwitchPersona: (persona: TravelerPersona) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onUpdateProfile,
  trustedContactsCount,
  reportsCount,
  onOpenSettings,
  onOpenContacts,
  onLogout,
  onSwitchPersona,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
  const [persona, setPersona] = useState<TravelerPersona>(user.persona);
  const [emergencyPin, setEmergencyPin] = useState(user.emergencyPin);
  const [bio, setBio] = useState(user.bio || '');
  const [medicalInfo, setMedicalInfo] = useState(user.emergencyMedicalInfo || '');
  const [saveToast, setSaveToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      displayName: displayName.trim(),
      phoneNumber: phoneNumber.trim(),
      persona,
      emergencyPin: emergencyPin.trim(),
      bio: bio.trim(),
      emergencyMedicalInfo: medicalInfo.trim(),
    };
    onUpdateProfile(updated);
    setIsEditing(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const getPersonaColor = (p: TravelerPersona) => {
    switch (p) {
      case 'student':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'traveler':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'runner':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      default:
        return 'bg-indigo-950 text-indigo-300 border-indigo-800';
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Toast */}
      {saveToast && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-600 rounded-xl text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      {/* Profile Header & Identity Card */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl relative overflow-hidden space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            {/* Avatar Circle */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-rose-600 border border-white/20 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {user.displayName.slice(0, 1)}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">{user.displayName}</h2>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${getPersonaColor(
                    user.persona
                  )}`}
                >
                  {user.persona}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-slate-500" />
                <span>{user.phoneNumber}</span>
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-500" />
                <span>{user.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="touch-target p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Edit Profile"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {user.bio && (
          <p className="text-slate-300 leading-relaxed pt-2 border-t border-slate-800 text-[11px]">
            {user.bio}
          </p>
        )}

        {/* Safety Stats Strip */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80">
          <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xl text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Trips Safe</span>
            <span className="font-mono text-base font-extrabold text-emerald-400">
              {user.tripsCompletedCount || 24}
            </span>
          </div>

          <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xl text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Guardians</span>
            <span className="font-mono text-base font-extrabold text-indigo-400">
              {trustedContactsCount}
            </span>
          </div>

          <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xl text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Reports</span>
            <span className="font-mono text-base font-extrabold text-amber-400">
              {reportsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile Form (Collapsible) */}
      {isEditing && (
        <form onSubmit={handleSave} className="p-4 bg-slate-900 border border-indigo-500/50 rounded-2xl space-y-3">
          <h3 className="font-bold text-sm text-white">Edit Profile Details</h3>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Traveler Persona</label>
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value as TravelerPersona)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="commuter">Late Commuter</option>
                <option value="student">Campus Student</option>
                <option value="traveler">Solo Traveler</option>
                <option value="runner">Evening Runner</option>
                <option value="general">Daily Transit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Emergency Disarm PIN (4 Digits)
            </label>
            <input
              type="password"
              maxLength={4}
              value={emergencyPin}
              onChange={(e) => setEmergencyPin(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono tracking-widest focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Emergency Medical Note (Attached to SOS)
            </label>
            <input
              type="text"
              value={medicalInfo}
              onChange={(e) => setMedicalInfo(e.target.value)}
              placeholder="e.g. Blood Group O+, carries asthma inhaler"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="w-1/2 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
            >
              Save Profile
            </button>
          </div>
        </form>
      )}

      {/* Emergency Medical & Disarm PIN Overview Card */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-rose-400" />
            <span>Emergency Medical & SOS Info</span>
          </span>
          <span className="text-[10px] text-slate-400">Attached to SOS SMS</span>
        </div>

        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Medical Notes:</span>
            <span className="font-medium">{user.emergencyMedicalInfo || 'None specified'}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Emergency Disarm PIN:</span>
            <span className="font-mono tracking-widest text-indigo-400">••••</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Rows */}
      <div className="p-2 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
        <button
          onClick={onOpenContacts}
          className="touch-target w-full p-3 rounded-xl flex items-center justify-between hover:bg-slate-800/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-200">Manage Trusted Guardians</span>
          </div>
          <span className="text-slate-400 font-mono">{trustedContactsCount} Contacts →</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="touch-target w-full p-3 rounded-xl flex items-center justify-between hover:bg-slate-800/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">Battery Saver & Polling Rates</span>
          </div>
          <span className="text-slate-400">Configure →</span>
        </button>

        <button
          onClick={onLogout}
          className="touch-target w-full p-3 rounded-xl flex items-center justify-between hover:bg-rose-950/40 text-rose-400 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4" />
            <span className="font-semibold">Log Out of SafeTrip</span>
          </div>
          <span className="text-rose-400/80">Switch Account →</span>
        </button>
      </div>

      {/* Switch Demo Persona Quick Bar */}
      <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-2">
        <span className="font-semibold text-slate-300 block text-[11px]">
          Switch Active Demo Persona (For Testing):
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['commuter', 'student', 'traveler', 'runner'] as TravelerPersona[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onSwitchPersona(p)}
              className={`px-2.5 py-1 rounded-lg border capitalize text-[11px] transition-colors cursor-pointer ${
                user.persona === p
                  ? 'bg-slate-800 border-indigo-500 text-white font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Commitment */}
      <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-start gap-2 text-[10px] text-slate-500">
        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          SafeTrip Privacy Commitment: Location tracking only activates during scheduled trips. Raw locations are never sold or shared. Community hazard reports automatically fuzz coordinates by ~100m.
        </p>
      </div>
    </div>
  );
};
