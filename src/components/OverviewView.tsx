import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HotspotCluster, LiveIngestionEvent, CitizenReport } from '../types/civic';
import { PROJECT_START_DATE, PROJECT_START_DISPLAY } from '../config/projectConfig';
import { AnimatedCounter } from './AnimatedCounter';

interface OverviewViewProps {
  hotspots: HotspotCluster[];
  liveStream: LiveIngestionEvent[];
  latestReports?: CitizenReport[];
  onOpenHotspot: (hotspot: HotspotCluster) => void;
  onOpenSimulator: () => void;
  onOpenExportBrief: () => void;
  onNavigateToReport: () => void;
  onNavigateToRequests: () => void;
  onViewRequestDetail?: (report: CitizenReport) => void;
  onResetData?: () => void;
  onSeedStarter?: () => void;
  isResetting?: boolean;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  hotspots,
  liveStream,
  latestReports = [],
  onOpenHotspot,
  onOpenSimulator,
  onOpenExportBrief,
  onNavigateToReport,
  onNavigateToRequests,
  onViewRequestDetail,
  onResetData,
  onSeedStarter,
  isResetting = false,
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState('Since Project Start');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // REAL LIVE DATA DERIVATIONS ONLY - NO HARDCODED VALUES
  const totalRequestsCount = latestReports.length;
  const highPriorityCount = latestReports.filter(
    (r) => r.severity === 'HIGH' || r.severity === 'CRITICAL'
  ).length;
  const activeClustersCount = hotspots.length;
  const totalPopulationImpact = hotspots.reduce((sum, h) => sum + (h.impactNumber || 0), 0);

