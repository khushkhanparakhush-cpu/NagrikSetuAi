import React, { useState } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { LanguageCode, LANGUAGE_METADATA } from './LanguageSelector';
import { searchCities } from '../data/locations';

interface FollowUpQuestionProps {
  missingField: string;
  questionText: string;
  selectedLanguage: LanguageCode;
  onAnswerText: (answer: string) => void;
  onAnswerVoice: (audioBase64: string, mimeType: string) => void;
  onSkip?: () => void;
  onEnterManually?: () => void;
  onAddPhoto?: (photoUrl: string) => void;
  isProcessing: boolean;
}

export const FollowUpQuestion: React.FC<FollowUpQuestionProps> = ({
  missingField,
  questionText,
  selectedLanguage,
  onAnswerText,
  onAnswerVoice,
  onSkip,
  onEnterManually,
  onAddPhoto,
  isProcessing,
}) => {
  const [typedAnswer, setTypedAnswer] = useState('');
  const [mode, setMode] = useState<'voice' | 'text'>('voice');

  const {
    state: recState,
    formattedDuration,
    audioBase64,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording,
  } = useAudioRecorder();

  const langMeta = LANGUAGE_METADATA[selectedLanguage];
  const isHindi = selectedLanguage === 'hi';

  const handleStartVoice = async () => {
    await startRecording();
  };

  const handleStopAndSubmitVoice = () => {
    stopRecording();
  };

  const handleSubmitTyped = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedAnswer.trim()) {
      onAnswerText(typedAnswer.trim());
      setTypedAnswer('');
    }
  };

  // Determine user-friendly prompt for any missing field
  const getPromptText = () => {
    if (questionText) return questionText;
    switch (missingField) {
      case 'city':
        return isHindi
          ? 'यह समस्या किस शहर या कस्बे में है?'
          : 'Which city or town is this issue located in?';
      case 'district':
        return isHindi
          ? 'यह किस जिले में है?'
          : 'Which district is this issue in?';
      case 'state':
        return isHindi
          ? 'यह किस राज्य या केंद्र शासित प्रदेश में स्थित है?'
          : 'Which State or Union Territory is this located in?';
      case 'area':
        return isHindi
          ? 'कौन सा क्षेत्र, कॉलोनी या मोहल्ला प्रभावित है?'
          : 'Which area, colony, or neighbourhood is affected?';
      case 'severity':
        return isHindi
          ? 'यह समस्या कितनी गंभीर है? क्या इसे तत्काल ध्यान देने की आवश्यकता है?'
          : 'How serious is the problem? Does it require urgent municipal attention?';
      default:
        return isHindi
          ? `कृपया ${missingField} के बारे में बताएं।`
          : `Could you clarify the ${missingField} for this report?`;
    }
  };

  return (
    <div className="bg-[#FFFFFF] border-2 border-[#356AE6] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm animate-fadeIn">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#356AE6] animate-pulse" />
          <span className="font-mono text-xs font-bold text-[#356AE6] uppercase tracking-wider">
            AI CLARIFICATION
          </span>
        </div>
        <span className="font-mono text-xs text-[#6B7280]">
          Field: <strong className="text-[#15171A] uppercase">{missingField}</strong>
        </span>
      </div>

      {/* Question Prompt */}
      <div className="bg-[#F7F6F2] p-4 rounded-xl border border-[#E5E7EB] space-y-1">
        <p className="font-sans text-[16px] font-semibold text-[#15171A]">
          {getPromptText()}
        </p>
        <p className="font-mono text-[11px] text-[#6B7280]">
          You can answer by voice in {langMeta.nativeName} or type below.
        </p>
      </div>

      {/* Missing Location Guidance (Requirement 15) */}
      {(missingField === 'city' || missingField === 'district' || missingField === 'area') && (
        <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#356AE6] font-medium">
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>I don't have enough location information yet.</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {onEnterManually && (
              <button
                type="button"
                onClick={onEnterManually}
                className="px-3 py-1.5 bg-white border border-[#356AE6]/30 text-[#356AE6] hover:bg-[#EBF0FF] rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Enter Manually
              </button>
            )}
            <button
              type="button"
              onClick={() => setMode('voice')}
              className="px-3 py-1.5 bg-[#356AE6] text-white hover:bg-[#2B58C7] rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Answer by Voice
            </button>
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="px-3 py-1.5 bg-white border border-gray-300 text-[#6B7280] hover:text-[#15171A] rounded-lg text-xs font-medium transition-colors"
              >
                Continue without exact area
              </button>
            )}
          </div>
        </div>
      )}

      {/* Severity Quick Buttons */}
      {missingField === 'severity' && (
        <div className="space-y-2">
          <span className="font-mono text-xs text-[#6B7280]">Quick Selection:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Low', value: 'LOW', color: 'bg-[#F7F6F2] text-[#15171A] border-[#E5E7EB]' },
              { label: 'Medium', value: 'MODERATE', color: 'bg-[#F7F6F2] text-[#15171A] border-[#E5E7EB]' },
              { label: 'High', value: 'HIGH', color: 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30' },
              { label: 'Critical', value: 'CRITICAL', color: 'bg-[#DC2626] text-white border-[#DC2626]' },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => onAnswerText(btn.label)}
                type="button"
                className={`py-2 px-3 rounded-xl font-sans text-xs font-semibold border transition-all text-center ${btn.color}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* City Quick Suggestions (India-Wide Major Hubs) */}
      {missingField === 'city' && (
        <div className="space-y-1.5">
          <span className="font-mono text-[11px] text-[#6B7280]">Example Cities across India:</span>
          <div className="flex flex-wrap gap-1.5">
            {['Pune', 'Jaipur', 'Lucknow', 'Bengaluru', 'Delhi', 'Mumbai', 'Ahmedabad', 'Kolkata'].map(
              (cityName) => (
                <button
                  key={cityName}
                  onClick={() => onAnswerText(cityName)}
                  type="button"
                  className="px-2.5 py-1 bg-[#F7F6F2] hover:bg-[#EBEAE4] text-xs font-sans rounded-lg border border-[#E5E7EB] text-[#15171A] transition-colors"
                >
                  {cityName}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Answer Mode Toggle */}
      <div className="flex items-center gap-2 border-t border-[#E5E7EB] pt-3">
        <button
          onClick={() => setMode('voice')}
          type="button"
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 ${
            mode === 'voice'
              ? 'bg-[#356AE6] text-white'
              : 'bg-[#F7F6F2] text-[#6B7280] hover:text-[#15171A]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">mic</span>
          <span>Answer by Voice</span>
        </button>

        <button
          onClick={() => setMode('text')}
          type="button"
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 ${
            mode === 'text'
              ? 'bg-[#356AE6] text-white'
              : 'bg-[#F7F6F2] text-[#6B7280] hover:text-[#15171A]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">keyboard</span>
          <span>Type Answer</span>
        </button>

        {onSkip && (
          <button
            onClick={onSkip}
            type="button"
            className="ml-auto text-xs text-[#6B7280] hover:underline"
          >
            Skip for now
          </button>
        )}
      </div>

      {/* Voice Answer Sub-Panel */}
      {mode === 'voice' && (
        <div className="bg-[#F7F6F2] rounded-xl p-4 border border-[#E5E7EB] text-center space-y-3">
          {recState === 'recording' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-ping" />
                <span className="font-mono text-xs font-bold text-[#DC2626]">
                  RECORDING ANSWER ({formattedDuration})
                </span>
              </div>
              <p className="font-sans text-xs text-[#6B7280]">
                Speak your answer now (e.g. “Pune” or “Kothrud” or “High severity”).
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleStopAndSubmitVoice}
                  type="button"
                  className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Done & Process Voice</span>
                </button>
                <button
                  onClick={cancelRecording}
                  type="button"
                  className="px-3 py-2 text-xs text-[#6B7280] hover:bg-[#EBEAE4] rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : recState === 'stopped' && audioBase64 ? (
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#059669] font-medium">
                ✓ Voice answer captured
              </span>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => onAnswerVoice(audioBase64, 'audio/webm')}
                  disabled={isProcessing}
                  type="button"
                  className="px-4 py-2 bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isProcessing ? 'Processing Answer...' : 'Submit Voice Answer'}
                </button>
                <button
                  onClick={resetRecording}
                  type="button"
                  className="px-3 py-2 text-xs text-[#6B7280] hover:bg-[#EBEAE4] rounded-xl"
                >
                  Re-speak
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleStartVoice}
                type="button"
                className="px-5 py-2.5 bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl font-sans text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">mic</span>
                <span>🎙 Speak Answer ({langMeta.promptHint})</span>
              </button>
              <p className="font-mono text-[10px] text-[#6B7280]">
                Click microphone to answer with speech.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Typed Answer Sub-Panel */}
      {mode === 'text' && (
        <form onSubmit={handleSubmitTyped} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Enter ${missingField} (e.g. Pune, Kothrud)...`}
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              className="flex-1 min-w-0 p-2.5 text-sm bg-[#F7F6F2] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#356AE6]/30 text-[#15171A]"
              autoFocus
            />
            <button
              type="submit"
              disabled={!typedAnswer.trim() || isProcessing}
              className="px-4 py-2.5 bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 shadow-xs shrink-0"
            >
              {isProcessing ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
