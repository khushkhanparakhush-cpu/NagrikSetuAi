import React from 'react';

export type LanguageCode = 'en' | 'hi';

interface LanguageSelectorProps {
  selectedLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  compact?: boolean;
}

export const LANGUAGE_METADATA: Record<
  LanguageCode,
  {
    name: string;
    nativeName: string;
    promptHint: string;
    sampleUtterance: string;
    locale: string;
  }
> = {
  en: {
    name: 'English',
    nativeName: 'English',
    promptHint: 'Speak in English',
    sampleUtterance: 'The road outside the school is damaged and floods during heavy rain.',
    locale: 'en-IN',
  },
  hi: {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    promptHint: 'हिंदी में बोलें',
    sampleUtterance: 'बारिश के बाद स्कूल के पास सड़क पर पानी भर जाता है और सड़क खराब हो गई है।',
    locale: 'hi-IN',
  },
};

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
  compact = false,
}) => {
  if (compact) {
    return (
      <div
        role="group"
        aria-label="Language selection"
        className="flex items-center p-0.5 bg-[#FFFFFF] rounded-lg border border-[#E5E7EB] shadow-xs shrink-0"
      >
        {(['en', 'hi'] as const).map((lang) => {
          const isSelected = selectedLanguage === lang;
          return (
            <button
              key={lang}
              onClick={() => onSelectLanguage(lang)}
              type="button"
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                isSelected
                  ? 'bg-[#EBF0FF] text-[#356AE6] font-semibold shadow-xs border border-[#356AE6]/20'
                  : 'text-[#6B7280] hover:text-[#15171A] hover:bg-[#F7F6F2]'
              }`}
              aria-pressed={isSelected}
            >
              {LANGUAGE_METADATA[lang].nativeName}
            </button>
          );
        })}
      </div>
    );
  }

  // Responsive full-width segmented control for content views (Requirement 3 & 4)
  return (
    <div className="w-full max-w-full space-y-2">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <label className="font-mono text-xs uppercase tracking-wider text-[#15171A] font-bold">
          SELECT LANGUAGE
        </label>
        <span className="font-mono text-xs text-[#356AE6] font-semibold truncate">
          {LANGUAGE_METADATA[selectedLanguage].promptHint}
        </span>
      </div>

      <div
        role="group"
        aria-label="Choose reporting language"
        className="w-full flex p-1 bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] shadow-xs"
      >
        {(['en', 'hi'] as const).map((lang) => {
          const isSelected = selectedLanguage === lang;
          const meta = LANGUAGE_METADATA[lang];
          return (
            <button
              key={lang}
              type="button"
              onClick={() => onSelectLanguage(lang)}
              className={`flex-1 min-h-[44px] py-2 px-3 rounded-lg text-center transition-all flex items-center justify-center gap-2 select-none ${
                isSelected
                  ? 'bg-[#EBF0FF] text-[#356AE6] font-bold shadow-xs border border-[#356AE6]/30'
                  : 'text-[#6B7280] hover:text-[#15171A] hover:bg-[#F7F6F2] font-medium'
              }`}
              aria-pressed={isSelected}
            >
              <span className="font-sans text-sm sm:text-base">
                {meta.nativeName}
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] opacity-75 hidden sm:inline">
                ({meta.name})
              </span>
              {isSelected && (
                <span className="w-4 h-4 rounded-full bg-[#356AE6] text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[12px] leading-none">check</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
