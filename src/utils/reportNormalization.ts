import { CitizenReport } from '../types/civic';

export type NormalizedSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type NormalizedStatus = 'Submitted' | 'Under Review' | 'In Action' | 'Resolved';

/**
 * Normalizes any severity variation to one of 4 canonical values:
 * 'Critical' | 'High' | 'Medium' | 'Low'
 */
export function normalizeSeverity(val?: string | null): NormalizedSeverity {
  if (!val) return 'Low';
  const clean = val.trim().toLowerCase();
  if (clean === 'critical' || clean === 'crit') return 'Critical';
  if (clean === 'high') return 'High';
  if (clean === 'moderate' || clean === 'medium' || clean === 'mod' || clean === 'med') return 'Medium';
  if (clean === 'low') return 'Low';
  return 'Low';
}

/**
 * Normalizes any status variation to one of 4 canonical values:
 * 'Submitted' | 'Under Review' | 'In Action' | 'Resolved'
 */
export function normalizeStatus(val?: string | null): NormalizedStatus {
  if (!val) return 'Submitted';
  const clean = val.trim().toLowerCase();
  if (clean === 'submitted' || clean === 'open' || clean === 'new' || clean === 'pending') {
    return 'Submitted';
  }
  if (
    clean === 'under review' ||
    clean === 'analyzed' ||
    clean === 'clustered' ||
    clean === 'prioritized' ||
    clean === 'recommended' ||
    clean === 'pwd dispatched' ||
    clean === 'dispatched'
  ) {
    return 'Under Review';
  }
  if (
    clean === 'in action' ||
    clean === 'work in progress' ||
    clean === 'in progress' ||
    clean === 'in-progress' ||
    clean === 'wip'
  ) {
    return 'In Action';
  }
  if (
    clean === 'resolved' ||
    clean === 'resolved & anonymized' ||
    clean === 'closed' ||
    clean === 'completed'
  ) {
    return 'Resolved';
  }
  return 'Submitted';
}

/**
 * Normalizes category string with consistent spacing and casing
 */
export function normalizeCategory(val?: string | null): string {
  if (!val) return 'Road & Drainage';
  const clean = val.trim();
  const lower = clean.toLowerCase();
  if (lower.includes('road') || lower.includes('pothole') || lower.includes('drainage')) {
    return 'Road & Drainage';
  }
  if (lower.includes('water')) {
    return 'Water Supply';
  }
  if (lower.includes('light') || lower.includes('electric') || lower.includes('traffic signal')) {
    return 'Streetlighting & Electrical';
  }
  if (lower.includes('waste') || lower.includes('garbage')) {
    return 'Waste Management';
  }
  if (lower.includes('health') || lower.includes('sanitation')) {
    return 'Public Health & Sanitation';
  }
  return clean;
}

export interface NormalizedReport extends CitizenReport {
  normalizedSeverity: NormalizedSeverity;
  normalizedStatus: NormalizedStatus;
  normalizedCategory: string;
}

/**
 * Normalizes a single report record into canonical form
 */
export function normalizeReport(r: CitizenReport): NormalizedReport {
  return {
    ...r,
    normalizedSeverity: normalizeSeverity(r.severity),
    normalizedStatus: normalizeStatus(r.status),
    normalizedCategory: normalizeCategory(r.category),
  };
}

/**
 * Deduplicates and normalizes an array of reports
 */
export function normalizeReports(reports: CitizenReport[]): NormalizedReport[] {
  if (!reports || reports.length === 0) return [];

  const seenIds = new Set<string>();
  const deduplicated: CitizenReport[] = [];

  for (const rep of reports) {
    const uniqueKey = rep.id || rep.ticketNumber;
    if (uniqueKey && !seenIds.has(uniqueKey)) {
      seenIds.add(uniqueKey);
      deduplicated.push(rep);
    }
  }

  return deduplicated.map(normalizeReport);
}

export interface DashboardStatistics {
  totalReports: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  submittedCount: number;
  underReviewCount: number;
  inActionCount: number;
  resolvedCount: number;
  categoryCounts: Record<string, number>;
  cityCounts: Record<string, number>;
  departmentCounts: Record<string, number>;
}

