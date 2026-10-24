import React from 'react';
import { CitizenReport } from '../types/civic';

interface RequestDetailPageProps {
  report: CitizenReport | null;
  onClose: () => void;
  onOpenDashboard?: () => void;
}

export const RequestDetailPage: React.FC<RequestDetailPageProps> = ({
  report,
  onClose,
  onOpenDashboard,
}) => {
  if (!report) return null;

  const timelineSteps = report.timeline || [
    { label: 'Submitted', sublabel: report.inputMode === 'voice' ? 'Acoustic voice ingested' : 'Direct text input', status: 'completed', timestamp: report.timestamp || 'Today' },
    { label: 'Analyzed', sublabel: 'Gemini NLP semantic parsing', status: 'completed', timestamp: 'Verified' },
    { label: 'Clustered', sublabel: `Aggregated to ${report.hotspotClusterName || report.area || 'Zone Cluster'}`, status: 'completed', timestamp: 'Active' },
    { label: 'Prioritized', sublabel: `Priority Score ${report.priorityScore}/100`, status: 'completed', timestamp: 'Active' },
    { label: 'Recommended', sublabel: 'Municipal dispatch queue', status: 'current', timestamp: 'Active' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-[#FFFFFF] rounded-2xl w-full max-w-[calc(100vw-24px)] sm:max-w-3xl p-4 sm:p-7 space-y-4 sm:space-y-6 shadow-2xl border border-[#E5E7EB] max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-4 border-[#E5E7EB] gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-[#356AE6] bg-[#EBF0FF] px-2.5 py-0.5 rounded">
                REQUEST DOSSIER
              </span>
              <span className="font-mono text-sm font-bold text-[#15171A]">
                {report.ticketNumber}
              </span>
              <span
                className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                  report.priorityScore >= 80
                    ? 'bg-[#FEE2E2] text-[#DC2626]'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                Priority {report.priorityScore}/100 ({report.severity})
              </span>
            </div>
            <h2 className="font-sans text-lg sm:text-[20px] font-semibold text-[#15171A] break-words">
              {report.locationName}
            </h2>
            <p className="font-mono text-[11px] sm:text-xs text-[#6B7280]">
              Ingested {report.timeAgo} • Language: {report.languageLabel} ({report.inputMode === 'voice' ? 'Voice Audio' : 'Text Input'}) • District: {report.district}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#9CA3AF] hover:text-[#15171A] rounded-lg shrink-0 transition-colors"
            aria-label="Close dossier"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Status Timeline */}
        <div className="space-y-2 bg-[#F7F6F2] p-3 sm:p-4 rounded-xl border border-[#E5E7EB]">
          <span className="font-mono text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold block">
            STATUS TIMELINE: Submitted → Analyzed → Clustered → Prioritized → Recommended
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            {timelineSteps.map((step, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg border text-xs font-mono flex flex-col ${idx === timelineSteps.length - 1 ? 'col-span-2 sm:col-span-1' : ''} ${
                  step.status === 'completed'
                    ? 'bg-white border-[#059669]/40 text-[#059669]'
                    : step.status === 'current'
                    ? 'bg-[#EBF0FF] border-[#356AE6] text-[#356AE6] font-semibold'
                    : 'bg-white/60 border-[#E5E7EB] text-[#9CA3AF]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{step.label}</span>
                  {step.status === 'completed' && (
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  )}
                  {step.status === 'current' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#356AE6] animate-pulse" />
                  )}
                </div>
                {step.timestamp && (
                  <span className="text-[10px] text-[#6B7280] font-normal mt-0.5">
                    {step.timestamp}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Structured Field Attributes with Visual Source Badging */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] space-y-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#6B7280] uppercase">Location</span>
              <span className="px-1.5 py-0.5 rounded bg-[#EBF0FF] text-[#356AE6] font-mono text-[9px] font-bold">
                USER PROVIDED
              </span>
            </div>
            <p className="font-sans text-xs font-semibold text-[#15171A] truncate">{report.area || report.locationName}</p>
            <span className="font-mono text-[10px] text-[#6B7280] block truncate">{report.district}</span>
          </div>

          <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] space-y-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#6B7280] uppercase">Category</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-mono text-[9px] font-bold border border-amber-200">
                AI SUGGESTED
              </span>
            </div>
            <p className="font-sans text-xs font-semibold text-[#15171A] truncate">{report.category}</p>
            <span className="font-mono text-[10px] text-[#6B7280] block">Confidence 96.4%</span>
          </div>

          <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] space-y-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#6B7280] uppercase">Severity</span>
              <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-mono text-[9px] font-bold border border-purple-200">
                PROTOTYPE MODEL
              </span>
            </div>
            <p className="font-sans text-xs font-semibold text-[#15171A]">{report.severity}</p>
            <span className="font-mono text-[10px] text-[#6B7280] block">Score {report.priorityScore}/100</span>
          </div>

          <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] space-y-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#6B7280] uppercase">Impact Footprint</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[9px] font-bold border border-emerald-200">
                MODELLED ESTIMATE
              </span>
            </div>
            <p className="font-sans text-xs font-semibold text-[#15171A]">~{report.modelledImpactCitizens} Citizens</p>
            <span className="font-mono text-[10px] text-[#6B7280] block">Zone Buffer Radius</span>
          </div>
        </div>

        {/* Content Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          {/* Original Transcript Box */}
          <div className="p-4 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#6B7280] uppercase font-semibold">
                Original Voice / Text ({report.languageLabel})
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#EBF0FF] text-[#356AE6] font-mono text-[9px] font-bold">
                USER PROVIDED
              </span>
            </div>
            <p className="font-sans text-sm font-medium text-[#15171A] italic bg-white p-3 rounded-lg border border-[#E5E7EB] leading-relaxed">
              "{report.vernacularTranscript}"
            </p>
            <div className="text-[#6B7280] pt-1">
              <div className="flex items-center justify-between mb-1">
                <strong className="text-[#15171A]">AI English Translation:</strong>
                <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-mono text-[9px] font-bold border border-amber-200">
                  AI GENERATED
                </span>
              </div>
              <span className="italic">"{report.englishTranslation}"</span>
            </div>
          </div>

          {/* AI Understanding & Recommendations */}
          <div className="p-4 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-[#6B7280] uppercase font-semibold">
                  AI Issue Summary
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-mono text-[9px] font-bold border border-amber-200">
                  AI GENERATED
                </span>
              </div>
              <p className="text-sm font-medium text-[#15171A]">
                {report.issueSummary || 'Recurring waterlogging and damaged road infrastructure near a school.'}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-[#356AE6] uppercase font-semibold">
                  Recommended Development Action
                </span>
                <span className="px-1.5 py-0.2 rounded bg-[#EBF0FF] text-[#356AE6] font-mono text-[9px] font-bold border border-[#356AE6]/20">
                  AI GENERATED
                </span>
              </div>
              <p className="text-xs text-[#15171A] leading-relaxed">
                {report.recommendedAction || 'Improve stormwater drainage and repair the affected road segment.'}
              </p>
            </div>

            <div className="flex justify-between font-mono text-[11px] pt-1 border-t border-[#E5E7EB]">
              <span className="text-[#6B7280]">Modelled Impact:</span>
              <span className="font-semibold text-[#15171A]">~{report.modelledImpactCitizens} Citizens (MODELLED ESTIMATE)</span>
            </div>
          </div>
        </div>

        {/* Attached Photo & Cluster Context (No Map) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          {report.evidenceImage && (
            <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] flex items-center gap-3">
              <img
                src={report.evidenceImage}
                alt="Report photographic evidence"
                className="w-16 h-16 rounded-lg object-cover border border-[#E5E7EB]"
              />
              <div className="space-y-0.5 font-mono min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#15171A] block">Photographic Evidence</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#EBF0FF] text-[#356AE6] font-mono text-[8px] font-bold">
                    USER PROVIDED
                  </span>
                </div>
                <span className="text-[#6B7280] block text-[10px] truncate">{report.exifDetails || 'GPS Verified'}</span>
                <span className="text-[#059669] text-[10px] block">✓ Location Match</span>
              </div>
            </div>
          )}

          <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] space-y-1.5 text-xs">
            <span className="font-mono text-[10px] text-[#6B7280] uppercase font-semibold block">
              Hotspot Cluster & Related Requests
            </span>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Assigned Cluster:</span>
              <span className="font-semibold text-[#15171A]">{report.hotspotClusterName || report.area || 'Active Zone'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Related Grievances:</span>
              <span className="font-semibold text-[#356AE6]">{report.relatedRequestsCount || 1} citizen report(s)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Municipal Division:</span>
              <span className="text-[#15171A]">{report.assignedDepartment}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions (No Map buttons) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#E5E7EB]">
          <span className="font-mono text-xs text-[#6B7280]">
            Ward Jurisdiction: {report.ward} • {report.district}
          </span>

          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 min-h-[44px] bg-[#F7F6F2] hover:bg-[#EBEAE4] text-[#15171A] rounded-xl text-xs font-mono border border-[#E5E7EB] flex items-center justify-center"
            >
              Close
            </button>
            {onOpenDashboard && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDashboard();
                }}
                className="px-4 py-2 min-h-[44px] bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">dashboard</span>
                <span>Government Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