  // Category distribution derived from actual reports
  const categoryCounts = latestReports.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});

  const filteredClusters = hotspots.filter((h) => {
    if (selectedDistrict !== 'All' && h.district !== selectedDistrict) return false;
    if (categoryFilter !== 'All' && !h.category.toLowerCase().includes(categoryFilter.toLowerCase())) return false;
    return true;
  });

  const filteredReports = latestReports.filter((r) => {
    if (selectedDistrict !== 'All' && r.district !== selectedDistrict) return false;
    if (categoryFilter !== 'All' && !r.category.toLowerCase().includes(categoryFilter.toLowerCase())) return false;
    return true;
  });

  const hasNoData = latestReports.length === 0;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EBF0FF] text-[#356AE6] font-mono text-[11px] font-semibold tracking-wider uppercase border border-[#356AE6]/20">
              LIVE CITIZEN DATA
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EBEAE4] text-[#6B7280] font-mono text-[11px] tracking-wider uppercase">
              PROJECT START: {PROJECT_START_DISPLAY.toUpperCase()}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[12px] text-[#059669] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
              FIRESTORE SYNC ACTIVE
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="font-sans text-[28px] sm:text-[32px] font-semibold text-[#15171A] tracking-tight">
              Development Intelligence
            </h1>
            <span className="font-mono text-[12px] text-[#6B7280] bg-[#EBEAE4] px-2 py-0.5 rounded">
              PROTOTYPE PRIORITY MODEL
            </span>
          </div>

          <p className="font-sans text-[14px] text-[#6B7280] max-w-3xl leading-relaxed">
            Synthesizing verified citizen vernacular reports into structured municipal engineering intelligence.
          </p>
        </div>

        {/* Action & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Timeframe selector defaulting to Since Project Start */}
          <div className="inline-flex items-center bg-[#FFFFFF] px-3 py-1.5 rounded-lg border border-[#E5E7EB] shadow-xs">
            <span className="material-symbols-outlined text-[16px] text-[#6B7280] mr-1.5">calendar_today</span>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="font-sans text-[13px] text-[#15171A] font-medium bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Since Project Start">Since Project Start ({PROJECT_START_DISPLAY} → Today)</option>
              <option value="Today">Today</option>
              <option value="7 Days">7 Days</option>
              <option value="30 Days">30 Days</option>
              <option value="All Project Data">All Project Data</option>
            </select>
          </div>

          {/* District Filter */}
          <div className="inline-flex items-center bg-[#FFFFFF] px-3 py-1.5 rounded-lg border border-[#E5E7EB] shadow-xs">
            <span className="material-symbols-outlined text-[16px] text-[#6B7280] mr-1.5">apartment</span>
            <span className="font-sans text-[13px] text-[#15171A] font-medium">District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="font-sans text-[13px] text-[#15171A] bg-transparent focus:outline-none cursor-pointer ml-1 font-medium"
            >
              <option value="All">All Districts</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Surat">Surat</option>
              <option value="Rajkot">Rajkot</option>
              <option value="Vadodara">Vadodara</option>
            </select>
          </div>

          {/* Export intelligence brief button */}
          <button
            onClick={onOpenExportBrief}
            disabled={hasNoData}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-sans text-[13px] font-medium shadow-xs transition-colors ${
              hasNoData
                ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                : 'bg-[#356AE6] hover:bg-[#2B58C7] text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export Intelligence Brief</span>
          </button>

          {/* Reset database button */}
          {onResetData && (
            <div className="relative">
              <button
                onClick={() => setShowResetConfirm(true)}
                disabled={isResetting}
                title="Reset database to clean state as of 27 September 2026"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#DC2626]/30 rounded-lg font-mono text-[12px] transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                <span>Reset Data</span>
              </button>

              {/* Reset Confirmation Popover */}
              {showResetConfirm && (
                <div className="absolute right-0 top-10 z-50 w-72 bg-white rounded-xl shadow-xl border border-[#E5E7EB] p-3.5 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626]">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    <span>Reset to 27 Sep 2026?</span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] leading-snug">
                    This will clear all submitted reports and restore the workspace to a pristine clean state.
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#E5E7EB]">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-[#15171A]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowResetConfirm(false);
                        onResetData();
                      }}
                      className="px-3 py-1 bg-[#DC2626] text-white text-xs font-semibold rounded-md hover:bg-[#B91C1C]"
                    >
                      Confirm Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Real Statistics derived strictly from actual Firestore/live records */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requests */}
        <div
          onClick={onNavigateToRequests}
          className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E7EB] shadow-xs space-y-2 flex flex-col justify-between hover:border-[#356AE6]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#6B7280] uppercase tracking-wider">
              TOTAL REQUESTS
            </span>
            <span className="material-symbols-outlined text-[#9CA3AF] group-hover:text-[#356AE6] text-[18px]">
              forum
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="font-sans text-[30px] text-[#15171A] font-semibold tracking-tight">
              <AnimatedCounter value={totalRequestsCount} />
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[12px]">
              <span className="text-[#356AE6] font-medium">LIVE CITIZEN DATA</span>
              <span className="text-[#6B7280]">from {PROJECT_START_DATE}</span>
            </div>
          </div>
          <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden mt-1">
            <motion.div
              className="bg-[#356AE6] h-full"
              initial={{ width: 0 }}
              animate={{ width: totalRequestsCount > 0 ? `${Math.min(100, totalRequestsCount * 10)}%` : '0%' }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* High Priority */}
        <div
          onClick={onNavigateToRequests}
          className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E7EB] shadow-xs space-y-2 flex flex-col justify-between hover:border-[#DC2626]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#6B7280] uppercase tracking-wider">
              HIGH PRIORITY
            </span>
            <span className="material-symbols-outlined text-[#DC2626] text-[18px]">
              priority_high
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="font-sans text-[30px] text-[#DC2626] font-semibold tracking-tight">
              <AnimatedCounter value={highPriorityCount} />
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[12px] text-[#6B7280]">
              <span>Severity High or Critical</span>
            </div>
          </div>
          <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden mt-1">
            <motion.div
              className="bg-[#DC2626] h-full"
              initial={{ width: 0 }}
              animate={{
                width:
                  totalRequestsCount > 0
                    ? `${Math.round((highPriorityCount / Math.max(1, totalRequestsCount)) * 100)}%`
                    : '0%',
              }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Active Issue Clusters */}
        <div
          onClick={() => {
            if (hotspots[0]) onOpenHotspot(hotspots[0]);
          }}
          className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E7EB] shadow-xs space-y-2 flex flex-col justify-between hover:border-[#3FA7A3]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#6B7280] uppercase tracking-wider">
              ISSUE CLUSTERS
            </span>
            <span className="material-symbols-outlined text-[#3FA7A3] text-[18px]">
              hub
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="font-sans text-[30px] text-[#15171A] font-semibold tracking-tight">
              <AnimatedCounter value={activeClustersCount} />
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[12px] text-[#6B7280]">
              <span>Aggregated civic zones</span>
            </div>
          </div>
          <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden mt-1">
            <motion.div
              className="bg-[#3FA7A3] h-full"
              initial={{ width: 0 }}
              animate={{ width: activeClustersCount > 0 ? `${Math.min(100, activeClustersCount * 25)}%` : '0%' }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Modelled Population Impact */}
        <div
          onClick={onOpenSimulator}
          className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E7EB] shadow-xs space-y-2 flex flex-col justify-between hover:border-[#356AE6]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#6B7280] uppercase tracking-wider">
              POPULATION IMPACT
            </span>
            <span className="material-symbols-outlined text-[#356AE6] text-[18px]">
              groups
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="font-sans text-[30px] text-[#356AE6] font-semibold tracking-tight">
              <AnimatedCounter
                value={totalPopulationImpact}
                formatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString())}
              />
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[12px] text-[#6B7280]">
              <span>MODELLED ESTIMATE</span>
            </div>
          </div>
          <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden mt-1">
            <motion.div
              className="bg-[#356AE6] h-full"
              initial={{ width: 0 }}
              animate={{ width: totalPopulationImpact > 0 ? `${Math.min(100, (totalPopulationImpact / 10000) * 100)}%` : '0%' }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 6: EMPTY STATE AFTER RESET */}
      {hasNoData ? (
        <div className="bg-[#FFFFFF] rounded-2xl border-2 border-dashed border-[#D1D5DB] p-10 sm:p-14 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#EBF0FF] text-[#356AE6] mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px]">dataset</span>
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="font-sans text-[22px] sm:text-[26px] font-bold text-[#15171A]">
              Your civic intelligence workspace is ready.
            </h2>
            <p className="font-sans text-[15px] text-[#6B7280] leading-relaxed">
              New citizen reports will appear here as they are submitted and analyzed.
            </p>
          </div>

          {/* 0 Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto py-2">
            <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB]">
              <span className="font-sans text-2xl font-bold text-[#15171A] block">0</span>
              <span className="font-mono text-[11px] text-[#6B7280] uppercase">TOTAL REQUESTS</span>
            </div>
            <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB]">
              <span className="font-sans text-2xl font-bold text-[#DC2626] block">0</span>
              <span className="font-mono text-[11px] text-[#6B7280] uppercase">HIGH PRIORITY</span>
            </div>
            <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB]">
              <span className="font-sans text-2xl font-bold text-[#3FA7A3] block">0</span>
              <span className="font-mono text-[11px] text-[#6B7280] uppercase">ISSUE CLUSTERS</span>
            </div>
            <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB]">
              <span className="font-sans text-2xl font-bold text-[#356AE6] block">0</span>
              <span className="font-mono text-[11px] text-[#6B7280] uppercase">RECOMMENDATIONS</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onNavigateToReport}
              className="px-6 py-3 bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl font-sans text-sm font-semibold shadow-md hover:shadow-lg inline-flex items-center gap-2 transition-all transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
              <span>Report the First Issue</span>
            </button>

            {onSeedStarter && (
              <button
                onClick={onSeedStarter}
                className="px-5 py-3 bg-[#FFFFFF] hover:bg-[#F7F6F2] text-[#15171A] border border-[#E5E7EB] rounded-xl font-sans text-xs font-semibold shadow-xs inline-flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-[#059669]">add_circle</span>
                <span>Ingest Live Test Report (27 Sep 2026)</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Workspace when real data exists */
        <div className="space-y-6">
          {/* Top Issue Clusters & Live Ingestion Stream */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: TOP ISSUE CLUSTERS */}
            <div className="xl:col-span-8 space-y-4">
              <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] shadow-xs p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-[#E5E7EB]">
                  <div>
                    <h2 className="font-sans text-[18px] font-semibold text-[#15171A]">
                      TOP ISSUE CLUSTERS
                    </h2>
                    <p className="font-mono text-xs text-[#6B7280]">
                      Algorithmic spatial agglomeration of verified citizen grievances
                    </p>
                  </div>

                  {/* Filter pills */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#6B7280]">Category:</span>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-[#F7F6F2] border border-[#E5E7EB] text-xs font-mono px-2 py-1 rounded-lg text-[#15171A] focus:outline-none"
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

                {/* Cluster Cards List */}
                <div className="space-y-3">
                  {filteredClusters.length === 0 ? (
                    <div className="p-6 text-center text-xs font-mono text-[#6B7280] bg-[#F7F6F2] rounded-xl">
                      No clusters matching the selected category filter.
                    </div>
                  ) : (
                    filteredClusters.map((cluster) => {
                      const densityPercent = Math.min(100, Math.round((cluster.citizenRequests / Math.max(1, totalRequestsCount)) * 100));
                      return (
                        <div
                          key={cluster.id}
                          onClick={() => onOpenHotspot(cluster)}
                          className="p-4 rounded-xl bg-[#F7F6F2] hover:bg-[#EBEAE4] border border-[#E5E7EB] transition-all cursor-pointer space-y-3 group"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-[#6B7280]">
                                  #{cluster.code}
                                </span>
                                <span className="font-sans text-[16px] font-semibold text-[#15171A] group-hover:text-[#356AE6] transition-colors">
                                  {cluster.name.toUpperCase()}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-white text-xs font-mono text-[#15171A] border border-[#E5E7EB]">
                                  {cluster.category}
                                </span>
                              </div>
                              <span className="font-mono text-xs text-[#6B7280]">
                                {cluster.ward} • {cluster.district}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
                              <span
                                className={`px-2 py-0.5 rounded font-bold ${
                                  cluster.priorityScore >= 80
                                    ? 'bg-[#FEE2E2] text-[#DC2626]'
                                    : cluster.priorityScore >= 60
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                Priority Score {cluster.priorityScore}
                              </span>
                            </div>
                          </div>

                          {/* Horizontal Density Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-mono text-[#6B7280]">
                              <span>Density: {cluster.citizenRequests} related report(s)</span>
                              <span>Modelled Impact: {cluster.modelledImpact} citizens</span>
                            </div>
                            <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[#E5E7EB]">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  cluster.priorityScore >= 80 ? 'bg-[#DC2626]' : 'bg-[#356AE6]'
                                }`}
                                style={{ width: `${Math.max(15, densityPercent)}%` }}
                              />
                            </div>
                          </div>

                          {/* Breakdown counts & Vulnerability */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs font-mono text-[#6B7280]">
                            <div className="flex items-center gap-3">
                              <span>Road: <strong className="text-[#15171A]">{cluster.breakdown.roadCount}</strong></span>
                              <span>Drainage: <strong className="text-[#15171A]">{cluster.breakdown.drainageCount}</strong></span>
                              <span>Water: <strong className="text-[#15171A]">{cluster.breakdown.waterCount}</strong></span>
                            </div>
                            <span className="text-[#356AE6] font-sans font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              Open Hotspot Dossier →
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* AI Civic Intelligence Insight Banner */}
              {hotspots[0] && (
                <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5E7EB] shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-1.5 bg-[#356AE6] absolute left-0 top-0 bottom-0" />
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#EBF0FF] text-[#356AE6] shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-[#356AE6] font-semibold tracking-wider uppercase">
                        Gemini Civic Intelligence Insight
                      </span>
                      <span className="font-mono text-[11px] text-[#6B7280]">
                        Cluster Synthesis #{hotspots[0].code}
                      </span>
                    </div>
                    <p className="font-sans text-[14px] text-[#15171A] leading-relaxed">
                      <strong className="font-semibold text-[#15171A]">Synthesis:</strong> {hotspots[0].summary}
                    </p>
                    <div className="flex items-center gap-4 pt-1 flex-wrap">
                      <button
                        onClick={() => onOpenHotspot(hotspots[0])}
                        className="text-[#356AE6] hover:underline font-sans text-[13px] font-medium flex items-center gap-1"
                      >
                        <span>View Root Cause Analysis ({hotspots[0].citizenRequests} Reports)</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                      <span className="text-[#E5E7EB]">•</span>
                      <button
                        onClick={onOpenSimulator}
                        className="text-[#6B7280] hover:text-[#15171A] font-sans text-[13px]"
                      >
                        Simulate Budget Intervention
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right 4 Cols: Live Ingestion Stream & Category Distribution */}
            <div className="xl:col-span-4 space-y-4">
              {/* Category Breakdown derived from live records */}
              <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] shadow-xs p-5 space-y-3">
                <span className="font-sans text-[15px] font-semibold text-[#15171A] block">
                  Category Distribution
                </span>
                <p className="font-mono text-[11px] text-[#6B7280]">
                  Calculated from verified citizen reports
                </p>

                <div className="space-y-2 pt-1">
                  {Object.entries(categoryCounts).map(([cat, count]) => {
                    const percent = Math.round((count / Math.max(1, totalRequestsCount)) * 100);
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-[#15171A] font-medium">{cat}</span>
                          <span className="text-[#6B7280]">{count} ({percent}%)</span>
                        </div>
                        <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#356AE6] h-full" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Ingestion Stream */}
              <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-[#E5E7EB]">
                  <div className="space-y-0.5">
                    <span className="font-sans text-[15px] font-semibold text-[#15171A]">
                      Live Ingestion Stream
                    </span>
                    <p className="font-mono text-[11px] text-[#6B7280]">
                      Real-time vernacular grievance feed
                    </p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto">
                  {liveStream.length === 0 ? (
                    <div className="p-4 text-center text-xs font-mono text-[#6B7280]">
                      No stream events recorded yet.
                    </div>
                  ) : (
                    liveStream.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (latestReports[0] && onViewRequestDetail) {
                            onViewRequestDetail(latestReports[0]);
                          } else {
                            onNavigateToRequests();
                          }
                        }}
                        className="p-3 rounded-xl bg-[#F7F6F2] hover:bg-[#EBEAE4] text-[#15171A] border border-[#E5E7EB] transition-colors cursor-pointer space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#15171A] truncate">{item.title}</span>
                          <span className="font-mono text-[10px] text-[#6B7280] shrink-0">{item.timeAgo}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px] text-[#6B7280]">
                          <span>{item.location}</span>
                          <span>•</span>
                          <span className="text-[#356AE6]">{item.language}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-[#E5E7EB]">
                  <button
                    onClick={onNavigateToReport}
                    className="w-full py-2.5 bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl text-xs font-sans font-semibold shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">mic</span>
                    <span>Ingest Voice Grievance</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 8: RECENT REQUESTS DETAILED TABLE */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] shadow-xs p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-[#E5E7EB]">
              <div>
                <h2 className="font-sans text-[18px] font-semibold text-[#15171A]">
                  RECENT REQUESTS
                </h2>
                <p className="font-mono text-xs text-[#6B7280]">
                  Chronological citizen demand ledger since {PROJECT_START_DISPLAY}
                </p>
              </div>

              <button
                onClick={onNavigateToRequests}
                className="text-[#356AE6] hover:underline font-sans text-xs font-medium flex items-center gap-1"
              >
                <span>View All In Demands Ledger ({totalRequestsCount})</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Request ID</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Language</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Priority Score</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredReports.slice(0, 8).map((rep) => (
                    <tr
                      key={rep.id}
                      onClick={() => onViewRequestDetail && onViewRequestDetail(rep)}
                      className="hover:bg-[#F7F6F2] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3 font-mono font-semibold text-[#15171A]">
                        {rep.ticketNumber}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#6B7280]">
                        {PROJECT_START_DISPLAY}
                      </td>
                      <td className="py-3 px-3 font-medium text-[#15171A]">
                        {rep.locationName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-[#EBF0FF] text-[#356AE6] font-mono text-[11px]">
                          {rep.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[#6B7280]">
                        {rep.languageLabel}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                            rep.severity === 'CRITICAL' || rep.severity === 'HIGH'
                              ? 'bg-[#FEE2E2] text-[#DC2626]'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rep.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[11px] border border-emerald-200">
                          {rep.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#15171A]">
                        {rep.priorityScore}/100
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onViewRequestDetail) onViewRequestDetail(rep);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-[#356AE6] hover:bg-[#EBF0FF] rounded-lg transition-colors"
                        >
                          View Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Traceability Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[#6B7280] font-mono text-[11px] border-t border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[15px] text-[#059669]">verified_user</span>
          <span>Interoperable with NIC / MoHUA standards • DPDP Anonymized</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Database: Live Firestore Schema</span>
          <span>•</span>
          <span>Project Baseline: {PROJECT_START_DATE}</span>
        </div>
      </div>
    </div>
  );
};
