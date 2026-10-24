import { IssueSeverity, CivicCategory } from '../types/civic';

export type InterventionType =
  | 'Road Repair'
  | 'Drainage Upgrade'
  | 'Water Supply Improvement'
  | 'Waste Management'
  | 'Street Lighting'
  | 'Public Transport Improvement'
  | 'School Access Improvement'
  | 'Healthcare Access Improvement';

export interface InterventionModelSpec {
  name: InterventionType;
  baseCostCr: number; // Base mobilization & design in ₹ Crores
  costPerCitizen: number; // Capital outlay per affected resident in INR
  costPerRequestCr: number; // Marginal remediation cost per verified citizen ticket in ₹ Crores
  coverageRate: number; // Peak asymptotic coverage limit (0.75 - 0.98)
  efficiencyLabel: string;
  timelineMonths: number;
  coBenefit: string;
  categoryMatches: string[];
}

/**
 * PROTOTYPE INTERVENTION COST ASSUMPTIONS
 * Note: These are modelled prototype assumptions for civic simulation,
 * not official government Schedule of Rates (SOR) or tender estimates.
 */
export const INTERVENTION_COST_MODEL: Record<InterventionType, InterventionModelSpec> = {
  'Road Repair': {
    name: 'Road Repair',
    baseCostCr: 1.5,
    costPerCitizen: 420,
    costPerRequestCr: 0.12,
    coverageRate: 0.92,
    efficiencyLabel: 'Asphalt milling, subsurface stabilization & bituminous sealing',
    timelineMonths: 3,
    coBenefit: 'Reduces commute delays, vehicle damage & dust pollution',
    categoryMatches: ['Road & Drainage', 'Roads', 'Potholes'],
  },
  'Drainage Upgrade': {
    name: 'Drainage Upgrade',
    baseCostCr: 2.8,
    costPerCitizen: 650,
    costPerRequestCr: 0.20,
    coverageRate: 0.90,
    efficiencyLabel: 'Precast RCC stormwater box culverts & silt desilting',
    timelineMonths: 6,
    coBenefit: 'Prevents monsoon waterlogging & waterborne disease vectors',
    categoryMatches: ['Road & Drainage', 'Drainage', 'Waterlogging'],
  },
  'Water Supply Improvement': {
    name: 'Water Supply Improvement',
    baseCostCr: 3.2,
    costPerCitizen: 720,
    costPerRequestCr: 0.25,
    coverageRate: 0.95,
    efficiencyLabel: 'HDPE feeder pipeline replacement & booster pumping overhaul',
    timelineMonths: 5,
    coBenefit: 'Guarantees equitable terminal pressure & potable chlorination',
    categoryMatches: ['Water Supply', 'Water Contamination', 'Low Pressure'],
  },
  'Waste Management': {
    name: 'Waste Management',
    baseCostCr: 0.9,
    costPerCitizen: 260,
    costPerRequestCr: 0.08,
    coverageRate: 0.88,
    efficiencyLabel: 'Smart IoT bin deployment & secondary transfer station compaction',
    timelineMonths: 2,
    coBenefit: 'Eliminates open garbage dumps & stray animal congregation',
    categoryMatches: ['Waste Management', 'Solid Waste', 'Garbage'],
  },
  'Street Lighting': {
    name: 'Street Lighting',
    baseCostCr: 0.6,
    costPerCitizen: 160,
    costPerRequestCr: 0.05,
    coverageRate: 0.97,
    efficiencyLabel: 'Energy-efficient smart LED luminaire conversion & solar backbones',
    timelineMonths: 1,
    coBenefit: 'Dramatically improves night-time pedestrian safety & crime deterrence',
    categoryMatches: ['Streetlighting & Electrical', 'Lighting', 'Dark Spots'],
  },
  'Public Transport Improvement': {
    name: 'Public Transport Improvement',
    baseCostCr: 4.5,
    costPerCitizen: 880,
    costPerRequestCr: 0.32,
    coverageRate: 0.86,
    efficiencyLabel: 'Electric feeder minibus routes & high-visibility sheltered halts',
    timelineMonths: 8,
    coBenefit: 'Connects underserved peripheral wards with commercial corridors',
    categoryMatches: ['Public Transport', 'Mobility', 'Traffic'],
  },
  'School Access Improvement': {
    name: 'School Access Improvement',
    baseCostCr: 1.8,
    costPerCitizen: 480,
    costPerRequestCr: 0.15,
    coverageRate: 0.94,
    efficiencyLabel: 'Raised tabletop zebra crossings, bollards & school speed calms',
    timelineMonths: 2,
    coBenefit: 'Guarantees zero-casualty safe walking routes for young students',
    categoryMatches: ['Road & Drainage', 'Public Safety', 'Schools'],
  },
  'Healthcare Access Improvement': {
    name: 'Healthcare Access Improvement',
    baseCostCr: 3.0,
    costPerCitizen: 780,
    costPerRequestCr: 0.28,
    coverageRate: 0.91,
    efficiencyLabel: 'Primary health dispensary approach roads, ramps & hygienic buffers',
    timelineMonths: 4,
    coBenefit: 'Ensures unimpeded ambulance transit & sanitization around clinics',
    categoryMatches: ['Public Health & Sanitation', 'Health', 'Sanitation'],
  },
};

