import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface FloatingEmergencyButtonProps {
  onTriggerSOS: () => void;
}

export const FloatingEmergencyButton: React.FC<FloatingEmergencyButtonProps> = ({
  onTriggerSOS,
}) => {
  return (
    <div className="fixed bottom-20 right-4 z-45">
      <button
        onClick={onTriggerSOS}
        className="touch-target relative flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 active:scale-90 text-white font-extrabold text-xs px-4 py-3 rounded-full shadow-2xl shadow-rose-950/90 border-2 border-rose-300/40 cursor-pointer transition-all"
        aria-label="Emergency SOS 112 - 1 tap to emergency actions"
        title="Emergency SOS (1 tap to call 112 or dispatch GPS SMS)"
      >
        {/* Pulsing ring indicator */}
        <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-60 pointer-events-none" />
        <span className="relative flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 fill-current text-white shrink-0" />
          <span className="tracking-wider text-xs">SOS 112</span>
        </span>
      </button>
    </div>
  );
};
