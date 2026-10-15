import React, { useState } from 'react';
import {
  AlertTriangle,
  Lightbulb,
  Shield,
  ThumbsUp,
  Plus,
  X,
  MapPin,
  Clock,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { SafetyReport, HazardCategory, HazardSeverity, GeoPoint } from '../types';

interface CommunityReportsViewProps {
  reports: SafetyReport[];
  currentLocation: GeoPoint;
  onAddReport: (report: Omit<SafetyReport, 'id' | 'createdAt' | 'upvotes' | 'verified'>) => void;
  onUpvoteReport: (reportId: string) => void;
  isModalOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
}

export const CommunityReportsView: React.FC<CommunityReportsViewProps> = ({
  reports,
  currentLocation,
  onAddReport,
  onUpvoteReport,
  isModalOpen,
  onOpenModal,
  onCloseModal,
}) => {
  const [category, setCategory] = useState<HazardCategory>('poor_lighting');
  const [severity, setSeverity] = useState<HazardSeverity>('medium');
  const [description, setDescription] = useState<string>('');
  const [addressNote, setAddressNote] = useState<string>(currentLocation.address || 'Near Current Location');
  const [submittedToast, setSubmittedToast] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    onAddReport({
      userId: 'current-user',
      userName: 'You',
      category,
      severity,
      description: description.trim(),
      location: {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        approxAddress: addressNote,
      },
    });

    setDescription('');
    onCloseModal();
    setSubmittedToast(true);
    setTimeout(() => setSubmittedToast(false), 3000);
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffHours = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hr ago';
    if (diffHours < 24) return `${diffHours} hrs ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {submittedToast && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-600 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Safety report published to the community corridor. Thank you for keeping others safe!</span>
        </div>
      )}

      {/* Header with Submit Trigger */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Community Safety Reports</h2>
          <p className="text-xs text-slate-400">Crowdsourced corridor insights and infrastructure warnings</p>
        </div>
        <button
          onClick={onOpenModal}
          className="touch-target px-3.5 py-2 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-md shadow-rose-950/60 flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>File Report</span>
        </button>
      </div>

      {/* Reports Feed */}
      <div className="space-y-2.5">
        {reports.map((report) => (
          <div
            key={report.id}
            className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs space-y-2.5 hover:border-slate-700/80 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 ${
                    report.category === 'poor_lighting'
                      ? 'bg-amber-600/30 text-amber-400 border border-amber-500/40'
                      : report.category === 'harassment'
                      ? 'bg-rose-600/30 text-rose-400 border border-rose-500/40'
                      : report.category === 'stray_animals'
                      ? 'bg-orange-600/30 text-orange-400 border border-orange-500/40'
                      : 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/40'
                  }`}
                >
                  {report.category === 'poor_lighting' && <Lightbulb className="w-4 h-4" />}
                  {report.category === 'harassment' && <AlertTriangle className="w-4 h-4" />}
                  {report.category === 'stray_animals' && <AlertTriangle className="w-4 h-4" />}
                  {report.category !== 'poor_lighting' &&
                    report.category !== 'harassment' &&
                    report.category !== 'stray_animals' && <Shield className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 capitalize">
                      {report.category.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        report.severity === 'high'
                          ? 'bg-rose-950 text-rose-300'
                          : report.severity === 'medium'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {report.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{report.userName}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(report.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Upvote Button */}
              <button
                onClick={() => onUpvoteReport(report.id)}
                className={`touch-target px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium text-xs transition-colors cursor-pointer border ${
                  report.userUpvoted
                    ? 'bg-rose-950/80 text-rose-300 border-rose-600'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800'
                }`}
                title="Confirm / Upvote this hazard"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span className="font-mono tabular-nums">{report.upvotes}</span>
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed">{report.description}</p>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{report.location.approxAddress}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Report a Safety Hazard</h3>
                  <p className="text-xs text-slate-400">Help travelers stay informed</p>
                </div>
              </div>
              <button
                onClick={onCloseModal}
                className="touch-target p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              {/* Category Picker */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Hazard Category</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'poor_lighting', label: 'Poor Street Lighting' },
                    { id: 'isolated_area', label: 'Deserted / Isolated Path' },
                    { id: 'stray_animals', label: 'Aggressive Animals' },
                    { id: 'road_hazard', label: 'Road / Pavement Hazard' },
                    { id: 'harassment', label: 'Harassment / Loitering' },
                    { id: 'broken_infrastructure', label: 'Broken Infrastructure' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as HazardCategory)}
                      className={`p-2.5 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                        category === cat.id
                          ? 'bg-rose-950/60 border-rose-500 text-white font-semibold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity Selector */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Severity Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as HazardSeverity[]).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`py-2 px-3 rounded-xl border capitalize font-medium text-center transition-all cursor-pointer ${
                        severity === sev
                          ? 'bg-slate-800 border-indigo-500 text-white font-bold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Description & Observations
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  maxLength={400}
                  placeholder="e.g. 4 streetlights out between the bakery and the footbridge; recommended walking on the opposite sidewalk."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Location Note */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Approximate Location Landmark
                </label>
                <input
                  type="text"
                  value={addressNote}
                  onChange={(e) => setAddressNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Privacy Notice */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2 text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>
                  Privacy protected: Exact GPS coordinates are automatically fuzzed by ~100m to prevent exposing your private residence or location habits.
                </span>
              </div>

              <button
                type="submit"
                className="touch-target w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-rose-950 cursor-pointer transition-all"
              >
                Publish Safety Report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
