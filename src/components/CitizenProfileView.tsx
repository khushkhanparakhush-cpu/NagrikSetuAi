import React, { useState } from 'react';
import { UserProfile, CitizenReport } from '../types/civic';
import { CITIZEN_LOGO_URL, CITIZEN_LOGO_DATA_URI } from '../config/assets';

interface CitizenProfileViewProps {
  currentUser: UserProfile;
  reports: CitizenReport[];
  selectedLanguage: 'en' | 'hi';
  onSelectLanguage: (lang: 'en' | 'hi') => void;
  onNavigateToMyReports: () => void;
}

export const CitizenProfileView: React.FC<CitizenProfileViewProps> = ({
  currentUser,
  reports,
  selectedLanguage,
  onSelectLanguage,
  onNavigateToMyReports,
}) => {
  const [notifySms, setNotifySms] = useState(true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const myReports = reports.filter((r) => r.ownerId === currentUser.uid);
  const resolvedCount = myReports.filter((r) => r.status === 'Resolved & Anonymized').length;
  const inProgressCount = myReports.filter(
    (r) => r.status === 'Work In Progress' || r.status === 'PWD Dispatched'
  ).length;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="desktop-container w-full lg:w-[calc(100%-64px)] lg:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-sans text-2xl font-bold text-[#15171A]">
          Citizen Profile
        </h1>
        <p className="font-sans text-sm text-[#6B7280]">
          Manage your verified citizen profile, language preferences, and alert channels.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <img
            alt={currentUser.name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-[#356AE6]/20 shrink-0 bg-[#15171A]"
            src={currentUser.avatarUrl || CITIZEN_LOGO_URL}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = CITIZEN_LOGO_DATA_URI;
            }}
          />
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-sans text-base sm:text-lg font-bold text-[#15171A] truncate">
                {currentUser.name}
              </h2>
              <span className="font-mono text-[9px] sm:text-[10px] text-[#059669] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold uppercase shrink-0">
                Citizen Verified
              </span>
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              <span className="font-mono text-xs text-[#059669] font-bold uppercase">
                Account Status: Active
              </span>
            </div>
            <p className="font-sans text-xs text-[#4B5563] font-medium truncate">
              Verified Citizen Grievance Portal Access
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToMyReports}
          type="button"
          className="px-4 py-2.5 bg-[#F7F6F2] hover:bg-[#EBEAE4] text-[#15171A] text-xs font-semibold rounded-xl border border-[#E5E7EB] transition-colors flex items-center gap-1.5 self-stretch sm:self-auto justify-center min-h-[44px] shrink-0"
        >
          <span className="material-symbols-outlined text-[16px] text-[#356AE6]">
            assignment
          </span>
          <span>View My Reports ({myReports.length})</span>
        </button>
      </div>

      {/* Civic Activity Metric Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-[#FFFFFF] p-2.5 sm:p-4 rounded-xl border border-[#E5E7EB] text-center space-y-0.5 sm:space-y-1 min-w-0">
          <span className="font-mono text-lg sm:text-2xl font-bold text-[#15171A]">
            {myReports.length}
          </span>
          <p className="font-mono text-[9px] sm:text-[11px] text-[#6B7280] uppercase tracking-normal xs:tracking-wider truncate">
            Total Filed
          </p>
        </div>
        <div className="bg-[#FFFFFF] p-2.5 sm:p-4 rounded-xl border border-[#E5E7EB] text-center space-y-0.5 sm:space-y-1 min-w-0">
          <span className="font-mono text-lg sm:text-2xl font-bold text-[#356AE6]">
            {inProgressCount}
          </span>
          <p className="font-mono text-[9px] sm:text-[11px] text-[#6B7280] uppercase tracking-normal xs:tracking-wider truncate">
            In Action
          </p>
        </div>
        <div className="bg-[#FFFFFF] p-2.5 sm:p-4 rounded-xl border border-[#E5E7EB] text-center space-y-0.5 sm:space-y-1 min-w-0">
          <span className="font-mono text-lg sm:text-2xl font-bold text-[#059669]">
            {resolvedCount}
          </span>
          <p className="font-mono text-[9px] sm:text-[11px] text-[#6B7280] uppercase tracking-normal xs:tracking-wider truncate">
            Resolved
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Language Preference Section */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <span className="material-symbols-outlined text-[20px] text-[#356AE6]">
              translate
            </span>
            <h3 className="font-sans text-sm font-bold text-[#15171A]">
              Language Preference
            </h3>
          </div>

          <p className="font-sans text-xs text-[#6B7280]">
            Select your preferred language for voice recognition and AI grievance summaries.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onSelectLanguage('en')}
              className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all min-h-[44px] flex flex-col justify-between ${
                selectedLanguage === 'en'
                  ? 'bg-[#EBF0FF] border-[#356AE6] text-[#356AE6] ring-2 ring-[#356AE6]/20'
                  : 'bg-[#F7F6F2] border-[#E5E7EB] text-[#15171A] hover:bg-[#EBEAE4]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-sans text-sm font-bold">English</span>
                {selectedLanguage === 'en' && (
                  <span className="material-symbols-outlined text-[16px] text-[#356AE6]">check</span>
                )}
              </div>
              <div className="font-mono text-[10px] text-[#6B7280] mt-0.5">
                Indian English (en-IN)
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSelectLanguage('hi')}
              className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all min-h-[44px] flex flex-col justify-between ${
                selectedLanguage === 'hi'
                  ? 'bg-[#EBF0FF] border-[#356AE6] text-[#356AE6] ring-2 ring-[#356AE6]/20'
                  : 'bg-[#F7F6F2] border-[#E5E7EB] text-[#15171A] hover:bg-[#EBEAE4]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-sans text-sm font-bold">हिन्दी</span>
                {selectedLanguage === 'hi' && (
                  <span className="material-symbols-outlined text-[16px] text-[#356AE6]">check</span>
                )}
              </div>
              <div className="font-mono text-[10px] text-[#6B7280] mt-0.5">
                Devanagari (hi-IN)
              </div>
            </button>
          </div>
        </div>

        {/* Notifications Preference Section */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <span className="material-symbols-outlined text-[20px] text-[#356AE6]">
              notifications_active
            </span>
            <h3 className="font-sans text-sm font-bold text-[#15171A]">
              Notification Alerts
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#F7F6F2] border border-[#E5E7EB] cursor-pointer">
              <div>
                <span className="font-sans text-xs font-semibold text-[#15171A] block">
                  SMS Ticket Status Updates
                </span>
                <span className="font-sans text-[11px] text-[#6B7280] block">
                  Receive instant SMS notifications on municipal dispatch
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifySms}
                onChange={(e) => setNotifySms(e.target.checked)}
                className="h-4 w-4 rounded text-[#356AE6] focus:ring-[#356AE6]/20"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#F7F6F2] border border-[#E5E7EB] cursor-pointer">
              <div>
                <span className="font-sans text-xs font-semibold text-[#15171A] block">
                  WhatsApp Progress Alerts
                </span>
                <span className="font-sans text-[11px] text-[#6B7280] block">
                  Get geo-tagged resolution proofs directly on WhatsApp
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyWhatsapp}
                onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                className="h-4 w-4 rounded text-[#356AE6] focus:ring-[#356AE6]/20"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Save Changes Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {savedSuccess ? (
          <span className="font-mono text-xs text-[#059669] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Preferences saved successfully
          </span>
        ) : (
          <span className="font-sans text-xs text-[#6B7280]">
            Digital Personal Data Protection (DPDP) Act 2023 certified.
          </span>
        )}

        <button
          onClick={handleSave}
          type="button"
          className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-[#356AE6] hover:bg-[#2563EB] text-white rounded-xl font-sans text-xs font-semibold shadow-xs transition-colors flex items-center justify-center"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};
