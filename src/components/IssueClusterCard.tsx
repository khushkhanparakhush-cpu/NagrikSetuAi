import React from 'react';
import { HotspotCluster } from '../types/civic';

interface IssueClusterCardProps {
  cluster: HotspotCluster;
  onOpenDetails: () => void;
  onSimulate?: () => void;
}

export const IssueClusterCard: React.FC<IssueClusterCardProps> = ({
  cluster,
  onOpenDetails,
  onSimulate,
}) => {
  const densityPercent = Math.min(100, Math.round((cluster.citizenRequests / 200) * 100));

  return (
    <div
      onClick={onOpenDetails}
      className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] shadow-xs p-6 hover:border-[#356AE6]/50 transition-all cursor-pointer group space-y-4"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-sm font-bold text-[#6B7280]">
              #{cluster.code}
            </span>
            <h3 className="font-sans text-[20px] font-semibold text-[#15171A] group-hover:text-[#356AE6] transition-colors">
              {cluster.name}
            </h3>
            <span className="px-2.5 py-0.5 rounded-md bg-[#F7F6F2] font-mono text-xs text-[#15171A] border border-[#E5E7EB]">
              {cluster.category}
            </span>
          </div>
          {/* Location Hierarchy - Pure text & labels, NO MAPS */}
          <p className="font-mono text-xs text-[#6B7280]">
            State: Gujarat • District: {cluster.district} • Ward: {cluster.ward}
          </p>
        </div>

        {/* Priority & Impact Badges */}
        <div className="flex items-center gap-3 self-start sm:self-auto font-mono text-xs">
          <div className="bg-[#F7F6F2] px-3 py-1.5 rounded-lg border border-[#E5E7EB]">
            <span className="text-[#6B7280] block text-[10px] uppercase font-semibold">Priority</span>
            <span
              className={`font-bold text-sm ${
                cluster.priorityScore >= 80 ? 'text-[#DC2626]' : 'text-[#356AE6]'
              }`}
            >
              {cluster.priorityScore} / 100
            </span>
          </div>
          <div className="bg-[#EBF0FF] px-3 py-1.5 rounded-lg border border-[#356AE6]/20">
            <span className="text-[#356AE6] block text-[10px] uppercase font-semibold">
              Modelled Impact
            </span>
            <span className="font-bold text-[#356AE6] text-sm">
              {cluster.modelledImpact}
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Density Bar (Replacing Map) */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono text-[#6B7280]">
          <span>
            <strong className="text-[#15171A]">{cluster.citizenRequests}</strong> related citizen requests
          </span>
          <span>Cluster Density: {densityPercent}%</span>
        </div>
        <div className="w-full bg-[#F7F6F2] h-2.5 rounded-full overflow-hidden border border-[#E5E7EB]">
          <div
            className={`h-full rounded-full transition-all ${
              cluster.priorityScore >= 80 ? 'bg-[#DC2626]' : 'bg-[#356AE6]'
            }`}
            style={{ width: `${densityPercent}%` }}
          />
        </div>
      </div>

      {/* Subcategory Request Breakdown */}
      <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] font-mono text-xs">
        <div className="text-center">
          <span className="text-[#6B7280] block text-[10px]">ROAD</span>
          <span className="font-bold text-[#15171A]">{cluster.breakdown?.roadCount || 91}</span>
        </div>
        <div className="text-center border-x border-[#E5E7EB]">
          <span className="text-[#6B7280] block text-[10px]">DRAINAGE</span>
          <span className="font-bold text-[#15171A]">{cluster.breakdown?.drainageCount || 67}</span>
        </div>
        <div className="text-center">
          <span className="text-[#6B7280] block text-[10px]">WATER</span>
          <span className="font-bold text-[#15171A]">{cluster.breakdown?.waterCount || 26}</span>
        </div>
      </div>

      {/* Issue Summary & Recommendation */}
      <div className="space-y-1 text-xs">
        <p className="font-sans text-[#15171A] leading-relaxed">
          <strong className="font-mono text-[#6B7280]">Issue: </strong>
          {cluster.summary}
        </p>
        <p className="font-sans text-[#6B7280] leading-relaxed">
          <strong className="font-mono text-[#059669]">AI Action: </strong>
          {cluster.recommendedIntervention}
        </p>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB] text-xs">
        <span className="font-mono text-[#6B7280]">
          32 Related requests verified in ward
        </span>
        <div className="flex items-center gap-2">
          {onSimulate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSimulate();
              }}
              className="px-3 py-1 text-xs font-mono text-[#3FA7A3] hover:underline"
            >
              Simulate ROI
            </button>
          )}
          <span className="font-sans text-[#356AE6] font-semibold group-hover:underline inline-flex items-center gap-1">
            <span>Inspect Cluster Dossier</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </div>
  );
};
