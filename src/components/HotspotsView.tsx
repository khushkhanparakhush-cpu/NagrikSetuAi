import React, { useState } from 'react';
import { HotspotCluster } from '../types/civic';
import { IssueClusterCard } from './IssueClusterCard';
import { PROJECT_START_DISPLAY } from '../config/projectConfig';

interface HotspotsViewProps {
  hotspots: HotspotCluster[];
  onOpenHotspot: (hotspot: HotspotCluster) => void;
  onOpenSimulator: () => void;
}

export const HotspotsView: React.FC<HotspotsViewProps> = ({
  hotspots,
  onOpenHotspot,
  onOpenSimulator,
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filtered = hotspots.filter((h) => {
    if (selectedDistrict !== 'All' && h.district !== selectedDistrict) return false;
    if (categoryFilter !== 'All' && !h.category.toLowerCase().includes(categoryFilter.toLowerCase())) return false;
    return true;
  });

  const highPriorityCount = filtered.filter(
    (h) => h.severity === 'HIGH' || h.severity === 'CRITICAL'
  ).length;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#356AE6] bg-[#EBF0FF] px-2.5 py-0.5 rounded-md border border-[#356AE6]/20">
              LIVE CITIZEN DATA
            </span>
            <span className="font-mono text-xs text-[#6B7280]">
              Zero Map Architecture • Regional Agglomeration
            </span>
          </div>
          <h1 className="font-sans text-[26px] sm:text-[32px] font-semibold text-[#15171A] tracking-tight mt-1">
            Issue Clusters
          </h1>
          <p className="font-sans text-[14px] text-[#6B7280]">
            Geographic concentrations of verified citizen requests ranked by Prototype Priority Model.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-[#FFFFFF] px-3 py-1.5 rounded-lg border border-[#E5E7EB] shadow-xs">
            <span className="font-mono text-xs text-[#6B7280]">District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-xs font-sans text-[#15171A] bg-transparent focus:outline-none cursor-pointer font-medium"
            >
              <option value="All">All Districts</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Surat">Surat</option>
              <option value="Rajkot">Rajkot</option>
              <option value="Vadodara">Vadodara</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#FFFFFF] px-3 py-1.5 rounded-lg border border-[#E5E7EB] shadow-xs">
            <span className="font-mono text-xs text-[#6B7280]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-sans text-[#15171A] bg-transparent focus:outline-none cursor-pointer font-medium"
            >
              <option value="All">All Categories</option>
              <option value="Road">Road & Drainage</option>
              <option value="Waste">Waste Management</option>
              <option value="Water">Water Supply</option>
              <option value="Streetlighting">Streetlighting</option>
              <option value="Health">Public Health</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cluster Overview Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] shadow-xs space-y-1">
          <span className="font-mono text-[10px] text-[#6B7280] uppercase tracking-wider block">
            IDENTIFIED CLUSTERS
          </span>
          <span className="font-sans text-[24px] font-bold text-[#15171A]">
            {filtered.length} Active Zone{filtered.length === 1 ? '' : 's'}
          </span>
          <p className="font-sans text-xs text-[#6B7280]">
            Formed dynamically from live citizen grievance reports
          </p>
        </div>

        <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] shadow-xs space-y-1">
          <span className="font-mono text-[10px] text-[#6B7280] uppercase tracking-wider block">
            PROTOTYPE PRIORITY MODEL
          </span>
          <span className="font-sans text-[14px] font-bold text-[#356AE6]">
            35% Demand • 25% Infra • 20% Pop • 10% Urg • 10% Read
          </span>
          <p className="font-sans text-xs text-[#6B7280]">
            Deterministic Prototype Priority Scoring
          </p>
        </div>

        <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] shadow-xs space-y-1">
          <span className="font-mono text-[10px] text-[#6B7280] uppercase tracking-wider block">
            HIGH SEVERITY
          </span>
          <span className="font-sans text-[24px] font-bold text-[#DC2626]">
            {highPriorityCount} High Priority
          </span>
          <p className="font-sans text-xs text-[#6B7280]">
            Require urgent municipal intervention
          </p>
        </div>
      </div>

      {/* Empty State or Cluster Cards List */}
      {filtered.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-2xl border-2 border-dashed border-[#D1D5DB] p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#EBF0FF] text-[#356AE6] mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">hub</span>
          </div>
          <div className="space-y-1">
            <h3 className="font-sans text-lg font-bold text-[#15171A]">
              No active issue clusters yet
            </h3>
            <p className="font-sans text-xs text-[#6B7280] max-w-md mx-auto">
              Clusters form automatically as multiple citizen reports are submitted and analyzed for specific geographic zones.
            </p>
          </div>
          <span className="font-mono text-xs text-[#356AE6] block">
            Starting from {PROJECT_START_DISPLAY}
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((cluster) => (
            <IssueClusterCard
              key={cluster.id}
              cluster={cluster}
              onOpenDetails={() => onOpenHotspot(cluster)}
              onSimulate={onOpenSimulator}
            />
          ))}
        </div>
      )}
    </div>
  );
};
