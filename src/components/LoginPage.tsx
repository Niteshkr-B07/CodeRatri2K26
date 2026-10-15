import React, { useState } from 'react';
import { Shield, Lock, Mail, User, Phone, ArrowRight, Sparkles, Check, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import { TravelerPersona, UserProfile } from '../types';
import { DEMO_USERS, storageService } from '../services/storage';
import {
  firebaseLogin,
  firebaseSignUp,
  firebaseSendPasswordReset,
  getFriendlyAuthError,
} from '../services/firebase';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('aarav.patel@safetrip.org');
  const [password, setPassword] = useState('safe123');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+91 ');
  const [persona, setPersona] = useState<TravelerPersona>('commuter');
  const [emergencyPin, setEmergencyPin] = useState('1234');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Network pre-check
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMsg('No internet connection. Please verify your network connection and try again.');
      return;
    }

    setIsLoading(true);

    if (isSignUp) {
      if (!displayName.trim()) {
        setErrorMsg('Please enter your full name');
        setIsLoading(false);
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address');
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }

      try {
        const newUser = await firebaseSignUp({
          email: email.trim(),
          password,
          displayName: displayName.trim(),
          phoneNumber: phoneNumber.trim() || '+91 98000 11223',
          persona,
          emergencyPin: emergencyPin || '1234',
        });

        storageService.saveUser(newUser);
        setSuccessToast(`Welcome to SafeTrip, ${newUser.displayName}! Account created.`);
        setTimeout(() => onLoginSuccess(newUser), 600);
      } catch (err: unknown) {
        console.error('Sign up error:', err);
        setErrorMsg(getFriendlyAuthError(err));
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!email.trim()) {
        setErrorMsg('Please enter your email');
        setIsLoading(false);
        return;
      }
      if (!password) {
        setErrorMsg('Please enter your password');
        setIsLoading(false);
        return;
      }

      try {
        const user = await firebaseLogin(email.trim(), password);
        storageService.saveUser(user);
        setSuccessToast(`Welcome back, ${user.displayName}!`);
        setTimeout(() => onLoginSuccess(user), 500);
      } catch (err: unknown) {
        console.error('Login error:', err);
        setErrorMsg(getFriendlyAuthError(err));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectPreset = (p: TravelerPersona) => {
    const user = storageService.loginAsPreset(p);
    setSuccessToast(`Logged in as ${user.displayName} (${p})`);
    setTimeout(() => onLoginSuccess(user), 400);
  };

  const handleGuestLogin = () => {
    const guestUser: UserProfile = {
      uid: 'guest-' + Date.now().toString(36),
      displayName: 'Guest Traveler',
      email: 'guest@safetrip.local',
      phoneNumber: '+91 98999 00000',
      persona: 'general',
      emergencyPin: '0000',
      createdAt: Date.now(),
      tripsCompletedCount: 0,
      reportsFiledCount: 0,
    };
    storageService.saveUser(guestUser);
    onLoginSuccess(guestUser);
  };

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = (forgotEmail || email).trim();
    if (!targetEmail) return;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMsg('No internet connection. Please verify your network and try again.');
      return;
    }

    try {
      await firebaseSendPasswordReset(targetEmail);
      setIsForgotModalOpen(false);
      setSuccessToast(`Password reset email dispatched to ${targetEmail}. Please check your inbox.`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      setErrorMsg(getFriendlyAuthError(err));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center px-4 py-8">
      <div className="max-w-md w-full mx-auto space-y-5">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/40 items-center justify-center text-rose-400 mb-1 shadow-lg shadow-rose-950/40">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">SafeTrip</h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Universal journey protection, real-time Trip Guardian, and emergency response for everyone.
          </p>
        </div>

        {/* Success / Error Notification Toasts */}
        {successToast && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-600 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-950/80 border border-rose-600 rounded-xl text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1-Tap Hackathon Fast Demo Personas */}
        <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Instant Demo Personas</span>
            </span>
            <span className="text-[10px] text-slate-400">1-Tap Login</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Select a verified persona to test journey guardian and community reports instantly:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleSelectPreset('commuter')}
              className="touch-target p-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors cursor-pointer"
            >
              <span className="font-bold text-slate-200 text-xs block truncate">Aarav Patel</span>
              <span className="text-[10px] text-indigo-400">Late Commuter</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('student')}
              className="touch-target p-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors cursor-pointer"
            >
              <span className="font-bold text-slate-200 text-xs block truncate">Riya Sen</span>
              <span className="text-[10px] text-emerald-400">Campus Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('traveler')}
              className="touch-target p-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors cursor-pointer"
            >
              <span className="font-bold text-slate-200 text-xs block truncate">Maya Verma</span>
              <span className="text-[10px] text-amber-400">Solo Traveler</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('runner')}
              className="touch-target p-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors cursor-pointer"
            >
              <span className="font-bold text-slate-200 text-xs block truncate">Kabir Mehta</span>
              <span className="text-[10px] text-rose-400">Evening Runner</span>
            </button>
          </div>
        </div>

        {/* Main Auth Form Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-xs space-y-4">
          {/* Tabs: Sign In / Create Account */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                !isSignUp ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                isSignUp ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignUp && (
              <>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      placeholder="e.g. Ananya Sharma"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Traveler Persona</label>
                  <select
                    value={persona}
                    onChange={(e) => setPersona(e.target.value as TravelerPersona)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="commuter">Late Commuter (Shift Worker / Tech / Retail)</option>
                    <option value="student">Campus Student (Library & Hostel)</option>
                    <option value="traveler">Solo Traveler (Tourist / Explorer)</option>
                    <option value="runner">Evening Runner / Cyclist</option>
                    <option value="general">Daily Transit Rider</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Phone Number (with Country Code)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.name@email.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-slate-300">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setIsForgotModalOpen(true);
                    }}
                    className="text-[11px] text-indigo-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Emergency PIN (4 Digits to Cancel Alerts)
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    maxLength={4}
                    value={emergencyPin}
                    onChange={(e) => setEmergencyPin(e.target.value)}
                    required
                    placeholder="1234"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-100 font-mono text-center tracking-widest focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="touch-target w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-950 flex items-center justify-center gap-1.5 cursor-pointer transition-all mt-2"
            >
              <span>{isSignUp ? 'Create SafeTrip Account' : 'Sign In to SafeTrip'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Guest Checkout Alternative */}
          <div className="pt-2 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              Continue as Anonymous Guest
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl text-xs space-y-3">
            <h3 className="text-base font-bold text-white">Reset SafeTrip Password</h3>
            <p className="text-slate-400">
              Enter your account email to receive secure recovery instructions:
            </p>
            <form onSubmit={handleSendReset} className="space-y-3">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                placeholder="email@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
