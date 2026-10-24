import React from 'react';
import { MunicipalRecommendation } from '../types/civic';

interface RecommendationCardProps {
  recommendation: MunicipalRecommendation;
  onOpenSimulator: () => void;
  onGenerateTender?: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onOpenSimulator,
  onGenerateTender,
}) => {
  return (
    <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] shadow-xs p-6 hover:border-[#356AE6]/40 transition-all space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#EBF0FF] text-[#356AE6] border border-[#356AE6]/20">
              {recommendation.category}
            </span>
            <span
              className={`font-mono text-[11px] px-2 py-0.5 rounded-md ${
                recommendation.urgency === 'IMMEDIATE'
                  ? 'bg-[#FEE2E2] text-[#DC2626] font-semibold'
                  : 'bg-[#F7F6F2] text-[#6B7280]'
              }`}
            >
              {recommendation.urgency} URGENCY
            </span>
          </div>

          <h3 className="font-sans text-[20px] font-semibold text-[#15171A]">
            {recommendation.title}
          </h3>

          {/* Regional Hierarchy - NO MAPS */}
          <p className="font-mono text-xs text-[#6B7280]">
            State: Gujarat • District: {recommendation.district} • Ward: {recommendation.ward}
          </p>
        </div>

        {/* Priority & ROI */}
        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
          <div className="bg-[#F7F6F2] px-3 py-1.5 rounded-lg border border-[#E5E7EB]">
            <span className="text-[#6B7280] block text-[10px] uppercase font-semibold">
              Prototype Priority
            </span>
            <span className="font-bold text-[#DC2626] text-sm">
              {recommendation.roiScore} / 100
            </span>
          </div>
          <div className="bg-[#EBF0FF] px-3 py-1.5 rounded-lg border border-[#356AE6]/20">
            <span className="text-[#356AE6] block text-[10px] uppercase font-semibold">
              Capex Budget
            </span>
            <span className="font-bold text-[#356AE6] text-sm">
              {recommendation.estimatedCost}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] font-mono text-xs">
        <div>
          <span className="text-[#6B7280] block text-[10px]">CITIZEN REQUESTS</span>
          <span className="font-bold text-[#15171A]">
            {recommendation.citizenRequests ? `${recommendation.citizenRequests} Ingested` : 'Verified Cluster'}
          </span>
        </div>
        <div>
          <span className="text-[#6B7280] block text-[10px]">INFRASTRUCTURE GAP</span>
          <span className="font-bold text-[#DC2626]">High (Deficit)</span>
        </div>
        <div>
          <span className="text-[#6B7280] block text-[10px]">MODELLED POPULATION</span>
          <span className="font-bold text-[#356AE6]">{recommendation.citizensBenefited}</span>
        </div>
        <div>
          <span className="text-[#6B7280] block text-[10px]">TENDER STATUS</span>
          <span className="font-bold text-[#059669]">Execution Ready</span>
        </div>
      </div>

      {/* Description & AI Rationale */}
      <div className="space-y-2 text-xs">
        <p className="font-sans text-[#15171A] leading-relaxed">
          {recommendation.description}
        </p>
        <div className="p-3 bg-white rounded-lg border border-[#E5E7EB] space-y-1">
          <span className="font-mono text-[10px] text-[#3FA7A3] font-semibold uppercase block">
            AI RECOMMENDATION & RATIONALE
          </span>
          <p className="font-sans text-[#6B7280] italic leading-relaxed">
            “{recommendation.geminiRationale}”
          </p>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
        <button
          type="button"
          onClick={onOpenSimulator}
          className="text-xs font-mono text-[#3FA7A3] hover:underline inline-flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">equalizer</span>
          <span>Simulate Population ROI</span>
        </button>

        {onGenerateTender && (
          <button
            type="button"
            onClick={onGenerateTender}
            className="px-4 py-2 bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl font-sans text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">description</span>
            <span>Draft E-Tender Notice</span>
          </button>
        )}
      </div>
    </div>
  );
};
