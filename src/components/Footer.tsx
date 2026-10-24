import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#FFFFFF] border-t border-[#E5E7EB] shadow-2xs py-2.5">
      <div className="desktop-container w-full lg:w-[calc(100%-64px)] lg:max-w-[1440px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[#6B7280] font-mono text-[10px] sm:text-[11px] text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
          <span className="font-bold text-[#15171A]">NAGRIKSETU AI</span>
          <span>•</span>
          <span>GARBATHON 2026 TRACK 01</span>
          <span>•</span>
          <span className="hidden md:inline">CIVIC COMPLAINT AGENT</span>
        </div>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-emerald-700 font-semibold">MOCK AMC SYSTEM SIMULATION</span>
          <span className="hidden sm:inline text-[#9CA3AF]">|</span>
          <span className="hidden sm:inline">NO REAL GOVT PORTAL CONNECTION</span>
        </div>
      </div>
    </footer>
  );
};
