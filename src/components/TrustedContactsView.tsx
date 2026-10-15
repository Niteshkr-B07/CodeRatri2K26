import React, { useState } from 'react';
import { Users, Plus, Phone, Trash2, ShieldCheck, Check, MessageSquare, X } from 'lucide-react';
import { TrustedContact } from '../types';

interface TrustedContactsViewProps {
  contacts: TrustedContact[];
  onAddContact: (contact: Omit<TrustedContact, 'id' | 'createdAt'>) => void;
  onDeleteContact: (id: string) => void;
  onToggleDefault: (id: string) => void;
}

export const TrustedContactsView: React.FC<TrustedContactsViewProps> = ({
  contacts,
  onAddContact,
  onDeleteContact,
  onToggleDefault,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [relationship, setRelationship] = useState<TrustedContact['relationship']>('Family');
  const [isDefault, setIsDefault] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    onAddContact({
      userId: 'current-user',
      name: name.trim(),
      phone: phone.trim(),
      relationship,
      isDefaultGuardian: isDefault,
    });

    setName('');
    setPhone('+91 ');
    setIsAdding(false);
    setToastMessage('Trusted contact saved.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleTestSms = (contact: TrustedContact) => {
    const body = encodeURIComponent(
      `Hi ${contact.name}, this is a test check-in alert from SafeTrip. You are set as my trusted guardian for journey monitoring!`
    );
    window.location.href = `sms:${contact.phone.replace(/[^0-9+]/g, '')}?body=${body}`;
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-600 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Trusted Contacts & Guardians</h2>
          <p className="text-xs text-slate-400">
            Guardians receive your live tracking link and missed check-in alerts
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="touch-target px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-950 flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAdding ? 'Close' : 'Add Contact'}</span>
        </button>
      </div>

      {/* Add Contact Card */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-900 border border-indigo-500/50 rounded-2xl space-y-3 text-xs">
          <h3 className="font-bold text-sm text-white">Add New Trusted Guardian</h3>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Maya Sharma"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Phone Number (with Country Code)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+91 98765 43210"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as TrustedContact['relationship'])}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Family">Family / Parent</option>
                <option value="Roommate">Roommate</option>
                <option value="Colleague">Colleague</option>
                <option value="Friend">Friend</option>
                <option value="Partner">Partner</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span>Set as primary default guardian for new trips</span>
          </label>

          <button
            type="submit"
            className="touch-target w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            Save Trusted Contact
          </button>
        </form>
      )}

      {/* Contacts List */}
      <div className="space-y-2.5">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 font-bold">
                {contact.name.slice(0, 1)}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 text-sm">{contact.name}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-medium">
                    {contact.relationship}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>{contact.phone}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleTestSms(contact)}
                className="touch-target p-2 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors"
                title="Send test check-in SMS"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <button
                onClick={() => onToggleDefault(contact.id)}
                className={`touch-target p-2 rounded-lg transition-colors ${
                  contact.isDefaultGuardian
                    ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                }`}
                title={contact.isDefaultGuardian ? 'Active Guardian' : 'Click to set as default guardian'}
              >
                <ShieldCheck className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDeleteContact(contact.id)}
                className="touch-target p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Delete contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
