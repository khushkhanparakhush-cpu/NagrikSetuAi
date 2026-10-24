import { useState, useRef, useEffect, useCallback } from 'react';

export type RecorderState =
  | 'idle'
  | 'requestingPermission'
  | 'recording'
  | 'paused'
  | 'stopped'
  | 'error';

export interface UseAudioRecorderReturn {
  state: RecorderState;
  audioBlob: Blob | null;
  audioUrl: string | null;
  audioBase64: string | null;
  recordingDuration: number;
  formattedDuration: string;
  audioLevel: number;
  frequencyData: number[];
  errorMessage: string | null;
  isPermissionDenied: boolean;
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<{ blob: Blob; base64: string; url: string } | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  cancelRecording: () => void;
  resetRecording: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<RecorderState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(32).fill(6));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const stopResolverRef = useRef<((val: { blob: Blob; base64: string; url: string } | null) => void) | null>(null);

  // Clean up all active tracks and audio context
  const cleanupTracksAndAudio = useCallback(() => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.error('Error stopping track', e);
        }
      });
      audioStreamRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.error('Error closing audioContext', e);
      }
      audioContextRef.current = null;
      analyserRef.current = null;
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  // Setup Web Audio Analyser for real audio input level & real waveform
  const setupAudioAnalyser = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64; // Gives 32 frequency bins
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        const normalizedBars: number[] = [];
        for (let i = 0; i < dataArray.length; i++) {
          const val = dataArray[i];
          sum += val;
          // Scale 0-255 to bar height between 4 and 40 px
          normalizedBars.push(Math.max(4, Math.round((val / 255) * 36) + 4));
        }

        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 255) * 100)));
        setFrequencyData(normalizedBars);

        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (e) {
      console.warn('AudioAnalyser setup not supported or failed', e);
    }
  };

  // Start recording
  const startRecording = useCallback(async (): Promise<boolean> => {
    // Cleanup previous if any
    cleanupTracksAndAudio();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioBlob(null);
    setAudioUrl(null);
    setAudioBase64(null);
    setRecordingDuration(0);
    setErrorMessage(null);
    setIsPermissionDenied(false);
    audioChunksRef.current = [];

    // Verify browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage(
        'Voice recognition is unavailable in this browser. You can report your issue using text.'
      );
      setState('error');
      return false;
    }

    try {
      setState('requestingPermission');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      audioStreamRef.current = stream;

      // Select supported mimeType
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/wav',
      ];
      let selectedMimeType = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }

      const recorder = selectedMimeType
        ? new MediaRecorder(stream, { mimeType: selectedMimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, {
          type: selectedMimeType || 'audio/webm',
        });
        setAudioBlob(finalBlob);

        const newUrl = URL.createObjectURL(finalBlob);
        setAudioUrl(newUrl);

        // Convert to base64 for API
        const reader = new FileReader();
        reader.onloadend = () => {
          const raw = reader.result as string;
          setAudioBase64(raw);
          if (stopResolverRef.current) {
            stopResolverRef.current({
              blob: finalBlob,
              base64: raw,
              url: newUrl,
            });
            stopResolverRef.current = null;
          }
        };
        reader.readAsDataURL(finalBlob);

        setState('stopped');
        cleanupTracksAndAudio();
      };

      recorder.start(250); // Collect data every 250ms
      setState('recording');

      // Start duration timer
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Start analyser
      setupAudioAnalyser(stream);

      return true;
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      cleanupTracksAndAudio();

      if (
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError' ||
        err.message?.includes('denied')
      ) {
        setIsPermissionDenied(true);
        setErrorMessage(
          'Microphone permission was denied. Allow microphone access to report your issue by voice, or continue with text.'
        );
      } else if (
        err.name === 'NotFoundError' ||
        err.name === 'DevicesNotFoundError'
      ) {
        setErrorMessage('No microphone was detected on this device.');
      } else {
        setErrorMessage(
          'Unable to access microphone. Please check your system audio settings or use text instead.'
        );
      }
      setState('error');
      return false;
    }
  }, [cleanupTracksAndAudio, audioUrl]);

  // Stop recording
  const stopRecording = useCallback((): Promise<{ blob: Blob; base64: string; url: string } | null> => {
    return new Promise((resolve) => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        stopResolverRef.current = resolve;
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.error('Error stopping recorder', e);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  }, []);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setState('paused');
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, []);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setState('recording');
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }
  }, []);

  // Cancel recording and discard data
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    cleanupTracksAndAudio();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioBase64(null);
    setRecordingDuration(0);
    setFrequencyData(new Array(32).fill(6));
    setAudioLevel(0);
    setErrorMessage(null);
    setState('idle');
  }, [cleanupTracksAndAudio, audioUrl]);

  // Reset for a fresh record
  const resetRecording = useCallback(() => {
    cancelRecording();
  }, [cancelRecording]);

  // Unmount cleanup
  useEffect(() => {
    return () => {
      cleanupTracksAndAudio();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [cleanupTracksAndAudio, audioUrl]);

  return {
    state,
    audioBlob,
    audioUrl,
    audioBase64,
    recordingDuration,
    formattedDuration: formatTime(recordingDuration),
    audioLevel,
    frequencyData,
    errorMessage,
    isPermissionDenied,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    resetRecording,
  };
}
