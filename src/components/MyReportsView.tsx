import React, { useState } from 'react';
import { CitizenReport } from '../types/civic';
import { PROJECT_START_DISPLAY } from '../config/projectConfig';

interface MyReportsViewProps {
  reports: CitizenReport[];
  currentUserId: string;
  onNavigateToReport: () => void;
  onViewRequestDetail: (report: CitizenReport) => void;
  onNavigateToTracking?: (trackingId: string) => void;
}

export const MyReportsView: React.FC<MyReportsViewProps> = ({
  reports,
  currentUserId,
  onNavigateToReport,
  onViewRequestDetail,
  onNavigateToTracking,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter reports owned by this citizen user (including seeded demo citizen records)
  const myReports = reports.filter(
    (r) => r.ownerId === currentUserId || r.ownerId === 'citizen-user-01'
  );

  const filtered = myReports.filter((r) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        r.ticketNumber.toLowerCase().includes(q) ||
        r.vernacularTranscript.toLowerCase().includes(q) ||
        r.englishTranslation.toLowerCase().includes(q) ||
        r.locationName.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="desktop-container w-full lg:w-[calc(100%-64px)] lg:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EBF0FF] text-[#356AE6] font-mono text-[11px] font-semibold tracking-wider uppercase border border-[#356AE6]/20">
              CITIZEN PORTAL
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-[#F7F6F2] text-[#6B7280] border border-[#E5E7EB]">
              Prototype Demo Data
            </span>
            <span className="font-mono text-xs text-[#6B7280]">
              Personal Grievance Tracking Ledger
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="font-sans text-[26px] sm:text-[30px] font-semibold text-[#15171A]">
              My Reports
            </h1>
            <span className="px-2.5 py-0.5 rounded bg-[#EBEAE4] font-mono text-[11px] text-[#15171A] font-semibold">
              {myReports.length} {myReports.length === 1 ? 'Report' : 'Reports'} Filed
            </span>
          </div>
          <p className="font-sans text-sm text-[#6B7280]">
            Track the status of development issues you reported. AI analyzes every issue and dispatches municipal inspection.
          </p>
        </div>

        <button
          onClick={onNavigateToReport}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl font-sans text-xs font-semibold shadow-xs transition-colors w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-[18px]">mic</span>
          <span>Report New Grievance</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="w-full sm:flex-1 flex items-center gap-2 px-3 py-2.5 sm:py-2 min-h-[42px] bg-[#F7F6F2] rounded-lg border border-[#E5E7EB]">
          <span className="material-symbols-outlined text-[18px] text-[#9CA3AF]">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your tickets, keywords, or locality..."
            className="w-full text-xs font-sans bg-transparent focus:outline-none text-[#15171A]"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-[#9CA3AF] hover:text-[#15171A] p-1">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-1.5 bg-[#F7F6F2] px-3 py-2.5 sm:py-2 min-h-[42px] rounded-lg border border-[#E5E7EB] text-xs font-mono">
          <span className="text-[#6B7280]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent focus:outline-none text-[#15171A] font-medium cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Analyzed">Analyzed</option>
            <option value="PWD Dispatched">PWD Dispatched</option>
            <option value="Work In Progress">Work In Progress</option>
            <option value="Resolved & Anonymized">Resolved</option>
          </select>
        </div>
      </div>

      {/* Empty State when no reports */}
      {myReports.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-2xl border-2 border-dashed border-[#D1D5DB] p-10 sm:p-14 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#EBF0FF] text-[#356AE6] mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px]">folder_open</span>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="font-sans text-[20px] font-bold text-[#15171A]">
              No reports submitted yet
            </h2>
            <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
              When you submit a civic problem using your voice or text, your ticket and its resolution progress will appear here.
            </p>
          </div>

          <button
            onClick={onNavigateToReport}
            className="px-6 py-3 bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl font-sans text-xs font-semibold shadow-md inline-flex items-center gap-2 transition-all transform active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">mic</span>
            <span>Record Your First Report</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] p-8 text-center text-xs font-mono text-[#6B7280]">
          No reports match your search or filter criteria.
        </div>
      ) : (
        /* My Reports Cards Grid */
        <div className="space-y-4">
          {filtered.map((report) => (
            <div
              key={report.id}
              onClick={() => onViewRequestDetail(report)}
              className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] shadow-xs p-5 hover:border-[#356AE6]/50 transition-all cursor-pointer group space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] pb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-sm font-bold text-[#356AE6] bg-[#EBF0FF] px-2.5 py-0.5 rounded-md border border-[#356AE6]/20">
                    {report.ticketNumber}
                  </span>
                  <span className="font-mono text-xs text-[#6B7280]">
                    {report.timestamp || PROJECT_START_DISPLAY}
                  </span>
                  <span className="font-mono text-xs text-[#6B7280]">
                    • Mode: {report.inputMode === 'voice' ? '🎙 Voice' : '⌨ Text'} ({report.languageLabel})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono text-xs font-medium border border-emerald-200">
                    {report.status}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-bold ${
                      report.severity === 'CRITICAL' || report.severity === 'HIGH'
                        ? 'bg-[#FEE2E2] text-[#DC2626]'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {report.severity}
                  </span>
                </div>
              </div>

              {/* Main Grievance Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 space-y-2">
                  <div>
                    <span className="font-mono text-[10px] text-[#6B7280] uppercase tracking-wider block">
                      Spoken Grievance / Transcript
                    </span>
                    <p className="font-sans text-sm text-[#15171A] font-medium leading-relaxed mt-0.5">
                      “{report.vernacularTranscript || report.englishTranslation}”
                    </p>
                  </div>

                  {report.issueSummary && (
                    <div className="bg-[#F7F6F2] p-2.5 rounded-lg border border-[#E5E7EB] text-xs">
                      <span className="font-mono text-[10px] text-[#356AE6] font-semibold uppercase block">
                        AI Technical Summary
                      </span>
                      <p className="font-sans text-xs text-[#15171A] mt-0.5">
                        {report.issueSummary}
                      </p>
                    </div>
                  )}

                  {/* Location - NO MAPS */}
                  <div className="flex items-center gap-2 text-xs font-mono text-[#6B7280] pt-1">
                    <span className="material-symbols-outlined text-[16px] text-[#356AE6]">location_on</span>
                    <span>
                      {[
                        report.state && `State: ${report.state}`,
                        report.district && `District: ${report.district}`,
                        report.city && `City: ${report.city}`,
                        report.area && `Area: ${report.area}`,
                      ]
                        .filter(Boolean)
                        .join(' • ') || report.locationName || 'Location Unspecified'}
                    </span>
                  </div>
                </div>

                {/* Right col: Evidence Photo & Meta */}
                <div className="lg:col-span-4 flex flex-col justify-between space-y-3 bg-[#F7F6F2] p-3 rounded-xl border border-[#E5E7EB]">
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Category:</span>
                      <span className="font-semibold text-[#15171A]">{report.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Assigned Dept:</span>
                      <span className="text-[#15171A]">{report.assignedDepartment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Target Response:</span>
                      <span className="text-[#356AE6] font-semibold">{report.dispatchTargetHours} Hours</span>
                    </div>
                  </div>

                  {report.evidenceImage && (
                    <div className="flex items-center gap-2 pt-1 border-t border-[#E5E7EB]">
                      <img
                        src={report.evidenceImage}
                        alt="Evidence"
                        className="w-10 h-10 object-cover rounded-md border border-[#E5E7EB]"
                      />
                      <span className="text-[11px] font-mono text-[#059669]">✓ Photo Attached</span>
                    </div>
                  )}

                  {onNavigateToTracking && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToTracking(report.ticketNumber);
                      }}
                      className="w-full py-1.5 bg-[#EBF0FF] hover:bg-[#DBEAFE] text-[#356AE6] border border-[#356AE6]/20 rounded-lg text-xs font-sans font-semibold transition-colors flex items-center justify-center gap-1.5 mt-auto"
                    >
                      <span className="material-symbols-outlined text-[15px]">saved_search</span>
                      <span>Track in Mock AMC</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewRequestDetail(report);
                    }}
                    className="w-full py-1.5 bg-[#FFFFFF] hover:bg-[#EBEAE4] text-[#4B5563] hover:text-[#15171A] border border-[#E5E7EB] rounded-lg text-xs font-sans font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <span>View Ticket Details</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