/**
 * Centralized, authoritative single source of truth for dashboard metrics.
 * Every metric is mathematically derived from the exact same dataset.
 */
export function calculateDashboardStats(
  rawReports: (CitizenReport | NormalizedReport)[]
): DashboardStatistics {
  const reports = (rawReports as any[]).map((r) =>
    r.normalizedSeverity ? (r as NormalizedReport) : normalizeReport(r as CitizenReport)
  );

  const totalReports = reports.length;

  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  let submittedCount = 0;
  let underReviewCount = 0;
  let inActionCount = 0;
  let resolvedCount = 0;

  const categoryCounts: Record<string, number> = {};
  const cityCounts: Record<string, number> = {};
  const departmentCounts: Record<string, number> = {};

  for (const rep of reports) {
    // 1. Severity Mutually Exclusive Count
    switch (rep.normalizedSeverity) {
      case 'Critical':
        criticalCount++;
        break;
      case 'High':
        highCount++;
        break;
      case 'Medium':
        mediumCount++;
        break;
      case 'Low':
      default:
        lowCount++;
        break;
    }

    // 2. Status Mutually Exclusive Count
    switch (rep.normalizedStatus) {
      case 'Submitted':
        submittedCount++;
        break;
      case 'Under Review':
        underReviewCount++;
        break;
      case 'In Action':
        inActionCount++;
        break;
      case 'Resolved':
      default:
        resolvedCount++;
        break;
    }

    // 3. Category Count
    const cat = rep.normalizedCategory;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    // 4. City Count
    const city = rep.city || rep.district || 'Unassigned';
    cityCounts[city] = (cityCounts[city] || 0) + 1;

    // 5. Department Count
    const dept = rep.assignedDepartment || 'Municipal Operations';
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
  }

  return {
    totalReports,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    submittedCount,
    underReviewCount,
    inActionCount,
    resolvedCount,
    categoryCounts,
    cityCounts,
    departmentCounts,
  };
}

/**
 * Development-time validation and data integrity auditor.
 * Confirms all mathematical invariants:
 *   severitySum === totalReports
 *   statusSum === totalReports
 *   categorySum === totalReports
 */
export function validateReportData(reports: CitizenReport[]): {
  isValid: boolean;
  totalReports: number;
  severitySum: number;
  statusSum: number;
  categorySum: number;
  errors: string[];
} {
  const errors: string[] = [];
  const normalized = normalizeReports(reports);
  const stats = calculateDashboardStats(normalized);

  const severitySum = stats.criticalCount + stats.highCount + stats.mediumCount + stats.lowCount;
  const statusSum =
    stats.submittedCount + stats.underReviewCount + stats.inActionCount + stats.resolvedCount;
  const categorySum = Object.values(stats.categoryCounts).reduce((acc, c) => acc + c, 0);

  if (severitySum !== stats.totalReports) {
    errors.push(
      `Severity invariant violation: Critical(${stats.criticalCount}) + High(${stats.highCount}) + Medium(${stats.mediumCount}) + Low(${stats.lowCount}) = ${severitySum} !== totalReports(${stats.totalReports})`
    );
  }

  if (statusSum !== stats.totalReports) {
    errors.push(
      `Status invariant violation: Submitted(${stats.submittedCount}) + UnderReview(${stats.underReviewCount}) + InAction(${stats.inActionCount}) + Resolved(${stats.resolvedCount}) = ${statusSum} !== totalReports(${stats.totalReports})`
    );
  }

  if (categorySum !== stats.totalReports) {
    errors.push(
      `Category invariant violation: categorySum(${categorySum}) !== totalReports(${stats.totalReports})`
    );
  }

  const isValid = errors.length === 0;

  if (!isValid) {
    console.error('[Data Integrity Audit] FAILED with errors:', errors);
  } else {
    console.info(
      `[Data Integrity Audit] PASSED: Total=${stats.totalReports}, SeveritySum=${severitySum}, StatusSum=${statusSum}, CategorySum=${categorySum}.`
    );
  }

  return {
    isValid,
    totalReports: stats.totalReports,
    severitySum,
    statusSum,
    categorySum,
    errors,
  };
}
