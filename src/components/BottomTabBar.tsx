import React from 'react';
import { Home, Map, ShieldCheck, AlertTriangle, User } from 'lucide-react';

export type TabType = 'home' | 'map' | 'trips' | 'report' | 'profile' | 'contacts';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isTripActive: boolean;
  reportsCount: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  isTripActive,
  reportsCount,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'map' as TabType, label: 'Map', icon: Map },
    {
      id: 'trips' as TabType,
      label: 'Trips',
      icon: ShieldCheck,
      badge: isTripActive ? 'Active' : undefined,
    },
    {
      id: 'report' as TabType,
      label: 'Report',
      icon: AlertTriangle,
      badge: reportsCount > 0 ? String(reportsCount) : undefined,
    },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`touch-target relative flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
                isActive ? 'text-rose-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-rose-400' : 'text-slate-400'
                  }`}
                />
                {tab.badge && (
                  <span
                    className={`absolute -top-1.5 -right-2 text-[9px] font-bold px-1.5 py-0.2 rounded-full leading-none ${
                      tab.id === 'trips' && isTripActive
                        ? 'bg-emerald-500 text-slate-950 animate-pulse'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 leading-none">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-rose-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
