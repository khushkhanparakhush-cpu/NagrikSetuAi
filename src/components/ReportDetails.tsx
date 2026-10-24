import React, { useState } from 'react';
import { CivicCategory, IssueSeverity } from '../types/civic';
import { SearchableLocationPicker } from './SearchableLocationPicker';
import { validateLocation } from '../data/locations';

export type ProvenanceType = 'USER PROVIDED' | 'AI SUGGESTED' | 'AI GENERATED' | 'MISSING' | 'CANONICAL LOCATION';

export interface ReportFormData {
  language: string;
  transcript: string;
  state: string;
  stateId?: string;
  district: string;
  districtId?: string;
  city: string;
  cityId?: string;
  area: string;
  category: CivicCategory;
  severity: IssueSeverity;
  additionalDetails: string;
  photoUrl: string | null;
  provenance: Record<string, ProvenanceType>;
}

interface ReportDetailsProps {
  formData: ReportFormData;
  onChange: (updated: ReportFormData) => void;
  onProceedToReview: () => void;
  onBack: () => void;
}

export const ReportDetails: React.FC<ReportDetailsProps> = ({
  formData,
  onChange,
  onProceedToReview,
  onBack,
}) => {
  const [locationValidationError, setLocationValidationError] = useState<string | null>(null);

  const updateField = (field: keyof ReportFormData, value: any) => {
    onChange({
      ...formData,
      [field]: value,
      provenance: {
        ...formData.provenance,
        [field]: value ? 'USER PROVIDED' : 'MISSING',
      },
    });
  };

  const handleLocationChange = (loc: {
    state: string;
    district: string;
    city: string;
    area: string;
    stateId?: string;
    districtId?: string;
    cityId?: string;
  }) => {
    setLocationValidationError(null);
    onChange({
      ...formData,
      state: loc.state,
      stateId: loc.stateId,
      district: loc.district,
      districtId: loc.districtId,
      city: loc.city,
      cityId: loc.cityId,
      area: loc.area,
      provenance: {
        ...formData.provenance,
        state: loc.state ? (formData.provenance.state || 'USER PROVIDED') : 'MISSING',
        district: loc.district ? (formData.provenance.district || 'USER PROVIDED') : 'MISSING',
        city: loc.city ? (formData.provenance.city || 'USER PROVIDED') : 'MISSING',
        area: loc.area ? (formData.provenance.area || 'USER PROVIDED') : 'MISSING',
      },
    });
  };

  const handleProceed = () => {
    const val = validateLocation(formData);
    if (!val.isValid) {
      setLocationValidationError(
        val.errors.state || val.errors.district || val.errors.city || 'Please check the selected location.'
      );
      return;
    }
    setLocationValidationError(null);
    onProceedToReview();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('photoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderBadge = (fieldKey: string, currentValue: any, defaultProvenance: ProvenanceType = 'USER PROVIDED') => {
    let prov = formData.provenance[fieldKey] || defaultProvenance;
    if (!currentValue && currentValue !== 0) {
      prov = 'MISSING';
    }

    if (prov === 'MISSING') {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold border border-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
          MISSING
        </span>
      );
    }
    if (prov === 'AI GENERATED') {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-semibold border border-purple-200">
          AI GENERATED
        </span>
      );
    }
    if (prov === 'AI SUGGESTED') {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-[#EBF0FF] text-[#356AE6] px-2 py-0.5 rounded font-semibold border border-[#356AE6]/20">
          AI SUGGESTED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-[#F7F6F2] text-[#15171A] px-2 py-0.5 rounded font-medium border border-[#E5E7EB]">
        USER PROVIDED
      </span>
    );
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-4 sm:p-8 lg:p-10 space-y-5 sm:space-y-6 shadow-xs w-full lg:max-w-none mx-auto">
      {/* Title & Badge Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
        <div>
          <h2 className="font-sans text-[22px] sm:text-[24px] font-semibold text-[#15171A]">
            EDIT REPORT DETAILS
          </h2>
          <p className="font-sans text-[13px] text-[#6B7280]">
            Every field remains editable. Review provenance badges before submission.
          </p>
        </div>
        {/* Full 4-Badge Legend */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
          <span className="bg-[#F7F6F2] text-[#15171A] px-2 py-0.5 rounded border border-[#E5E7EB]">
            USER PROVIDED
          </span>
          <span className="bg-[#EBF0FF] text-[#356AE6] px-2 py-0.5 rounded border border-[#356AE6]/20">
            AI SUGGESTED
          </span>
          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
            AI GENERATED
          </span>
          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 font-bold">
            MISSING
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Language */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="font-mono text-xs text-[#6B7280]">LANGUAGE</label>
            {renderBadge('language', formData.language, 'USER PROVIDED')}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateField('language', 'English')}
              className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                formData.language === 'English'
                  ? 'bg-[#EBF0FF] text-[#356AE6] border-[#356AE6] ring-1 ring-[#356AE6]/20'
                  : 'bg-[#F7F6F2] text-[#4B5563] border-[#E5E7EB] hover:bg-[#EBEAE4]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => updateField('language', 'Hindi')}
              className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                formData.language === 'Hindi'
                  ? 'bg-[#EBF0FF] text-[#356AE6] border-[#356AE6] ring-1 ring-[#356AE6]/20'
                  : 'bg-[#F7F6F2] text-[#4B5563] border-[#E5E7EB] hover:bg-[#EBEAE4]'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Transcript / Spoken Problem */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-mono text-xs text-[#6B7280]">DESCRIPTION / SPOKEN PROBLEM</label>
            {renderBadge('transcript', formData.transcript, 'AI SUGGESTED')}
          </div>
          <textarea
            value={formData.transcript}
            onChange={(e) => updateField('transcript', e.target.value)}
            rows={3}
            className="w-full p-3 text-sm bg-[#F7F6F2] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#356AE6]/30 text-[#15171A]"
            placeholder="Detailed description of the issue..."
          />
        </div>

        {/* Geographic Hierarchy - Searchable India-wide Autocomplete (NO MAPS) */}
        <div className="bg-[#F7F6F2] p-4 sm:p-5 rounded-2xl border border-[#E5E7EB]">
          <SearchableLocationPicker
            state={formData.state}
            district={formData.district}
            city={formData.city}
            area={formData.area}
            onChange={handleLocationChange}
            provenance={{
              state: formData.provenance.state,
              district: formData.provenance.district,
              city: formData.provenance.city,
              area: formData.provenance.area,
            }}
            validationError={locationValidationError}
          />
        </div>

        {/* Category & Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-mono text-xs text-[#6B7280]">CIVIC CATEGORY</label>
              {renderBadge('category', formData.category, 'AI SUGGESTED')}
            </div>
            <select
              value={formData.category}
              onChange={(e) => updateField('category', e.target.value as CivicCategory)}
              className="w-full p-2.5 text-sm bg-[#F7F6F2] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#356AE6]/30 text-[#15171A]"
            >
              <option value="Road & Drainage">Road & Drainage</option>
              <option value="Waste Management">Waste Management</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Streetlighting & Electrical">Streetlighting & Electrical</option>
              <option value="Public Health & Sanitation">Public Health & Sanitation</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-mono text-xs text-[#6B7280]">SEVERITY</label>
              {renderBadge('severity', formData.severity, 'AI SUGGESTED')}
            </div>
            <select
              value={formData.severity}
              onChange={(e) => updateField('severity', e.target.value as IssueSeverity)}
              className="w-full p-2.5 text-sm bg-[#F7F6F2] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#356AE6]/30 text-[#15171A]"
            >
              <option value="LOW">LOW</option>
              <option value="MODERATE">MODERATE</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-mono text-xs text-[#6B7280]">
              ADDITIONAL DETAILS (OPTIONAL)
            </label>
            {formData.additionalDetails ? (
              <span className="font-mono text-[10px] bg-[#F7F6F2] text-[#15171A] px-2 py-0.5 rounded border border-[#E5E7EB]">
                USER PROVIDED
              </span>
            ) : null}
          </div>
          <input
            type="text"
            value={formData.additionalDetails}
            onChange={(e) => updateField('additionalDetails', e.target.value)}
            className="w-full p-2.5 text-sm bg-[#F7F6F2] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#356AE6]/30 text-[#15171A]"
            placeholder="e.g. Near Sardar Patel School, recurring waterlogging"
          />
        </div>

        {/* Photo Attachment (Optional) */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="font-mono text-xs text-[#6B7280]">
              PHOTO ATTACHMENT (OPTIONAL)
            </label>
            {formData.photoUrl && (
              <span className="font-mono text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                USER PROVIDED
              </span>
            )}
          </div>
          {formData.photoUrl ? (
            <div className="flex items-center gap-3 p-3 bg-[#F7F6F2] rounded-xl border border-[#E5E7EB]">
              <img
                src={formData.photoUrl}
                alt="Uploaded evidence"
                className="w-16 h-16 object-cover rounded-lg border border-[#E5E7EB]"
              />
              <div className="flex-1 text-xs">
                <span className="font-mono text-[#059669] font-medium block">
                  ✓ Photo attached
                </span>
                <span className="text-[#6B7280]">Optional visual evidence for municipal review</span>
              </div>
              <button
                type="button"
                onClick={() => updateField('photoUrl', null)}
                className="text-xs text-[#DC2626] hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center p-4 border-2 border-dashed border-[#E5E7EB] rounded-xl cursor-pointer hover:border-[#356AE6] bg-[#F7F6F2]/50 transition-colors">
              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                <span className="material-symbols-outlined text-[20px] text-[#356AE6]">add_a_photo</span>
                <span>Upload site photo (PNG, JPG)</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 min-h-[44px] text-sm text-[#6B7280] hover:text-[#15171A] hover:bg-[#F7F6F2] rounded-xl transition-colors inline-flex items-center justify-center"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleProceed}
          className="px-5 sm:px-6 py-2.5 min-h-[44px] bg-[#356AE6] hover:bg-[#2B58C7] text-white rounded-xl font-sans text-sm font-semibold transition-colors shadow-xs inline-flex items-center justify-center gap-2"
        >
          <span>Review Report</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
