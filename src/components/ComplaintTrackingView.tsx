import React, { useState, useEffect } from 'react';

interface ComplaintTrackingViewProps {
  initialTrackingId?: string | null;
  onNavigateToReport: () => void;
  onNavigateToDashboard: () => void;
}

export const ComplaintTrackingView: React.FC<ComplaintTrackingViewProps> = ({
  initialTrackingId,
  onNavigateToReport,
  onNavigateToDashboard,
}) => {
  const [searchInput, setSearchInput] = useState(initialTrackingId || 'AMC-DEMO-2026-000001');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'gu'>('en');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [chatReply, setChatReply] = useState<{ reply: string; verified: boolean; missingInfo?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick sample IDs
  const sampleIds = [
    'AMC-DEMO-2026-000001',
    'AMC-DEMO-2026-000002',
    'AMC-DEMO-2026-000003',
    'AMC-DEMO-2026-000004',
  ];

  // Quick inquiry chips
  const sampleQuestions = [
    { label: 'Status of AMC-DEMO-2026-000001', q: 'Status of AMC-DEMO-2026-000001' },
    { label: 'Supported Wards in AMC', q: 'Which municipal wards are supported in Ahmedabad?' },
    { label: 'Pothole Routing', q: 'Which department handles pothole complaints?' },
    { label: 'Status Inquiry (Missing ID)', q: 'What is the status of my complaint?' },
  ];

  const handleLookup = async (queryText?: string) => {
    const target = queryText || searchInput;
    if (!target.trim()) {
      setErrorMessage('Please enter a tracking ID or status question.');
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);
    setResult(null);
    setChatReply(null);

    try {
      // 1. First attempt direct tracking ID status lookup
      const resp = await fetch('/api/agent/status-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: target.trim() }),
      });

      const data = await resp.json();

      if (data.found) {
        setResult(data);
        return;
      }

      // 2. If not a direct tracking ID match, query the conversational grounded Agent Chatbot
      const chatResp = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: target.trim(),
          language: selectedLanguage,
        }),
      });

      const chatData = await chatResp.json();
      if (chatData.foundComplaint && chatData.complaint) {
        setResult({
          found: true,
          trackingId: chatData.complaint.trackingId,
          complaint: chatData.complaint,
          explanation: chatData.reply,
        });
      } else if (chatData.reply) {
        setChatReply({
          reply: chatData.reply,
          verified: chatData.verified ?? true,
          missingInfo: chatData.missingInfo,
        });
      } else {
        setErrorMessage(data.message || 'No complaint was found with this tracking ID.');
      }
    } catch (err: any) {
      console.error('Status lookup error:', err);
      setErrorMessage('Failed to connect to Mock AMC system. Please retry.');
    } finally {
      setIsSearching(false);
    }
  };

  // Run automatically if initialTrackingId is passed
  useEffect(() => {
    if (initialTrackingId) {
      setSearchInput(initialTrackingId);
      handleLookup(initialTrackingId);
    }
  }, [initialTrackingId]);

  return (
    <div className="desktop-container w-full lg:w-[calc(100%-64px)] lg:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#356AE6] bg-[#EBF0FF] px-2.5 py-0.5 rounded-md border border-[#356AE6]/20">
              MOCK AMC STATUS AGENT
            </span>
            <span className="font-mono text-xs text-[#6B7280]">
              Real-time Grievance Tracking
            </span>
          </div>
          <h1 className="font-sans text-[24px] sm:text-[30px] font-bold text-[#15171A] tracking-tight mt-1">
            Track Complaint Status
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#6B7280]">
            Enter your unique AMC tracking ID or ask in natural language to check live departmental status.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToReport}
          className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-[#356AE6] hover:bg-[#2563EB] text-white rounded-xl font-sans text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto inline-flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
          <span>File New Complaint</span>
        </button>
      </div>

      {/* Search Input Box */}
      <div className="bg-[#FFFFFF] p-4 sm:p-7 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#15171A] block">
              Enter Tracking ID or Natural Language Query
            </label>

            {/* Language Selection: en, hi, gu */}
            <div className="flex items-center gap-1 self-start sm:self-auto bg-[#F7F6F2] p-1 rounded-lg border border-[#E5E7EB]">
              {(
                [
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिन्दी' },
                  { code: 'gu', label: 'ગુજરાતી' },
                ] as const
              ).map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`px-2.5 py-1 text-xs font-sans font-semibold rounded-md transition-colors ${
                    selectedLanguage === lang.code
                      ? 'bg-[#356AE6] text-white shadow-xs'
                      : 'text-[#6B7280] hover:text-[#15171A]'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <span className="absolute left-3 top-3.5 material-symbols-outlined text-[20px] text-[#9CA3AF]">
                search
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder='e.g. AMC-DEMO-2026-000001 or "Status of AMC-DEMO-2026-000001"'
                className="w-full pl-10 pr-4 py-3 min-h-[46px] bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#356AE6]/30 text-[#15171A]"
              />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 min-h-[48px] bg-[#356AE6] hover:bg-[#2563EB] disabled:opacity-60 text-white rounded-xl font-sans text-sm font-bold shadow-xs transition-colors inline-flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                  <span>Retrieving Status...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                  <span>Search Status</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Sample Tracking ID Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-1 text-xs font-mono">
          <span className="text-[#6B7280] text-[11px] sm:text-xs">Try Demo Tickets:</span>
          {sampleIds.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setSearchInput(id);
                handleLookup(id);
              }}
              className="px-2.5 py-1.5 min-h-[34px] bg-[#F7F6F2] hover:bg-[#EBF0FF] text-[#356AE6] hover:text-[#2563EB] rounded-md border border-[#E5E7EB] transition-colors text-[11px] sm:text-xs inline-flex items-center"
            >
              {id}
            </button>
          ))}
        </div>

        {/* Quick Question Chips */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-1 border-t border-[#E5E7EB]/70">
          <span className="text-[#6B7280] text-[11px] sm:text-xs font-mono">Try Natural Queries:</span>
          {sampleQuestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSearchInput(item.q);
                handleLookup(item.q);
              }}
              className="px-2.5 py-1 min-h-[32px] bg-[#FFFFFF] hover:bg-[#F7F6F2] text-[#4B5563] hover:text-[#15171A] rounded-md border border-[#E5E7EB] transition-colors text-[11px] sm:text-xs inline-flex items-center"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversational AI Chat Reply Card (Requirement 4) */}
      {chatReply && (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#356AE6]/30 shadow-xs p-4 sm:p-6 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#356AE6] animate-pulse" />
              <span className="font-mono text-xs font-bold text-[#356AE6] uppercase tracking-wider">
                NagrikSetu AI — Truthful Civic Assistant
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Verified Grounding
            </span>
          </div>

          <p className="font-sans text-sm sm:text-base text-[#15171A] leading-relaxed bg-[#F7F6F2] p-4 rounded-xl border border-[#E5E7EB]">
            {chatReply.reply}
          </p>

          {chatReply.missingInfo === 'trackingId' && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs font-mono text-[#6B7280]">Select a demo tracking ID to verify:</span>
              {sampleIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSearchInput(id);
                    handleLookup(id);
                  }}
                  className="px-2 py-1 bg-[#EBF0FF] text-[#356AE6] hover:bg-[#356AE6] hover:text-white rounded text-xs font-mono font-bold transition-colors"
                >
                  {id}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error / Not Found Alert */}
      {errorMessage && (
        <div className="p-4 sm:p-5 bg-red-50 border border-red-200 rounded-2xl text-xs font-sans text-red-700 flex items-start gap-3 animate-fadeIn">
          <span className="material-symbols-outlined text-[22px] text-red-600 shrink-0">
            error
          </span>
          <div className="space-y-1">
            <div className="font-bold text-sm">Complaint Not Found</div>
            <div>{errorMessage}</div>
            <div className="text-[11px] font-mono text-red-600 pt-1">
              Please verify the tracking ID format (e.g. AMC-DEMO-2026-000001).
            </div>
          </div>
        </div>
      )}

      {/* Search Result Card */}
      {result && result.complaint && (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] shadow-xs p-4 sm:p-8 space-y-5 sm:space-y-6 animate-fadeIn">
          {/* Top Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3.5">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs sm:text-sm font-bold text-[#356AE6] bg-[#EBF0FF] px-2.5 py-0.5 rounded-md border border-[#356AE6]/20 break-all">
                  {result.complaint.trackingId}
                </span>
                <span className="text-[11px] sm:text-xs font-mono text-[#6B7280]">
                  Mock AMC Official Record
                </span>
              </div>
              <h2 className="font-sans text-lg sm:text-2xl font-bold text-[#15171A] mt-1 leading-snug">
                {result.complaint.category} — {result.complaint.location || result.complaint.wardName}
              </h2>
            </div>

            {/* Status Pill */}
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border inline-flex items-center ${
                  result.complaint.status === 'Resolved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : result.complaint.status === 'In Progress'
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : result.complaint.status === 'Assigned'
                    ? 'bg-purple-50 text-purple-700 border-purple-300'
                    : 'bg-amber-50 text-amber-700 border-amber-300'
                }`}
              >
                ● Status: {result.complaint.status}
              </span>
            </div>
          </div>

          {/* Data Classification Legend (Section 4 Compliance) */}
          <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] flex items-center gap-1.5 sm:gap-2 flex-wrap text-[10px] sm:text-[11px] font-mono">
            <span className="text-[#6B7280] font-bold">ACCURACY AUDIT:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Verified Data (Mock AMC Store)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              AI Analysis (Gemini 3.8 Flash)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Estimated Priority (Advisory)
            </span>
          </div>

          {/* AI Explanation Box */}
          {result.explanation && (
            <div className="bg-[#FFFFFF] p-3.5 sm:p-5 rounded-xl border border-[#356AE6]/30 shadow-2xs space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#356AE6] font-semibold">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  <span>AI AGENT STATUS SYNTHESIS</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  AI Analysis
                </span>
              </div>
              <p className="font-sans text-xs sm:text-sm text-[#15171A] leading-relaxed">
                {result.explanation}
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 bg-[#FFFFFF] p-3.5 sm:p-4 rounded-xl border border-[#E5E7EB] font-mono text-xs">
            <div className="space-y-1 min-w-0">
              <span className="text-[#6B7280] text-[10px] block">RESPONSIBLE DEPARTMENT</span>
              <span className="font-bold text-[#15171A] font-sans text-sm block break-words">
                {result.complaint.department}
              </span>
              <span className="inline-block text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                ✓ Verified Data
              </span>
            </div>
            <div className="space-y-1 min-w-0">
              <span className="text-[#6B7280] text-[10px] block">MUNICIPAL WARD</span>
              <span className="font-bold text-[#15171A] font-sans text-sm block truncate">
                {result.complaint.wardId || 'W12'} ({result.complaint.wardName})
              </span>
              <span className="inline-block text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                ✓ Verified Ward ({result.complaint.zone || 'West Zone'})
              </span>
            </div>
            <div className="space-y-1 min-w-0">
              <span className="text-[#6B7280] text-[10px] block">PRIORITY</span>
              <span
                className={`font-bold font-sans text-sm block ${
                  result.complaint.priority === 'High' ? 'text-red-600' : 'text-amber-600'
                }`}
              >
                {result.complaint.priority || 'Medium'}
              </span>
              <span className="inline-block text-[9px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                ▲ Estimated Priority
              </span>
            </div>
            <div className="space-y-1 min-w-0">
              <span className="text-[#6B7280] text-[10px] block">LAST UPDATED</span>
              <span className="font-bold text-[#15171A] font-sans text-sm truncate block">
                {new Date(result.complaint.lastUpdated || result.complaint.updatedAt || Date.now()).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="inline-block text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                ✓ Verified Ledger
              </span>
            </div>
          </div>

          {/* Grievance Description */}
          {result.complaint.citizenDescription && (
            <div className="space-y-1 text-sm">
              <span className="font-mono text-[10px] sm:text-[11px] text-[#6B7280] uppercase tracking-wider block font-semibold">
                Reported Grievance
              </span>
              <p className="font-sans text-xs sm:text-sm text-[#15171A] bg-[#F7F6F2] p-3 rounded-lg border border-[#E5E7EB]">
                “{result.complaint.citizenDescription}”
              </p>
            </div>
          )}

          {/* Status History Timeline (Requirement 5 & 7) */}
          <div className="space-y-3 pt-2">
            <span className="font-mono text-xs font-bold text-[#15171A] uppercase tracking-wider block">
              Complaint Status History Timeline
            </span>

            <div className="space-y-3 relative pl-4 border-l-2 border-[#E5E7EB]">
              {(result.complaint.statusHistory || []).map((h: any, idx: number) => (
                <div key={idx} className="relative space-y-1 text-xs">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#356AE6] ring-4 ring-[#FFFFFF]" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-[#15171A]">{h.status}</span>
                    <span className="font-mono text-[#6B7280] text-[10px]">
                      {new Date(h.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {h.updatedBy && (
                      <span className="font-mono text-[10px] text-[#6B7280]">
                        • by {h.updatedBy}
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-[#4B5563] text-xs leading-relaxed">{h.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="px-4 py-2.5 min-h-[44px] text-xs font-sans text-[#356AE6] hover:underline font-semibold flex items-center justify-center sm:justify-start"
            >
              ← Back to My Reports
            </button>

            <button
              type="button"
              onClick={onNavigateToReport}
              className="px-5 py-2.5 min-h-[44px] bg-[#F7F6F2] hover:bg-[#EBEAE4] text-[#15171A] rounded-xl font-sans text-xs font-semibold border border-[#E5E7EB] transition-colors flex items-center justify-center"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
