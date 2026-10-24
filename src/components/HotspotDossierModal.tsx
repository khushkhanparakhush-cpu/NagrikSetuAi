import React from 'react';
import { HotspotCluster } from '../types/civic';

interface HotspotDossierModalProps {
  hotspot: HotspotCluster | null;
  onClose: () => void;
  onSimulate: () => void;
}

export const HotspotDossierModal: React.FC<HotspotDossierModalProps> = ({
  hotspot,
  onClose,
  onSimulate,
}) => {
  if (!hotspot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-[#E5E7EB] max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b pb-3 border-[#E5E7EB]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#6B7280]">
                CLUSTER DOSSIER #{hotspot.code}
              </span>
              <span
                className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                  hotspot.priorityScore >= 80
                    ? 'bg-[#FEE2E2] text-[#DC2626]'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                Score: {hotspot.priorityScore}/100
              </span>
            </div>
            <h2 className="font-sans text-xl font-semibold text-[#15171A]">
              {hotspot.name} • {hotspot.ward}
            </h2>
            <p className="font-mono text-xs text-[#6B7280]">{hotspot.district} District</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9CA3AF] hover:text-[#15171A] rounded-lg"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-4 text-xs font-sans">
          {/* Key Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#F7F6F2] flex flex-col font-mono border border-[#E5E7EB]">
              <span className="text-[#6B7280] text-[10px] uppercase">Grievances Ingested</span>
              <span className="font-sans text-lg font-bold text-[#15171A] mt-0.5">
                {hotspot.citizenRequests}
              </span>
              <span className="text-[#DC2626] text-[10px] mt-0.5">{hotspot.surgeVelocity}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F6F2] flex flex-col font-mono border border-[#E5E7EB]">
              <span className="text-[#6B7280] text-[10px] uppercase">Modelled Footprint</span>
              <span className="font-sans text-lg font-bold text-[#356AE6] mt-0.5">
                {hotspot.modelledImpact}
              </span>
              <span className="text-[#6B7280] text-[10px] mt-0.5">Citizens impacted</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F6F2] flex flex-col font-mono border border-[#E5E7EB]">
              <span className="text-[#6B7280] text-[10px] uppercase">Category</span>
              <span className="font-sans text-sm font-bold text-[#15171A] mt-1 truncate">
                {hotspot.category}
              </span>
              <span className="text-[#059669] text-[10px] mt-0.5">{hotspot.sources} Sources Verified</span>
            </div>
          </div>

          {/* Root cause analysis */}
          <div className="p-4 rounded-xl bg-[#EBF0FF] border border-[#356AE6]/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#356AE6] font-mono text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              <span>GEMINI CIVIC INTELLIGENCE ROOT CAUSE ANALYSIS</span>
            </div>
            <p className="text-[13px] text-[#15171A] leading-relaxed">{hotspot.rootCause}</p>
          </div>

          {/* School Vulnerability */}
          <div className="p-3.5 rounded-xl bg-[#F7F6F2] border border-[#E5E7EB] flex items-center gap-3">
            <span className="material-symbols-outlined text-[#DC2626] text-[24px]">school</span>
            <div className="space-y-0.5">
              <span className="font-semibold text-[#15171A] block text-[13px]">
                Pedestrian & School Vulnerability Index
              </span>
              <span className="text-[#6B7280]">{hotspot.primarySchoolDistance}</span>
            </div>
          </div>

          {/* Recommended Intervention */}
          <div className="p-3.5 rounded-xl bg-[#F7F6F2] border border-[#E5E7EB] space-y-1">
            <span className="font-mono text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold">
              Recommended Municipal Action
            </span>
            <p className="text-[#15171A] font-medium leading-relaxed">
              {hotspot.recommendedIntervention}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
          <span className="font-mono text-xs text-[#6B7280]">
            Location: {hotspot.ward}, {hotspot.district}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-[#F3F2ED] rounded-xl font-mono text-xs text-[#15171A] border border-[#E5E7EB]"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onSimulate();
              }}
              className="px-4 py-2 bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl font-sans text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Simulate Mitigation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
