import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CitizenReport, MunicipalRecommendation } from '../types/civic';
import { PROJECT_START_DISPLAY } from '../config/projectConfig';
import { AdminEditRequestModal } from './AdminEditRequestModal';
import { ExportBriefModal } from './ExportBriefModal';
import { deriveClustersFromReports, deriveRecommendationsFromClusters } from '../data/mockCivicData';
import { ImpactSimulatorView } from './ImpactSimulatorView';
import {
  normalizeReports,
  calculateDashboardStats,
  validateReportData,
  NormalizedReport,
  NormalizedSeverity,
  NormalizedStatus,
} from '../utils/reportNormalization';

export type AdminTab = 'overview' | 'requests' | 'recommendations' | 'simulator' | 'profile';

interface AdminPortalViewProps {
  reports: CitizenReport[];
  onExitToCitizen: () => void;
  onUpdateReport: (id: string, updates: Partial<CitizenReport>) => Promise<boolean>;
  onResetData: () => Promise<void>;
  isResetting?: boolean;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  reports,
  onExitToCitizen,
  onUpdateReport,
  onResetData,
  isResetting = false,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [selectedReportForEdit, setSelectedReportForEdit] = useState<CitizenReport | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  // Close role menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setIsRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. CANONICAL SINGLE SOURCE OF TRUTH: Normalize and deduplicate reports
  const normalizedReports = useMemo(() => normalizeReports(reports), [reports]);

  // 2. Development-time integrity validation and audit logging
  useEffect(() => {
    validateReportData(reports);
  }, [reports]);

  // 3. Centralized filtering across all dimensions
  const filteredReports = useMemo(() => {
    return normalizedReports.filter((r) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          r.ticketNumber.toLowerCase().includes(q) ||
          r.locationName.toLowerCase().includes(q) ||
          r.vernacularTranscript.toLowerCase().includes(q) ||
          r.englishTranslation.toLowerCase().includes(q) ||
          r.normalizedCategory.toLowerCase().includes(q) ||
          (r.city && r.city.toLowerCase().includes(q)) ||
          (r.area && r.area.toLowerCase().includes(q)) ||
          (r.assignedDepartment && r.assignedDepartment.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (categoryFilter !== 'All' && r.normalizedCategory !== categoryFilter) return false;
      if (statusFilter !== 'All' && r.normalizedStatus !== statusFilter) return false;
      if (severityFilter !== 'All' && r.normalizedSeverity !== severityFilter) return false;
      return true;
    });
  }, [normalizedReports, searchTerm, categoryFilter, statusFilter, severityFilter]);

  // 4. Authoritative Statistics derived directly from the single canonical dataset
  // All dashboard cards, charts, and metrics consume this identical object.
  const stats = useMemo(() => calculateDashboardStats(filteredReports), [filteredReports]);
  const globalStats = useMemo(() => calculateDashboardStats(normalizedReports), [normalizedReports]);

  // Derived clusters and recommendations directly from canonical reports
  const derivedClusters = useMemo(() => deriveClustersFromReports(filteredReports), [filteredReports]);
  const derivedRecs = useMemo(() => deriveRecommendationsFromClusters(derivedClusters), [derivedClusters]);

  // Invariant verification check (for UI display safety)
  const isFiltered =
    searchTerm !== '' || categoryFilter !== 'All' || statusFilter !== 'All' || severityFilter !== 'All';

