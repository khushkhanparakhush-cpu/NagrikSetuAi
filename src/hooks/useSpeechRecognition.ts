import { useState, useRef, useEffect, useCallback } from 'react';

interface UseSpeechRecognitionOptions {
  language: 'en' | 'hi';
  onInterimTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
}

export function useSpeechRecognition({
  language,
  onInterimTranscript,
  onFinalTranscript,
}: UseSpeechRecognitionOptions) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [finalSegments, setFinalSegments] = useState<string[]>([]);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);

  // Initialize SpeechRecognition instance if available
  useEffect(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      setIsSupported(true);
      const instance = new SpeechRecognitionClass();
      instance.continuous = true;
      instance.interimResults = true;
      instance.maxAlternatives = 1;
      recognitionRef.current = instance;
    } else {
      setIsSupported(false);
    }

    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Set language code (Indian English en-IN or Hindi hi-IN)
  const getLangCode = useCallback((lang: 'en' | 'hi') => {
    switch (lang) {
      case 'hi':
        return 'hi-IN';
      case 'en':
      default:
        return 'en-IN';
    }
  }, []);

  // Update language dynamically on instance
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = getLangCode(language);
    }
  }, [language, getLangCode]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    shouldListenRef.current = true;
    setFinalSegments([]);
    setInterimText('');

    try {
      recognitionRef.current.lang = getLangCode(language);

      recognitionRef.current.onresult = (event: any) => {
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const transcriptFragment = res[0]?.transcript || '';

          if (res.isFinal) {
            const trimmed = transcriptFragment.trim();
            if (trimmed) {
              setFinalSegments((prev) => {
                const updated = [...prev, trimmed];
                if (onFinalTranscript) onFinalTranscript(updated.join(' '));
                return updated;
              });
            }
          } else {
            currentInterim += transcriptFragment;
          }
        }

        const trimmedInterim = currentInterim.trim();
        setInterimText(trimmedInterim);
        if (trimmedInterim && onInterimTranscript) {
          onInterimTranscript(trimmedInterim);
        }
      };

      recognitionRef.current.onerror = (e: any) => {
        // Non-fatal error; audio recording continues uninterrupted
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('SpeechRecognition live event notice:', e?.error);
        }
      };

      recognitionRef.current.onend = () => {
        // If recording is still supposed to be active, auto-restart continuous recognition
        if (shouldListenRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Already started or restarting
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.warn('Could not start live SpeechRecognition:', e);
    }
  }, [language, getLangCode, onInterimTranscript, onFinalTranscript]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setFinalSegments([]);
    setInterimText('');
  }, []);

  const setManualTranscript = useCallback((text: string) => {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    setFinalSegments(lines.length > 0 ? lines : [text]);
    setInterimText('');
  }, []);

  // Compute full combined transcript string
  const fullTranscript = [...finalSegments, interimText]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' ');

  return {
    isSupported,
    isListening,
    finalSegments,
    interimText,
    fullTranscript,
    startListening,
    stopListening,
    clearTranscript,
    setManualTranscript,
    setFinalSegments,
  };
}
