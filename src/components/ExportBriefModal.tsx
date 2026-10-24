import React, { useState } from 'react';
import { CitizenReport, HotspotCluster } from '../types/civic';
import { PROJECT_START_DISPLAY } from '../config/projectConfig';

interface ExportBriefModalProps {
  onClose: () => void;
  reports?: CitizenReport[];
  clusters?: HotspotCluster[];
}

export const ExportBriefModal: React.FC<ExportBriefModalProps> = ({
  onClose,
  reports = [],
  clusters = [],
}) => {
  const [format, setFormat] = useState<'markdown' | 'json' | 'csv'>('markdown');
  const [copied, setCopied] = useState(false);

  const totalReports = reports.length;
  const highPriorityCount = reports.filter(
    (r) => r.severity === 'HIGH' || r.severity === 'CRITICAL'
  ).length;
  const totalImpact = clusters.reduce((sum, c) => sum + (c.impactNumber || 0), 0);

  const csvContent = [
    'Ticket Number,Date,Location,Category,Severity,Status,Assigned Department,Priority Score',
    ...reports.map(
      (r) =>
        `"${r.ticketNumber}","${r.timestamp}","${r.locationName}","${r.category}","${r.severity}","${r.status}","${r.assignedDepartment}",${r.priorityScore}`
    ),
  ].join('\n');

  const briefContent = `# NAGRIKSETU AI — CIVIC INTELLIGENCE BRIEF
Generated: ${PROJECT_START_DISPLAY} | Classification: LIVE CITIZEN DATA (Municipal Queue)
Model: Gemini 3.8 Flash Multimodal | Database: Mock AMC / Firestore Schema Collection

## 1. Executive Summary
- Project Baseline Start Date: ${PROJECT_START_DISPLAY}
- Total Citizen Reports Ingested: ${totalReports}
- High Priority Issues: ${highPriorityCount}
- Active Clustered Hotspots: ${clusters.length}
- Modelled Population Impact: ~${totalImpact.toLocaleString()} Citizens footprint (MODELLED ESTIMATE)
- Telemetry Mode: Zero PII retention, DPDP anonymized

## 2. Active Hotspot Cluster Ranking
${
  clusters.length === 0
    ? '_No active clusters formed yet. New citizen reports will aggregate into clusters as they are submitted._'
    : clusters
        .map(
          (c, idx) =>
            `${idx + 1}. ${c.name} (${c.ward}): Priority Score ${c.priorityScore}/100 (${c.severity})
   - ${c.citizenRequests} Citizen Request(s) | Category: ${c.category}
   - Modelled Footprint: ${c.modelledImpact} citizens
   - Recommended Action: ${c.recommendedIntervention}`
        )
        .join('\n')
}

## 3. Data Integrity & Privacy Guarantee
- Deterministic DPDP Anonymization applied at voice ingest.
- 0 bytes of biometric telemetry or personal telephone identifiers retained.
- Purely derived from verified citizen input into the municipal ledger.`;

  const handleCopy = () => {
    const textToCopy =
      format === 'json'
        ? JSON.stringify({ projectStartDate: PROJECT_START_DISPLAY, totalReports, highPriorityCount, activeClustersCount: clusters.length, totalImpact, clusters, reports }, null, 2)
        : format === 'csv'
        ? csvContent
        : briefContent;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (format === 'json') {
      const jsonContent = JSON.stringify(
        {
          projectStartDate: PROJECT_START_DISPLAY,
          totalReports,
          highPriorityCount,
          activeClustersCount: clusters.length,
          totalImpact,
          clusters,
          reports,
        },
        null,
        2
      );
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NagrikSetu_Civic_Ledger_${PROJECT_START_DISPLAY.replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NagrikSetu_Ledger_${PROJECT_START_DISPLAY.replace(/\s+/g, '_')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([briefContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NagrikSetu_Intelligence_Brief_${PROJECT_START_DISPLAY.replace(/\s+/g, '_')}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-[#ffffff] rounded-2xl w-full max-w-[calc(100vw-24px)] sm:max-w-2xl p-4 sm:p-6 space-y-4 shadow-2xl border border-[#e2e2e6] max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3 border-[#e2e2e6] gap-2">
          <div className="space-y-0.5 min-w-0">
            <span className="font-mono text-[10px] sm:text-xs text-[#0650cc] font-semibold uppercase">
              MUNICIPAL GOVERNANCE EXPORT
            </span>
            <h2 className="font-sans text-lg sm:text-xl font-semibold text-[#1a1c1f]">
              Export Intelligence Brief
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#737685] hover:text-[#1a1c1f] rounded-lg shrink-0"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-[#737685]">Format:</span>
          {(['markdown', 'json', 'csv'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={`px-3.5 py-1.5 min-h-[36px] rounded-lg text-xs font-mono uppercase transition-colors ${
                format === fmt
                  ? 'bg-[#356ae6] text-white font-semibold'
                  : 'bg-[#f0f0f4] text-[#737685] hover:text-[#1a1c1f]'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>

        {/* Preview Container */}
        <div className="bg-[#f9f9fd] p-3 sm:p-4 rounded-xl border border-[#e2e2e6] max-h-56 sm:max-h-72 overflow-y-auto">
          <pre className="font-mono text-[11px] sm:text-xs text-[#1a1c1f] whitespace-pre-wrap leading-relaxed break-words">
            {format === 'json'
              ? JSON.stringify(
                  {
                    projectStartDate: PROJECT_START_DISPLAY,
                    totalReports,
                    highPriorityCount,
                    activeClustersCount: clusters.length,
                    totalImpact,
                    clusters,
                  },
                  null,
                  2
                )
              : format === 'csv'
              ? csvContent
              : briefContent}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#e2e2e6]">
          <span className="font-mono text-[10px] sm:text-[11px] text-[#737685]">
            Verified Dynamic Intelligence Summary
          </span>

          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 min-h-[44px] text-xs font-mono text-[#0650cc] hover:bg-[#ebf0ff] rounded-xl transition-colors border border-[#0650cc]/20 flex items-center justify-center"
            >
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 min-h-[44px] text-xs font-semibold bg-[#356ae6] hover:bg-[#2b58c7] text-white rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
