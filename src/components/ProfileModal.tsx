import React, { useState } from 'react';
import { UserProfile } from '../types/civic';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  if (!isOpen) return null;

  const [languagePreference, setLanguagePreference] = useState<'English' | 'Hindi'>('English');
  const [notifySms, setNotifySms] = useState(true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-[#FFFFFF] rounded-2xl w-full max-w-[calc(100vw-24px)] sm:max-w-md max-h-[90dvh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl border border-[#E5E7EB]">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-[#E5E7EB] gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[20px] text-[#356AE6]">account_circle</span>
            <h2 className="font-sans text-base font-bold text-[#15171A]">
              Citizen Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#6B7280] hover:text-[#15171A] rounded-lg transition-colors shrink-0"
            aria-label="Close profile modal"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3.5 p-3.5 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB]">
          <img
            alt={currentUser.name}
            className="w-13 h-13 rounded-full object-cover ring-2 ring-[#356AE6]/20 shrink-0"
            src={currentUser.avatarUrl || 'https://lh3.googleusercontent.com/aida/AEtjO1XTyED-9ie0YU8xC9J07771zY1lGpLaF1tLAXEHWHX2SfdBJKC8BVhZ3Gw9c09RZdWJHsTLKbifxC1A6t2aZ6lQfponWB_QaSQqTiehhhrEIKLkXhrABdVVqzn79m-rX59qGmz_nIdYtLOaxb7mf6Tekt2OrBBzX_7Y36T9RgIPGGhE_6H0vL9a0hmiYAun2C-hteuxJb0dj3QYu_kG427AvzDUF74ZEgyroRwEgQnkFrPM7rvHlbOaRA'}
          />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-sans text-sm sm:text-base font-bold text-[#15171A] truncate">
              {currentUser.name}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              <span className="font-mono text-[10px] text-[#059669] font-bold uppercase truncate">
                Verified Citizen • Active
              </span>
            </div>
          </div>
        </div>

        {/* Preferences Section (Requirement 16) */}
        <div className="space-y-3 text-xs font-sans">
          {/* Language Preference */}
          <div>
            <label className="block font-mono text-[11px] text-[#6B7280] font-semibold uppercase mb-1">
              Language Preference
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['English', 'Hindi'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguagePreference(lang)}
                  className={`py-2 px-2.5 min-h-[42px] rounded-lg text-xs font-medium border transition-colors flex items-center justify-center ${
                    languagePreference === lang
                      ? 'bg-[#EBF0FF] text-[#356AE6] border-[#356AE6]/30 font-semibold'
                      : 'bg-[#F7F6F2] text-[#4B5563] border-[#E5E7EB]'
                  }`}
                >
                  {lang === 'Hindi' ? 'हिन्दी (Hindi)' : 'English'}
                </button>
              ))}
            </div>
          </div>

          {/* Notification Preference */}
          <div>
            <label className="block font-mono text-[11px] text-[#6B7280] font-semibold uppercase mb-1.5">
              Notification Preference
            </label>
            <div className="space-y-2 bg-[#F7F6F2] p-3 rounded-xl border border-[#E5E7EB]">
              <label className="flex items-center justify-between cursor-pointer min-h-[36px]">
                <span className="text-[#15171A]">SMS Ticket Progress Updates</span>
                <input
                  type="checkbox"
                  checked={notifySms}
                  onChange={(e) => setNotifySms(e.target.checked)}
                  className="rounded text-[#356AE6] focus:ring-[#356AE6]/20 h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer min-h-[36px]">
                <span className="text-[#15171A]">WhatsApp Status Alerts</span>
                <input
                  type="checkbox"
                  checked={notifyWhatsapp}
                  onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                  className="rounded text-[#356AE6] focus:ring-[#356AE6]/20 h-4 w-4"
                />
              </label>
            </div>
          </div>

          {/* DPDP Compliance Badge */}
          <div className="p-2.5 bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] text-center space-y-0.5">
            <span className="font-mono text-[10px] text-[#059669] font-bold uppercase block">
              DPDP Act 2023 Compliant
            </span>
            <span className="font-sans text-[11px] text-[#6B7280] block">
              Citizen grievance recordings are strictly anonymized and privacy-preserved.
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="space-y-2 pt-1 border-t border-[#E5E7EB]">
          <button
            onClick={onClose}
            type="button"
            className="w-full py-2.5 min-h-[44px] bg-[#356AE6] hover:bg-[#2563EB] text-white rounded-xl font-sans text-xs font-semibold shadow-xs transition-colors flex items-center justify-center"
          >
            Save & Done
          </button>
        </div>
      </div>
    </div>
  );
};
