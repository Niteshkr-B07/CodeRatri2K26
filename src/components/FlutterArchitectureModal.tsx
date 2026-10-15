import React, { useState } from 'react';
import { X, Copy, Check, FileCode2, Layers, Database, Shield } from 'lucide-react';

interface FlutterArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SNIPPETS = {
  riverpod: `// lib/presentation/controllers/trip_guardian_controller.dart
import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/models/trip_session.dart';
import '../../data/repositories/trip_repository.dart';

final tripGuardianProvider = StateNotifierProvider<TripGuardianNotifier, TripSession?>((ref) {
  return TripGuardianNotifier(ref.watch(tripRepositoryProvider));
});

class TripGuardianNotifier extends StateNotifier<TripSession?> {
  final TripRepository _repository;
  Timer? _countdownTimer;

  TripGuardianNotifier(this._repository) : super(null);

  Future<void> startTrip({
    required String destinationAddress,
    required double lat,
    required double lng,
    required int durationMinutes,
    required int intervalMinutes,
    required List<String> contactIds,
  }) async {
    final newTrip = TripSession.create(
      destinationAddress: destinationAddress,
      lat: lat,
      lng: lng,
      durationMinutes: durationMinutes,
      intervalMinutes: intervalMinutes,
      contactIds: contactIds,
    );
    state = await _repository.createTrip(newTrip);
    _startTimer();
  }

  void checkIn() {
    if (state == null) return;
    final updated = state!.copyWith(
      lastCheckInAt: DateTime.now(),
      nextCheckInDueAt: DateTime.now().add(Duration(minutes: state!.intervalMinutes)),
      status: TripStatus.active,
    );
    state = updated;
    _repository.updateTrip(updated);
  }

  void _startTimer() {
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (state == null) {
        timer.cancel();
        return;
      }
      if (DateTime.now().isAfter(state!.nextCheckInDueAt)) {
        state = state!.copyWith(status: TripStatus.overdueAlert);
      }
    });
  }
}`,

  model: `// lib/domain/models/trip_session.dart
enum TripStatus { active, paused, overdueAlert, completed, cancelled }

class TripSession {
  final String id;
  final String userId;
  final String destinationAddress;
  final double lat;
  final double lng;
  final TripStatus status;
  final DateTime startedAt;
  final DateTime nextCheckInDueAt;
  final DateTime lastCheckInAt;
  final int intervalMinutes;
  final List<String> contactIds;
  final String shareToken;

  const TripSession({
    required this.id,
    required this.userId,
    required this.destinationAddress,
    required this.lat,
    required this.lng,
    required this.status,
    required this.startedAt,
    required this.nextCheckInDueAt,
    required this.lastCheckInAt,
    required this.intervalMinutes,
    required this.contactIds,
    required this.shareToken,
  });

  Map<String, dynamic> toFirestore() => {
    'destinationAddress': destinationAddress,
    'location': {'lat': lat, 'lng': lng},
    'status': status.name,
    'startedAt': startedAt.toIso8601String(),
    'nextCheckInDueAt': nextCheckInDueAt.toIso8601String(),
    'intervalMinutes': intervalMinutes,
    'contactIds': contactIds,
    'shareToken': shareToken,
  };
}`,

  securityRules: `// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuth() { return request.auth != null; }
    function isOwner(uid) { return isAuth() && request.auth.uid == uid; }

    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    match /trusted_contacts/{contactId} {
      allow read, write: if isAuth() && resource.data.userId == request.auth.uid;
      allow create: if isAuth() && request.resource.data.userId == request.auth.uid;
    }
    match /trips/{tripId} {
      allow read, write: if isAuth() && (resource == null || resource.data.userId == request.auth.uid);
      allow read: if resource.data.status == 'active';
    }
    match /safety_reports/{reportId} {
      allow read: if true;
      allow create: if isAuth();
    }
  }
}`,
};

export const FlutterArchitectureModal: React.FC<FlutterArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'riverpod' | 'model' | 'securityRules'>('riverpod');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentCode = SNIPPETS[activeTab];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-6">
      <div className="w-full max-w-2xl bg-slate-900 border border-indigo-500/40 rounded-2xl p-5 shadow-2xl text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Flutter (Dart) + Firebase Architecture
              </h2>
              <p className="text-xs text-slate-400">Ready-to-present mobile engineering blueprint</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="touch-target p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('riverpod')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'riverpod'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Riverpod Controller
            </button>
            <button
              onClick={() => setActiveTab('model')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'model'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dart Trip Model
            </button>
            <button
              onClick={() => setActiveTab('securityRules')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'securityRules'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Firestore Rules
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="touch-target px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Content Viewport */}
        <div className="mt-3 flex-1 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-300">
          <pre className="whitespace-pre-wrap">{currentCode}</pre>
        </div>

        {/* Footer Note */}
        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Clean Architecture: Domain, Data, Presentation layers separated.</span>
          <span className="text-indigo-400 font-medium">Null-safe Dart 3.x</span>
        </div>
      </div>
    </div>
  );
};
