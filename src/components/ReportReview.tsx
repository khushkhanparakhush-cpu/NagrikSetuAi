import React from 'react';
import { ReportFormData } from './ReportDetails';

interface ReportReviewProps {
  formData: ReportFormData;
  issueSummary: string;
  recommendedAction: string;
  isSubmitting: boolean;
  onEdit: () => void;
  onSubmit: () => void;
}

export const ReportReview: React.FC<ReportReviewProps> = ({
  formData,
  issueSummary,
  recommendedAction,
  isSubmitting,
  onEdit,
  onSubmit,
}) => {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-4 sm:p-8 lg:p-10 space-y-5 sm:space-y-6 shadow-xs w-full lg:max-w-none mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
        <div>
          <h2 className="font-sans text-[22px] sm:text-[24px] font-semibold text-[#15171A]">
            REVIEW YOUR REPORT
          </h2>
          <p className="font-sans text-[13px] text-[#6B7280]">
            Confirm the details below. Once verified, this report will enter the municipal queue.
          </p>
        </div>
        <span className="font-mono text-xs text-[#059669] font-medium bg-[#ECFDF5] px-2.5 py-1 rounded-md border border-[#059669]/20">
          READY FOR SUBMISSION
        </span>
      </div>

      {/* Review Fields Card */}
      <div className="bg-[#F7F6F2] rounded-xl p-5 border border-[#E5E7EB] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-[#E5E7EB]">
          <div>
            <span className="font-mono text-[11px] text-[#6B7280] block">LANGUAGE</span>
            <span className="font-sans text-sm font-semibold text-[#15171A]">
              {formData.language}
            </span>
          </div>

          <div>
            <span className="font-mono text-[11px] text-[#6B7280] block">CIVIC CATEGORY</span>
            <span className="font-sans text-sm font-semibold text-[#356AE6]">
              {formData.category}
            </span>
          </div>

          <div>
            <span className="font-mono text-[11px] text-[#6B7280] block">LOCATION (INDIA-WIDE)</span>
            <span className="font-sans text-sm font-semibold text-[#15171A]">
              {[formData.area, formData.city, formData.district, formData.state]
                .filter(Boolean)
                .join(', ') || 'Location Unspecified'}
            </span>
          </div>

          <div>
            <span className="font-mono text-[11px] text-[#6B7280] block">SEVERITY LEVEL</span>
            <span
              className={`font-sans text-sm font-bold ${
                formData.severity === 'CRITICAL' || formData.severity === 'HIGH'
                  ? 'text-[#DC2626]'
                  : 'text-[#15171A]'
              }`}
            >
              {formData.severity}
            </span>
          </div>
        </div>

        {/* Your Words (Original Transcript) */}
        <div>
          <span className="font-mono text-[11px] text-[#6B7280] block mb-1">
            YOUR WORDS (ORIGINAL TRANSCRIPT)
          </span>
          <p className="font-sans text-sm text-[#15171A] bg-white p-3 rounded-lg border border-[#E5E7EB] leading-relaxed whitespace-pre-wrap">
            “{formData.transcript || 'No transcript provided.'}”
          </p>
        </div>

        {/* AI Synthesis & Recommendation */}
        <div className="space-y-2 pt-1">
          {issueSummary && (
            <div>
              <span className="font-mono text-[11px] text-[#6B7280] block mb-0.5">
                AI ISSUE SUMMARY
              </span>
              <p className="font-sans text-xs text-[#15171A] bg-white p-2.5 rounded-lg border border-[#E5E7EB]">
                {issueSummary}
              </p>
            </div>
          )}

          {recommendedAction && (
            <div>
              <span className="font-mono text-[11px] text-[#6B7280] block mb-0.5">
                AI RECOMMENDED ACTION
              </span>
              <p className="font-sans text-xs text-[#15171A] bg-white p-2.5 rounded-lg border border-[#E5E7EB]">
                {recommendedAction}
              </p>
            </div>
          )}
        </div>

        {/* Photo Status */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E5E7EB]">
          <span className="font-mono text-[#6B7280]">EVIDENCE PHOTO</span>
          <span className="font-sans font-medium text-[#15171A]">
            {formData.photoUrl ? '✓ Attached' : 'Not attached'}
          </span>
        </div>

        {/* Modelled Estimate Disclaimer */}
        <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#E5E7EB] space-y-1">
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#6B7280]">
            <span className="material-symbols-outlined text-[14px] text-[#3FA7A3]">info</span>
            <span className="font-semibold uppercase text-[#3FA7A3]">MODELLED ESTIMATE</span>
          </div>
          <p className="font-sans text-[11px] text-[#6B7280] leading-relaxed">
            Prioritization rankings and population footprint approximations are algorithmic estimations designed for municipal workflow acceleration and do not constitute official statutory census figures.
          </p>
        </div>
      </div>

      {/* Explicit User Confirmation Controls */}
      <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4">
        <button
          type="button"
          onClick={onEdit}
          disabled={isSubmitting}
          className="px-4 py-2.5 min-h-[44px] text-sm text-[#15171A] hover:bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] transition-colors inline-flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          <span>Edit</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-5 sm:px-6 py-2.5 min-h-[44px] bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl font-sans text-sm font-semibold transition-colors shadow-xs inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">
                progress_activity
              </span>
              <span>Submitting Report...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>Submit Report</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
