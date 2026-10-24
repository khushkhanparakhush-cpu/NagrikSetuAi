import React from 'react';
import { NavTab } from './Header';

interface MobileBottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unreadCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  unreadCount = 0,
}) => {
  const navItems: { id: NavTab; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'report', label: 'File', icon: 'add_a_photo' },
    { id: 'track', label: 'Track', icon: 'travel_explore' },
    { id: 'my-reports', label: 'Reports', icon: 'assignment' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E5E7EB] shadow-[0_-2px_12px_rgba(0,0,0,0.04)] h-16 sm:h-[68px] pb-[env(safe-area-inset-bottom)] px-2"
    >
      <div className="grid grid-cols-5 h-full max-w-md mx-auto items-center">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              type="button"
              className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-150 min-h-[44px] ${
                isActive
                  ? 'text-[#356AE6]'
                  : 'text-[#6B7280] hover:text-[#15171A] active:scale-95'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className={`material-symbols-outlined text-[22px] transition-transform ${
                    isActive ? 'scale-110 font-bold text-[#356AE6]' : 'text-[#6B7280]'
                  }`}
                >
                  {item.icon}
                </span>

                {/* Badge for Notifications / Updates on My Reports */}
                {item.id === 'my-reports' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-[#356AE6] rounded-full ring-2 ring-white" />
                )}
              </div>

              <span
                className={`text-[11px] font-sans mt-0.5 tracking-tight ${
                  isActive ? 'font-semibold text-[#356AE6]' : 'font-medium text-[#6B7280]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
