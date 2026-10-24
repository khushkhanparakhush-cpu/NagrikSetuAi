import React, { useRef, useState, useEffect } from 'react';

interface RecordingPlayerProps {
  audioUrl: string | null;
  formattedDuration: string;
  onReRecord: () => void;
  onDelete: () => void;
}

export const RecordingPlayer: React.FC<RecordingPlayerProps> = ({
  audioUrl,
  formattedDuration,
  onReRecord,
  onDelete,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.warn('Audio playback error', e));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatSecs = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-5 space-y-4 shadow-xs">
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="metadata"
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
          <span className="font-mono text-xs font-semibold text-[#15171A] uppercase tracking-wider">
            VOICE CAPTURED
          </span>
        </div>
        <span className="font-mono text-xs text-[#6B7280]">
          Duration: {duration > 0 ? formatSecs(duration) : formattedDuration}
        </span>
      </div>

      {/* Playback Controls & Progress Bar */}
      <div className="bg-[#F7F6F2] rounded-xl p-3 border border-[#E5E7EB] flex items-center gap-3">
        <button
          onClick={togglePlay}
          type="button"
          disabled={!audioUrl}
          className="w-10 h-10 rounded-full bg-[#356AE6] hover:bg-[#2B58C7] text-white flex items-center justify-center transition-colors shadow-xs disabled:opacity-50"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        <div className="flex-1 space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 10}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full accent-[#356AE6] h-1.5 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between font-mono text-[10px] text-[#6B7280]">
            <span>{formatSecs(currentTime)}</span>
            <span>{formatSecs(duration || 0)}</span>
          </div>
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={onReRecord}
          type="button"
          className="px-3.5 py-1.5 text-xs font-medium text-[#15171A] hover:bg-[#F7F6F2] rounded-lg border border-[#E5E7EB] transition-colors inline-flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          <span>Re-record</span>
        </button>

        <button
          onClick={onDelete}
          type="button"
          className="px-3.5 py-1.5 text-xs font-medium text-[#DC2626] hover:bg-[#DC2626]/5 rounded-lg border border-[#DC2626]/20 transition-colors inline-flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