export interface ImpactSimulatorInputs {
  budget: number; // in Crores (e.g. 10 = ₹10 Cr)
  intervention: InterventionType;
  requestCount: number;
  severity: IssueSeverity;
  affectedPopulation: number;
  infrastructureGap: number; // 0 to 100 %
  category?: CivicCategory | string;
  locationName?: string;
}

export interface ImpactSimulatorResults {
  requestsPotentiallyAddressed: number;
  populationPotentiallyReached: number;
  issueReductionPercent: number;
  infrastructureImprovementPercent: number;
  estimatedCoveragePercent: number;
  costEfficiency: number; // Citizens protected per ₹1 Cr
  costPerCitizen: number; // Capital cost per resident in INR
  confidence: number; // Algorithmic confidence score (0-100)
  requiredBudgetCr: number; // Modelled budget for 100% capacity
  budgetRatio: number; // budget / requiredBudgetCr
  budgetAdequacy: 'UNDERFUNDED' | 'OPTIMAL' | 'DIMINISHING_RETURNS';
  urgencyMultiplier: number;
  rationale: string;
  engineeringBenchmark: string;
}

/**
 * DYNAMIC CIVIC IMPACT ENGINE
 * Deterministic calculation model utilizing non-linear diminishing returns:
 * coverage = 1 - Math.exp(-budget / requiredBudget)
 */
