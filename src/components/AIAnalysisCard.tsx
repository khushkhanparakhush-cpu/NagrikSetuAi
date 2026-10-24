import React from 'react';
import { CivicCategory, IssueSeverity } from '../types/civic';

export interface StructuredAnalysis {
  language: string;
  transcript: string;
  englishTranslation?: string;
  category: CivicCategory;
  severity: IssueSeverity | null;
  state: string | null;
  district: string | null;
  city: string | null;
  area: string | null;
  issueSummary: string;
  recommendedAction: string;
  missingInformation: string[];
  suggestedFollowUpQuestion?: string | null;
  priorityScore: number;
}

interface AIAnalysisCardProps {
  analysis: StructuredAnalysis;
  onEditDetails: () => void;
  onReviewReport: () => void;
  onAnswerMissingDetail?: () => void;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  analysis,
  onEditDetails,
  onReviewReport,
  onAnswerMissingDetail,
}) => {
  const hasMissing = analysis.missingInformation && analysis.missingInformation.length > 0;

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-4 sm:p-8 lg:p-10 space-y-5 sm:space-y-6 shadow-xs w-full lg:max-w-none mx-auto">
      {/* Header */}
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between border-b border-[#E5E7EB] pb-3 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
          <h3 className="font-sans text-lg sm:text-[20px] font-semibold text-[#15171A]">
            AI ANALYSIS
          </h3>
        </div>
        <span className="font-mono text-[10px] sm:text-xs text-[#356AE6] bg-[#EBF0FF] px-2.5 py-1 rounded-md border border-[#356AE6]/20 font-medium">
          GEMINI MULTIMODAL VERIFIED
        </span>
      </div>

      {/* Analysis Grid */}
      <div className="bg-[#F7F6F2] rounded-xl p-5 border border-[#E5E7EB] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-[#E5E7EB]">
          <div>
            <span className="font-mono text-[11px] text-[#6B7280] block">LANGUAGE</span>
            <span className="font-sans text-sm font-semibold text-[#15171A]">
              {analysis.language}
            </span>
          </div>

          <div>
            <span className="font-mono text-[11px] text-[#6B7280] block">CIVIC CATEGORY</span>
            <span className="font-sans text-sm font-semibold text-[#356AE6]">
              {analysis.category}
            </span>
          </div>

          <div>
            <span className="font-mono text-[11px] text-[#6B7280] block">SEVERITY</span>
            <span
              className={`font-sans text-sm font-bold ${
                analysis.severity === 'CRITICAL' || analysis.severity === 'HIGH'
                  ? 'text-[#DC2626]'
                  : 'text-[#15171A]'
              }`}
            >
              {analysis.severity || (
                <span className="text-[#DC2626] font-normal italic">
                  Missing (Needs follow-up)
                </span>
              )}
            </span>
          </div>

          <div>
            <span className="font-mono text-[11px] text-[#6B7280] block">LOCATION (INDIA-WIDE)</span>
            <span className="font-sans text-sm font-semibold text-[#15171A]">
              {[analysis.area, analysis.city, analysis.district, analysis.state]
                .filter(Boolean)
                .join(', ') || (
                <span className="text-[#DC2626] font-normal italic">
                  Location missing (Needs follow-up)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Verbatim Transcript */}
        <div>
          <span className="font-mono text-[11px] text-[#6B7280] block mb-1">
            ORIGINAL TRANSCRIPT
          </span>
          <p className="font-sans text-sm text-[#15171A] bg-white p-3 rounded-lg border border-[#E5E7EB] leading-relaxed">
            “{analysis.transcript}”
          </p>
          {analysis.englishTranslation && (
            <p className="font-sans text-xs text-[#6B7280] italic mt-1 px-1">
              Translation: {analysis.englishTranslation}
            </p>
          )}
        </div>

        {/* Issue Summary */}
        <div>
          <span className="font-mono text-[11px] text-[#6B7280] block mb-1">
            ISSUE SUMMARY
          </span>
          <p className="font-sans text-sm text-[#15171A] bg-white p-3 rounded-lg border border-[#E5E7EB]">
            {analysis.issueSummary}
          </p>
        </div>

        {/* Recommended Action */}
        <div>
          <span className="font-mono text-[11px] text-[#6B7280] block mb-1">
            RECOMMENDED ACTION
          </span>
          <p className="font-sans text-sm text-[#15171A] bg-white p-3 rounded-lg border border-[#E5E7EB]">
            {analysis.recommendedAction}
          </p>
        </div>

        {/* Modelled Estimate Callout */}
        <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#E5E7EB] flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="font-mono text-[10px] text-[#3FA7A3] font-semibold uppercase">
              MODELLED ESTIMATE • PROTOTYPE PRIORITY
            </span>
            <p className="font-sans text-xs text-[#6B7280]">
              Calculated using: 35% Demand + 25% Infra Gap + 20% Population + 10% Urgency + 10% Readiness
            </p>
          </div>
          <div className="font-mono text-base font-bold text-[#356AE6] px-2.5 py-1 bg-[#F7F6F2] rounded-md border border-[#E5E7EB] shrink-0 self-start xs:self-auto">
            {analysis.priorityScore} / 100
          </div>
        </div>

        {/* Missing information alert if any */}
        {hasMissing && (
          <div className="bg-[#FEE2E2] p-3.5 rounded-xl border border-[#DC2626]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#DC2626] shrink-0 mt-0.5">
                warning
              </span>
              <span className="font-sans text-xs text-[#DC2626] font-medium leading-relaxed">
                Missing details detected: {analysis.missingInformation.join(', ')}.
              </span>
            </div>
            {onAnswerMissingDetail && (
              <button
                type="button"
                onClick={onAnswerMissingDetail}
                className="w-full sm:w-auto px-3.5 py-1.5 min-h-[36px] bg-[#DC2626] text-white rounded-lg text-xs font-semibold hover:bg-[#B91C1C] flex items-center justify-center shrink-0"
              >
                Answer Now
              </button>
            )}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-between border-t border-[#E5E7EB] pt-4 gap-2.5">
        <button
          type="button"
          onClick={onEditDetails}
          className="w-full xs:w-auto px-4 py-2.5 min-h-[44px] text-sm text-[#15171A] hover:bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] transition-colors inline-flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          <span>Edit Details</span>
        </button>

        <button
          type="button"
          onClick={onReviewReport}
          className="w-full xs:w-auto px-5 sm:px-6 py-2.5 min-h-[44px] bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl font-sans text-sm font-semibold transition-colors shadow-xs inline-flex items-center justify-center gap-2"
        >
          <span>Review Report</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
