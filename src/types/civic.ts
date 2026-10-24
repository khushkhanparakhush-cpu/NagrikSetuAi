export type CivicCategory =
  | 'Road & Drainage'
  | 'Waste Management'
  | 'Water Supply'
  | 'Streetlighting & Electrical'
  | 'Public Health & Sanitation';

export type IssueSeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export type RequestStatus =
  | 'Submitted'
  | 'Analyzed'
  | 'Clustered'
  | 'Prioritized'
  | 'Recommended'
  | 'PWD Dispatched'
  | 'Work In Progress'
  | 'Resolved & Anonymized';

export interface TimelineStep {
  label: string;
  sublabel?: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
}

export type UserRole = 'citizen' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  location?: string;
  department?: string;
}

export interface CitizenReport {
  id: string;
  ticketNumber: string;
  ownerId: string;
  timestamp: string;
  timeAgo: string;
  inputMode: 'voice' | 'text';
  language: 'en' | 'hi';
  languageLabel: string;
  vernacularTranscript: string;
  englishTranslation: string;
  locationName: string;
  state?: string;
  district: string;
  city?: string;
  area?: string;
  ward: string;
  category: CivicCategory;
  categoryConfidence: number;
  priorityScore: number;
  severity: IssueSeverity;
  status: RequestStatus;
  evidenceImage?: string;
  exifDetails?: string;
  citizenClusterCount: number;
  modelledImpactCitizens: number;
  dispatchTargetHours: number;
  assignedDepartment: string;
  aiSynthesis?: string;
  issueSummary?: string;
  recommendedAction?: string;
  additionalDetails?: string;
  adminNote?: string;
  resolutionNote?: string;
  relatedRequestsCount?: number;
  hotspotClusterId?: string;
  hotspotClusterName?: string;
  additionalNotes?: string;
  contactInfo?: string;
  missingInformation?: string[];
  suggestedFollowUpQuestion?: string | null;
  timeline?: TimelineStep[];
  createdAt?: string;
  updatedAt?: string;
}

export interface HotspotCluster {
  id: string;
  code: string;
  rank: number;
  name: string;
  ward: string;
  district: string;
  priorityScore: number;
  severity: IssueSeverity;
  citizenRequests: number;
  category: CivicCategory;
  modelledImpact: string;
  impactNumber: number;
  surgeVelocity: string;
  breakdown: {
    roadCount: number;
    drainageCount: number;
    waterCount: number;
  };
  summary: string;
  rootCause: string;
  primarySchoolDistance: string;
  recommendedIntervention: string;
  sources: number;
}

export interface MunicipalRecommendation {
  id: string;
  title: string;
  type: 'CAPEX_INFRASTRUCTURE' | 'OPEX_LOGISTICS' | 'EMERGENCY_DISPATCH';
  category: CivicCategory;
  ward: string;
  district: string;
  estimatedCost: string;
  costNumericLakhs: number;
  citizensBenefited: string;
  citizensBenefitedNumeric: number;
  roiScore: number;
  urgency: 'IMMEDIATE' | 'HIGH' | 'MEDIUM';
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'IN_TENDER' | 'EXECUTION';
  citizenRequests?: number;
  description: string;
  geminiRationale: string;
}

export interface LiveIngestionEvent {
  id: string;
  language: 'Hindi' | 'English';
  title: string;
  timeAgo: string;
  location: string;
  verified: boolean;
  priority: IssueSeverity;
}

export interface MockAMCComplaint {
  id: string;
  trackingId: string;
  ticketNumber: string;
  ownerId: string;
  citizenDescription: string;
  aiSummary: string;
  category: 'Pothole' | 'Garbage' | 'Broken Streetlight' | 'Waterlogging' | 'Other Civic Issue' | CivicCategory;
  priority: 'Low' | 'Medium' | 'High';
  priorityScore: number;
  severity: IssueSeverity;
  location: string;
  area: string;
  city: string;
  district: string;
  state: string;
  wardId: string;
  wardName: string;
  zone: string;
  department: string;
  status: 'Submitted' | 'Assigned' | 'In Progress' | 'Resolved';
  image?: string | null;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note: string;
    updatedBy?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AgentActivityStep {
  id: 'analyze' | 'ward' | 'department' | 'ticket' | 'status';
  label: string;
  toolName: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  details?: string;
  input?: any;
  output?: any;
  executionTimeMs?: number;
}

