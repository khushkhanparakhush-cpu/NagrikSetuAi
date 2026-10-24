import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types/civic';
import { CITIZEN_LOGO_URL, CITIZEN_LOGO_DATA_URI } from '../config/assets';

export type NavTab = 'home' | 'report' | 'track' | 'my-reports' | 'profile';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  selectedLanguage: 'en' | 'hi';
  onSelectLanguage: (lang: 'en' | 'hi') => void;
  unreadNotificationsCount?: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  currentUser: UserProfile;
  onSelectRole?: (role: 'citizen' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  selectedLanguage,
  onSelectLanguage,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenProfile,
  currentUser,
  onSelectRole,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Citizen-facing 5 navigation items
  const navItems: { id: NavTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'report', label: 'File Complaint' },
    { id: 'track', label: 'Track Status' },
    { id: 'my-reports', label: 'My Reports' },
    { id: 'profile', label: 'Profile' },
  ];

  // Map tab id to page title for mobile top bar
  const pageTitles: Record<NavTab, string> = {
    home: 'Home',
    report: 'File Complaint',
    track: 'Track Status',
    'my-reports': 'My Reports',
    profile: 'Profile',
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F7F6F2]/95 backdrop-blur-md border-b border-[#E5E7EB] transition-all">
      <div className="desktop-container w-full lg:w-[calc(100%-64px)] lg:max-w-[1440px] mx-auto h-16 md:h-[68px] px-3 sm:px-5 lg:px-0 flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* LEFT: Citizen Website Logo & Brand Name */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-1.5 sm:gap-2 group text-left focus:outline-none shrink-0 min-h-[44px] py-1"
            aria-label="NagrikSetu AI Home"
          >
            {/* Citizen Website Logo */}
            <img
              src={CITIZEN_LOGO_URL}
              alt="NagrikSetu AI Logo"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain shadow-xs transition-transform duration-150 group-hover:scale-105 shrink-0 bg-[#15171A]"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = CITIZEN_LOGO_DATA_URI;
              }}
            />

            <div className="flex flex-col">
              <div className="flex items-center gap-1 leading-none">
                <span className="font-sans text-[13px] sm:text-[16px] font-bold tracking-tight text-[#15171A]">
                  NAGRIKSETU
                </span>
                <span className="font-sans text-[13px] sm:text-[16px] font-extrabold text-[#356AE6] tracking-tight">
                  AI
                </span>
              </div>
              <span className="font-mono text-[9px] text-[#6B7280] tracking-wider uppercase mt-0.5 hidden lg:block">
                CIVIC INTELLIGENCE PLATFORM
              </span>
            </div>
          </button>

          {/* Mobile Current Page Indicator (Hidden on small screens to prevent crowdedness) */}
          <div className="hidden md:hidden lg:hidden items-center gap-1.5 pl-2 border-l border-[#E5E7EB] shrink-0">
            <span className="text-[#9CA3AF] text-xs font-mono">/</span>
            <span className="font-sans text-[12px] font-semibold text-[#15171A] truncate max-w-[100px]">
              {pageTitles[currentTab]}
            </span>
          </div>
        </div>

        {/* CENTER: Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-1 lg:gap-2"
        >
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative px-3.5 py-2 text-[14px] font-sans transition-colors rounded-lg font-medium whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[#356AE6] font-semibold bg-[#356AE6]/5'
                    : 'text-[#6B7280] hover:text-[#15171A] hover:bg-[#EBEAE4]/50'
                }`}
              >
                <span>{item.label}</span>
                {/* Subtle minimal bottom underline indicator */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#356AE6] rounded-full transition-all"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* RIGHT: Language Switcher, Notifications, User Role & Dropdown */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Desktop Language Switcher */}
          <div
            role="group"
            aria-label="Language selector"
            className="hidden md:flex items-center p-0.5 bg-[#FFFFFF] rounded-lg border border-[#E5E7EB] shadow-xs"
          >
            <button
              onClick={() => onSelectLanguage('en')}
              className={`px-2.5 py-1 text-[12px] lg:text-[13px] font-medium rounded-md transition-all ${
                selectedLanguage === 'en'
                  ? 'bg-[#EBF0FF] text-[#356AE6] font-semibold shadow-xs border border-[#356AE6]/20'
                  : 'text-[#6B7280] hover:text-[#15171A]'
              }`}
              type="button"
              aria-pressed={selectedLanguage === 'en'}
            >
              English
            </button>
            <span className="text-[#E5E7EB] text-[10px] select-none">|</span>
            <button
              onClick={() => onSelectLanguage('hi')}
              className={`px-2.5 py-1 text-[12px] lg:text-[13px] font-medium rounded-md transition-all ${
                selectedLanguage === 'hi'
                  ? 'bg-[#EBF0FF] text-[#356AE6] font-semibold shadow-xs border border-[#356AE6]/20'
                  : 'text-[#6B7280] hover:text-[#15171A]'
              }`}
              type="button"
              aria-pressed={selectedLanguage === 'hi'}
            >
              हिन्दी
            </button>
          </div>

          {/* Mobile Compact Language Switcher */}
          <div
            role="group"
            aria-label="Language selector"
            className="flex md:hidden items-center p-0.5 bg-[#FFFFFF] rounded-lg border border-[#E5E7EB] shadow-xs text-[11px]"
          >
            <button
              onClick={() => onSelectLanguage('en')}
              className={`px-2 py-1 min-h-[36px] min-w-[28px] font-semibold rounded-md transition-all flex items-center justify-center ${
                selectedLanguage === 'en'
                  ? 'bg-[#EBF0FF] text-[#356AE6] shadow-xs'
                  : 'text-[#6B7280]'
              }`}
              type="button"
              aria-label="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => onSelectLanguage('hi')}
              className={`px-2 py-1 min-h-[36px] min-w-[28px] font-semibold rounded-md transition-all flex items-center justify-center ${
                selectedLanguage === 'hi'
                  ? 'bg-[#EBF0FF] text-[#356AE6] shadow-xs'
                  : 'text-[#6B7280]'
              }`}
              type="button"
              aria-label="हिंदी में बदलें"
            >
              हि
            </button>
          </div>

          {/* Notifications Icon Button */}
          <button
            onClick={onOpenNotifications}
            aria-label={`Notifications${
              unreadNotificationsCount > 0
                ? `, ${unreadNotificationsCount} unread`
                : ''
            }`}
            className="relative p-2 min-h-[44px] min-w-[40px] text-[#6B7280] hover:text-[#15171A] hover:bg-[#EBEAE4]/60 rounded-lg transition-colors focus:outline-none flex items-center justify-center shrink-0"
            type="button"
          >
            <span className="material-symbols-outlined text-[19px] sm:text-[20px] leading-none">
              notifications
            </span>
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#356AE6] rounded-full ring-2 ring-[#F7F6F2]" />
            )}
          </button>

          {/* User Role Selector: Citizen / Admin Panel */}
          <div className="relative shrink-0" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 min-h-[44px] bg-[#FFFFFF] hover:bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] transition-colors focus:outline-none shadow-xs text-xs font-sans font-medium text-[#15171A]"
              type="button"
              aria-haspopup="true"
              aria-expanded={isProfileMenuOpen}
              aria-label="Role selector"
            >
              <img
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover shrink-0 bg-[#15171A]"
                src={currentUser.avatarUrl || CITIZEN_LOGO_URL}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = CITIZEN_LOGO_DATA_URI;
                }}
              />
              <span className="font-semibold text-[#15171A] max-w-[65px] sm:max-w-none truncate">
                {currentUser.role === 'admin' ? 'Admin' : 'Citizen'}
              </span>
              <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-[#6B7280]">
                keyboard_arrow_down
              </span>
            </button>

            {/* Role Dropdown Popover */}
            {isProfileMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-48 bg-[#FFFFFF] rounded-xl shadow-lg border border-[#E5E7EB] py-1.5 z-50 animate-fadeIn"
              >
                <div className="px-3.5 py-1.5 text-[10px] font-mono text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB]">
                  Role Selector
                </div>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onSelectRole?.('citizen');
                  }}
                  role="menuitem"
                  className={`w-full px-3.5 py-2.5 text-left text-xs font-sans flex items-center justify-between transition-colors ${
                    currentUser.role === 'citizen'
                      ? 'bg-[#EBF0FF] text-[#356AE6] font-semibold'
                      : 'text-[#15171A] hover:bg-[#F7F6F2]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[17px]">person</span>
                    <span>Citizen</span>
                  </div>
                  {currentUser.role === 'citizen' && (
                    <span className="material-symbols-outlined text-[16px] text-[#356AE6]">check</span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onSelectRole?.('admin');
                  }}
                  role="menuitem"
                  className={`w-full px-3.5 py-2.5 text-left text-xs font-sans flex items-center justify-between transition-colors ${
                    currentUser.role === 'admin'
                      ? 'bg-[#FEE2E2] text-[#DC2626] font-semibold'
                      : 'text-[#15171A] hover:bg-[#F7F6F2]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[17px]">admin_panel_settings</span>
                    <span>Admin Panel</span>
                  </div>
                  {currentUser.role === 'admin' && (
                    <span className="material-symbols-outlined text-[16px] text-[#DC2626]">check</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
