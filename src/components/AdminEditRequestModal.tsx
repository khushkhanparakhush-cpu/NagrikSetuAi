import React, { useState } from 'react';
import { CitizenReport, CivicCategory, IssueSeverity, RequestStatus } from '../types/civic';

interface AdminEditRequestModalProps {
  report: CitizenReport | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<CitizenReport>) => Promise<boolean>;
}

export const AdminEditRequestModal: React.FC<AdminEditRequestModalProps> = ({
  report,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !report) return null;

  const [status, setStatus] = useState<RequestStatus>(report.status);
  const [category, setCategory] = useState<CivicCategory>(report.category);
  const [severity, setSeverity] = useState<IssueSeverity>(report.severity);
  const [assignedDepartment, setAssignedDepartment] = useState(
    report.assignedDepartment || 'AMC Infrastructure Division'
  );
  const [recommendedAction, setRecommendedAction] = useState(
    report.recommendedAction || ''
  );
  const [adminNote, setAdminNote] = useState(report.adminNote || '');
  const [resolutionNote, setResolutionNote] = useState(report.resolutionNote || '');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const ok = await onSave(report.id, {
        status,
        category,
        severity,
        assignedDepartment,
        recommendedAction,
        adminNote,
        resolutionNote,
      });

      if (ok) {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          onClose();
        }, 1200);
      } else {
        setErrorMsg('Failed to save changes. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error saving changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#FFFFFF] rounded-2xl w-full max-w-[calc(100vw-24px)] sm:max-w-xl p-4 sm:p-7 space-y-4 sm:space-y-5 shadow-2xl border border-[#E5E7EB] my-4 sm:my-8 max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3.5 gap-2">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] sm:text-xs font-bold text-[#DC2626] bg-[#FEE2E2] px-2 sm:px-2.5 py-0.5 rounded border border-[#DC2626]/20">
                ADMIN AUTHORIZED EDIT
              </span>
              <span className="font-mono text-xs text-[#6B7280]">
                #{report.ticketNumber}
              </span>
            </div>
            <h2 className="font-sans text-base sm:text-lg font-bold text-[#15171A]">
              Modify Report Records
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#6B7280] hover:text-[#15171A] rounded-lg transition-colors shrink-0"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#FEE2E2] text-[#DC2626] border border-[#DC2626]/20 rounded-xl text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {/* Immutable Fields Notice */}
        <div className="bg-[#F7F6F2] p-3 rounded-xl border border-[#E5E7EB] space-y-1.5 font-mono text-[11px] text-[#6B7280]">
          <div className="font-semibold text-[#15171A] uppercase">
            IMMUTABLE AUDIT IDENTIFIERS (READ-ONLY)
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs">
            <div>
              <span>Owner ID: </span>
              <strong className="text-[#15171A] truncate block">{report.ownerId}</strong>
            </div>
            <div>
              <span>Original Created: </span>
              <strong className="text-[#15171A] block">{report.timestamp}</strong>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
          {/* Status & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] font-semibold text-[#4B5563] uppercase mb-1">
                Workflow Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RequestStatus)}
                className="w-full p-2.5 min-h-[44px] bg-[#F7F6F2] border border-[#E5E7EB] rounded-xl font-medium text-xs text-[#15171A] focus:outline-none focus:ring-2 focus:ring-[#356AE6]/20"
              >
                <option value="Submitted">Submitted</option>
                <option value="Analyzed">Analyzed</option>
                <option value="PWD Dispatched">PWD Dispatched</option>
                <option value="Work In Progress">Work In Progress</option>
                <option value="Resolved & Anonymized">Resolved & Anonymized</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[11px] font-semibold text-[#4B5563] uppercase mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
                className="w-full p-2.5 min-h-[44px] bg-[#F7F6F2] border border-[#E5E7EB] rounded-xl font-medium text-xs text-[#15171A] focus:outline-none focus:ring-2 focus:ring-[#356AE6]/20"
              >
                <option value="LOW">LOW</option>
                <option value="MODERATE">MODERATE</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          {/* Category & Assigned Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] font-semibold text-[#4B5563] uppercase mb-1">
                Civic Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CivicCategory)}
                className="w-full p-2.5 min-h-[44px] bg-[#F7F6F2] border border-[#E5E7EB] rounded-xl font-medium text-xs text-[#15171A] focus:outline-none focus:ring-2 focus:ring-[#356AE6]/20"
              >
                <option value="Road & Drainage">Road & Drainage</option>
                <option value="Waste Management">Waste Management</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Streetlighting & Electrical">Streetlighting & Electrical</option>
                <option value="Public Health & Sanitation">Public Health & Sanitation</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[11px] font-semibold text-[#4B5563] uppercase mb-1">
                Assigned Department
              </label>
              <input
                type="text"
                value={assignedDepartment}
                onChange={(e) => setAssignedDepartment(e.target.value)}
                className="w-full p-2.5 min-h-[44px] bg-[#F7F6F2] border border-[#E5E7EB] rounded-xl text-xs text-[#15171A] focus:outline-none focus:ring-2 focus:ring-[#356AE6]/20"
                placeholder="e.g. AMC Road & Drainage Dept"
              />
            </div>
          </div>

          {/* Recommended Action */}
          <div>
            <label className="block font-mono text-[11px] font-semibold text-[#4B5563] uppercase mb-1">
              Recommended Municipal Action
            </label>
            <textarea
              value={recommendedAction}
              onChange={(e) => setRecommendedAction(e.target.value)}
              rows={2}
              className="w-full p-2.5 bg-[#F7F6F2] border border-[#E5E7EB] rounded-xl text-xs text-[#15171A] focus:outline-none focus:ring-2 focus:ring-[#356AE6]/20"
              placeholder="Technical municipal directive..."
            />
          </div>

          {/* Admin Note */}
          <div>
            <label className="block font-mono text-[11px] font-semibold text-[#4B5563] uppercase mb-1">
              Internal Admin Note (Officer Log)
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={2}
              className="w-full p-2.5 bg-[#F7F6F2] border border-[#E5E7EB] rounded-xl text-xs text-[#15171A] focus:outline-none focus:ring-2 focus:ring-[#356AE6]/20"
              placeholder="Audit log or administrative rationale..."
            />
          </div>

          {/* Resolution Note */}
          <div>
            <label className="block font-mono text-[11px] font-semibold text-[#4B5563] uppercase mb-1">
              Resolution Note (Visible to Citizen upon Closure)
            </label>
            <input
              type="text"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              className="w-full p-2.5 min-h-[44px] bg-[#F7F6F2] border border-[#E5E7EB] rounded-xl text-xs text-[#15171A] focus:outline-none focus:ring-2 focus:ring-[#356AE6]/20"
              placeholder="e.g. Drainage line cleared by Ward 12 engineering squad."
            />
          </div>

          {/* Footer Controls */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[44px] text-xs font-semibold text-[#6B7280] hover:text-[#15171A] rounded-xl transition-colors flex items-center justify-center"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving || saveSuccess}
              className={`px-6 py-2.5 min-h-[44px] rounded-xl font-sans text-xs font-semibold shadow-xs transition-all inline-flex items-center justify-center gap-2 ${
                saveSuccess
                  ? 'bg-[#059669] text-white ring-4 ring-[#059669]/20'
                  : 'bg-[#356AE6] hover:bg-[#2563EB] text-white'
              }`}
            >
              {saveSuccess ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-bounce">
                    check_circle
                  </span>
                  <span>Saved Successfully!</span>
                </>
              ) : isSaving ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
