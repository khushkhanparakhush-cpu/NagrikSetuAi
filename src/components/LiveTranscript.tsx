import React, { useState, useEffect, useRef } from 'react';

interface LiveTranscriptProps {
  finalSegments: string[];
  interimText: string;
  isLiveRecording: boolean;
  isSpeechSupported: boolean;
  languageLabel: string;
  onTranscriptChange: (newFullText: string) => void;
  onClear: () => void;
  onReRecord?: () => void;
  onSwitchToText?: () => void;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  finalSegments,
  interimText,
  isLiveRecording,
  isSpeechSupported,
  languageLabel,
  onTranscriptChange,
  onClear,
  onSwitchToText,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomMarkerRef = useRef<HTMLDivElement>(null);

  const fullTranscript = [...finalSegments, interimText]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' ');

  // Auto-scroll to latest recognized phrase line-by-line
  useEffect(() => {
    if (bottomMarkerRef.current) {
      bottomMarkerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [finalSegments, interimText]);

  // Sync edit text when full transcript updates while not editing
  useEffect(() => {
    if (!isEditing) {
      setEditText(finalSegments.join('\n'));
    }
  }, [finalSegments, isEditing]);

  const handleStartEditing = () => {
    setEditText(finalSegments.join('\n') || fullTranscript);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onTranscriptChange(editText);
    setIsEditing(false);
  };

  const hasAnyText = finalSegments.length > 0 || Boolean(interimText.trim());

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-5 space-y-3.5 shadow-xs transition-all">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
        <div className="flex items-center gap-2">
          {isLiveRecording ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-pulse" />
              <span className="font-mono text-xs font-bold text-[#DC2626] uppercase tracking-wider">
                LIVE TRANSCRIPT
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#356AE6]">format_quote</span>
              <span className="font-mono text-xs font-semibold text-[#15171A] uppercase tracking-wider">
                VERBATIM TRANSCRIPT
              </span>
            </div>
          )}

          <span className="font-mono text-[10px] text-[#6B7280] bg-[#F7F6F2] px-2 py-0.5 rounded border border-[#E5E7EB]">
            {languageLabel}
          </span>
        </div>

        {/* Actions when not recording */}
        {!isLiveRecording && (
          <div className="flex items-center gap-2">
            {!isEditing && hasAnyText && (
              <button
                onClick={handleStartEditing}
                type="button"
                className="text-xs font-sans text-[#356AE6] hover:underline inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                <span>Edit Text</span>
              </button>
            )}

            {hasAnyText && (
              <button
                onClick={onClear}
                type="button"
                className="text-xs font-sans text-[#6B7280] hover:text-[#DC2626] inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">clear</span>
                <span>Clear</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Speech fallback warning if live browser recognition is unavailable */}
      {!isSpeechSupported && isLiveRecording && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0">
              info
            </span>
            <span>
              Live transcription is unavailable in this browser. Your recording can still be processed where supported.
            </span>
          </div>
          {onSwitchToText && (
            <button
              onClick={onSwitchToText}
              type="button"
              className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-medium text-xs self-start sm:self-auto shrink-0 transition-colors"
            >
              Use Text Instead
            </button>
          )}
        </div>
      )}

      {/* Editing Mode */}
      {isEditing ? (
        <div className="space-y-2.5">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={4}
            className="w-full p-3.5 text-sm font-sans bg-[#F7F6F2] rounded-xl border border-[#356AE6]/40 focus:outline-none focus:ring-2 focus:ring-[#356AE6]/20 text-[#15171A] leading-relaxed"
            placeholder="Edit your speech transcript line-by-line..."
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              type="button"
              className="px-3 py-1.5 text-xs text-[#6B7280] hover:bg-[#F7F6F2] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              type="button"
              className="px-3.5 py-1.5 text-xs bg-[#356AE6] text-white rounded-lg font-medium shadow-xs hover:bg-[#2B58C7] transition-colors"
            >
              Save Transcript
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="min-h-[100px] max-h-[220px] overflow-y-auto overflow-x-hidden bg-[#F7F6F2] rounded-xl p-3 sm:p-4 border border-[#E5E7EB] text-sm font-sans space-y-2 w-full max-w-full"
        >
          {hasAnyText ? (
            <div className="space-y-1.5 w-full">
              {/* Confirmed Segments: Dark normal text, line-by-line */}
              {finalSegments.map((segment, index) => (
                <div
                  key={index}
                  className="text-[#15171A] font-medium leading-relaxed flex items-start gap-2 break-words [overflow-wrap:anywhere] animate-fadeIn"
                >
                  <span className="text-[#9CA3AF] text-xs font-mono select-none pt-0.5 shrink-0">
                    {index + 1}.
                  </span>
                  <span className="flex-1 min-w-0 break-words [overflow-wrap:anywhere]">{segment}</span>
                </div>
              ))}

              {/* Interim Text: Currently recognized phrase, lighter/blue text */}
              {interimText && (
                <div className="text-[#356AE6] italic leading-relaxed flex items-start gap-2 pl-2 break-words [overflow-wrap:anywhere]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#356AE6] mt-2 shrink-0 animate-ping" />
                  <span className="flex-1 min-w-0 font-normal opacity-90 break-words [overflow-wrap:anywhere]">{interimText}...</span>
                </div>
              )}
            </div>
          ) : isLiveRecording ? (
            <div className="py-4 text-center space-y-1 px-2">
              <p className="text-[#356AE6] font-medium animate-pulse text-xs sm:text-sm">
                {isSpeechSupported
                  ? 'Listening... speak now, words will appear here in real time.'
                  : 'Recording audio... Gemini AI will transcribe your full statement when stopped.'}
              </p>
              <p className="text-xs text-[#9CA3AF] break-words">
                {languageLabel.toLowerCase().includes('hindi')
                  ? 'Example: “बारिश के बाद स्कूल के पास सड़क पर पानी भर जाता है और सड़क खराब हो गई है।”'
                  : 'Example: “The road outside the school has large potholes and becomes flooded during heavy rain.”'}
              </p>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-[#6B7280] italic text-xs">
                No speech detected yet. Click the microphone above to start speaking.
              </p>
            </div>
          )}

          <div ref={bottomMarkerRef} />
        </div>
      )}

      {/* Live recognition status indicator */}
      {isLiveRecording && (
        <div className="flex items-center justify-between text-[11px] font-mono text-[#6B7280] pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
            {isSpeechSupported
              ? 'Real-time interim recognition active'
              : 'Direct audio recording active'}
          </span>
          <span>{finalSegments.length} phrase(s) confirmed</span>
        </div>
      )}
    </div>
  );
};
