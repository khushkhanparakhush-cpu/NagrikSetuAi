import React from 'react';
import { RecorderState } from '../hooks/useAudioRecorder';
import { LanguageCode, LANGUAGE_METADATA } from './LanguageSelector';

interface VoiceControlsProps {
  recorderState: RecorderState;
  selectedLanguage: LanguageCode;
  formattedDuration: string;
  frequencyData: number[];
  errorMessage: string | null;
  isPermissionDenied: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onCancelRecording: () => void;
  onSwitchToText: () => void;
  onRetryPermission?: () => void;
  compact?: boolean;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  recorderState,
  selectedLanguage,
  formattedDuration,
  frequencyData,
  errorMessage,
  isPermissionDenied,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onCancelRecording,
  onSwitchToText,
  onRetryPermission,
  compact = false,
}) => {
  const langMeta = LANGUAGE_METADATA[selectedLanguage];

  // Permission / Device Error Screen
  if (recorderState === 'error') {
    return (
      <div className="bg-[#FFFFFF] border border-[#DC2626]/30 rounded-2xl p-6 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#DC2626]/10 text-[#DC2626] mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-[28px]">mic_off</span>
        </div>
        <div className="space-y-1">
          <h3 className="font-sans text-[18px] font-semibold text-[#15171A]">
            {isPermissionDenied ? 'MICROPHONE ACCESS NEEDED' : 'MICROPHONE ISSUE'}
          </h3>
          <p className="font-sans text-[14px] text-[#6B7280] max-w-md mx-auto">
            {errorMessage || 'Allow microphone access to report your issue by voice.'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          {onRetryPermission && (
            <button
              onClick={onRetryPermission}
              type="button"
              className="px-4 py-2 bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl font-sans text-sm font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>Try Again</span>
            </button>
          )}
          <button
            onClick={onSwitchToText}
            type="button"
            className="px-4 py-2 bg-[#F7F6F2] hover:bg-[#EBEAE4] text-[#15171A] rounded-xl font-sans text-sm font-medium transition-colors inline-flex items-center gap-1.5 border border-[#E5E7EB]"
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            <span>Use Text Instead</span>
          </button>
        </div>
      </div>
    );
  }

  // Active Recording Screen
  if (recorderState === 'recording' || recorderState === 'paused') {
    return (
      <div className="bg-[#FFFFFF] border border-[#356AE6]/40 rounded-2xl p-6 sm:p-8 lg:p-10 space-y-6 shadow-xs text-center w-full">
        {/* Status & Timer */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#DC2626] animate-ping" />
            <span className="font-mono text-xs font-semibold text-[#DC2626] uppercase tracking-wider">
              {recorderState === 'paused' ? 'PAUSED' : `LISTENING IN ${langMeta.name.toUpperCase()}`}
            </span>
          </div>

          <div className="font-mono text-lg font-semibold text-[#15171A] tabular-nums bg-[#F7F6F2] px-3 py-1 rounded-lg border border-[#E5E7EB]">
            {formattedDuration}
          </div>
        </div>

        {/* Central Recording Indicator */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center ring-4 ring-[#DC2626]/20 animate-pulse">
            <span className="material-symbols-outlined text-[32px] sm:text-[40px]">
              mic
            </span>
          </div>
        </div>

        {/* Real Dynamic Audio Waveform (derived from AnalyserNode frequency data) */}
        <div className="space-y-2 w-full max-w-full">
          <div className="flex items-center justify-center gap-1 h-12 sm:h-14 px-2 sm:px-4 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB]/80 max-w-md mx-auto w-full overflow-hidden">
            {frequencyData.slice(0, 24).map((height, idx) => (
              <div
                key={idx}
                className="w-1.5 bg-[#356AE6] rounded-full transition-all duration-75"
                style={{
                  height: `${recorderState === 'paused' ? 6 : Math.max(4, height)}px`,
                  opacity: recorderState === 'paused' ? 0.3 : 0.85,
                }}
              />
            ))}
          </div>
          <p className="font-mono text-[11px] text-[#6B7280]">
            Speak naturally. AI transcribes line-by-line in real-time below.
          </p>
        </div>

        {/* Recording Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1">
          {recorderState === 'recording' ? (
            <button
              onClick={onPauseRecording}
              type="button"
              className="px-3.5 sm:px-4 py-2.5 bg-[#F7F6F2] hover:bg-[#EBEAE4] text-[#15171A] rounded-xl font-sans text-xs sm:text-sm font-medium transition-colors inline-flex items-center gap-1.5 border border-[#E5E7EB] min-h-[44px]"
            >
              <span className="material-symbols-outlined text-[18px]">pause</span>
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={onResumeRecording}
              type="button"
              className="px-3.5 sm:px-4 py-2.5 bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl font-sans text-xs sm:text-sm font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs min-h-[44px]"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>Resume</span>
            </button>
          )}

          <button
            onClick={onStopRecording}
            type="button"
            className="px-5 sm:px-6 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl font-sans text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-2 shadow-xs min-h-[44px]"
          >
            <span className="material-symbols-outlined text-[19px]">stop_circle</span>
            <span>Stop Recording</span>
          </button>

          <button
            onClick={onCancelRecording}
            type="button"
            className="px-3 sm:px-4 py-2.5 text-[#6B7280] hover:text-[#15171A] hover:bg-[#F7F6F2] rounded-xl font-sans text-xs sm:text-sm font-medium transition-colors min-h-[44px]"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Compact Mode (for Follow-up questions)
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onStartRecording}
          type="button"
          className="px-3.5 py-2 bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl font-sans text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px]">mic</span>
          <span>🎙 Answer by Voice ({langMeta.nativeName})</span>
        </button>
      </div>
    );
  }

  // Default: READY TO LISTEN state
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 lg:p-10 space-y-6 lg:space-y-8 shadow-xs text-center w-full">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF0FF] text-[#356AE6] font-mono text-xs font-medium border border-[#356AE6]/20">
          <span className="w-2 h-2 rounded-full bg-[#356AE6] animate-pulse" />
          <span>READY TO LISTEN • {langMeta.name.toUpperCase()} ({langMeta.nativeName})</span>
        </div>
        <h2 className="font-sans text-[22px] sm:text-[24px] font-semibold text-[#15171A]">
          REPORT WITH YOUR VOICE
        </h2>
        <p className="font-sans text-[14px] text-[#6B7280] max-w-md lg:max-w-xl mx-auto">
          Describe your problem naturally. AI will transcribe your speech and structure your report into municipal action.
        </p>
      </div>

      {/* Large Microphone Hero Control */}
      <div className="flex flex-col items-center justify-center gap-3">
        <button
          onClick={onStartRecording}
          type="button"
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#356AE6] hover:bg-[#2B58C7] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 group focus:outline-none ring-4 ring-[#356AE6]/20"
          aria-label="Start Speaking"
        >
          <span className="material-symbols-outlined text-[36px] sm:text-[42px] group-hover:animate-pulse">
            mic
          </span>
        </button>

        <button
          onClick={onStartRecording}
          type="button"
          className="font-sans text-sm font-semibold text-[#356AE6] hover:underline"
        >
          START SPEAKING ({langMeta.promptHint})
        </button>
      </div>

      {/* Helper text & Sample Utterance */}
      <div className="bg-[#F7F6F2] rounded-xl p-4 lg:p-5 border border-[#E5E7EB] text-left max-w-lg lg:max-w-2xl mx-auto space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-[#6B7280]">
          <span>Helper guide:</span>
          <span>Natural speech</span>
        </div>
        <p className="font-sans text-xs text-[#15171A] italic">
          “{langMeta.sampleUtterance}”
        </p>
        <p className="font-sans text-[11px] text-[#6B7280]">
          Tip: You can mention the issue, affected area/street, and urgency. If any details are missing, the AI will politely ask you follow-up questions.
        </p>
      </div>

      {/* Alternative Action */}
      <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-center">
        <button
          onClick={onSwitchToText}
          type="button"
          className="px-4 py-2 text-xs font-medium text-[#6B7280] hover:text-[#15171A] hover:bg-[#F7F6F2] rounded-lg transition-colors inline-flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">keyboard</span>
          <span>Use Text Instead</span>
        </button>
      </div>
    </div>
  );
};
