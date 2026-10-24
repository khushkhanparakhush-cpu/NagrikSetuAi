import React, { useState, useEffect } from 'react';
import { CitizenReport, CivicCategory, IssueSeverity } from '../types/civic';
import { LanguageSelector, LanguageCode, LANGUAGE_METADATA } from './LanguageSelector';
import { VoiceControls } from './VoiceControls';
import { RecordingPlayer } from './RecordingPlayer';
import { LiveTranscript } from './LiveTranscript';
import { FollowUpQuestion } from './FollowUpQuestion';
import { ReportDetails, ReportFormData } from './ReportDetails';
import { ReportReview } from './ReportReview';
import { AIAnalysisCard, StructuredAnalysis } from './AIAnalysisCard';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { PROJECT_START_DATE, PROJECT_START_DISPLAY } from '../config/projectConfig';
import { useAuth } from '../context/AuthContext';

import { MockAMCComplaint } from '../types/civic';
import { CivicComplaintAgentCard } from './CivicComplaintAgentCard';

interface ReportViewProps {
  onSubmitNewReport: (report: CitizenReport) => void;
  onOpenDashboard: () => void;
  onViewRequestDetail?: (report: CitizenReport) => void;
  onNavigateToTracking?: (trackingId: string) => void;
}

type ReportingStep =
  | 'language'
  | 'capture'
  | 'processing'
  | 'followup'
  | 'analysis'
  | 'edit'
  | 'review'
  | 'submitted';

