import React, { useState } from 'react';
import { MunicipalRecommendation } from '../types/civic';
import { RecommendationCard } from './RecommendationCard';
import { PROJECT_START_DISPLAY } from '../config/projectConfig';

interface RecommendationsViewProps {
  recommendations: MunicipalRecommendation[];
  onOpenSimulator: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  onOpenSimulator,
}) => {
  const [selectedRec, setSelectedRec] = useState<MunicipalRecommendation | null>(null);
  const [tenderDraft, setTenderDraft] = useState<string | null>(null);
  const [isGeneratingTender, setIsGeneratingTender] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState(false);

  const handleGenerateTender = (rec: MunicipalRecommendation) => {
    setSelectedRec(rec);
    setIsGeneratingTender(true);
    setTenderDraft(null);

    setTimeout(() => {
      setTenderDraft(`MUNICIPAL ENGINEERING CIRCLE
SPECIAL PROJECT E-TENDER NOTICE REF: NS-TND-2026-${rec.id.toUpperCase()}

1. TITLE OF WORK:
   ${rec.title}

2. JURISDICTION (REGIONAL HIERARCHY):
   State: Gujarat | District: ${rec.district} | Ward: ${rec.ward}

3. ESTIMATED VALUE OF CAPEX:
   ${rec.estimatedCost} (Inclusive of GST & Material Indexing)

4. PUBLIC JUSTIFICATION:
   Aggregated verified citizen grievances (${rec.citizensBenefited} citizens directly impacted).
   Algorithmic Prototype Priority Score: ${rec.roiScore}/100.

5. ENGINEERING SCOPE & SPECIFICATIONS:
   ${rec.description}
   - Quality benchmark: IRC SP:50 guidelines for stormwater hydraulic culverts.
   - Project Completion Timeline: 45 Days from Work Order Execution.
   - Verification standard: Pre and post-construction audit.

6. APPROVAL AUTHORITY:
   Standing Municipal Committee / Municipal Commissioner`);
      setIsGeneratingTender(false);
    }, 400);
  };

  const handleCopyTender = () => {
    if (!tenderDraft) return;
    navigator.clipboard.writeText(tenderDraft);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 3000);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#356AE6] bg-[#EBF0FF] px-2.5 py-0.5 rounded-md border border-[#356AE6]/20">
              CAPITAL ALLOCATION INTELLIGENCE
            </span>
            <span className="font-mono text-xs text-[#6B7280]">
              Zero Map Architecture • Regional Hierarchy
            </span>
          </div>
          <h1 className="font-sans text-[26px] sm:text-[32px] font-semibold text-[#15171A] tracking-tight mt-1">
            Recommended Development Projects
          </h1>
          <p className="font-sans text-[14px] text-[#6B7280]">
            Capital projects ranked by citizen requests, infrastructure gap, and modelled population footprint.
          </p>
        </div>

        <button
          onClick={onOpenSimulator}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#F7F6F2] hover:bg-[#EBEAE4] text-[#15171A] rounded-xl font-sans text-xs font-semibold border border-[#E5E7EB] transition-colors self-start sm:self-auto shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px] text-[#3FA7A3]">equalizer</span>
          <span>Open Impact Simulator</span>
        </button>
      </div>

      {/* Tender Modal Preview if generated */}
      {tenderDraft && selectedRec && (
        <div className="bg-[#FFFFFF] border-2 border-[#356AE6] rounded-2xl p-6 shadow-md space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#356AE6] text-[20px]">
                verified
              </span>
              <h3 className="font-sans text-base font-semibold text-[#15171A]">
                Generated Municipal E-Tender Notice: {selectedRec.title}
              </h3>
            </div>
            <button
              onClick={() => setTenderDraft(null)}
              className="text-[#6B7280] hover:text-[#15171A] text-xs font-mono"
            >
              Close
            </button>
          </div>

          <pre className="bg-[#F7F6F2] p-4 rounded-xl font-mono text-xs text-[#15171A] whitespace-pre-wrap leading-relaxed border border-[#E5E7EB] max-h-72 overflow-y-auto">
            {tenderDraft}
          </pre>

          <div className="flex items-center justify-end gap-2 text-xs">
            {copiedStatus && (
              <span className="text-[#059669] font-mono text-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Copied to clipboard!</span>
              </span>
            )}
            <button
              onClick={handleCopyTender}
              className="px-3.5 py-1.5 bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-lg font-medium shadow-xs transition-colors"
            >
              Copy Tender Text
            </button>
          </div>
        </div>
      )}

      {/* Empty State or Recommendations Cards List */}
      {recommendations.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-2xl border-2 border-dashed border-[#D1D5DB] p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#EBF0FF] text-[#356AE6] mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">assignment</span>
          </div>
          <div className="space-y-1">
            <h3 className="font-sans text-lg font-bold text-[#15171A] tracking-wider uppercase">
              NO RECOMMENDATIONS YET
            </h3>
            <p className="font-sans text-sm text-[#6B7280] max-w-md mx-auto">
              Recommendations will appear when enough related citizen reports are available for analysis.
            </p>
          </div>
          <span className="font-mono text-xs text-[#356AE6] block">
            Project Baseline: {PROJECT_START_DISPLAY}
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onOpenSimulator={onOpenSimulator}
              onGenerateTender={() => handleGenerateTender(rec)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
