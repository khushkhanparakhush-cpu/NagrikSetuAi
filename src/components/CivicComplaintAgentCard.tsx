import React, { useState, useRef } from 'react';
import { MockAMCComplaint, AgentActivityStep } from '../types/civic';
import { lookupWard, routeDepartment, MOCK_AMC_WARDS } from '../data/mockAmcWards';
import { optimizeImageDataUrl } from '../utils/imageOptimizer';

interface CivicComplaintAgentCardProps {
  onComplaintCreated: (complaint: MockAMCComplaint) => void;
  onNavigateToTracking: (trackingId: string) => void;
  onNavigateToDashboard: () => void;
}

interface AnalysisResult {
  isClearCivicIssue: boolean;
  issueCategory: string;
  issueTitle: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  confidence: string;
  reason: string;
  recommendedAction: string;
  clarificationNeeded?: string | null;
  suggestedWard?: any;
  suggestedDepartment?: any;
}

export const CivicComplaintAgentCard: React.FC<CivicComplaintAgentCardProps> = ({
  onComplaintCreated,
  onNavigateToTracking,
  onNavigateToDashboard,
}) => {
  // Form State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [locationInput, setLocationInput] = useState('Navrangpura');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Agent Analysis State
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [wardInfo, setWardInfo] = useState<any>(null);
  const [departmentInfo, setDepartmentInfo] = useState<any>(null);

  // Agent Activity Timeline
  const [activitySteps, setActivitySteps] = useState<AgentActivityStep[]>([
    {
      id: 'analyze',
      label: 'Image & Grievance Analysis',
      toolName: 'geminiMultimodalAnalysis',
      status: 'idle',
    },
    {
      id: 'ward',
      label: 'Municipal Ward Detection',
      toolName: 'lookupWard(location)',
      status: 'idle',
    },
    {
      id: 'department',
      label: 'Department Routing',
      toolName: 'routeDepartment(category)',
      status: 'idle',
    },
    {
      id: 'ticket',
      label: 'Complaint Ticket Creation',
      toolName: 'createComplaintTicket(data)',
      status: 'idle',
    },
  ]);
  const [isActivityExpanded, setIsActivityExpanded] = useState(true);

  // Successfully Created Ticket
  const [createdComplaint, setCreatedComplaint] = useState<MockAMCComplaint | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick preset samples for testing
  const presets = [
    {
      title: 'Pothole in Navrangpura',
      location: 'Navrangpura',
      desc: 'Large crater pothole on Navrangpura main road outside Commerce College. Deep asphalt damage posing accident risk to two-wheelers.',
      sampleImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23333333"/><ellipse cx="300" cy="220" rx="180" ry="90" fill="%231a1a1a"/><ellipse cx="280" cy="210" rx="140" ry="60" fill="%230d0d0d"/><text x="300" y="360" font-family="sans-serif" font-size="20" fill="%23cccccc" text-anchor="middle">Civic Evidence: Severe Pothole Crater (Navrangpura)</text></svg>',
    },
    {
      title: 'Garbage in Maninagar',
      location: 'Maninagar',
      desc: 'Overflowing commercial garbage dump near Kankaria Lake perimeter. Heavy litter accumulation causing foul odor and stray cattle gathering.',
      sampleImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%234a5568"/><rect x="180" y="140" width="240" height="180" fill="%232b6cb0" rx="10"/><path d="M160 140 L440 140 L420 80 L180 80 Z" fill="%233182ce"/><circle cx="230" cy="250" r="30" fill="%23e2e8f0"/><circle cx="370" cy="250" r="30" fill="%23e2e8f0"/><text x="300" y="370" font-family="sans-serif" font-size="20" fill="%23ffffff" text-anchor="middle">Civic Evidence: Overflowing Waste Bin (Maninagar)</text></svg>',
    },
    {
      title: 'Broken Streetlight in Vastrapur',
      location: 'Vastrapur',
      desc: 'Streetlight pole dark for 3 consecutive nights along Vastrapur Lake walking track. Complete blackout causing pedestrian safety issues.',
      sampleImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%231a202c"/><rect x="290" y="80" width="20" height="280" fill="%23718096"/><path d="M260 80 L340 80 L320 60 L280 60 Z" fill="%23a0aec0"/><circle cx="300" cy="95" r="16" fill="%234a5568"/><text x="300" y="370" font-family="sans-serif" font-size="20" fill="%23cbd5e0" text-anchor="middle">Civic Evidence: Non-functional Streetlight (Vastrapur)</text></svg>',
    },
    {
      title: 'Waterlogging in Nikol',
      location: 'Nikol',
      desc: 'Severe stormwater waterlogging under Nikol SP Ring Road bridge. Water accumulated up to 1.5 feet blocking vehicles.',
      sampleImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%232d3748"/><rect x="0" y="240" width="600" height="160" fill="%232b6cb0" opacity="0.8"/><text x="300" y="360" font-family="sans-serif" font-size="20" fill="%23ffffff" text-anchor="middle">Civic Evidence: Roadway Waterlogging (Nikol)</text></svg>',
    },
  ];

  // Handle local image file upload with client-side canvas optimization
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 15MB limit. Please upload a smaller photo.');
      return;
    }

    setErrorMessage(null);
    setImageFileName(file.name);

    const reader = new FileReader();
    reader.onload = async () => {
      const rawData = reader.result as string;
      try {
        const optimized = await optimizeImageDataUrl(rawData, {
          maxWidth: 1280,
          maxHeight: 1280,
          quality: 0.82,
        });
        setSelectedImage(optimized.dataUrl);
      } catch {
        setSelectedImage(rawData);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (p: typeof presets[0]) => {
    setSelectedImage(p.sampleImage);
    setImageFileName(`${p.title.toLowerCase().replace(/\s+/g, '_')}.png`);
    setLocationInput(p.location);
    setDescription(p.desc);
    setErrorMessage(null);
    setAnalysis(null);
    setWardInfo(null);
    setDepartmentInfo(null);
  };

  // STEP 1: Execute Gemini Multimodal Analysis + Ward Lookup + Department Routing
  const handleAnalyzeComplaint = async () => {
    if (!selectedImage && !description.trim()) {
      setErrorMessage('Please upload a photo or enter a description of the civic issue.');
      return;
    }
    if (!locationInput.trim()) {
      setErrorMessage('Please enter the location/neighborhood (e.g. Navrangpura, Maninagar, Vastrapur, Nikol).');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysis(null);
    setCreatedComplaint(null);

    // Update activity timeline
    setActivitySteps([
      {
        id: 'analyze',
        label: 'Image & Grievance Analysis',
        toolName: 'geminiMultimodalAnalysis',
        status: 'running',
        details: 'Sending evidence to Gemini 3.8 Flash multimodal API...',
      },
      {
        id: 'ward',
        label: 'Municipal Ward Detection',
        toolName: 'lookupWard(location)',
        status: 'idle',
      },
      {
        id: 'department',
        label: 'Department Routing',
        toolName: 'routeDepartment(category)',
        status: 'idle',
      },
      {
        id: 'ticket',
        label: 'Complaint Ticket Creation',
        toolName: 'createComplaintTicket(data)',
        status: 'idle',
      },
    ]);

    const t0 = performance.now();

    try {
      // 1. Call server-side Gemini Multimodal Analysis endpoint
      const analyzeResp = await fetch('/api/agent/analyze-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage || undefined,
          description: description.trim(),
          location: locationInput.trim(),
        }),
      });

      if (!analyzeResp.ok) {
        const errJson = await analyzeResp.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to analyze complaint evidence.');
      }

      const analyzeData: AnalysisResult = await analyzeResp.json();
      const t1 = performance.now();

      // Check if image is unclear or not a civic issue (Requirement 3)
      if (!analyzeData.isClearCivicIssue && analyzeData.clarificationNeeded) {
        setErrorMessage(`⚠️ Clarification Needed: ${analyzeData.clarificationNeeded}`);
        setActivitySteps((prev) =>
          prev.map((s) =>
            s.id === 'analyze'
              ? {
                  ...s,
                  status: 'failed',
                  details: analyzeData.clarificationNeeded || 'Image unclear or non-civic.',
                  output: analyzeData,
                  executionTimeMs: Math.round(t1 - t0),
                }
              : s
          )
        );
        setIsAnalyzing(false);
        return;
      }

      setActivitySteps((prev) =>
        prev.map((s) =>
          s.id === 'analyze'
            ? {
                ...s,
                status: 'success',
                details: `Classified as ${analyzeData.issueCategory} (${analyzeData.confidence} confidence)`,
                output: {
                  category: analyzeData.issueCategory,
                  title: analyzeData.issueTitle,
                  priority: analyzeData.priority,
                  confidence: analyzeData.confidence,
                },
                executionTimeMs: Math.round(t1 - t0),
              }
            : s
        )
      );

      // 2. Real Ward Lookup Tool: lookupWard(location)
      // High-speed optimization: Use server-precalculated ward if available, avoiding redundant network round trip
      let wardResult = analyzeData.suggestedWard;
      const t2_start = performance.now();

      if (!wardResult) {
        setActivitySteps((prev) =>
          prev.map((s) =>
            s.id === 'ward'
              ? {
                  ...s,
                  status: 'running',
                  details: `Searching Mock AMC Ward Dataset for "${locationInput}"...`,
                }
              : s
          )
        );

        const wardResp = await fetch('/api/agent/lookup-ward', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location: locationInput.trim() }),
        });

        wardResult = await wardResp.json();
      }
      const t2 = performance.now();

      if (!wardResult || !wardResult.found) {
        const notFoundMsg =
          wardResult?.message ||
          'Your location could not be matched to an available demo ward. Please select a supported area.';
        setErrorMessage(
          `Location Notice: ${notFoundMsg} Supported examples: Navrangpura (W12), Maninagar (W27), Vastrapur (W02), Nikol (W01), Satellite (W03), Paldi (W04).`
        );
        setActivitySteps((prev) =>
          prev.map((s) =>
            s.id === 'ward'
              ? {
                  ...s,
                  status: 'failed',
                  details: notFoundMsg,
                  input: { location: locationInput },
                  output: wardResult,
                  executionTimeMs: Math.max(1, Math.round(t2 - t2_start)),
                }
              : s
          )
        );
        setIsAnalyzing(false);
        return;
      }

      setWardInfo(wardResult);
      setActivitySteps((prev) =>
        prev.map((s) =>
          s.id === 'ward'
            ? {
                ...s,
                status: 'success',
                details: `Matched to Ward ${wardResult.wardId} — ${wardResult.wardName} (${wardResult.zone})`,
                input: { location: locationInput },
                output: wardResult,
                executionTimeMs: Math.max(1, Math.round(t2 - t2_start)),
              }
            : s
        )
      );

      // 3. Real Department Routing Tool: routeDepartment(category)
      // High-speed optimization: Use server-precalculated department if available
      let deptResult = analyzeData.suggestedDepartment;
      const t3_start = performance.now();

      if (!deptResult) {
        setActivitySteps((prev) =>
          prev.map((s) =>
            s.id === 'department'
              ? {
                  ...s,
                  status: 'running',
                  details: `Determining department for ${analyzeData.issueCategory}...`,
                }
              : s
          )
        );

        const deptResp = await fetch('/api/agent/route-department', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ issueCategory: analyzeData.issueCategory }),
        });

        deptResult = await deptResp.json();
      }
      const t3 = performance.now();

      setDepartmentInfo(deptResult);
      setActivitySteps((prev) =>
        prev.map((s) =>
          s.id === 'department'
            ? {
                ...s,
                status: 'success',
                details: `Routed to ${deptResult.department}`,
                input: { category: analyzeData.issueCategory },
                output: deptResult,
                executionTimeMs: Math.max(1, Math.round(t3 - t3_start)),
              }
            : s
        )
      );

      setAnalysis(analyzeData);
    } catch (err: any) {
      console.error('Agent analysis error:', err);
      setErrorMessage(err?.message || 'Failed to analyze complaint. Please retry.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // STEP 2: Citizen Confirmation & Real Mock Ticket Creation
  const handleConfirmAndFile = async () => {
    if (isSubmitting) return; // Guard against duplicate submissions

    if (!analysis || !wardInfo || !departmentInfo) {
      setErrorMessage('Please run the AI analysis first.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    setActivitySteps((prev) =>
      prev.map((s) =>
        s.id === 'ticket'
          ? {
              ...s,
              status: 'running',
              details: 'Saving complaint into Mock AMC persistent database...',
            }
          : s
      )
    );

    const tStart = performance.now();

    try {
      const payload = {
        category: analysis.issueCategory,
        issueTitle: analysis.issueTitle,
        citizenDescription: description || analysis.description,
        aiSummary: analysis.description || analysis.issueTitle,
        priority: analysis.priority,
        severity: analysis.priority === 'High' ? 'CRITICAL' : analysis.priority === 'Medium' ? 'HIGH' : 'LOW',
        location: locationInput,
        area: wardInfo.matchedArea || wardInfo.wardName,
        wardId: wardInfo.wardId,
        wardName: wardInfo.wardName,
        zone: wardInfo.zone,
        department: departmentInfo.department,
        image: selectedImage || null,
        city: 'Ahmedabad',
        district: 'Ahmedabad',
        state: 'Gujarat',
      };

      const resp = await fetch('/api/agent/create-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server failed to save complaint in Mock AMC system.');
      }

      const resData = await resp.json();
      const tEnd = performance.now();

      const complaint: MockAMCComplaint = resData.complaint;

      setCreatedComplaint(complaint);
      onComplaintCreated(complaint);

      setActivitySteps((prev) =>
        prev.map((s) =>
          s.id === 'ticket'
            ? {
                ...s,
                status: 'success',
                details: `Saved in Mock AMC. Unique Tracking ID: ${complaint.trackingId}`,
                input: { category: complaint.category, ward: complaint.wardId },
                output: {
                  trackingId: complaint.trackingId,
                  status: complaint.status,
                  savedAt: complaint.createdAt,
                },
                executionTimeMs: Math.round(tEnd - tStart),
              }
            : s
        )
      );
    } catch (err: any) {
      console.error('Ticket creation error:', err);
      setErrorMessage(err?.message || 'Failed to file complaint.');
      setActivitySteps((prev) =>
        prev.map((s) =>
          s.id === 'ticket'
            ? {
                ...s,
                status: 'failed',
                details: err?.message || 'Save failed',
              }
            : s
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTrackingId = (id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const handleResetForm = () => {
    setSelectedImage(null);
    setImageFileName(null);
    setDescription('');
    setLocationInput('Navrangpura');
    setAnalysis(null);
    setWardInfo(null);
    setDepartmentInfo(null);
    setCreatedComplaint(null);
    setErrorMessage(null);
    setActivitySteps((prev) =>
      prev.map((s) => ({ ...s, status: 'idle', details: undefined, input: undefined, output: undefined }))
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* SUCCESS CONFIRMATION SCREEN (Requirement 6 & 9) */}
      {createdComplaint ? (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#059669]/30 shadow-sm p-4 sm:p-8 space-y-5 sm:space-y-6 text-center animate-fadeIn">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>MOCK AMC SYSTEM CONFIRMATION</span>
          </div>

          {/* Success Check Icon */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <span className="material-symbols-outlined text-[32px] sm:text-[36px]">check_circle</span>
          </div>

          {/* Title & Official Mock AMC Disclaimer */}
          <div className="space-y-1.5 max-w-xl mx-auto px-1">
            <h2 className="font-sans text-xl sm:text-3xl font-bold text-[#15171A] leading-tight">
              Successfully Registered in Mock AMC System
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#4B5563]">
              Your civic complaint has been analyzed by Gemini, routed to the responsible AMC department, and assigned an official tracking reference.
            </p>
            <div className="inline-block px-2.5 py-1 mt-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[10px] sm:text-[11px] font-mono">
              ⚠️ Hackathon Simulation: This is a verified Mock AMC system for Garbathon 2026.
            </div>
          </div>

          {/* Prominent Unique Tracking ID Card */}
          <div className="bg-[#F7F6F2] p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] max-w-lg mx-auto text-center space-y-2">
            <span className="font-mono text-[10px] sm:text-[11px] text-[#6B7280] uppercase tracking-wider block font-semibold">
              UNIQUE COMPLAINT TRACKING ID
            </span>
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <span className="font-mono text-xl sm:text-2xl md:text-3xl font-extrabold text-[#356AE6] tracking-tight break-all">
                {createdComplaint.trackingId}
              </span>
              <button
                type="button"
                onClick={() => handleCopyTrackingId(createdComplaint.trackingId)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#6B7280] hover:text-[#356AE6] hover:bg-[#FFFFFF] rounded-lg border border-[#E5E7EB] transition-colors shadow-2xs shrink-0"
                title="Copy Tracking ID"
                aria-label="Copy tracking ID"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {copiedId ? 'done' : 'content_copy'}
                </span>
              </button>
            </div>
            {copiedId && (
              <span className="text-[11px] font-mono text-emerald-600 font-semibold block">
                ✓ Copied to clipboard!
              </span>
            )}
          </div>

          {/* Complaint Details Grid */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-3.5 sm:p-5 max-w-xl mx-auto grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 text-left font-mono text-xs">
            <div className="min-w-0">
              <span className="text-[#6B7280] block text-[10px]">CATEGORY</span>
              <span className="font-bold text-[#15171A] font-sans text-sm block truncate">
                {createdComplaint.category}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-[#6B7280] block text-[10px]">PRIORITY</span>
              <span
                className={`font-bold font-sans text-sm block ${
                  createdComplaint.priority === 'High' ? 'text-red-600' : 'text-amber-600'
                }`}
              >
                {createdComplaint.priority}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-[#6B7280] block text-[10px]">WARD</span>
              <span className="font-bold text-[#15171A] font-sans text-sm block truncate">
                {createdComplaint.wardId} ({createdComplaint.wardName})
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-[#6B7280] block text-[10px]">DEPARTMENT</span>
              <span className="font-bold text-[#356AE6] font-sans text-sm block break-words">
                {createdComplaint.department}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => onNavigateToTracking(createdComplaint.trackingId)}
              className="w-full sm:w-auto px-6 py-3 min-h-[48px] bg-[#356AE6] hover:bg-[#2563EB] text-white rounded-xl font-sans text-sm font-semibold transition-all shadow-xs inline-flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">travel_explore</span>
              <span>Track Complaint Status</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="w-full sm:w-auto px-5 py-3 min-h-[48px] bg-[#F7F6F2] hover:bg-[#EBEAE4] text-[#15171A] border border-[#E5E7EB] rounded-xl font-sans text-sm font-semibold transition-all inline-flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px] text-[#6B7280]">folder_open</span>
              <span>View in My Reports</span>
            </button>

            <button
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto px-4 py-3 min-h-[44px] text-xs text-[#6B7280] hover:text-[#15171A] font-medium transition-colors flex items-center justify-center"
            >
              File Another Complaint
            </button>
          </div>
        </div>
      ) : (
        /* COMPLAINT SUBMISSION & AGENT WORKFLOW */
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Presets Bar for Hackathon Testers */}
          <div className="bg-[#FFFFFF] p-3.5 sm:p-4 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-mono text-[10px] sm:text-[11px] font-bold text-[#356AE6] uppercase tracking-wider">
                ⚡ HACKATHON TEST PRESETS (ONE-CLICK DEMO EVIDENCE)
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#6B7280] font-mono">
                Pothole • Garbage • Streetlight • Waterlogging
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 sm:px-3 py-1.5 min-h-[36px] bg-[#F7F6F2] hover:bg-[#EBF0FF] hover:text-[#356AE6] hover:border-[#356AE6]/30 text-xs font-sans font-medium text-[#15171A] rounded-lg border border-[#E5E7EB] transition-colors active:scale-95 flex items-center"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Citizen Complaint Form (Requirement 9) */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-4 sm:p-7 shadow-xs space-y-5 sm:space-y-6">
            <div className="border-b border-[#E5E7EB] pb-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#356AE6]" />
                <h2 className="font-sans text-[20px] sm:text-[22px] font-bold text-[#15171A]">
                  Civic Complaint Agent — File Grievance
                </h2>
              </div>
              <p className="font-sans text-xs sm:text-sm text-[#6B7280]">
                Submit a photo of the pothole, garbage, broken streetlight, or waterlogging. The AI agent analyzes the issue, identifies the AMC municipal ward, and routes it to the correct department.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-sans text-red-700 flex items-start justify-between gap-3 animate-fadeIn">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0 mt-0.5">
                    warning
                  </span>
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-red-500 hover:text-red-700 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
              {/* LEFT: Photo Upload Section */}
              <div className="lg:col-span-5 space-y-2.5 sm:space-y-3">
                <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#15171A] block">
                  1. Evidence Photo <span className="text-red-500">*</span>
                </label>

                {selectedImage ? (
                  <div className="relative rounded-xl border border-[#E5E7EB] overflow-hidden bg-[#15171A] group">
                    <img
                      src={selectedImage}
                      alt="Civic evidence"
                      className="w-full h-48 sm:h-64 object-contain bg-slate-900"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 min-h-[36px] bg-black/75 hover:bg-black text-white text-[11px] font-semibold rounded-md backdrop-blur-sm transition-colors flex items-center justify-center"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setImageFileName(null);
                        }}
                        className="p-1.5 min-h-[36px] min-w-[36px] bg-red-600/80 hover:bg-red-600 text-white rounded-md transition-colors flex items-center justify-center"
                        aria-label="Remove photo"
                      >
                        <span className="material-symbols-outlined text-[18px] leading-none">close</span>
                      </button>
                    </div>
                    {imageFileName && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm p-2 text-[11px] text-white font-mono truncate">
                        {imageFileName}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-44 sm:h-64 border-2 border-dashed border-[#D1D5DB] hover:border-[#356AE6] hover:bg-[#F7F6F2] rounded-xl flex flex-col items-center justify-center p-4 sm:p-6 text-center cursor-pointer transition-all group"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#EBF0FF] text-[#356AE6] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[24px] sm:text-[26px]">add_a_photo</span>
                    </div>
                    <span className="font-sans text-xs sm:text-sm font-semibold text-[#15171A]">
                      Upload Photo of Defect
                    </span>
                    <span className="font-sans text-[11px] sm:text-xs text-[#6B7280] mt-0.5">
                      Tap or click to browse (JPEG, PNG, WebP)
                    </span>
                    <span className="mt-2.5 px-2.5 py-1 bg-[#FFFFFF] border border-[#E5E7EB] rounded-md text-[10px] sm:text-[11px] font-mono text-[#6B7280] max-w-full text-center leading-tight">
                      Supports Pothole • Garbage • Streetlight • Waterlogging
                    </span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* RIGHT: Description & Location Inputs */}
              <div className="lg:col-span-7 space-y-4">
                {/* Location Input with Ward Auto-Detector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#15171A]">
                      2. Location / Area <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-[#356AE6]">
                      Mock AMC Ward Lookup
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-3.5 material-symbols-outlined text-[18px] text-[#9CA3AF]">
                      location_on
                    </span>
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="e.g. Navrangpura, Maninagar, Vastrapur, Nikol"
                      className="w-full pl-9 pr-3 py-2.5 min-h-[44px] bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#356AE6]/30 text-[#15171A]"
                    />
                  </div>

                  {/* Ward Preview Hint */}
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#6B7280] flex-wrap pt-0.5">
                    <span className="text-[10px] sm:text-[11px]">Quick Select:</span>
                    {['Navrangpura (W12)', 'Maninagar (W27)', 'Vastrapur (W02)', 'Nikol (W01)'].map((loc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLocationInput(loc.split(' ')[0])}
                        className="px-2 py-1 min-h-[32px] bg-[#F7F6F2] hover:bg-[#EBF0FF] hover:text-[#356AE6] rounded-md border border-[#E5E7EB] cursor-pointer inline-flex items-center text-[10px] sm:text-[11px] transition-colors"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Issue Description */}
                <div className="space-y-1.5">
                  <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#15171A]">
                    3. Issue Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe specific details, landmark, or hazard conditions (e.g. Near Commerce College, water logging after morning rain)..."
                    className="w-full p-3 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#356AE6]/30 text-[#15171A]"
                  />
                </div>

                {/* Primary Action: Analyze Complaint */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <span className="text-xs text-[#6B7280] font-sans hidden sm:inline">
                    Gemini 3.8 Flash Multimodal Engine
                  </span>

                  <button
                    type="button"
                    onClick={handleAnalyzeComplaint}
                    disabled={isAnalyzing}
                    className="w-full sm:w-auto px-6 py-3 min-h-[48px] bg-[#356AE6] hover:bg-[#2563EB] disabled:opacity-60 text-white rounded-xl font-sans text-sm font-semibold transition-all shadow-xs inline-flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">
                          progress_activity
                        </span>
                        <span>Agent Analyzing Evidence...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">psychology</span>
                        <span>Analyze Complaint</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AGENT ACTIVITY TIMELINE (Requirement 8) */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => setIsActivityExpanded(!isActivityExpanded)}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="material-symbols-outlined text-[18px] text-[#356AE6]">
                  terminal
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#15171A]">
                  Agent Execution Activity
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#F7F6F2] border border-[#E5E7EB] font-mono text-[10px] text-[#6B7280]">
                  Real Backend Tools
                </span>
              </div>
              <button type="button" className="text-[#6B7280] hover:text-[#15171A]">
                <span className="material-symbols-outlined text-[18px]">
                  {isActivityExpanded ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            </div>

            {isActivityExpanded && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
                {activitySteps.map((step) => {
                  const isSuccess = step.status === 'success';
                  const isRunning = step.status === 'running';
                  const isFailed = step.status === 'failed';

                  return (
                    <div
                      key={step.id}
                      className={`p-3 rounded-xl border text-xs font-mono transition-all min-w-0 ${
                        isSuccess
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : isRunning
                          ? 'bg-blue-50 border-blue-300 text-blue-900 animate-pulse'
                          : isFailed
                          ? 'bg-red-50 border-red-200 text-red-900'
                          : 'bg-[#F7F6F2] border-[#E5E7EB] text-[#6B7280]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[11px] truncate">{step.label}</span>
                        {isSuccess && (
                          <span className="material-symbols-outlined text-[16px] text-emerald-600">
                            check_circle
                          </span>
                        )}
                        {isRunning && (
                          <span className="material-symbols-outlined text-[16px] text-blue-600 animate-spin">
                            sync
                          </span>
                        )}
                        {isFailed && (
                          <span className="material-symbols-outlined text-[16px] text-red-600">
                            error
                          </span>
                        )}
                        {step.status === 'idle' && (
                          <span className="material-symbols-outlined text-[16px] text-gray-400">
                            circle
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-[#6B7280] truncate font-mono">
                        tool: {step.toolName}
                      </div>

                      {step.details && (
                        <div className="mt-1 text-[11px] font-sans font-medium line-clamp-2">
                          {step.details}
                        </div>
                      )}

                      {step.executionTimeMs !== undefined && (
                        <div className="mt-1 text-[9px] text-[#6B7280] text-right">
                          {step.executionTimeMs}ms
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI ANALYSIS RESULTS CARD (Requirement 3 & 9) */}
          {analysis && wardInfo && departmentInfo && (
            <div className="bg-[#FFFFFF] border border-[#356AE6]/40 rounded-2xl p-4 sm:p-7 shadow-sm space-y-5 sm:space-y-6 animate-fadeIn">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#E5E7EB] pb-3.5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-mono font-semibold border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>CIVIC COMPLAINT SYNTHESIS READY</span>
                  </div>
                  <h3 className="font-sans text-lg sm:text-[20px] font-bold text-[#15171A] mt-1 leading-snug">
                    {analysis.issueTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-[#EBF0FF] text-[#356AE6] font-mono text-[11px] sm:text-xs font-bold border border-[#356AE6]/20">
                    Confidence: {analysis.confidence}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg font-mono text-[11px] sm:text-xs font-bold ${
                      analysis.priority === 'High'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    Priority: {analysis.priority}
                  </span>
                </div>
              </div>

              {/* Data Classification Bar (Section 4 Compliance) */}
              <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] flex items-center gap-1.5 sm:gap-2 flex-wrap text-[10px] sm:text-[11px] font-mono">
                <span className="text-[#6B7280] font-bold">ACCURACY AUDIT:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  AI Analysis (Gemini Multimodal)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Verified Data (Mock AMC Tools)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Estimated Priority (Advisory)
                </span>
              </div>

              {/* Analysis Grid */}
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-[#F7F6F2] p-3.5 sm:p-5 rounded-xl border border-[#E5E7EB]">
                {/* Category */}
                <div className="space-y-0.5 min-w-0">
                  <span className="font-mono text-[10px] text-[#6B7280] uppercase tracking-wider block font-semibold">
                    DETECTED CATEGORY
                  </span>
                  <span className="font-sans text-sm sm:text-base font-bold text-[#15171A] block truncate">
                    {analysis.issueCategory}
                  </span>
                  <span className="inline-block text-[9px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    ✦ AI Analysis
                  </span>
                </div>

                {/* Ward */}
                <div className="space-y-0.5 min-w-0">
                  <span className="font-mono text-[10px] text-[#6B7280] uppercase tracking-wider block font-semibold">
                    MUNICIPAL WARD
                  </span>
                  <span className="font-sans text-sm sm:text-base font-bold text-[#356AE6] block truncate">
                    {wardInfo.wardId} — {wardInfo.wardName}
                  </span>
                  <span className="inline-block text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    ✓ Verified Ward ({wardInfo.zone})
                  </span>
                </div>

                {/* Department */}
                <div className="space-y-0.5 min-w-0">
                  <span className="font-mono text-[10px] text-[#6B7280] uppercase tracking-wider block font-semibold">
                    RESPONSIBLE DEPARTMENT
                  </span>
                  <span className="font-sans text-sm sm:text-base font-bold text-[#15171A] block break-words">
                    {departmentInfo.department}
                  </span>
                  <span className="inline-block text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    ✓ Verified Routing
                  </span>
                </div>

                {/* Priority */}
                <div className="space-y-0.5 min-w-0">
                  <span className="font-mono text-[10px] text-[#6B7280] uppercase tracking-wider block font-semibold">
                    LOCATION VERIFIED
                  </span>
                  <span className="font-sans text-sm sm:text-base font-bold text-[#15171A] block truncate">
                    {wardInfo.matchedArea}
                  </span>
                  <span className="inline-block text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    ✓ Verified Area Match
                  </span>
                </div>
              </div>

              {/* Details & Rationale */}
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-mono text-[11px] text-[#6B7280] font-semibold uppercase block">
                    AI Grievance Assessment
                  </span>
                  <p className="font-sans text-[#15171A] leading-relaxed mt-0.5 text-xs sm:text-sm">
                    {analysis.description}
                  </p>
                </div>

                <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#E5E7EB] text-xs font-mono space-y-1">
                  <div className="text-[#356AE6] font-semibold">
                    CLASSIFICATION REASON:
                  </div>
                  <div className="text-[#4B5563] font-sans">
                    {analysis.reason}
                  </div>
                  <div className="text-[#059669] font-semibold pt-1">
                    RECOMMENDED MUNICIPAL ACTION:
                  </div>
                  <div className="text-[#4B5563] font-sans">
                    {analysis.recommendedAction}
                  </div>
                </div>
              </div>

              {/* Pre-submission Confirmation & Working Submit Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#E5E7EB]">
                <div className="text-xs text-[#6B7280] font-sans">
                  Ready to register in the Mock AMC persistent complaint ledger.
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setAnalysis(null)}
                    className="px-4 py-2.5 text-xs text-[#6B7280] hover:text-[#15171A] font-medium min-h-[44px] flex items-center justify-center"
                  >
                    Edit Input
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmAndFile}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 min-h-[48px] bg-[#059669] hover:bg-[#047857] disabled:opacity-60 text-white rounded-xl font-sans text-sm font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">
                          progress_activity
                        </span>
                        <span>Filing in Mock AMC...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>Confirm & File Complaint</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