export const ReportView: React.FC<ReportViewProps> = ({
  onSubmitNewReport,
  onOpenDashboard,
  onViewRequestDetail,
  onNavigateToTracking,
}) => {
  const { currentUser, getAuthHeaders } = useAuth();

  // Primary workflow mode: 'agent' (Civic Complaint Agent Track 01) or 'voice' (legacy speech-to-text)
  const [workflowMode, setWorkflowMode] = useState<'agent' | 'voice'>('agent');

  // Input mode: voice or text fallback (for legacy voice flow)
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');

  // Selected language (Language-First selection: Default English)
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');

  // Reporting flow step
  const [currentStep, setCurrentStep] = useState<ReportingStep>('capture');

  // Text input mode state
  const [textInput, setTextInput] = useState('');

  // Processing state & stage trackers
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<number>(1);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Analysis result
  const [analysisResult, setAnalysisResult] = useState<StructuredAnalysis | null>(null);

  // Missing information queue for follow-up
  const [missingQueue, setMissingQueue] = useState<string[]>([]);
  const [currentMissingField, setCurrentMissingField] = useState<string | null>(null);
  const [followUpQuestionText, setFollowUpQuestionText] = useState<string>('');

  // Editable Form Data
  const [formData, setFormData] = useState<ReportFormData>({
    language: 'English',
    transcript: '',
    state: '',
    district: '',
    city: '',
    area: '',
    category: 'Road & Drainage',
    severity: 'HIGH',
    additionalDetails: '',
    photoUrl: null,
    provenance: {},
  });

  // Final submitted ticket info
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    ticketNumber: string;
    priorityScore: number;
    category: CivicCategory;
    relatedRequests: number;
    report: CitizenReport;
  } | null>(null);

  // Real Audio Recorder Hook
  const {
    state: recorderState,
    audioBlob,
    audioUrl,
    audioBase64,
    formattedDuration,
    frequencyData,
    errorMessage: recorderError,
    isPermissionDenied,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    resetRecording,
  } = useAudioRecorder();

  // Optional Browser Speech Recognition for live interim line-by-line display
  const {
    isSupported: isSpeechSupported,
    isListening: isSpeechListening,
    finalSegments,
    interimText,
    fullTranscript,
    startListening,
    stopListening,
    clearTranscript,
    setManualTranscript,
    setFinalSegments,
  } = useSpeechRecognition({
    language: selectedLanguage,
  });

  // Start real voice recording
  const handleStartVoice = async () => {
    const success = await startRecording();
    if (success) {
      startListening();
    }
  };

  // Stop real voice recording
  const handleStopVoice = () => {
    stopRecording();
    stopListening();
  };

  // Cancel voice recording
  const handleCancelVoice = () => {
    cancelRecording();
    stopListening();
    clearTranscript();
  };

  // Re-record
  const handleReRecord = () => {
    resetRecording();
    stopListening();
    clearTranscript();
  };

  // Process actual audio with Gemini
  const handleAnalyzeVoiceReport = async () => {
    if (!audioBase64) {
      setProcessingError('No audio recording found to analyze.');
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);
    setCurrentStep('processing');
    setProcessingStage(1);

    try {
      // Stage 1: Audio received
      setProcessingStage(1);

      // Call server endpoint with actual audio Blob data
      const response = await fetch('/api/analyze-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType: audioBlob?.type || 'audio/webm',
          language: LANGUAGE_METADATA[selectedLanguage].name,
          imageBase64: formData.photoUrl || undefined,
          liveTranscript: fullTranscript || undefined,
        }),
      });

      setProcessingStage(2); // Language identified
      setProcessingStage(3); // Speech understood

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server failed to analyze voice recording');
      }

      setProcessingStage(4); // Structuring report
      const data = await response.json();

      setProcessingStage(5); // Checking missing information
      setProcessingStage(6); // Preparing recommendation

      // Update analysis state
      const analysis: StructuredAnalysis = {
        language: data.language || LANGUAGE_METADATA[selectedLanguage].name,
        transcript: data.transcript || fullTranscript || '',
        englishTranslation: data.englishTranslation,
        category: (data.category as CivicCategory) || 'Road & Drainage',
        severity: data.severity as IssueSeverity | null,
        state: data.state || null,
        district: data.district || null,
        city: data.city || null,
        area: data.area || null,
        issueSummary:
          data.issueSummary || 'Citizen voice grievance recorded for municipal review.',
        recommendedAction:
          data.recommendedAction ||
          'Dispatch municipal engineering inspector for site verification.',
        missingInformation: data.missingInformation || [],
        suggestedFollowUpQuestion: data.suggestedFollowUpQuestion,
        priorityScore: data.priorityScore || 85,
      };

      setAnalysisResult(analysis);

      // Sync central form data with honest provenance
      setFormData({
        language: analysis.language,
        transcript: analysis.transcript,
        state: analysis.state || '',
        district: analysis.district || '',
        city: analysis.city || '',
        area: analysis.area || '',
        category: analysis.category,
        severity: analysis.severity || 'HIGH',
        additionalDetails: data.additionalDetails || '',
        photoUrl: formData.photoUrl,
        provenance: {
          language: 'USER PROVIDED',
          transcript: 'USER PROVIDED',
          category: 'AI SUGGESTED',
          severity: analysis.severity ? 'AI SUGGESTED' : 'MISSING',
          area: analysis.area ? 'AI SUGGESTED' : 'MISSING',
          city: analysis.city ? 'AI SUGGESTED' : 'MISSING',
          district: analysis.district ? 'AI SUGGESTED' : 'MISSING',
          state: 'AI SUGGESTED',
        },
      });

      // Check if missing critical details need follow-up
      if (analysis.missingInformation && analysis.missingInformation.length > 0) {
        setMissingQueue(analysis.missingInformation);
        setCurrentMissingField(analysis.missingInformation[0]);
        setFollowUpQuestionText(
          analysis.suggestedFollowUpQuestion ||
            `Please specify the ${analysis.missingInformation[0]} for this report.`
        );
        setCurrentStep('followup');
      } else {
        setCurrentStep('analysis');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setProcessingError(err?.message || 'Could not analyze voice report. Please try again.');
      setCurrentStep('capture');
    } finally {
      setIsProcessing(false);
    }
  };

  // Process text input with Gemini
  const handleAnalyzeTextReport = async () => {
    if (!textInput.trim()) {
      setProcessingError('Please describe your civic issue.');
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);
    setCurrentStep('processing');
    setProcessingStage(2);

    try {
      const response = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textInput.trim(),
          language: LANGUAGE_METADATA[selectedLanguage].name,
          imageBase64: formData.photoUrl || undefined,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server failed to analyze text report');
      }

      const data = await response.json();

      const analysis: StructuredAnalysis = {
        language: data.language || LANGUAGE_METADATA[selectedLanguage].name,
        transcript: data.transcript || textInput,
        englishTranslation: data.englishTranslation,
        category: (data.category as CivicCategory) || 'Road & Drainage',
        severity: data.severity as IssueSeverity | null,
        state: data.state || null,
        district: data.district || null,
        city: data.city || null,
        area: data.area || null,
        issueSummary: data.issueSummary || 'Citizen reported municipal concern.',
        recommendedAction: data.recommendedAction || 'Schedule road and drainage inspection.',
        missingInformation: data.missingInformation || [],
        suggestedFollowUpQuestion: data.suggestedFollowUpQuestion,
        priorityScore: data.priorityScore || 82,
      };

      setAnalysisResult(analysis);

      setFormData({
        language: analysis.language,
        transcript: analysis.transcript,
        state: analysis.state || '',
        district: analysis.district || '',
        city: analysis.city || '',
        area: analysis.area || '',
        category: analysis.category,
        severity: analysis.severity || 'HIGH',
        additionalDetails: '',
        photoUrl: formData.photoUrl,
        provenance: {
          language: 'USER PROVIDED',
          transcript: 'USER PROVIDED',
          category: 'AI SUGGESTED',
          severity: analysis.severity ? 'AI SUGGESTED' : 'USER PROVIDED',
          area: analysis.area ? 'AI SUGGESTED' : 'USER PROVIDED',
          district: analysis.district ? 'AI SUGGESTED' : 'USER PROVIDED',
          state: 'AI SUGGESTED',
        },
      });

      if (analysis.missingInformation && analysis.missingInformation.length > 0) {
        setMissingQueue(analysis.missingInformation);
        setCurrentMissingField(analysis.missingInformation[0]);
        setFollowUpQuestionText(
          analysis.suggestedFollowUpQuestion ||
            `Please specify the ${analysis.missingInformation[0]} for this report.`
        );
        setCurrentStep('followup');
      } else {
        setCurrentStep('analysis');
      }
    } catch (err: any) {
      console.error('Text analysis error:', err);
      setProcessingError(err?.message || 'Could not analyze text report.');
      setCurrentStep('capture');
    } finally {
      setIsProcessing(false);
    }
  };

  // Follow-up answer handler (Text or Quick Choice)
  const handleFollowUpAnswerText = async (answer: string) => {
    if (!currentMissingField || !analysisResult) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentReport: {
            ...analysisResult,
            area: formData.area,
            severity: formData.severity,
          },
          missingField: currentMissingField,
          answerText: answer,
          language: LANGUAGE_METADATA[selectedLanguage].name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const updated = data.updatedReport;

        // Apply update to form
        if (currentMissingField === 'area' || answer.toLowerCase().includes('ahmedabad')) {
          setFormData((prev) => ({
            ...prev,
            area: updated.area || answer,
            district: updated.district || prev.district || 'Ahmedabad',
            city: updated.city || prev.city || 'Ahmedabad',
            provenance: { ...prev.provenance, area: 'USER PROVIDED' },
          }));
        } else if (currentMissingField === 'severity') {
          const validSev: IssueSeverity =
            answer.toUpperCase() === 'CRITICAL'
              ? 'CRITICAL'
              : answer.toUpperCase() === 'LOW'
              ? 'LOW'
              : answer.toUpperCase() === 'MODERATE' || answer.toUpperCase() === 'MEDIUM'
              ? 'MODERATE'
              : 'HIGH';
          setFormData((prev) => ({
            ...prev,
            severity: validSev,
            provenance: { ...prev.provenance, severity: 'USER PROVIDED' },
          }));
        }

        // Process next in queue
        const remaining = missingQueue.filter((f) => f !== currentMissingField);
        setMissingQueue(remaining);

        if (remaining.length > 0) {
          setCurrentMissingField(remaining[0]);
          setFollowUpQuestionText(
            data.nextFollowUpQuestion || `Please specify the ${remaining[0]}.`
          );
        } else {
          // All missing resolved
          setCurrentStep('analysis');
        }
      } else {
        // Fallback local update
        if (currentMissingField === 'area') {
          setFormData((prev) => ({ ...prev, area: answer }));
        }
        setCurrentStep('analysis');
      }
    } catch (e) {
      console.warn('Follow-up error', e);
      if (currentMissingField === 'area') {
        setFormData((prev) => ({ ...prev, area: answer }));
      }
      setCurrentStep('analysis');
    } finally {
      setIsProcessing(false);
    }
  };

  // Follow-up answer handler (Voice audio)
  const handleFollowUpAnswerVoice = async (base64Audio: string, mime: string) => {
    if (!currentMissingField || !analysisResult) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentReport: {
            ...analysisResult,
            area: formData.area,
            severity: formData.severity,
          },
          missingField: currentMissingField,
          audioBase64: base64Audio,
          mimeType: mime,
          language: LANGUAGE_METADATA[selectedLanguage].name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const updated = data.updatedReport;

        if (updated.area) {
          setFormData((prev) => ({
            ...prev,
            area: updated.area,
            district: updated.district || prev.district || 'Ahmedabad',
            city: updated.city || prev.city || 'Ahmedabad',
            provenance: { ...prev.provenance, area: 'USER PROVIDED' },
          }));
        }
        if (updated.severity) {
          setFormData((prev) => ({
            ...prev,
            severity: updated.severity as IssueSeverity,
            provenance: { ...prev.provenance, severity: 'USER PROVIDED' },
          }));
        }

        const remaining = missingQueue.filter((f) => f !== currentMissingField);
        setMissingQueue(remaining);

        if (remaining.length > 0) {
          setCurrentMissingField(remaining[0]);
          setFollowUpQuestionText(data.nextFollowUpQuestion || `Please clarify the ${remaining[0]}.`);
        } else {
          setCurrentStep('analysis');
        }
      } else {
        setCurrentStep('analysis');
      }
    } catch (e) {
      console.warn('Voice follow-up error', e);
      setCurrentStep('analysis');
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Final Report to Firestore
  const handleSubmitFinalReport = async () => {
    setIsProcessing(true);
    try {
      const ticketNum = `NS-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      const locationParts = [formData.area, formData.city, formData.district, formData.state].filter(Boolean);
      const locDisplayName = locationParts.join(', ') || 'Local Municipality';

      const firestorePayload = {
        ticketNumber: ticketNum,
        language: formData.language,
        transcript: formData.transcript,
        description: formData.transcript,
        state: formData.state || '',
        district: formData.district || '',
        city: formData.city || '',
        area: formData.area || '',
        category: formData.category,
        severity: formData.severity,
        issueSummary:
          analysisResult?.issueSummary || 'Citizen reported municipal infrastructure concern.',
        recommendedAction:
          analysisResult?.recommendedAction ||
          'Improve stormwater drainage and repair the affected road segment.',
        photoUrl: formData.photoUrl,
        audioUrl: audioUrl || null,
        status: 'Submitted',
        source: inputMode,
        priorityScore: analysisResult?.priorityScore || 85,
        relatedRequestsCount: 1,
        createdAt: `${PROJECT_START_DATE}T${new Date().toTimeString().slice(0, 8)}Z`,
      };

      const resp = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(firestorePayload),
      });

      const jsonResp = await resp.json().catch(() => ({}));
      const reqId = jsonResp?.request?.id || `req-${Date.now()}`;
      const finalTicketNumber = jsonResp?.request?.ticketNumber || ticketNum;

      const finalCitizenReport: CitizenReport = {
        id: reqId,
        ticketNumber: finalTicketNumber,
        ownerId: currentUser.uid,
        timestamp: PROJECT_START_DISPLAY,
        timeAgo: 'Just now',
        inputMode,
        language: selectedLanguage,
        languageLabel: LANGUAGE_METADATA[selectedLanguage].name,
        vernacularTranscript: formData.transcript,
        englishTranslation: analysisResult?.englishTranslation || formData.transcript,
        locationName: locDisplayName,
        state: formData.state || '',
        district: formData.district || '',
        city: formData.city || '',
        area: formData.area || '',
        ward: formData.area ? `${formData.area}, Municipal Ward` : `${formData.city || formData.district || 'Municipal'}, Ward`,
        category: formData.category,
        categoryConfidence: 96.4,
        priorityScore: analysisResult?.priorityScore || 85,
        severity: formData.severity,
        status: 'Submitted',
        evidenceImage: formData.photoUrl || undefined,
        citizenClusterCount: 1,
        modelledImpactCitizens: 450,
        dispatchTargetHours: formData.severity === 'CRITICAL' ? 2 : formData.severity === 'HIGH' ? 4 : 8,
        assignedDepartment: `${formData.city || formData.district || 'Municipal'} ${formData.category} Engineering Wing`,
        issueSummary: analysisResult?.issueSummary,
        recommendedAction: analysisResult?.recommendedAction,
        relatedRequestsCount: 1,
        hotspotClusterId: '01',
        hotspotClusterName: formData.area || formData.city || 'Local Sector',
      };

      onSubmitNewReport(finalCitizenReport);

      setSubmittedTicket({
        id: reqId,
        ticketNumber: finalTicketNumber,
        priorityScore: analysisResult?.priorityScore || 85,
        category: formData.category,
        relatedRequests: 1,
        report: finalCitizenReport,
      });

      setCurrentStep('submitted');
    } catch (e) {
      console.error('Submission error:', e);
      setProcessingError('Failed to submit report to municipal ledger.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartNewReport = () => {
    handleCancelVoice();
    setTextInput('');
    setAnalysisResult(null);
    setMissingQueue([]);
    setCurrentMissingField(null);
    setFormData({
      language: LANGUAGE_METADATA[selectedLanguage].name,
      transcript: '',
      state: '',
      district: '',
      city: '',
      area: '',
      category: 'Road & Drainage',
      severity: 'HIGH',
      additionalDetails: '',
      photoUrl: null,
      provenance: {},
    });
    setSubmittedTicket(null);
    setCurrentStep('capture');
  };

  const handleAgentComplaintCreated = (complaint: MockAMCComplaint) => {
    // Map to CitizenReport for existing stores and views
    const mapped: CitizenReport = {
      id: complaint.id,
      ticketNumber: complaint.trackingId,
      ownerId: complaint.ownerId || currentUser.uid,
      timestamp: PROJECT_START_DISPLAY,
      timeAgo: 'Just now',
      inputMode: 'text',
      language: 'en',
      languageLabel: 'English',
      vernacularTranscript: complaint.citizenDescription,
      englishTranslation: complaint.aiSummary || complaint.citizenDescription,
      locationName: `${complaint.area || complaint.wardName}, Ahmedabad`,
      state: complaint.state || 'Gujarat',
      district: complaint.district || 'Ahmedabad',
      city: complaint.city || 'Ahmedabad',
      area: complaint.area || complaint.wardName,
      ward: `Ward ${complaint.wardId} (${complaint.wardName})`,
      category: complaint.category as any,
      categoryConfidence: 95.0,
      priorityScore: complaint.priorityScore || (complaint.priority === 'High' ? 90 : 75),
      severity: complaint.severity,
      status: complaint.status as any,
      evidenceImage: complaint.image || undefined,
      citizenClusterCount: 1,
      modelledImpactCitizens: 450,
      dispatchTargetHours: complaint.priority === 'High' ? 2 : 4,
      assignedDepartment: complaint.department,
      issueSummary: complaint.aiSummary,
      recommendedAction: `Routed to ${complaint.department} for inspection and repair.`,
      relatedRequestsCount: 1,
      hotspotClusterId: complaint.wardId,
      hotspotClusterName: complaint.wardName,
    };
    onSubmitNewReport(mapped);
  };

  return (
    <div className="desktop-container w-full lg:w-[calc(100%-64px)] lg:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-4 sm:space-y-6">
      {/* Primary Workflow Switcher: Civic Complaint Agent (Track 01) vs Voice Ingestion */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#356AE6] bg-[#EBF0FF] px-2.5 py-0.5 rounded-md border border-[#356AE6]/20">
              {workflowMode === 'agent' ? 'TRACK 01: CIVIC COMPLAINT AGENT' : 'VERNACULAR VOICE INGESTION'}
            </span>
            <span className="font-mono text-xs text-[#6B7280]">
              Garbathon 2026 AI Agent
            </span>
          </div>
          <h1 className="font-sans text-[24px] sm:text-[30px] font-bold text-[#15171A] tracking-tight mt-1">
            {workflowMode === 'agent' ? 'File Civic Complaint' : 'Report Civic Grievance'}
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#6B7280]">
            {workflowMode === 'agent'
              ? 'Upload a photo, let Gemini multimodal AI analyze the issue, identify the AMC ward, route to the department, and receive an official tracking ID.'
              : 'Speak naturally in your mother tongue. Words appear line-by-line in real time.'}
          </p>
        </div>

        {/* Workflow Mode Switcher */}
        <div className="inline-flex items-center p-1 bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setWorkflowMode('agent')}
            type="button"
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all inline-flex items-center gap-1.5 ${
              workflowMode === 'agent'
                ? 'bg-[#356AE6] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#15171A]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">smart_toy</span>
            <span>AI Complaint Agent</span>
          </button>

          <button
            onClick={() => setWorkflowMode('voice')}
            type="button"
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all inline-flex items-center gap-1.5 ${
              workflowMode === 'voice'
                ? 'bg-[#356AE6] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#15171A]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">mic</span>
            <span>Voice Mode</span>
          </button>
        </div>
      </div>

      {/* RENDER WORKFLOW MODE: AGENT (PRIMARY) */}
      {workflowMode === 'agent' && (
        <CivicComplaintAgentCard
          onComplaintCreated={handleAgentComplaintCreated}
          onNavigateToTracking={(id) => (onNavigateToTracking ? onNavigateToTracking(id) : onOpenDashboard())}
          onNavigateToDashboard={onOpenDashboard}
        />
      )}

      {/* RENDER WORKFLOW MODE: VOICE (PRESERVED EXISTING) */}
      {workflowMode === 'voice' && (
        <div className="space-y-6">

      {/* Error alert if any */}
      {processingError && (
        <div className="p-4 bg-[#FEE2E2] border border-[#DC2626]/30 rounded-xl text-xs font-mono text-[#DC2626] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{processingError}</span>
          </div>
          <button
            onClick={() => setProcessingError(null)}
            type="button"
            className="hover:underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* STEP 1: CAPTURE STATE */}
      {currentStep === 'capture' && (
        <div className="space-y-6 w-full lg:max-w-none">
          {/* Language Selection First */}
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onSelectLanguage={(lang) => setSelectedLanguage(lang)}
          />

          {/* Voice Input Section */}
          {inputMode === 'voice' && (
            <div className="space-y-5">
              {/* Voice Controls: Ready, Listening, Error */}
              {recorderState !== 'stopped' ? (
                <div className="space-y-4">
                  <VoiceControls
                    recorderState={recorderState}
                    selectedLanguage={selectedLanguage}
                    formattedDuration={formattedDuration}
                    frequencyData={frequencyData}
                    errorMessage={recorderError}
                    isPermissionDenied={isPermissionDenied}
                    onStartRecording={handleStartVoice}
                    onStopRecording={handleStopVoice}
                    onPauseRecording={pauseRecording}
                    onResumeRecording={resumeRecording}
                    onCancelRecording={handleCancelVoice}
                    onSwitchToText={() => setInputMode('text')}
                    onRetryPermission={handleStartVoice}
                  />

                  {/* REAL-TIME LINE-BY-LINE LIVE TRANSCRIPT RIGHT UNDER MICROPHONE */}
                  <LiveTranscript
                    finalSegments={finalSegments}
                    interimText={interimText}
                    isLiveRecording={recorderState === 'recording' || recorderState === 'paused'}
                    isSpeechSupported={isSpeechSupported}
                    languageLabel={LANGUAGE_METADATA[selectedLanguage].name}
                    onTranscriptChange={(txt) => setManualTranscript(txt)}
                    onClear={clearTranscript}
                    onSwitchToText={() => setInputMode('text')}
                  />
                </div>
              ) : (
                /* Stopped State: Recording Player & Analyze Voice Report button */
                <div className="space-y-4">
                  <RecordingPlayer
                    audioUrl={audioUrl}
                    formattedDuration={formattedDuration}
                    onReRecord={handleReRecord}
                    onDelete={handleCancelVoice}
                  />

                  {/* Verbatim / Confirmed Transcript */}
                  <LiveTranscript
                    finalSegments={finalSegments}
                    interimText={interimText}
                    isLiveRecording={false}
                    isSpeechSupported={isSpeechSupported}
                    languageLabel={LANGUAGE_METADATA[selectedLanguage].name}
                    onTranscriptChange={(txt) => setManualTranscript(txt)}
                    onClear={clearTranscript}
                    onReRecord={handleReRecord}
                  />

                  {/* Analyze Voice Report Action Button */}
                  <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5E7EB] shadow-xs text-center space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-sans text-[18px] font-semibold text-[#15171A]">
                        AUDIO RECORDING READY FOR GEMINI ANALYSIS
                      </h3>
                      <p className="font-sans text-xs text-[#6B7280]">
                        Gemini will process the actual audio waveform, generate the verbatim transcript in {LANGUAGE_METADATA[selectedLanguage].nativeName}, classify the infrastructure defect, and detect any missing details.
                      </p>
                    </div>

                    <button
                      onClick={handleAnalyzeVoiceReport}
                      type="button"
                      className="px-8 py-3 bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl font-sans text-sm font-semibold transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 transform active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[20px]">psychology</span>
                      <span>Analyze Voice Report</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Text Input Section (Fallback Mode) */}
          {inputMode === 'text' && (
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="space-y-1">
                <span className="font-mono text-xs font-semibold text-[#356AE6] uppercase tracking-wider">
                  TEXT GRIEVANCE INGESTION
                </span>
                <h2 className="font-sans text-[20px] font-semibold text-[#15171A]">
                  Type your civic issue ({LANGUAGE_METADATA[selectedLanguage].nativeName})
                </h2>
                <p className="font-sans text-xs text-[#6B7280]">
                  Describe the situation in your own words. Gemini will structure the report and identify any missing details.
                </p>
              </div>

              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={5}
                className="w-full p-4 text-sm font-sans bg-[#F7F6F2] rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#356AE6]/30 text-[#15171A]"
                placeholder={LANGUAGE_METADATA[selectedLanguage].sampleUtterance}
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setInputMode('voice')}
                  type="button"
                  className="text-xs font-sans text-[#6B7280] hover:text-[#15171A] inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">mic</span>
                  <span>Switch to Voice</span>
                </button>

                <button
                  onClick={handleAnalyzeTextReport}
                  disabled={!textInput.trim() || isProcessing}
                  type="button"
                  className="px-6 py-2.5 bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl font-sans text-sm font-semibold transition-colors shadow-xs disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <span>Analyze Report</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: PROCESSING STATE */}
      {currentStep === 'processing' && (
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-8 max-w-xl mx-auto space-y-6 shadow-xs text-center">
          <div className="w-14 h-14 rounded-full bg-[#EBF0FF] text-[#356AE6] mx-auto flex items-center justify-center animate-spin">
            <span className="material-symbols-outlined text-[28px]">sync</span>
          </div>

          <div className="space-y-1">
            <h3 className="font-sans text-[20px] font-semibold text-[#15171A]">
              Understanding your report...
            </h3>
            <p className="font-sans text-xs text-[#6B7280]">
              Gemini Multimodal AI is transcribing vernacular audio and synthesizing civic intelligence.
            </p>
          </div>

          {/* Sequential real processing checklist */}
          <div className="bg-[#F7F6F2] rounded-xl p-4 border border-[#E5E7EB] space-y-2.5 text-left max-w-sm mx-auto font-mono text-xs">
            <div className="flex items-center gap-2 text-[#059669]">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Audio received</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                processingStage >= 2 ? 'text-[#059669]' : 'text-[#6B7280]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {processingStage >= 2 ? 'check_circle' : 'circle'}
              </span>
              <span>Language identified ({LANGUAGE_METADATA[selectedLanguage].name})</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                processingStage >= 3 ? 'text-[#059669]' : 'text-[#6B7280]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {processingStage >= 3 ? 'check_circle' : 'circle'}
              </span>
              <span>Speech understood</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                processingStage >= 4
                  ? 'text-[#059669]'
                  : processingStage === 3
                  ? 'text-[#356AE6] font-semibold animate-pulse'
                  : 'text-[#6B7280]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {processingStage >= 4 ? 'check_circle' : 'radio_button_checked'}
              </span>
              <span>Structuring report</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                processingStage >= 5 ? 'text-[#059669]' : 'text-[#6B7280]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {processingStage >= 5 ? 'check_circle' : 'circle'}
              </span>
              <span>Checking missing information</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                processingStage >= 6 ? 'text-[#059669]' : 'text-[#6B7280]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {processingStage >= 6 ? 'check_circle' : 'circle'}
              </span>
              <span>Preparing recommendation</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: FOLLOW-UP QUESTION STATE */}
      {currentStep === 'followup' && currentMissingField && (
        <div className="w-full max-w-2xl lg:max-w-3xl mx-auto space-y-4">
          <FollowUpQuestion
            missingField={currentMissingField}
            questionText={followUpQuestionText}
            selectedLanguage={selectedLanguage}
            isProcessing={isProcessing}
            onAnswerText={handleFollowUpAnswerText}
            onAnswerVoice={handleFollowUpAnswerVoice}
            onEnterManually={() => setCurrentStep('edit')}
            onAddPhoto={(photo: string) => setFormData((p) => ({ ...p, photoUrl: photo }))}
            onSkip={() => {
              const remaining = missingQueue.filter((f) => f !== currentMissingField);
              setMissingQueue(remaining);
              if (remaining.length > 0) {
                setCurrentMissingField(remaining[0]);
              } else {
                setCurrentStep('analysis');
              }
            }}
          />
        </div>
      )}

      {/* STEP 4: AI ANALYSIS RESULT */}
      {currentStep === 'analysis' && analysisResult && (
        <AIAnalysisCard
          analysis={analysisResult}
          onEditDetails={() => setCurrentStep('edit')}
          onReviewReport={() => setCurrentStep('review')}
          onAnswerMissingDetail={() => {
            if (analysisResult.missingInformation.length > 0) {
              setMissingQueue(analysisResult.missingInformation);
              setCurrentMissingField(analysisResult.missingInformation[0]);
              setCurrentStep('followup');
            }
          }}
        />
      )}

      {/* STEP 5: EDIT DETAILS */}
      {currentStep === 'edit' && (
        <ReportDetails
          formData={formData}
          onChange={(updated) => setFormData(updated)}
          onProceedToReview={() => setCurrentStep('review')}
          onBack={() => setCurrentStep('analysis')}
        />
      )}

      {/* STEP 6: FINAL REVIEW */}
      {currentStep === 'review' && (
        <ReportReview
          formData={formData}
          issueSummary={analysisResult?.issueSummary || ''}
          recommendedAction={analysisResult?.recommendedAction || ''}
          isSubmitting={isProcessing}
          onEdit={() => setCurrentStep('edit')}
          onSubmit={handleSubmitFinalReport}
        />
      )}

      {/* STEP 7: SUBMISSION CONFIRMATION */}
      {currentStep === 'submitted' && submittedTicket && (
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-5 sm:p-8 lg:p-10 max-w-2xl lg:max-w-3xl mx-auto space-y-5 sm:space-y-6 shadow-sm text-center w-full">
          <div className="w-16 h-16 rounded-full bg-[#ECFDF5] text-[#059669] mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px]">check_circle</span>
          </div>

          <div className="space-y-1">
            <span className="font-mono text-xs uppercase tracking-wider text-[#059669] font-semibold">
              REPORT SUBMITTED TO MUNICIPAL QUEUE
            </span>
            <h2 className="font-sans text-[22px] sm:text-[26px] font-bold text-[#15171A]">
              Reference: {submittedTicket.ticketNumber}
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#6B7280]">
              Your grievance has been structured by Gemini and assigned to the municipal ward engineering unit.
            </p>
          </div>

          {/* Ticket Metadata Card */}
          <div className="bg-[#F7F6F2] rounded-xl p-4 sm:p-5 border border-[#E5E7EB] text-left grid grid-cols-2 gap-3 sm:gap-4 font-mono text-xs">
            <div>
              <span className="text-[#6B7280] block">AI ANALYSIS</span>
              <span className="text-[#059669] font-bold">Complete</span>
            </div>
            <div>
              <span className="text-[#6B7280] block">CATEGORY</span>
              <span className="text-[#15171A] font-bold">{submittedTicket.category}</span>
            </div>
            <div>
              <span className="text-[#6B7280] block">PROTOTYPE PRIORITY</span>
              <span className="text-[#DC2626] font-bold">
                {submittedTicket.priorityScore} / 100
              </span>
            </div>
            <div>
              <span className="text-[#6B7280] block">RELATED REQUESTS</span>
              <span className="text-[#356AE6] font-bold">
                {submittedTicket.relatedRequests} in cluster
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onViewRequestDetail && (
              <button
                type="button"
                onClick={() => onViewRequestDetail(submittedTicket.report)}
                className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl font-sans text-sm font-semibold transition-colors shadow-xs inline-flex items-center justify-center"
              >
                View Report
              </button>
            )}

            <button
              type="button"
              onClick={onOpenDashboard}
              className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] bg-[#F7F6F2] hover:bg-[#EBEAE4] text-[#15171A] rounded-xl font-sans text-sm font-semibold transition-colors border border-[#E5E7EB] inline-flex items-center justify-center"
            >
              Open Dashboard
            </button>

            <button
              type="button"
              onClick={handleStartNewReport}
              className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-xs text-[#6B7280] hover:text-[#15171A] rounded-xl transition-colors inline-flex items-center justify-center"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      )}
      </div>
      )}
    </div>
  );
};