  // Sorted recent reports by createdAt / timestamp descending
  const recentReports = useMemo(() => {
    return [...filteredReports].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.timestamp).getTime();
      const timeB = new Date(b.createdAt || b.timestamp).getTime();
      return timeB - timeA;
    });
  }, [filteredReports]);

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#15171A] flex flex-col font-sans pb-16 sm:pb-12">
      {/* Compact Modern Admin Header (~60-64px single horizontal row) */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E5E7EB] shadow-2xs">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* LEFT: Compact Branding */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#DC2626] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-sm sm:text-base font-bold text-[#15171A] tracking-tight">
                NagrikSetu AI
              </span>
              <span className="font-mono text-[10px] bg-[#FEE2E2] text-[#DC2626] px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                Admin Panel
              </span>
              <span className="hidden lg:inline font-mono text-[10px] bg-[#EBF0FF] text-[#356AE6] px-2 py-0.5 rounded font-semibold uppercase border border-[#356AE6]/20">
                Prototype Demo Data
              </span>
            </div>
          </div>

          {/* CENTER: Essential Desktop Admin Tabs */}
          <nav aria-label="Admin navigation" className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {(
              [
                { id: 'overview', label: 'Overview', icon: 'dashboard' },
                { id: 'requests', label: 'Requests', icon: 'table_rows' },
                { id: 'recommendations', label: 'Recommendations', icon: 'lightbulb' },
                { id: 'simulator', label: 'Impact Simulator', icon: 'equalizer' },
                { id: 'profile', label: 'Profile', icon: 'badge' },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors inline-flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#15171A] text-white font-semibold shadow-xs'
                      : 'text-[#4B5563] hover:text-[#15171A] hover:bg-[#F7F6F2]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] leading-none">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* RIGHT: Notifications, Role Selector, Exit, and Mobile Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Notification Bell with Critical Report Badge */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('requests');
                setSeverityFilter('Critical');
              }}
              title={`${stats.criticalCount} Critical Requests`}
              className="relative p-2 min-h-[44px] min-w-[40px] text-[#6B7280] hover:text-[#15171A] hover:bg-[#F7F6F2] rounded-lg transition-colors focus:outline-none flex items-center justify-center"
              aria-label="Admin Notifications"
            >
              <span className="material-symbols-outlined text-[19px] sm:text-[20px] leading-none">
                notifications
              </span>
              {stats.criticalCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#DC2626] rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Compact Desktop Role Selector */}
            <div className="relative" ref={roleMenuRef}>
              <button
                onClick={() => setIsRoleMenuOpen((prev) => !prev)}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[44px] bg-[#FFFFFF] hover:bg-[#F7F6F2] rounded-lg border border-[#E5E7EB] transition-colors focus:outline-none text-xs font-sans font-medium text-[#15171A]"
                type="button"
                aria-haspopup="true"
                aria-expanded={isRoleMenuOpen}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                <span className="font-semibold text-[#15171A]">Admin Panel</span>
                <span className="material-symbols-outlined text-[15px] text-[#6B7280]">
                  keyboard_arrow_down
                </span>
              </button>

              {isRoleMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-1.5 w-44 bg-[#FFFFFF] rounded-xl shadow-lg border border-[#E5E7EB] py-1 z-50 animate-fadeIn text-xs"
                >
                  <div className="px-3 py-1 text-[10px] font-mono text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB]">
                    Switch Role
                  </div>
                  <button
                    onClick={() => {
                      setIsRoleMenuOpen(false);
                      onExitToCitizen();
                    }}
                    role="menuitem"
                    className="w-full px-3 py-2 text-left flex items-center justify-between text-[#15171A] hover:bg-[#F7F6F2] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">person</span>
                      <span>Citizen</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsRoleMenuOpen(false)}
                    role="menuitem"
                    className="w-full px-3 py-2 text-left flex items-center justify-between bg-[#FEE2E2] text-[#DC2626] font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                      <span>Admin Panel</span>
                    </div>
                    <span className="material-symbols-outlined text-[15px] text-[#DC2626]">check</span>
                  </button>
                </div>
              )}
            </div>

            {/* Exit to Citizen Portal Button */}
            <button
              onClick={onExitToCitizen}
              type="button"
              title="Return to Citizen Portal"
              className="px-2.5 sm:px-3 py-1.5 min-h-[40px] bg-[#F7F6F2] hover:bg-[#EBEAE4] text-[#15171A] rounded-lg border border-[#E5E7EB] font-sans text-xs font-medium transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[16px]">arrow_back</span>
              <span className="hidden sm:inline">Citizen Portal</span>
              <span className="sm:hidden text-[11px]">Exit</span>
            </button>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 min-h-[44px] min-w-[44px] text-[#4B5563] hover:text-[#15171A] hover:bg-[#F7F6F2] rounded-lg transition-colors focus:outline-none flex items-center justify-center"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="material-symbols-outlined text-[22px] leading-none">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E7EB] bg-[#FFFFFF] px-4 py-3 space-y-1 shadow-md animate-fadeIn">
            {(
              [
                { id: 'overview', label: 'Overview', icon: 'dashboard' },
                { id: 'requests', label: 'Requests', icon: 'table_rows' },
                { id: 'recommendations', label: 'Recommendations', icon: 'lightbulb' },
                { id: 'simulator', label: 'Impact Simulator', icon: 'equalizer' },
                { id: 'profile', label: 'Profile', icon: 'badge' },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  type="button"
                  className={`w-full px-3 py-2 rounded-lg text-xs font-sans flex items-center gap-2.5 transition-colors ${
                    isActive
                      ? 'bg-[#15171A] text-white font-semibold'
                      : 'text-[#4B5563] hover:text-[#15171A] hover:bg-[#F7F6F2]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <div className="pt-2 mt-2 border-t border-[#E5E7EB]">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onExitToCitizen();
                }}
                type="button"
                className="w-full py-2 bg-[#F7F6F2] hover:bg-[#EBEAE4] text-[#15171A] rounded-lg border border-[#E5E7EB] font-sans text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Return to Citizen Portal</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Body */}
      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5 flex-1">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Header banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-sans text-2xl sm:text-3xl font-bold text-[#15171A]">
                    Administrative Overview
                  </h1>
                  <span className="font-mono text-[10px] bg-[#EBF0FF] text-[#356AE6] px-2 py-0.5 rounded font-semibold uppercase border border-[#356AE6]/20">
                    Prototype Demo Data
                  </span>
                </div>
                <p className="font-sans text-xs sm:text-sm text-[#6B7280]">
                  Authoritative municipal intelligence derived mathematically from the live report dataset.
                </p>
              </div>

              {/* Action Buttons: Export Brief & Reset Database */}
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <button
                  onClick={() => setShowExportModal(true)}
                  type="button"
                  className="px-3.5 py-2 min-h-[42px] bg-[#FFFFFF] hover:bg-[#F7F6F2] text-[#356AE6] border border-[#356AE6]/30 rounded-xl font-mono text-xs transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs flex-1 sm:flex-initial"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  <span>Export Brief & Ledger</span>
                </button>

                <div className="relative flex-1 sm:flex-initial">
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    disabled={isResetting}
                    type="button"
                    className="w-full sm:w-auto px-3.5 py-2 min-h-[42px] bg-[#FFFFFF] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#DC2626]/30 rounded-xl font-mono text-xs transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    <span>Reset Database</span>
                  </button>

                {showResetConfirm && (
                  <div className="absolute right-0 top-12 z-50 w-72 max-w-[calc(100vw-32px)] bg-white rounded-xl shadow-xl border border-[#E5E7EB] p-3.5 space-y-2.5 animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626]">
                      <span className="material-symbols-outlined text-[16px]">warning</span>
                      <span>Reset all records?</span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] leading-snug">
                      This will reset database records to clean state as of {PROJECT_START_DISPLAY}.
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#E5E7EB]">
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-3 py-1.5 min-h-[36px] text-xs text-[#6B7280] hover:text-[#15171A]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          setShowResetConfirm(false);
                          await onResetData();
                        }}
                        className="px-3.5 py-1.5 min-h-[36px] bg-[#DC2626] text-white text-xs font-semibold rounded-md hover:bg-[#B91C1C]"
                      >
                        Confirm Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Primary KPI Cards Grid - Authoritative Stats Object */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
              {/* Total Reports Card */}
              <div className="col-span-2 lg:col-span-1 bg-[#FFFFFF] p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E5E7EB] shadow-xs space-y-1 sm:space-y-1.5 min-w-0">
                <span className="font-mono text-[11px] sm:text-xs text-[#6B7280] uppercase tracking-wider block">
                  Total Reports
                </span>
                <div className="font-sans text-2xl sm:text-3xl font-extrabold text-[#15171A]">
                  {stats.totalReports}
                </div>
                <p className="font-sans text-[11px] sm:text-xs text-[#6B7280]">
                  {isFiltered ? `Filtered from ${globalStats.totalReports} total` : 'All verified civic reports'}
                </p>
              </div>

              {/* Severity: Critical */}
              <div className="bg-[#FFFFFF] p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E5E7EB] shadow-xs space-y-1 sm:space-y-1.5 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] sm:text-xs text-[#DC2626] font-bold uppercase tracking-wider">
                    Critical
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                </div>
                <div className="font-sans text-2xl sm:text-3xl font-extrabold text-[#DC2626]">
                  {stats.criticalCount}
                </div>
                <p className="font-sans text-[11px] sm:text-xs text-[#6B7280]">
                  {stats.totalReports > 0
                    ? `${Math.round((stats.criticalCount / stats.totalReports) * 100)}% of reports`
                    : 'Immediate danger'}
                </p>
              </div>

              {/* Severity: High */}
              <div className="bg-[#FFFFFF] p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E5E7EB] shadow-xs space-y-1 sm:space-y-1.5 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] sm:text-xs text-[#D97706] font-bold uppercase tracking-wider">
                    High
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                </div>
                <div className="font-sans text-2xl sm:text-3xl font-extrabold text-[#D97706]">
                  {stats.highCount}
                </div>
                <p className="font-sans text-[11px] sm:text-xs text-[#6B7280]">
                  {stats.totalReports > 0
                    ? `${Math.round((stats.highCount / stats.totalReports) * 100)}% of reports`
                    : 'Priority intervention'}
                </p>
              </div>

              {/* Severity: Medium */}
              <div className="bg-[#FFFFFF] p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E5E7EB] shadow-xs space-y-1 sm:space-y-1.5 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] sm:text-xs text-[#2563EB] font-bold uppercase tracking-wider">
                    Medium
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                </div>
                <div className="font-sans text-2xl sm:text-3xl font-extrabold text-[#2563EB]">
                  {stats.mediumCount}
                </div>
                <p className="font-sans text-[11px] sm:text-xs text-[#6B7280]">
                  {stats.totalReports > 0
                    ? `${Math.round((stats.mediumCount / stats.totalReports) * 100)}% of reports`
                    : 'Standard municipal queue'}
                </p>
              </div>

              {/* Severity: Low */}
              <div className="bg-[#FFFFFF] p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E5E7EB] shadow-xs space-y-1 sm:space-y-1.5 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] sm:text-xs text-[#4B5563] font-bold uppercase tracking-wider">
                    Low
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#9CA3AF]" />
                </div>
                <div className="font-sans text-2xl sm:text-3xl font-extrabold text-[#4B5563]">
                  {stats.lowCount}
                </div>
                <p className="font-sans text-[11px] sm:text-xs text-[#6B7280]">
                  {stats.totalReports > 0
                    ? `${Math.round((stats.lowCount / stats.totalReports) * 100)}% of reports`
                    : 'Scheduled maintenance'}
                </p>
              </div>
            </div>

            {/* Status Pipeline Cards - 4 Mutually Exclusive Statuses */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
                <span className="font-mono text-[11px] text-[#7C3AED] uppercase font-bold block">
                  Submitted
                </span>
                <div className="font-sans text-2xl font-bold text-[#15171A] mt-1">
                  {stats.submittedCount}
                </div>
                <span className="font-sans text-xs text-[#6B7280]">Awaiting dispatch review</span>
              </div>

              <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
                <span className="font-mono text-[11px] text-[#2563EB] uppercase font-bold block">
                  Under Review
                </span>
                <div className="font-sans text-2xl font-bold text-[#15171A] mt-1">
                  {stats.underReviewCount}
                </div>
                <span className="font-sans text-xs text-[#6B7280]">PWD unit dispatched</span>
              </div>

              <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
                <span className="font-mono text-[11px] text-[#D97706] uppercase font-bold block">
                  In Action
                </span>
                <div className="font-sans text-2xl font-bold text-[#15171A] mt-1">
                  {stats.inActionCount}
                </div>
                <span className="font-sans text-xs text-[#6B7280]">Active field repair underway</span>
              </div>

              <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
                <span className="font-mono text-[11px] text-[#059669] uppercase font-bold block">
                  Resolved
                </span>
                <div className="font-sans text-2xl font-bold text-[#15171A] mt-1">
                  {stats.resolvedCount}
                </div>
                <span className="font-sans text-xs text-[#6B7280]">Closed and anonymized</span>
              </div>
            </div>

            {/* Visual Breakdown Charts (100% Mathematically Matched to Cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Severity Composition Chart */}
              <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                  <h3 className="font-sans text-sm font-bold text-[#15171A]">
                    Severity Distribution
                  </h3>
                  <span className="font-mono text-xs text-[#6B7280]">
                    Total = {stats.totalReports}
                  </span>
                </div>

                {/* Horizontal Stacked Bar */}
                <div className="h-6 w-full rounded-lg overflow-hidden flex bg-[#F7F6F2] border border-[#E5E7EB]">
                  {stats.totalReports > 0 ? (
                    <>
                      <div
                        style={{ width: `${(stats.criticalCount / stats.totalReports) * 100}%` }}
                        className="bg-[#DC2626] transition-all h-full"
                        title={`Critical: ${stats.criticalCount}`}
                      />
                      <div
                        style={{ width: `${(stats.highCount / stats.totalReports) * 100}%` }}
                        className="bg-[#D97706] transition-all h-full"
                        title={`High: ${stats.highCount}`}
                      />
                      <div
                        style={{ width: `${(stats.mediumCount / stats.totalReports) * 100}%` }}
                        className="bg-[#2563EB] transition-all h-full"
                        title={`Medium: ${stats.mediumCount}`}
                      />
                      <div
                        style={{ width: `${(stats.lowCount / stats.totalReports) * 100}%` }}
                        className="bg-[#9CA3AF] transition-all h-full"
                        title={`Low: ${stats.lowCount}`}
                      />
                    </>
                  ) : (
                    <div className="w-full text-center text-[10px] text-[#9CA3AF] leading-6 font-mono">
                      No reports in scope
                    </div>
                  )}
                </div>

                {/* Legend matching exact numbers */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#DC2626]" />
                    <span className="text-[#6B7280]">Critical:</span>
                    <strong className="text-[#15171A]">{stats.criticalCount}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#D97706]" />
                    <span className="text-[#6B7280]">High:</span>
                    <strong className="text-[#15171A]">{stats.highCount}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB]" />
                    <span className="text-[#6B7280]">Medium:</span>
                    <strong className="text-[#15171A]">{stats.mediumCount}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#9CA3AF]" />
                    <span className="text-[#6B7280]">Low:</span>
                    <strong className="text-[#15171A]">{stats.lowCount}</strong>
                  </div>
                </div>
              </div>

              {/* Status Pipeline Chart */}
              <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                  <h3 className="font-sans text-sm font-bold text-[#15171A]">
                    Workflow Status Pipeline
                  </h3>
                  <span className="font-mono text-xs text-[#6B7280]">
                    Total = {stats.totalReports}
                  </span>
                </div>

                {/* Horizontal Stacked Bar */}
                <div className="h-6 w-full rounded-lg overflow-hidden flex bg-[#F7F6F2] border border-[#E5E7EB]">
                  {stats.totalReports > 0 ? (
                    <>
                      <div
                        style={{ width: `${(stats.submittedCount / stats.totalReports) * 100}%` }}
                        className="bg-[#7C3AED] transition-all h-full"
                        title={`Submitted: ${stats.submittedCount}`}
                      />
                      <div
                        style={{ width: `${(stats.underReviewCount / stats.totalReports) * 100}%` }}
                        className="bg-[#2563EB] transition-all h-full"
                        title={`Under Review: ${stats.underReviewCount}`}
                      />
                      <div
                        style={{ width: `${(stats.inActionCount / stats.totalReports) * 100}%` }}
                        className="bg-[#D97706] transition-all h-full"
                        title={`In Action: ${stats.inActionCount}`}
                      />
                      <div
                        style={{ width: `${(stats.resolvedCount / stats.totalReports) * 100}%` }}
                        className="bg-[#059669] transition-all h-full"
                        title={`Resolved: ${stats.resolvedCount}`}
                      />
                    </>
                  ) : (
                    <div className="w-full text-center text-[10px] text-[#9CA3AF] leading-6 font-mono">
                      No reports in scope
                    </div>
                  )}
                </div>

                {/* Legend matching exact numbers */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#7C3AED]" />
                    <span className="text-[#6B7280]">Submitted:</span>
                    <strong className="text-[#15171A]">{stats.submittedCount}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB]" />
                    <span className="text-[#6B7280]">Under Review:</span>
                    <strong className="text-[#15171A]">{stats.underReviewCount}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#D97706]" />
                    <span className="text-[#6B7280]">In Action:</span>
                    <strong className="text-[#15171A]">{stats.inActionCount}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#059669]" />
                    <span className="text-[#6B7280]">Resolved:</span>
                    <strong className="text-[#15171A]">{stats.resolvedCount}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown & City Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Category Breakdown */}
              <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                  <h3 className="font-sans text-sm font-bold text-[#15171A]">
                    Category Breakdown
                  </h3>
                  <span className="text-xs font-mono text-[#6B7280]">
                    Sum = {Object.values(stats.categoryCounts).reduce((a, b) => a + b, 0)}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {Object.entries(stats.categoryCounts).map(([cat, count]) => {
                    const pct = stats.totalReports > 0 ? Math.round((count / stats.totalReports) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-sans">
                          <span className="font-medium text-[#15171A]">{cat}</span>
                          <span className="font-mono text-[#6B7280]">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#F7F6F2] h-2 rounded-full overflow-hidden border border-[#E5E7EB]">
                          <div
                            style={{ width: `${pct}%` }}
                            className="bg-[#356AE6] h-full rounded-full transition-all"
                          />
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(stats.categoryCounts).length === 0 && (
                    <p className="text-xs text-[#6B7280] italic py-2">No category data</p>
                  )}
                </div>
              </div>

              {/* Jurisdiction / City Breakdown */}
              <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                  <h3 className="font-sans text-sm font-bold text-[#15171A]">
                    City / Jurisdiction Distribution
                  </h3>
                  <span className="text-xs font-mono text-[#6B7280]">
                    {Object.keys(stats.cityCounts).length} Jurisdictions
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {Object.entries(stats.cityCounts).map(([city, count]) => (
                    <div
                      key={city}
                      className="p-2.5 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] flex items-center justify-between"
                    >
                      <span className="font-medium text-[#15171A] truncate">{city}</span>
                      <span className="font-mono font-bold text-[#356AE6] shrink-0 ml-1">{count}</span>
                    </div>
                  ))}
                  {Object.keys(stats.cityCounts).length === 0 && (
                    <p className="text-xs text-[#6B7280] italic py-2 col-span-3">No location data</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Ingested Requests & Automated Clusters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                  <h3 className="font-sans text-sm font-bold text-[#15171A]">
                    Recent Ingested Requests
                  </h3>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="text-xs font-sans text-[#356AE6] hover:underline font-semibold"
                  >
                    View All ({stats.totalReports}) →
                  </button>
                </div>

                {recentReports.length > 0 ? (
                  <div className="space-y-2">
                    {recentReports.slice(0, 4).map((r) => (
                      <div
                        key={r.id}
                        onClick={() => setSelectedReportForEdit(r)}
                        className="p-3 bg-[#F7F6F2] hover:bg-[#EBEAE4] rounded-xl border border-[#E5E7EB] cursor-pointer transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-[#356AE6]">
                              #{r.ticketNumber}
                            </span>
                            <span className="font-sans text-xs font-semibold text-[#15171A] truncate">
                              {r.normalizedCategory}
                            </span>
                            <span
                              className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                r.normalizedSeverity === 'Critical'
                                  ? 'bg-[#FEE2E2] text-[#DC2626]'
                                  : r.normalizedSeverity === 'High'
                                  ? 'bg-[#FEF3C7] text-[#D97706]'
                                  : r.normalizedSeverity === 'Medium'
                                  ? 'bg-[#EBF0FF] text-[#2563EB]'
                                  : 'bg-[#F3F4F6] text-[#4B5563]'
                              }`}
                            >
                              {r.normalizedSeverity}
                            </span>
                          </div>
                          <p className="font-sans text-xs text-[#6B7280] truncate mt-0.5">
                            {r.locationName} • {r.vernacularTranscript || r.englishTranslation}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-[#E5E7EB] shrink-0">
                          {r.normalizedStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-sans text-[#6B7280] py-6 text-center italic">
                    Zero reports currently in scope.
                  </p>
                )}
              </div>

              <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                  <h3 className="font-sans text-sm font-bold text-[#15171A]">
                    Automated Priority Clusters
                  </h3>
                  <button
                    onClick={() => setActiveTab('recommendations')}
                    className="text-xs font-sans text-[#356AE6] hover:underline font-semibold"
                  >
                    View Recommendations →
                  </button>
                </div>

                {derivedClusters.length > 0 ? (
                  <div className="space-y-2">
                    {derivedClusters.slice(0, 4).map((c) => (
                      <div
                        key={c.id}
                        className="p-3 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <span className="font-sans font-semibold text-[#15171A]">
                            {c.name} ({c.district})
                          </span>
                          <p className="text-[#6B7280] text-[11px]">
                            {c.category} • {c.citizenRequests} citizen requests
                          </p>
                        </div>
                        <span className="font-mono font-bold text-[#356AE6]">
                          Score {c.priorityScore}/100
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-sans text-[#6B7280] py-6 text-center italic">
                    No issue clusters formed yet. Reports will be aggregated algorithmically.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REQUESTS (Filtered Table + Modal Edit) */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
              <div>
                <h1 className="font-sans text-2xl sm:text-3xl font-bold text-[#15171A]">
                  Municipal Demands Ledger
                </h1>
                <p className="font-sans text-xs sm:text-sm text-[#6B7280]">
                  Review, edit, and assign verified citizen grievances from the canonical dataset.
                </p>
              </div>
              <span className="font-mono text-xs bg-[#FFFFFF] px-3 py-1.5 rounded-xl border border-[#E5E7EB] font-bold text-[#15171A] self-start sm:self-auto">
                {stats.totalReports} {stats.totalReports === 1 ? 'Record' : 'Records'}
                {isFiltered && ` (of ${globalStats.totalReports} total)`}
              </span>
            </div>

            {/* Filter & Search Bar - Recalculates all metrics on change */}
            <div className="bg-[#FFFFFF] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
              <div className="w-full md:flex-1 md:min-w-[200px] flex items-center gap-2 px-3 py-2 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] min-h-[42px]">
                <span className="material-symbols-outlined text-[18px] text-[#9CA3AF]">search</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search ticket, locality, transcript, department..."
                  className="w-full text-xs font-sans bg-transparent focus:outline-none text-[#15171A]"
                />
              </div>

              <div className="grid grid-cols-2 xs:grid-cols-3 sm:flex items-center gap-2 flex-wrap">
                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="col-span-2 xs:col-span-1 px-2.5 py-2 min-h-[42px] bg-[#F7F6F2] border border-[#E5E7EB] rounded-xl text-xs font-sans font-medium text-[#15171A] focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Road & Drainage">Road & Drainage</option>
                  <option value="Water Supply">Water Supply</option>
                  <option value="Streetlighting & Electrical">Streetlighting & Electrical</option>
                  <option value="Waste Management">Waste Management</option>
                  <option value="Public Health & Sanitation">Public Health & Sanitation</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-2 min-h-[42px] bg-[#F7F6F2] border border-[#E5E7EB] rounded-xl text-xs font-sans font-medium text-[#15171A] focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="In Action">In Action</option>
                  <option value="Resolved">Resolved</option>
                </select>

                {/* Severity Filter */}
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="px-2.5 py-2 min-h-[42px] bg-[#F7F6F2] border border-[#E5E7EB] rounded-xl text-xs font-sans font-medium text-[#15171A] focus:outline-none"
                >
                  <option value="All">All Severities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                {isFiltered && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('All');
                      setStatusFilter('All');
                      setSeverityFilter('All');
                    }}
                    type="button"
                    className="col-span-2 xs:col-span-3 sm:col-span-1 px-3 py-2 min-h-[42px] text-xs font-mono text-[#DC2626] hover:bg-[#FEE2E2] rounded-xl transition-colors border border-transparent hover:border-[#DC2626]/20"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="bg-[#F7F6F2] border-b border-[#E5E7EB] text-[#6B7280] font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-[#F7F6F2]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#356AE6]">
                        {r.ticketNumber}
                      </td>
                      <td className="py-3.5 px-4 text-[#6B7280] font-mono">
                        {r.timestamp}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#15171A] max-w-[180px] truncate">
                        {r.locationName}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#15171A]">
                        {r.normalizedCategory}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                            r.normalizedSeverity === 'Critical'
                              ? 'bg-[#FEE2E2] text-[#DC2626]'
                              : r.normalizedSeverity === 'High'
                              ? 'bg-[#FEF3C7] text-[#D97706]'
                              : r.normalizedSeverity === 'Medium'
                              ? 'bg-[#EBF0FF] text-[#2563EB]'
                              : 'bg-[#F3F4F6] text-[#4B5563]'
                          }`}
                        >
                          {r.normalizedSeverity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold ${
                            r.normalizedStatus === 'Resolved'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : r.normalizedStatus === 'In Action'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : r.normalizedStatus === 'Under Review'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-purple-50 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {r.normalizedStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#6B7280] uppercase">
                        {r.inputMode} ({r.languageLabel || r.language})
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedReportForEdit(r)}
                          type="button"
                          className="px-3 py-1.5 bg-[#356AE6] hover:bg-[#2563EB] text-white rounded-lg font-sans text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-[#6B7280] font-mono italic">
                        No requests found matching current filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Vertical Cards View */}
            <div className="md:hidden space-y-3">
              {filteredReports.map((r) => (
                <div
                  key={r.id}
                  className="bg-[#FFFFFF] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2 gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#356AE6] break-all">
                      #{r.ticketNumber}
                    </span>
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                        r.normalizedSeverity === 'Critical'
                          ? 'bg-[#FEE2E2] text-[#DC2626]'
                          : r.normalizedSeverity === 'High'
                          ? 'bg-[#FEF3C7] text-[#D97706]'
                          : r.normalizedSeverity === 'Medium'
                          ? 'bg-[#EBF0FF] text-[#2563EB]'
                          : 'bg-[#F3F4F6] text-[#4B5563]'
                      }`}
                    >
                      {r.normalizedSeverity}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-sans">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[#6B7280] shrink-0">Category:</span>
                      <strong className="text-[#15171A] text-right break-words min-w-0">{r.normalizedCategory}</strong>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[#6B7280] shrink-0">Location:</span>
                      <span className="text-[#15171A] font-medium text-right break-words min-w-0">{r.locationName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#6B7280] shrink-0">Status:</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shrink-0">
                        {r.normalizedStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#6B7280] shrink-0">Date & Source:</span>
                      <span className="text-[#6B7280] font-mono text-[11px] text-right truncate">
                        {r.timestamp} • {r.inputMode}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E5E7EB]">
                    <button
                      onClick={() => setSelectedReportForEdit(r)}
                      type="button"
                      className="w-full py-2.5 min-h-[44px] bg-[#356AE6] hover:bg-[#2563EB] text-white rounded-xl font-sans text-xs font-semibold shadow-xs transition-colors inline-flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      <span>Edit & Manage Request</span>
                    </button>
                  </div>
                </div>
              ))}
              {filteredReports.length === 0 && (
                <div className="p-8 bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] text-center text-xs font-mono text-[#6B7280]">
                  No matching requests found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: RECOMMENDATIONS */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
              <div>
                <h1 className="font-sans text-2xl sm:text-3xl font-bold text-[#15171A]">
                  Municipal Action Recommendations
                </h1>
                <p className="font-sans text-xs sm:text-sm text-[#6B7280]">
                  Algorithmic interventions synthesized from active citizen defect clusters.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('simulator')}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#356AE6] hover:bg-[#2563EB] text-white rounded-xl font-sans text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[16px]">equalizer</span>
                <span>Open Impact Simulator</span>
              </button>
            </div>

            {derivedRecs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {derivedRecs.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-[#FFFFFF] p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-[#356AE6] bg-[#EBF0FF] px-2 py-0.5 rounded">
                        {rec.type}
                      </span>
                      <span className="font-mono text-xs text-[#059669] font-bold">
                        Cost: {rec.estimatedCost}
                      </span>
                    </div>

                    <h3 className="font-sans text-base font-bold text-[#15171A]">
                      {rec.title}
                    </h3>
                    <p className="font-sans text-xs text-[#4B5563] leading-relaxed">
                      {rec.description}
                    </p>

                    <div className="p-3 bg-[#F7F6F2] rounded-xl text-xs font-mono text-[#6B7280] space-y-1.5">
                      <div className="flex justify-between">
                        <span>Ward:</span>
                        <strong className="text-[#15171A]">{rec.ward}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Benefited Citizens:</span>
                        <strong className="text-[#356AE6]">{rec.citizensBenefited}</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveTab('simulator')}
                        className="text-xs font-mono text-[#356AE6] hover:underline inline-flex items-center gap-1 font-semibold min-h-[40px] px-2"
                      >
                        <span>Simulate Capex & Reach</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#FFFFFF] p-8 sm:p-12 rounded-2xl border border-[#E5E7EB] text-center space-y-2">
                <h3 className="font-sans text-base font-bold text-[#15171A]">
                  No recommendations generated yet
                </h3>
                <p className="font-sans text-xs text-[#6B7280]">
                  When citizen complaints are reported, Gemini aggregates spatial demand to formulate engineering briefs.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SIMULATOR */}
        {activeTab === 'simulator' && (
          <ImpactSimulatorView
            clusters={derivedClusters}
            reports={filteredReports}
            onNavigateToReport={onExitToCitizen}
          />
        )}

        {/* TAB 5: PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-xl mx-auto space-y-5">
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
              <div className="flex items-center gap-3.5 border-b border-[#E5E7EB] pb-4">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                  alt="Administrator"
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-[#DC2626]/20"
                />
                <div>
                  <h2 className="font-sans text-lg font-bold text-[#15171A]">
                    S. Mehta, IAS
                  </h2>
                  <span className="font-mono text-xs text-[#DC2626] font-bold uppercase">
                    Municipal Administrator
                  </span>
                  <p className="font-mono text-xs text-[#6B7280]">Desk Reference: AMC-ADM-01</p>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Clearance:</span>
                  <strong className="text-[#059669]">ADMINISTRATIVE ACCESS (LEVEL 1)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Department:</span>
                  <strong className="text-[#15171A]">Urban Development & Municipal Engineering</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Audit Status:</span>
                  <strong className="text-[#059669]">DPDP Act 2023 Verified</strong>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onExitToCitizen}
                  type="button"
                  className="w-full py-2.5 bg-[#15171A] hover:bg-[#2B2D31] text-white rounded-xl font-sans text-xs font-semibold shadow-xs transition-colors"
                >
                  Exit to Citizen Interface
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Admin Edit Modal */}
      <AdminEditRequestModal
        report={selectedReportForEdit}
        isOpen={Boolean(selectedReportForEdit)}
        onClose={() => setSelectedReportForEdit(null)}
        onSave={onUpdateReport}
      />

      {/* Export Intelligence Brief Modal */}
      {showExportModal && (
        <ExportBriefModal
          onClose={() => setShowExportModal(false)}
          reports={reports}
          clusters={derivedClusters}
        />
      )}
    </div>
  );
};
