import { CitizenReport, HotspotCluster, MunicipalRecommendation, LiveIngestionEvent } from '../types/civic';
import { PROJECT_START_DATE } from '../config/projectConfig';
import { DEMO_CITIZEN_REPORTS } from './demoSeedData';

/**
 * PROTOTYPE DEMONSTRATION SEED DATA
 * Initialized with 10 realistic civic sample reports for hackathon evaluation.
 * All application metrics and lists are derived dynamically from these records.
 */
export const INITIAL_REPORTS: CitizenReport[] = DEMO_CITIZEN_REPORTS;
export const HOTSPOT_CLUSTERS: HotspotCluster[] = [];
export const MUNICIPAL_RECOMMENDATIONS: MunicipalRecommendation[] = [];
export const LIVE_INGESTION_STREAM: LiveIngestionEvent[] = [];

/**
 * Derives dynamic issue clusters from actual Firestore/live citizen reports.
 * Aggregates reports by Area & Category.
 */
export function deriveClustersFromReports(reports: CitizenReport[]): HotspotCluster[] {
  if (!reports || reports.length === 0) return [];

  const clusterMap: Record<string, CitizenReport[]> = {};

  reports.forEach((rep) => {
    const key = `${rep.area || rep.district || 'Unassigned'}__${rep.category}`;
    if (!clusterMap[key]) {
      clusterMap[key] = [];
    }
    clusterMap[key].push(rep);
  });

  const sortedGroups = Object.entries(clusterMap).sort(
    (a, b) => b[1].length - a[1].length
  );

  return sortedGroups.map(([key, groupReports], index) => {
    const [area, category] = key.split('__');
    const district = groupReports[0]?.district || 'Ahmedabad';
    const ward = groupReports[0]?.ward || `${area}, Ward ${10 + index}`;
    
    // Calculate average priority
    const avgPriority = Math.round(
      groupReports.reduce((acc, r) => acc + r.priorityScore, 0) / groupReports.length
    );

    // Count breakdown
    let roadCount = 0;
    let drainageCount = 0;
    let waterCount = 0;

    groupReports.forEach((r) => {
      const lower = (r.category + ' ' + (r.vernacularTranscript || '')).toLowerCase();
      if (lower.includes('road') || lower.includes('pothole') || lower.includes('rast')) roadCount++;
      if (lower.includes('drain') || lower.includes('waterlog') || lower.includes('nali') || lower.includes('gatar')) drainageCount++;
      if (lower.includes('water') || lower.includes('supply') || lower.includes('pani') || lower.includes('pipe')) waterCount++;
    });

    if (roadCount === 0 && drainageCount === 0 && waterCount === 0) {
      roadCount = groupReports.length;
    }

    const hasCritical = groupReports.some((r) => r.severity === 'CRITICAL');
    const hasHigh = groupReports.some((r) => r.severity === 'HIGH');
    const severity = hasCritical ? 'CRITICAL' : hasHigh ? 'HIGH' : avgPriority >= 60 ? 'MODERATE' : 'LOW';

    // Modelled impact estimate based on real report density
    const impactNumber = groupReports.length * 450;
    const modelledImpact = impactNumber.toLocaleString();

    return {
      id: `cluster-${area.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
      code: String(index + 1).padStart(2, '0'),
      rank: index + 1,
      name: area,
      ward,
      district,
      priorityScore: avgPriority,
      severity,
      citizenRequests: groupReports.length,
      category: category as any,
      modelledImpact,
      impactNumber,
      surgeVelocity: `+${groupReports.length * 15}% active velocity`,
      breakdown: {
        roadCount,
        drainageCount,
        waterCount,
      },
      summary: `Spatial aggregation of ${groupReports.length} citizen report(s) in ${area}. ${groupReports[0]?.issueSummary || 'Municipal inspection required.'}`,
      rootCause: `Infrastructure bottleneck in ${area} requiring priority municipal maintenance.`,
      primarySchoolDistance: `Local neighborhood corridor within ${area}`,
      recommendedIntervention: groupReports[0]?.recommendedAction || `Targeted infrastructure overhaul and inspection in ${area}.`,
      sources: groupReports.length,
    };
  });
}

/**
 * Derives municipal capital recommendations dynamically from active clusters.
 */
export function deriveRecommendationsFromClusters(clusters: HotspotCluster[]): MunicipalRecommendation[] {
  if (!clusters || clusters.length === 0) return [];

  return clusters.map((cluster, idx) => {
    const isDrainage = cluster.category.toLowerCase().includes('drainage') || cluster.category.toLowerCase().includes('road');
    const costNumeric = Math.max(15, Math.round(cluster.citizenRequests * 18.5));
    const costString = costNumeric > 100 ? `₹${(costNumeric / 100).toFixed(2)} Cr` : `₹${costNumeric} Lakhs`;

    return {
      id: `rec-${cluster.id}`,
      title: `${cluster.category} Rehabilitation Program - ${cluster.name}`,
      type: cluster.priorityScore >= 75 ? 'CAPEX_INFRASTRUCTURE' : 'OPEX_LOGISTICS',
      category: cluster.category,
      ward: cluster.ward,
      district: cluster.district,
      estimatedCost: costString,
      costNumericLakhs: costNumeric,
      citizensBenefited: cluster.modelledImpact,
      citizensBenefitedNumeric: cluster.impactNumber,
      roiScore: cluster.priorityScore,
      urgency: cluster.severity === 'CRITICAL' ? 'IMMEDIATE' : cluster.severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
      status: 'PENDING_APPROVAL',
      citizenRequests: cluster.citizenRequests,
      description: cluster.recommendedIntervention,
      geminiRationale: `Synthesized from ${cluster.citizenRequests} active citizen report(s) with algorithmic priority ${cluster.priorityScore}/100.`,
    };
  });
}
