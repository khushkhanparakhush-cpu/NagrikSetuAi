import React, { useState, useMemo } from 'react';
import { HotspotCluster, CitizenReport, IssueSeverity } from '../types/civic';
import {
  InterventionType,
  INTERVENTION_COST_MODEL,
  calculateImpact,
  ImpactSimulatorInputs,
} from '../data/impactSimulatorEngine';

interface ImpactSimulatorViewProps {
  clusters?: HotspotCluster[];
  reports?: CitizenReport[];
  onNavigateToReport?: () => void;
}

const AVAILABLE_INTERVENTIONS: InterventionType[] = [
  'Road Repair',
  'Drainage Upgrade',
  'Water Supply Improvement',
  'Waste Management',
  'Street Lighting',
  'Public Transport Improvement',
  'School Access Improvement',
  'Healthcare Access Improvement',
];

const BUDGET_PRESETS = [1, 5, 10, 25, 50, 100];
const POPULATION_PRESETS = [500, 5000, 18000, 50000, 100000];

export const ImpactSimulatorView: React.FC<ImpactSimulatorViewProps> = ({
  clusters = [],
  reports = [],
  onNavigateToReport,
}) => {
  // 1. Determine Cluster Locations list
  const clusterOptions = useMemo(() => {
    if (clusters.length > 0) {
      return clusters.map((c) => ({
        id: c.id,
        name: c.name,
        district: c.district,
        ward: c.ward,
        category: c.category,
        citizenRequests: c.citizenRequests,
        impactNumber: c.impactNumber || c.citizenRequests * 450,
        severity: c.severity,
      }));
    }
    // Dynamic default clusters based on any reports available or India-wide archetypes
    return [
      {
        id: 'cluster-default-1',
        name: 'Zone A - East Ward Corridor',
        district: 'Central Municipal Division',
        ward: 'Ward 12',
        category: 'Road & Drainage' as const,
        citizenRequests: Math.max(8, reports.length),
        impactNumber: Math.max(3600, reports.length * 450),
        severity: 'HIGH' as IssueSeverity,
      },
      {
        id: 'cluster-default-2',
        name: 'Zone B - Market Drainage Basin',
        district: 'Urban Catchment Circle',
        ward: 'Ward 08',
        category: 'Road & Drainage' as const,
        citizenRequests: 24,
        impactNumber: 14500,
        severity: 'CRITICAL' as IssueSeverity,
      },
      {
        id: 'cluster-default-3',
        name: 'Zone C - Industrial Pipeline Belt',
        district: 'Suburban Utility Ring',
        ward: 'Ward 19',
        category: 'Water Supply' as const,
        citizenRequests: 16,
        impactNumber: 9200,
        severity: 'MODERATE' as IssueSeverity,
      },
    ];
  }, [clusters, reports]);

  // Selected state
  const [selectedClusterId, setSelectedClusterId] = useState<string>(
    clusterOptions[0]?.id || 'cluster-default-1'
  );

  // Active Cluster finding
  const activeCluster =
    clusterOptions.find((c) => c.id === selectedClusterId) || clusterOptions[0];

  // Simulator Input States
  const [intervention, setIntervention] = useState<InterventionType>('Drainage Upgrade');
  const [budgetCr, setBudgetCr] = useState<number>(10);
  const [customRequests, setCustomRequests] = useState<number | null>(null);
  const [customPopulation, setCustomPopulation] = useState<number | null>(null);
  const [customSeverity, setCustomSeverity] = useState<IssueSeverity | null>(null);
  const [infrastructureGap, setInfrastructureGap] = useState<number>(65); // 0 - 100%
  const [showCostModelDetails, setShowCostModelDetails] = useState<boolean>(false);
  const [copiedRationale, setCopiedRationale] = useState<boolean>(false);

  // Synchronized inputs (Cluster default or user override)
  const effectiveRequests = customRequests ?? activeCluster.citizenRequests;
  const effectivePopulation = customPopulation ?? activeCluster.impactNumber;
  const effectiveSeverity = customSeverity ?? activeCluster.severity;
  const effectiveCategory = activeCluster.category;

  // When user changes selected cluster, reset custom overrides to new cluster defaults
  const handleClusterChange = (clusterId: string) => {
    setSelectedClusterId(clusterId);
    setCustomRequests(null);
    setCustomPopulation(null);
    setCustomSeverity(null);
  };

  // Run dynamic calculation engine
  const calculationInputs: ImpactSimulatorInputs = useMemo(
    () => ({
      budget: budgetCr,
      intervention,
      requestCount: effectiveRequests,
      severity: effectiveSeverity,
      affectedPopulation: effectivePopulation,
      infrastructureGap,
      category: effectiveCategory,
      locationName: activeCluster.name,
    }),
    [
      budgetCr,
      intervention,
      effectiveRequests,
      effectiveSeverity,
      effectivePopulation,
      infrastructureGap,
      effectiveCategory,
      activeCluster.name,
    ]
  );

  const results = useMemo(() => calculateImpact(calculationInputs), [calculationInputs]);
  const activeCostSpec = INTERVENTION_COST_MODEL[intervention];

  const handleCopyRationale = () => {
    navigator.clipboard.writeText(
      `NAGRIKSETU AI — IMPACT SIMULATION REPORT\n` +
        `Location: ${activeCluster.name} (${activeCluster.district})\n` +
        `Intervention: ${intervention}\n` +
        `Simulated Budget: ₹${budgetCr} Cr (Required: ₹${results.requiredBudgetCr} Cr)\n` +
        `Requests Addressed: ${results.requestsPotentiallyAddressed} / ${effectiveRequests} (${results.estimatedCoveragePercent}%)\n` +
        `Citizens Protected: ${results.populationPotentiallyReached.toLocaleString()} / ${effectivePopulation.toLocaleString()}\n` +
        `Defect Reduction: ${results.issueReductionPercent}%\n` +
        `Cost Efficiency: ₹${results.costPerCitizen} per citizen\n` +
        `Adequacy: ${results.budgetAdequacy}\n` +
        `Rationale: ${results.rationale}`
    );
    setCopiedRationale(true);
    setTimeout(() => setCopiedRationale(false), 2500);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 font-sans">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#356AE6] bg-[#EBF0FF] px-2.5 py-0.5 rounded-md border border-[#356AE6]/20">
              DYNAMIC CALCULATION ENGINE
            </span>
            <span className="font-mono text-[11px] text-[#059669] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
              Deterministic • Non-Linear Diminishing Returns
            </span>
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl font-bold text-[#15171A] tracking-tight mt-1.5">
            Civic Capital & Impact Simulator
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#6B7280]">
            Model municipal capital investments before tender release. Every budget, cluster, and intervention dynamically changes projected outcomes.
          </p>
        </div>

        {/* Prototype Assumptions badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="font-mono text-[11px] bg-[#F7F6F2] text-[#4B5563] px-3 py-1.5 rounded-xl border border-[#E5E7EB] font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#356AE6]" />
            Modelled prototype assumptions
          </span>
        </div>
      </div>

      {/* Main Grid: Inputs (5 cols on lg) vs Real-Time Outputs (7 cols on lg) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================== */}
        {/* LEFT COLUMN: CONTROLS & MODEL INPUTS (5 Cols)                  */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] shadow-xs p-4 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#356AE6]">
                tune
              </span>
              <h2 className="font-sans text-base font-bold text-[#15171A]">
                Simulation Controls
              </h2>
            </div>
            <span className="font-mono text-[10px] text-[#6B7280] uppercase">
              Realtime Synthesis
            </span>
          </div>

          {/* 1. Location / Issue Cluster Selection */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between font-mono text-xs text-[#4B5563] uppercase font-bold">
              <span>Location / Issue Cluster</span>
              <span className="text-[10px] text-[#356AE6] font-normal normal-case">
                {clusterOptions.length} available zones
              </span>
            </label>
            <select
              value={selectedClusterId}
              onChange={(e) => handleClusterChange(e.target.value)}
              className="w-full p-2.5 bg-[#F7F6F2] hover:bg-[#EBEAE4] border border-[#E5E7EB] rounded-xl text-xs font-sans text-[#15171A] font-semibold focus:outline-none cursor-pointer transition-colors"
            >
              {clusterOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.district} ({c.citizenRequests} requests, {c.category})
                </option>
              ))}
            </select>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#6B7280] pt-0.5 px-1">
              <span>Jurisdiction: {activeCluster.ward}</span>
              <span className="text-[#356AE6] font-semibold">{effectiveCategory}</span>
            </div>
          </div>

          {/* 2. Intervention Type Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-mono text-xs text-[#4B5563] uppercase font-bold">
              <span>Intervention Type</span>
              <span className="text-[10px] text-[#6B7280] font-normal normal-case">
                8 Engineering Models
              </span>
            </div>
            <select
              value={intervention}
              onChange={(e) => setIntervention(e.target.value as InterventionType)}
              className="w-full p-2.5 bg-[#F7F6F2] hover:bg-[#EBEAE4] border border-[#E5E7EB] rounded-xl text-xs font-sans text-[#15171A] font-semibold focus:outline-none cursor-pointer transition-colors"
            >
              {AVAILABLE_INTERVENTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#6B7280] font-sans px-1 leading-snug">
              {activeCostSpec.efficiencyLabel}
            </p>
          </div>

          {/* 3. Available Budget (Presets + Range Slider + Direct Numeric Input) */}
          <div className="space-y-3 p-4 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs text-[#15171A] uppercase font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#059669]">
                  account_balance_wallet
                </span>
                <span>Simulated Budget</span>
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs font-mono font-bold text-[#6B7280]">₹</span>
                <input
                  type="number"
                  min={0.5}
                  max={200}
                  step={0.5}
                  value={budgetCr}
                  onChange={(e) => setBudgetCr(Math.max(0.2, Number(e.target.value)))}
                  className="w-20 px-2 py-1 bg-white border border-[#E5E7EB] rounded-lg text-sm font-sans font-extrabold text-[#15171A] text-right focus:outline-none focus:ring-1 focus:ring-[#356AE6]"
                />
                <span className="text-xs font-mono font-bold text-[#15171A]">Cr</span>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={0.5}
              max={50}
              step={0.5}
              value={Math.min(50, budgetCr)}
              onChange={(e) => setBudgetCr(Number(e.target.value))}
              className="w-full accent-[#356AE6] cursor-pointer"
            />

            {/* Quick Presets Buttons */}
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] text-[#6B7280] uppercase tracking-wider block">
                Quick Capex Scenarios:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {BUDGET_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBudgetCr(preset)}
                    className={`py-1.5 min-h-[36px] rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center ${
                      budgetCr === preset
                        ? 'bg-[#15171A] text-white shadow-xs'
                        : 'bg-white text-[#4B5563] border border-[#E5E7EB] hover:bg-[#EBEAE4]'
                    }`}
                  >
                    ₹{preset}Cr
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Citizen Demand & Related Requests */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs text-[#4B5563] uppercase font-bold">
                Citizen Demand (Verified Reports)
              </label>
              <span className="font-mono text-xs font-bold text-[#356AE6]">
                {effectiveRequests} Reports
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={150}
                step={1}
                value={effectiveRequests}
                onChange={(e) => setCustomRequests(Number(e.target.value))}
                className="flex-1 accent-[#356AE6] cursor-pointer"
              />
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCustomRequests(Math.max(1, effectiveRequests - 5))}
                  className="w-8 h-8 min-h-[32px] bg-[#F7F6F2] hover:bg-[#EBEAE4] border border-[#E5E7EB] rounded-lg text-xs font-bold text-[#4B5563] flex items-center justify-center"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => setCustomRequests(effectiveRequests + 5)}
                  className="w-8 h-8 min-h-[32px] bg-[#F7F6F2] hover:bg-[#EBEAE4] border border-[#E5E7EB] rounded-lg text-xs font-bold text-[#4B5563] flex items-center justify-center"
                >
                  +5
                </button>
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[#6B7280]">
              <span>1 report (isolated)</span>
              <span>25 (cluster)</span>
              <span>100+ (district crisis)</span>
            </div>
          </div>

          {/* 5. Severity Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs text-[#4B5563] uppercase font-bold">
                Defect Severity & Urgency
              </label>
              <span className="font-mono text-[10px] text-[#6B7280]">
                Urgency factor: {results.urgencyMultiplier}x
              </span>
            </div>
            <div className="grid grid-cols-2 xs:grid-cols-4 gap-1.5">
              {(['LOW', 'MODERATE', 'HIGH', 'CRITICAL'] as IssueSeverity[]).map((sev) => {
                const isSelected = effectiveSeverity === sev;
                const colors = {
                  LOW: isSelected ? 'bg-[#EBF0FF] text-[#356AE6] border-[#356AE6]' : '',
                  MODERATE: isSelected ? 'bg-amber-50 text-amber-800 border-amber-400' : '',
                  HIGH: isSelected ? 'bg-orange-50 text-orange-800 border-orange-400' : '',
                  CRITICAL: isSelected ? 'bg-red-50 text-red-800 border-red-500' : '',
                };
                return (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setCustomSeverity(sev)}
                    className={`py-2 px-2 min-h-[38px] rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center ${
                      isSelected
                        ? `${colors[sev]} ring-1`
                        : 'bg-[#F7F6F2] text-[#6B7280] border-[#E5E7EB] hover:bg-[#EBEAE4]'
                    }`}
                  >
                    {sev}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Affected Population Footprint */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs text-[#4B5563] uppercase font-bold">
                Affected Population
              </label>
              <span className="font-mono text-xs font-bold text-[#15171A]">
                {effectivePopulation.toLocaleString()} citizens
              </span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {POPULATION_PRESETS.map((pop) => (
                <button
                  key={pop}
                  type="button"
                  onClick={() => setCustomPopulation(pop)}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded-md border transition-colors ${
                    effectivePopulation === pop
                      ? 'bg-[#356AE6] text-white border-[#356AE6]'
                      : 'bg-[#F7F6F2] text-[#6B7280] border-[#E5E7EB] hover:bg-[#EBEAE4]'
                  }`}
                >
                  {pop >= 1000 ? `${pop / 1000}k` : pop}
                </button>
              ))}
              <input
                type="number"
                min={100}
                max={500000}
                step={500}
                value={effectivePopulation}
                onChange={(e) => setCustomPopulation(Math.max(100, Number(e.target.value)))}
                className="w-24 px-2 py-0.5 text-[11px] font-mono bg-white border border-[#E5E7EB] rounded text-right focus:outline-none"
              />
            </div>
          </div>

          {/* 7. Infrastructure Gap Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs text-[#4B5563] uppercase font-bold">
                Infrastructure Gap Deficit
              </label>
              <span className="font-mono text-xs font-bold text-[#DC2626]">
                {infrastructureGap}%
              </span>
            </div>
            <input
              type="range"
              min={15}
              max={95}
              step={5}
              value={infrastructureGap}
              onChange={(e) => setInfrastructureGap(Number(e.target.value))}
              className="w-full accent-[#DC2626] cursor-pointer"
            />
          </div>

          {/* Reset Overrides Button */}
          {(customRequests !== null || customPopulation !== null || customSeverity !== null) && (
            <button
              type="button"
              onClick={() => {
                setCustomRequests(null);
                setCustomPopulation(null);
                setCustomSeverity(null);
              }}
              className="w-full py-1.5 text-center text-xs font-mono text-[#356AE6] hover:underline"
            >
              ↺ Reset inputs to verified cluster baseline
            </button>
          )}
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: SIMULATOR DYNAMIC IMPACT RESULTS (7 Cols)        */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Adequacy Meter Banner */}
          <div
            className={`p-4 rounded-2xl border shadow-xs transition-all ${
              results.budgetAdequacy === 'OPTIMAL'
                ? 'bg-emerald-50/70 border-emerald-200'
                : results.budgetAdequacy === 'UNDERFUNDED'
                ? 'bg-amber-50/70 border-amber-200'
                : 'bg-[#EBF0FF]/70 border-[#356AE6]/20'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    results.budgetAdequacy === 'OPTIMAL'
                      ? 'bg-emerald-600 text-white'
                      : results.budgetAdequacy === 'UNDERFUNDED'
                      ? 'bg-amber-600 text-white'
                      : 'bg-[#356AE6] text-white'
                  }`}
                >
                  {results.budgetAdequacy === 'OPTIMAL'
                    ? 'Optimal Capital Zone'
                    : results.budgetAdequacy === 'UNDERFUNDED'
                    ? 'Underfunded Deficit'
                    : 'Diminishing Returns Zone'}
                </span>
                <span className="font-mono text-xs text-[#4B5563]">
                  Budget Ratio: <strong>{Math.round(results.budgetRatio * 100)}%</strong> of required
                </span>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs text-[#6B7280] block">
                  Modelled Required Budget:
                </span>
                <span className="font-sans text-sm font-bold text-[#15171A]">
                  ₹{results.requiredBudgetCr} Cr
                </span>
              </div>
            </div>

            {/* Visual Adequacy Bar */}
            <div className="mt-3 space-y-1">
              <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-[#E5E7EB]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    results.budgetAdequacy === 'OPTIMAL'
                      ? 'bg-emerald-600'
                      : results.budgetAdequacy === 'UNDERFUNDED'
                      ? 'bg-amber-500'
                      : 'bg-[#356AE6]'
                  }`}
                  style={{ width: `${Math.min(100, Math.round(results.budgetRatio * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#6B7280]">
                <span>0% (No Allocation)</span>
                <span>100% (Benchmark: ₹{results.requiredBudgetCr} Cr)</span>
                <span>150%+ (Plateau)</span>
              </div>
            </div>
          </div>

          {/* Key 4 Output Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Requests Addressed */}
            <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E7EB] shadow-xs space-y-1">
              <span className="font-mono text-[10px] text-[#6B7280] uppercase tracking-wider block">
                Requests Addressed
              </span>
              <div className="font-sans text-[26px] font-extrabold text-[#15171A] tabular-nums leading-tight">
                {results.requestsPotentiallyAddressed}
                <span className="text-xs font-normal text-[#6B7280]">/{effectiveRequests}</span>
              </div>
              <span className="font-mono text-[10px] text-[#059669] font-bold block">
                {results.estimatedCoveragePercent}% capacity coverage
              </span>
            </div>

            {/* 2. Population Reached */}
            <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E7EB] shadow-xs space-y-1">
              <span className="font-mono text-[10px] text-[#6B7280] uppercase tracking-wider block">
                Population Reached
              </span>
              <div className="font-sans text-[26px] font-extrabold text-[#356AE6] tabular-nums leading-tight">
                {results.populationPotentiallyReached.toLocaleString()}
              </div>
              <span className="font-mono text-[10px] text-[#6B7280] block">
                Out of {effectivePopulation.toLocaleString()}
              </span>
            </div>

            {/* 3. Issue & Defect Reduction */}
            <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E7EB] shadow-xs space-y-1">
              <span className="font-mono text-[10px] text-[#6B7280] uppercase tracking-wider block">
                Defect Reduction
              </span>
              <div className="font-sans text-[26px] font-extrabold text-[#059669] tabular-nums leading-tight">
                +{results.issueReductionPercent}%
              </div>
              <span className="font-mono text-[10px] text-[#6B7280] block">
                Gap cleared: +{results.infrastructureImprovementPercent}%
              </span>
            </div>

            {/* 4. Cost Efficiency */}
            <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E7EB] shadow-xs space-y-1">
              <span className="font-mono text-[10px] text-[#6B7280] uppercase tracking-wider block">
                Cost Per Resident
              </span>
              <div className="font-sans text-[26px] font-extrabold text-[#15171A] tabular-nums leading-tight">
                ₹{results.costPerCitizen}
              </div>
              <span className="font-mono text-[10px] text-[#6B7280] block">
                {results.costEfficiency.toLocaleString()} citizens / ₹1 Cr
              </span>
            </div>
          </div>

          {/* Before vs After Visual Comparison Cards */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] shadow-xs p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="font-sans text-base font-bold text-[#15171A]">
                  Before vs After Simulation Comparison
                </h3>
                <p className="font-sans text-xs text-[#6B7280]">
                  Projected impact of ₹{budgetCr} Cr {intervention} in {activeCluster.name}
                </p>
              </div>
              <span className="font-mono text-xs bg-[#F7F6F2] px-2.5 py-1 rounded-lg border border-[#E5E7EB] text-[#4B5563]">
                Confidence: <strong>{results.confidence}%</strong>
              </span>
            </div>

            {/* Comparison Bars */}
            <div className="space-y-4 font-mono text-xs">
              {/* Metric 1: Citizen Grievances */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[#6B7280]">
                  <span>Citizen Grievance Resolution:</span>
                  <span>
                    <strong className="text-[#DC2626]">{effectiveRequests} Initial</strong> →{' '}
                    <strong className="text-[#059669]">
                      ~{Math.max(0, effectiveRequests - results.requestsPotentiallyAddressed)} Residual
                    </strong>
                  </span>
                </div>
                <div className="w-full bg-[#F7F6F2] h-4 rounded-full overflow-hidden border border-[#E5E7EB] flex">
                  <div
                    className="bg-[#059669] h-full transition-all duration-500 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                    style={{ width: `${results.estimatedCoveragePercent}%` }}
                  >
                    {results.estimatedCoveragePercent >= 15 ? `${results.requestsPotentiallyAddressed} Addressed` : ''}
                  </div>
                  <div
                    className="bg-[#DC2626]/70 h-full transition-all duration-500"
                    style={{ width: `${100 - results.estimatedCoveragePercent}%` }}
                  />
                </div>
              </div>

              {/* Metric 2: Vulnerable Population Protected */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[#6B7280]">
                  <span>Population Footprint Benefited:</span>
                  <span className="text-[#356AE6] font-bold">
                    {results.populationPotentiallyReached.toLocaleString()} / {effectivePopulation.toLocaleString()} ({results.estimatedCoveragePercent}%)
                  </span>
                </div>
                <div className="w-full bg-[#F7F6F2] h-4 rounded-full overflow-hidden border border-[#E5E7EB]">
                  <div
                    className="bg-[#356AE6] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((results.populationPotentiallyReached / effectivePopulation) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Modelled Outcome Rationale Box */}
            <div className="p-4 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] text-xs font-sans space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#356AE6] font-bold uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">psychology</span>
                  <span>Modelled Outcome Rationale</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyRationale}
                  className="font-mono text-[11px] text-[#6B7280] hover:text-[#15171A] inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copiedRationale ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedRationale ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-[#15171A] leading-relaxed">
                {results.rationale}
              </p>

              <div className="pt-2 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#6B7280]">
                <span>Engineering Benchmark: {results.engineeringBenchmark}</span>
              </div>
            </div>

            {/* Toggleable Cost Assumptions Detail */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowCostModelDetails(!showCostModelDetails)}
                className="text-xs font-mono text-[#356AE6] hover:underline inline-flex items-center gap-1"
              >
                <span>{showCostModelDetails ? 'Hide' : 'Inspect'} Intervention Prototype Model Assumptions</span>
                <span className="material-symbols-outlined text-[14px]">
                  {showCostModelDetails ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {showCostModelDetails && (
                <div className="mt-3 p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-3 animate-fadeIn text-xs">
                  <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                    <span className="font-sans font-bold text-[#15171A]">
                      {activeCostSpec.name} Specifications
                    </span>
                    <span className="font-mono text-[10px] text-[#6B7280]">PROTOTYPE COEFFICIENTS</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-[11px]">
                    <div className="p-2 bg-[#F7F6F2] rounded-lg">
                      <span className="text-[#6B7280] block text-[10px]">Base Capex Mobilization</span>
                      <strong className="text-[#15171A]">₹{activeCostSpec.baseCostCr} Cr</strong>
                    </div>
                    <div className="p-2 bg-[#F7F6F2] rounded-lg">
                      <span className="text-[#6B7280] block text-[10px]">Per-Citizen Factor</span>
                      <strong className="text-[#15171A]">₹{activeCostSpec.costPerCitizen} / resident</strong>
                    </div>
                    <div className="p-2 bg-[#F7F6F2] rounded-lg">
                      <span className="text-[#6B7280] block text-[10px]">Per-Request Remediation</span>
                      <strong className="text-[#15171A]">₹{activeCostSpec.costPerRequestCr} Cr / ticket</strong>
                    </div>
                    <div className="p-2 bg-[#F7F6F2] rounded-lg">
                      <span className="text-[#6B7280] block text-[10px]">Asymptotic Reach Limit</span>
                      <strong className="text-[#15171A]">{Math.round(activeCostSpec.coverageRate * 100)}% Max</strong>
                    </div>
                    <div className="p-2 bg-[#F7F6F2] rounded-lg">
                      <span className="text-[#6B7280] block text-[10px]">Project Timeline</span>
                      <strong className="text-[#15171A]">{activeCostSpec.timelineMonths} Months</strong>
                    </div>
                    <div className="p-2 bg-[#F7F6F2] rounded-lg">
                      <span className="text-[#6B7280] block text-[10px]">Severity Scaling</span>
                      <strong className="text-[#DC2626]">{results.urgencyMultiplier}x Multiplier</strong>
                    </div>
                  </div>

                  <p className="font-sans text-[11px] text-[#6B7280] italic leading-tight">
                    * Disclaimer: These figures represent illustrative algorithmic simulation models designed for municipal priority prototypes, not statutory public works estimates.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
