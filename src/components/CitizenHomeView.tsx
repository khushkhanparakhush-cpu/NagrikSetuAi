import React from 'react';
import { CitizenReport } from '../types/civic';
import { PROJECT_START_DISPLAY } from '../config/projectConfig';

interface CitizenHomeViewProps {
  reports: CitizenReport[];
  currentUserId: string;
  onNavigateToReport: () => void;
  onNavigateToMyReports: () => void;
  onNavigateToTracking?: (trackingId?: string) => void;
  onViewRequestDetail?: (report: CitizenReport) => void;
}

export const CitizenHomeView: React.FC<CitizenHomeViewProps> = ({
  reports,
  currentUserId,
  onNavigateToReport,
  onNavigateToMyReports,
  onNavigateToTracking,
  onViewRequestDetail,
}) => {
  const totalReportsCount = reports.length;
  const myReportsCount = reports.filter((r) => r.ownerId === currentUserId).length;
  const highPriorityCount = reports.filter(
    (r) => r.severity === 'HIGH' || r.severity === 'CRITICAL'
  ).length;
  const resolvedCount = reports.filter(
    (r) => r.status === 'Resolved & Anonymized' || (r.status as unknown as string) === 'Resolved'
  ).length;

  return (
    <div className="desktop-container w-full lg:w-[calc(100%-64px)] lg:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* Requirement 8: Clean & Compact Hero Section */}
      <section className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-4 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl lg:max-w-4xl space-y-3.5 sm:space-y-4">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#356AE6] animate-pulse" />
            <span className="font-mono text-[10px] sm:text-xs font-bold text-[#356AE6] tracking-wider uppercase">
              GARBATHON 2026 • CIVIC COMPLAINT AGENT
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-sans text-[22px] sm:text-[32px] lg:text-[38px] font-bold text-[#15171A] tracking-tight leading-tight">
            From Citizen Complaint to Intelligent Civic Action.
          </h1>

          {/* Description */}
          <p className="font-sans text-xs sm:text-base text-[#4B5563] leading-relaxed max-w-2xl lg:max-w-3xl">
            Upload a photo of a pothole, overflowing garbage, broken streetlight, or waterlogging. NagrikSetu AI analyzes the issue, identifies the AMC municipal ward, routes to the department, and returns a verified tracking ID.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
            <button
              onClick={onNavigateToReport}
              type="button"
              className="w-full sm:w-auto px-6 py-3 min-h-[48px] bg-[#356AE6] hover:bg-[#2563EB] text-white rounded-xl font-sans text-sm font-semibold shadow-xs transition-all inline-flex items-center justify-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-[19px]">smart_toy</span>
              <span>File Complaint with AI Agent</span>
            </button>

            {onNavigateToTracking && (
              <button
                onClick={() => onNavigateToTracking('AMC-DEMO-2026-000001')}
                type="button"
                className="w-full sm:w-auto px-5 py-3 min-h-[48px] bg-[#FFFFFF] hover:bg-[#F7F6F2] text-[#356AE6] border border-[#356AE6]/30 rounded-xl font-sans text-sm font-semibold transition-all inline-flex items-center justify-center gap-2 active:scale-95 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[19px]">travel_explore</span>
                <span>Track Complaint Status</span>
              </button>
            )}

            <button
              onClick={onNavigateToMyReports}
              type="button"
              className="w-full sm:w-auto px-5 py-3 min-h-[48px] bg-[#F7F6F2] hover:bg-[#EBEAE4] text-[#15171A] border border-[#E5E7EB] rounded-xl font-sans text-sm font-semibold transition-all inline-flex items-center justify-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-[19px] text-[#6B7280]">
                fact_check
              </span>
              <span>View My Reports ({myReportsCount})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Reporting Quick Card: Dual AI Agent & Voice reporting */}
      <section className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-4 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] pb-3">
          <div>
            <h2 className="font-sans text-base sm:text-lg font-bold text-[#15171A]">
              Automated AMC Complaint Management
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#6B7280]">
              Simulated Ahmedabad Municipal Corporation (AMC) system with real ward lookup and department routing.
            </p>
          </div>
          <span className="self-start sm:self-auto font-mono text-[11px] text-[#059669] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
            ● Agent Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A: Multimodal Photo AI Agent */}
          <div className="bg-[#F7F6F2] p-5 rounded-xl border border-[#E5E7EB] flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#EBF0FF] text-[#356AE6] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">add_a_photo</span>
              </div>
              <h3 className="font-sans text-sm font-bold text-[#15171A]">
                Photo-Based Complaint Agent
              </h3>
              <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
                Submit a photo of a pothole, garbage, streetlight, or waterlogging. Gemini determines the issue and auto-detects the AMC ward.
              </p>
            </div>
            <button
              onClick={onNavigateToReport}
              type="button"
              className="w-full py-2.5 bg-[#356AE6] hover:bg-[#2563EB] text-white rounded-xl font-sans text-xs font-semibold shadow-xs transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <span>Launch Complaint Agent</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Option B: Direct Status Tracking */}
          <div className="bg-[#F7F6F2] p-5 rounded-xl border border-[#E5E7EB] flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">travel_explore</span>
              </div>
              <h3 className="font-sans text-sm font-bold text-[#15171A]">
                AI-Powered Status Tracking
              </h3>
              <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
                Ask “What's the status of AMC-DEMO-2026-000001?” to retrieve live departmental progress and inspection notes.
              </p>
            </div>
            {onNavigateToTracking ? (
              <button
                onClick={() => onNavigateToTracking('AMC-DEMO-2026-000001')}
                type="button"
                className="w-full py-2.5 bg-[#FFFFFF] hover:bg-[#EBEAE4] text-[#15171A] border border-[#E5E7EB] rounded-xl font-sans text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <span>Track Complaint Status</span>
                <span className="material-symbols-outlined text-[16px]">search</span>
              </button>
            ) : (
              <button
                onClick={onNavigateToMyReports}
                type="button"
                className="w-full py-2.5 bg-[#FFFFFF] hover:bg-[#EBEAE4] text-[#15171A] border border-[#E5E7EB] rounded-xl font-sans text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <span>View My Reports</span>
                <span className="material-symbols-outlined text-[16px]">search</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Requirement 21: Live Civic Transparency Ledger */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#356AE6]">insights</span>
            <h2 className="font-sans text-base sm:text-lg font-bold text-[#15171A]">
              Live Civic Transparency Ledger
            </h2>
          </div>
          <span className="font-mono text-xs text-[#6B7280]">
            Database active since {PROJECT_START_DISPLAY}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Total Requests */}
          <div className="bg-[#FFFFFF] p-3.5 sm:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-1 min-w-0">
            <span className="font-mono text-[10px] sm:text-[11px] text-[#6B7280] uppercase tracking-wider block font-semibold truncate">
              Total Requests
            </span>
            <div className="font-sans text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#15171A]">
              {totalReportsCount}
            </div>
            <p className="font-sans text-[11px] sm:text-xs text-[#6B7280] leading-tight truncate">
              {totalReportsCount > 0 ? 'Verified grievances' : 'Workspace ready'}
            </p>
          </div>

          {/* High Priority */}
          <div className="bg-[#FFFFFF] p-3.5 sm:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-1 min-w-0">
            <span className="font-mono text-[10px] sm:text-[11px] text-[#DC2626] uppercase tracking-wider block font-semibold truncate">
              High Priority
            </span>
            <div className="font-sans text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#DC2626]">
              {highPriorityCount}
            </div>
            <p className="font-sans text-[11px] sm:text-xs text-[#6B7280] leading-tight truncate">
              {highPriorityCount > 0 ? 'Swift inspection' : 'Zero backlogs'}
            </p>
          </div>

          {/* Municipal Queued */}
          <div className="bg-[#FFFFFF] p-3.5 sm:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-1 min-w-0">
            <span className="font-mono text-[10px] sm:text-[11px] text-[#356AE6] uppercase tracking-wider block font-semibold truncate">
              Under Review
            </span>
            <div className="font-sans text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#356AE6]">
              {reports.filter((r) => r.status === 'Submitted' || r.status === 'PWD Dispatched' || r.status === 'Work In Progress').length}
            </div>
            <p className="font-sans text-[11px] sm:text-xs text-[#6B7280] leading-tight truncate">
              Queued for inspection
            </p>
          </div>

          {/* Resolved */}
          <div className="bg-[#FFFFFF] p-3.5 sm:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-1 min-w-0">
            <span className="font-mono text-[10px] sm:text-[11px] text-[#059669] uppercase tracking-wider block font-semibold truncate">
              Resolved
            </span>
            <div className="font-sans text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#059669]">
              {resolvedCount}
            </div>
            <p className="font-sans text-[11px] sm:text-xs text-[#6B7280] leading-tight truncate">
              Completed repairs
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Step Guide */}
      <section className="bg-[#FFFFFF] rounded-2xl p-5 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-5">
        <div className="max-w-xl space-y-1">
          <span className="font-mono text-[11px] font-bold text-[#356AE6] uppercase tracking-wider">
            THREE-STEP WORKFLOW
          </span>
          <h2 className="font-sans text-lg sm:text-xl font-bold text-[#15171A]">
            How Voice Reporting Works
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#6B7280]">
            Speak naturally without filling complicated forms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="bg-[#F7F6F2] p-4 sm:p-5 rounded-xl border border-[#E5E7EB] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#356AE6]/10 text-[#356AE6] flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-sans text-sm font-semibold text-[#15171A]">
              1. Speak in your language
            </h3>
            <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
              Describe the issue in Hindi or English. Your words appear live on screen line by line in real time.
            </p>
          </div>

          <div className="bg-[#F7F6F2] p-4 sm:p-5 rounded-xl border border-[#E5E7EB] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#3FA7A3]/10 text-[#3FA7A3] flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-sans text-sm font-semibold text-[#15171A]">
              2. Gemini auto-structures
            </h3>
            <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
              AI automatically classifies the infrastructure category, severity, and locality without inventing missing facts.
            </p>
          </div>

          <div className="bg-[#F7F6F2] p-4 sm:p-5 rounded-xl border border-[#E5E7EB] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#059669]/10 text-[#059669] flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-sans text-sm font-semibold text-[#15171A]">
              3. Track in My Reports
            </h3>
            <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
              Receive a unique ticket number to follow up on municipal review and engineering dispatch until resolution.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Community Reports Feed */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-sans text-base sm:text-lg font-bold text-[#15171A]">
              Recent Community Grievances
            </h2>
            <p className="font-sans text-xs text-[#6B7280]">
              Transparent record of reports registered by fellow citizens.
            </p>
          </div>

          <button
            onClick={onNavigateToReport}
            className="text-xs font-sans text-[#356AE6] hover:underline font-semibold inline-flex items-center gap-1 shrink-0"
          >
            <span>+ Report Issue</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        {reports.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {reports.slice(0, 6).map((report) => (
              <div
                key={report.id}
                onClick={() => onViewRequestDetail && onViewRequestDetail(report)}
                className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs hover:border-[#356AE6]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#6B7280]">
                      #{report.ticketNumber}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                        report.severity === 'CRITICAL'
                          ? 'bg-[#FEE2E2] text-[#DC2626]'
                          : report.severity === 'HIGH'
                          ? 'bg-[#FEF3C7] text-[#D97706]'
                          : 'bg-[#EBF0FF] text-[#356AE6]'
                      }`}
                    >
                      {report.severity}
                    </span>
                  </div>

                  <h3 className="font-sans text-sm font-semibold text-[#15171A] group-hover:text-[#356AE6] transition-colors line-clamp-1">
                    {report.category}
                  </h3>

                  <p className="font-sans text-xs text-[#4B5563] line-clamp-2 leading-relaxed">
                    {report.vernacularTranscript || report.englishTranslation}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[11px] font-mono text-[#6B7280]">
                  <span className="inline-flex items-center gap-1 truncate max-w-[150px]">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    <span className="truncate">{report.locationName}</span>
                  </span>
                  <span className="text-[#356AE6] font-sans font-medium shrink-0">
                    View Details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#FFFFFF] p-8 sm:p-12 rounded-2xl border border-[#E5E7EB] text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF0FF] text-[#356AE6] mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">folder_open</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-sans text-base font-semibold text-[#15171A]">
                Your civic intelligence workspace is ready.
              </h3>
              <p className="font-sans text-xs text-[#6B7280] max-w-md mx-auto">
                No civic grievances have been recorded in the database since {PROJECT_START_DISPLAY}. Be the first citizen to report an issue!
              </p>
            </div>
            <button
              onClick={onNavigateToReport}
              type="button"
              className="px-5 py-2.5 bg-[#356AE6] hover:bg-[#2563EB] text-white rounded-xl font-sans text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">mic</span>
              <span>Start Voice Report</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