export function calculateImpact(inputs: ImpactSimulatorInputs): ImpactSimulatorResults {
  const {
    budget,
    intervention,
    requestCount,
    severity,
    affectedPopulation,
    infrastructureGap,
    category,
    locationName = 'Selected Cluster',
  } = inputs;

  const model = INTERVENTION_COST_MODEL[intervention] || INTERVENTION_COST_MODEL['Road Repair'];

  // 1. Severity Multiplier
  const severityMultiplierMap: Record<IssueSeverity, number> = {
    CRITICAL: 1.55,
    HIGH: 1.30,
    MODERATE: 1.10,
    LOW: 0.95,
  };
  const urgencyMultiplier = severityMultiplierMap[severity] || 1.15;

  // 2. Category Alignment Synergy
  // If the intervention matches the issue category, capital yields a 10% efficiency bonus (0.90 required budget)
  const isDirectCategoryMatch = category
    ? model.categoryMatches.some((cat) => category.toLowerCase().includes(cat.toLowerCase()))
    : true;
  const categorySynergyModifier = isDirectCategoryMatch ? 0.90 : 1.12;

  // 3. Modelled Required Budget Calculation (in ₹ Crores)
  // Required Budget = (Base Capex + Population Cost + Ticket Remediation Cost) * Severity * Synergy
  const popCostCr = (Math.max(100, affectedPopulation) * model.costPerCitizen) / 10000000;
  const ticketCostCr = Math.max(1, requestCount) * model.costPerRequestCr;
  const rawRequiredBudget =
    (model.baseCostCr + popCostCr + ticketCostCr) * urgencyMultiplier * categorySynergyModifier;

  // Bounded between ₹0.8 Cr and ₹150 Cr for sensible municipal budgeting
  const requiredBudgetCr = Math.max(0.8, Math.round(rawRequiredBudget * 10) / 10);

  // 4. Non-linear Diminishing Returns Coverage Model
  // Ratio > 1 means budget exceeds baseline requirement
  const safeBudget = Math.max(0.1, budget);
  const budgetRatio = safeBudget / requiredBudgetCr;
  
  // Mathematical exponential diminishing returns curve: 1 - e^(-x)
  const rawCoverage = 1 - Math.exp(-budgetRatio);
  
  // Scale with intervention peak coverage rate (e.g. 0.92)
  const estimatedCoverageDecimal = rawCoverage * model.coverageRate;
  const estimatedCoveragePercent = Math.min(
    99,
    Math.max(4, Math.round(estimatedCoverageDecimal * 100))
  );

  // 5. Requests Potentially Addressed (Influenced by citizen demand & coverage)
  const safeRequests = Math.max(1, requestCount);
  const rawAddressed = Math.round(safeRequests * (estimatedCoveragePercent / 100));
  const requestsPotentiallyAddressed = Math.min(
    safeRequests,
    Math.max(1, rawAddressed)
  );

  // 6. Population Potentially Reached (Influenced by affected population & coverage)
  const safePopulation = Math.max(150, affectedPopulation);
  const rawPopReached = Math.round(safePopulation * (estimatedCoveragePercent / 100));
  const populationPotentiallyReached = Math.min(
    safePopulation,
    Math.max(Math.round(requestsPotentiallyAddressed * 120), rawPopReached)
  );

  // 7. Defect Reduction & Infrastructure Gap Improvement %
  const severityFriction = severity === 'CRITICAL' ? 0.88 : severity === 'HIGH' ? 0.92 : 0.96;
  const issueReductionPercent = Math.min(
    98,
    Math.max(5, Math.round(estimatedCoveragePercent * severityFriction))
  );

  // Gap improvement depends on initial gap severity and coverage
  const gapImprovementDecimal = (infrastructureGap / 100) * (estimatedCoveragePercent / 100);
  const infrastructureImprovementPercent = Math.min(
    95,
    Math.max(8, Math.round(gapImprovementDecimal * 100))
  );

  // 8. Cost Efficiency & Cost Per Citizen
  const costPerCitizen =
    populationPotentiallyReached > 0
      ? Math.round((safeBudget * 10000000) / populationPotentiallyReached)
      : 0;

  const costEfficiency =
    safeBudget > 0 ? Math.round(populationPotentiallyReached / safeBudget) : 0;

  // 9. Algorithmic Confidence
  // Higher request sample size = higher confidence; CRITICAL complexity adds slight variability
  const sampleConfidenceBonus = Math.min(18, safeRequests * 1.5);
  const rawConfidence = 76 + sampleConfidenceBonus - (severity === 'CRITICAL' ? 4 : 0);
  const confidence = Math.min(98, Math.max(68, Math.round(rawConfidence)));

  // 10. Budget Adequacy Classification
  let budgetAdequacy: 'UNDERFUNDED' | 'OPTIMAL' | 'DIMINISHING_RETURNS';
  if (budgetRatio < 0.5) {
    budgetAdequacy = 'UNDERFUNDED';
  } else if (budgetRatio <= 1.35) {
    budgetAdequacy = 'OPTIMAL';
  } else {
    budgetAdequacy = 'DIMINISHING_RETURNS';
  }

  // 11. Plain-Language Explainable Model Rationale
  let rationale = '';
  if (budgetAdequacy === 'UNDERFUNDED') {
    rationale = `Allocating ₹${safeBudget} Cr against an estimated required capital of ₹${requiredBudgetCr} Cr (${Math.round(budgetRatio * 100)}% adequacy) leaves an infrastructure funding deficit. While it resolves approximately ${requestsPotentiallyAddressed} of ${safeRequests} citizen reports, higher budget allocation is recommended to clear the ${severity} bottleneck.`;
  } else if (budgetAdequacy === 'OPTIMAL') {
    rationale = `Allocating ₹${safeBudget} Cr is in the optimal municipal capital efficiency zone (~${Math.round(budgetRatio * 100)}% of the ₹${requiredBudgetCr} Cr benchmark). This investment addresses ${requestsPotentiallyAddressed} out of ${safeRequests} verified grievances, shielding ~${populationPotentiallyReached.toLocaleString()} residents with a competitive cost of ₹${costPerCitizen} per citizen.`;
  } else {
    rationale = `Allocating ₹${safeBudget} Cr exceeds the primary required benchmark of ₹${requiredBudgetCr} Cr (${Math.round(budgetRatio * 100)}%). Due to mathematical diminishing returns, incremental coverage gains plateau at ${estimatedCoveragePercent}%. Secondary funds could be diversified to adjacent wards.`;
  }

  return {
    requestsPotentiallyAddressed,
    populationPotentiallyReached,
    issueReductionPercent,
    infrastructureImprovementPercent,
    estimatedCoveragePercent,
    costEfficiency,
    costPerCitizen,
    confidence,
    requiredBudgetCr,
    budgetRatio: Math.round(budgetRatio * 100) / 100,
    budgetAdequacy,
    urgencyMultiplier,
    rationale,
    engineeringBenchmark: `${model.efficiencyLabel}. Estimated execution: ${model.timelineMonths} months. Co-benefit: ${model.coBenefit}.`,
  };
}
