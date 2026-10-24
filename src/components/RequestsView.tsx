import React, { useState } from 'react';
import { CitizenReport } from '../types/civic';
import { PROJECT_START_DISPLAY } from '../config/projectConfig';

interface RequestsViewProps {
  reports: CitizenReport[];
  onNavigateToReport: () => void;
  onUpdateReportStatus: (id: string, newStatus: CitizenReport['status']) => void;
  onViewRequestDetail: (report: CitizenReport) => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  reports,
  onNavigateToReport,
  onUpdateReportStatus,
  onViewRequestDetail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWard, setSelectedWard] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');

  const filteredReports = reports.filter((r) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        r.ticketNumber.toLowerCase().includes(q) ||
        r.vernacularTranscript.toLowerCase().includes(q) ||
        r.englishTranslation.toLowerCase().includes(q) ||
        r.locationName.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedWard !== 'All' && !r.ward.includes(selectedWard)) return false;
    if (selectedCategory !== 'All' && !r.category.includes(selectedCategory)) return false;
    if (selectedLanguage !== 'All' && r.language !== selectedLanguage) return false;
    if (selectedMode !== 'All' && r.inputMode !== selectedMode) return false;
    return true;
  });

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EBF0FF] text-[#356AE6] font-mono text-[11px] font-semibold tracking-wider uppercase border border-[#356AE6]/20">
              LIVE CITIZEN DATA
            </span>
            <span className="font-mono text-xs text-[#6B7280]">
              Starting {PROJECT_START_DISPLAY}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="font-sans text-[26px] sm:text-[30px] font-semibold text-[#15171A]">
              Citizen Demand Ledger
            </h1>
            <span className="px-2.5 py-0.5 rounded bg-[#EBEAE4] font-mono text-[11px] text-[#15171A] font-semibold">
              {reports.length} Records Ingested
            </span>
          </div>
          <p className="font-sans text-[14px] text-[#6B7280]">
            Anonymized multi-lingual grievance stream with GIS verification and automated semantic parsing.
          </p>
        </div>

        <button
          onClick={onNavigateToReport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl font-sans text-[13px] font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">mic</span>
          <span>Ingest New Voice Report</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E5E7EB] shadow-xs flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="w-full sm:flex-1 sm:min-w-[200px] flex items-center gap-2 px-3 py-1.5 bg-[#F7F6F2] rounded-lg border border-[#E5E7EB]">
          <span className="material-symbols-outlined text-[18px] text-[#9CA3AF]">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tickets, transcripts, keywords, or locations..."
            className="w-full text-xs font-sans bg-transparent focus:outline-none text-[#15171A]"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-[#9CA3AF] hover:text-[#15171A]">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Input Mode Filter */}
        <div className="flex items-center gap-1.5 bg-[#F7F6F2] px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-mono">
          <span className="text-[#6B7280]">Mode:</span>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="bg-transparent text-[#15171A] focus:outline-none cursor-pointer"
          >
            <option value="All">All Modes</option>
            <option value="voice">Voice Only</option>
            <option value="text">Text Only</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 bg-[#F7F6F2] px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-mono">
          <span className="text-[#6B7280]">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent text-[#15171A] focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Road">Road & Drainage</option>
            <option value="Waste">Waste Management</option>
            <option value="Water">Water Supply</option>
            <option value="Streetlighting">Streetlighting</option>
            <option value="Health">Public Health</option>
          </select>
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-1.5 bg-[#F7F6F2] px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-mono">
          <span className="text-[#6B7280]">Language:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-transparent text-[#15171A] focus:outline-none cursor-pointer"
          >
            <option value="All">All Languages</option>
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
        </div>
      </div>

      {/* Empty State or Data Table */}
      {reports.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-2xl border-2 border-dashed border-[#D1D5DB] p-10 sm:p-14 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF0FF] text-[#356AE6] mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">folder_open</span>
          </div>
          <div className="space-y-1">
            <h3 className="font-sans text-xl font-bold text-[#15171A]">
              Your civic intelligence workspace is ready.
            </h3>
            <p className="font-sans text-sm text-[#6B7280] max-w-md mx-auto">
              New citizen reports will appear here as they are submitted and analyzed.
            </p>
          </div>
          <button
            onClick={onNavigateToReport}
            className="px-6 py-2.5 bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl font-sans text-xs font-semibold shadow-xs inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">mic</span>
            <span>Report the First Issue</span>
          </button>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-[#FFFFFF] p-8 rounded-xl border border-[#E5E7EB] text-center text-xs font-mono text-[#6B7280]">
          No citizen requests match the selected search or filter criteria.
        </div>
      ) : (
        <div className="bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F6F2] border-b border-[#E5E7EB] font-mono text-[11px] text-[#6B7280] uppercase tracking-wider">
                  <th className="py-2.5 px-4">Ticket</th>
                  <th className="py-2.5 px-4">Language & Transcript</th>
                  <th className="py-2.5 px-4">Location / Ward</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-center">Priority</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs font-sans">
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => onViewRequestDetail(report)}
                    className="hover:bg-[#F7F6F2] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-[#15171A]">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-[#356AE6]">
                          {report.inputMode === 'voice' ? 'mic' : 'edit_note'}
                        </span>
                        <span>{report.ticketNumber}</span>
                      </div>
                      <div className="text-[10px] text-[#6B7280] font-normal pl-5">{PROJECT_START_DISPLAY}</div>
                    </td>

                    <td className="py-3 px-4 max-w-sm">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-[#EBF0FF] text-[#356AE6] font-mono text-[10px] font-semibold">
                          {report.languageLabel}
                        </span>
                      </div>
                      <div className="font-medium text-[#15171A] truncate">
                        {report.vernacularTranscript}
                      </div>
                      <div className="text-[#6B7280] text-[11px] truncate italic">
                        "{report.englishTranslation}"
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-[#15171A]">{report.locationName}</div>
                      <div className="text-[11px] text-[#6B7280] font-mono">{report.ward}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#EBF0FF] text-[#356AE6] font-mono text-[11px]">
                        {report.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          report.priorityScore >= 80
                            ? 'bg-[#FEE2E2] text-[#DC2626]'
                            : report.priorityScore >= 60
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {report.priorityScore}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#6B7280]">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            report.status === 'PWD Dispatched' || report.status === 'Prioritized'
                              ? 'bg-[#356AE6] animate-pulse'
                              : report.status === 'Resolved & Anonymized'
                              ? 'bg-[#059669]'
                              : 'bg-[#9CA3AF]'
                          }`}
                        ></span>
                        <span>{report.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewRequestDetail(report);
                        }}
                        className="px-2.5 py-1 text-[#356AE6] hover:bg-[#EBF0FF] rounded font-medium transition-colors"
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
