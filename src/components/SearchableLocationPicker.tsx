import React, { useState, useEffect, useRef } from 'react';
import {
  getAllStates,
  getDistrictsByState,
  getCitiesByDistrict,
  searchCities,
  findState,
} from '../data/locations';
import { StateItem, DistrictItem, CityItem } from '../data/locations/types';

interface SearchableLocationPickerProps {
  state: string;
  district: string;
  city: string;
  area: string;
  onChange: (location: {
    state: string;
    district: string;
    city: string;
    area: string;
    stateId?: string;
    districtId?: string;
    cityId?: string;
  }) => void;
  provenance?: {
    state?: string;
    district?: string;
    city?: string;
    area?: string;
  };
  validationError?: string | null;
}

export const SearchableLocationPicker: React.FC<SearchableLocationPickerProps> = ({
  state,
  district,
  city,
  area,
  onChange,
  provenance = {},
  validationError,
}) => {
  // Active dropdown open states
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);

  // Search input queries
  const [stateQuery, setStateQuery] = useState('');
  const [districtQuery, setDistrictQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');

  // Refs for click outside
  const stateRef = useRef<HTMLDivElement>(null);
  const districtRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) {
        setIsStateOpen(false);
      }
      if (districtRef.current && !districtRef.current.contains(e.target as Node)) {
        setIsDistrictOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setIsCityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered lists
  const allStates = getAllStates();
  const filteredStates = stateQuery
    ? allStates.filter(
        (s) =>
          s.name.toLowerCase().includes(stateQuery.toLowerCase()) ||
          s.code.toLowerCase().includes(stateQuery.toLowerCase())
      )
    : allStates;

  const currentDistricts = state ? getDistrictsByState(state) : [];
  const filteredDistricts = districtQuery
    ? currentDistricts.filter((d) =>
        d.name.toLowerCase().includes(districtQuery.toLowerCase())
      )
    : currentDistricts;

  // Filtered cities: if district is chosen, prioritize district cities; otherwise allow global search
  const filteredCities: CityItem[] = cityQuery
    ? searchCities(cityQuery, 12)
    : district
    ? getCitiesByDistrict(district)
    : searchCities('', 10);

  // When state changes: reset district, city, area (Requirement 4)
  const handleSelectState = (selectedState: StateItem) => {
    setIsStateOpen(false);
    setStateQuery('');
    onChange({
      state: selectedState.name,
      stateId: selectedState.id,
      district: '',
      districtId: undefined,
      city: '',
      cityId: undefined,
      area: '',
    });
  };

  // When district changes: reset city
  const handleSelectDistrict = (selectedDistrict: DistrictItem) => {
    setIsDistrictOpen(false);
    setDistrictQuery('');
    onChange({
      state,
      district: selectedDistrict.name,
      districtId: selectedDistrict.id,
      city: '',
      cityId: undefined,
      area,
    });
  };

  // When city changes from global/district search
  const handleSelectCity = (selectedCity: CityItem) => {
    setIsCityOpen(false);
    setCityQuery('');
    // Auto-align canonical district and state if not set or different
    onChange({
      state: selectedCity.stateName,
      stateId: selectedCity.stateId,
      district: selectedCity.districtName,
      districtId: selectedCity.districtId,
      city: selectedCity.canonicalCity,
      cityId: selectedCity.id,
      area,
    });
  };

  const handleAreaChange = (newArea: string) => {
    onChange({
      state,
      district,
      city,
      area: newArea,
    });
  };

  const renderBadge = (field: 'state' | 'district' | 'city' | 'area') => {
    const prov = provenance[field];
    if (!prov) return null;
    const isAi = prov.includes('AI');
    const isCanonical = prov.includes('CANONICAL');
    return (
      <span
        className={`font-mono text-[9px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
          isCanonical
            ? 'bg-blue-50 text-[#356AE6] border border-blue-200'
            : isAi
            ? 'bg-purple-50 text-purple-700 border border-purple-200'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}
      >
        {prov}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#356AE6]">
            location_city
          </span>
          <span className="font-mono text-xs font-bold text-[#15171A] uppercase tracking-wider">
            ADMINISTRATIVE LOCATION (INDIA-WIDE)
          </span>
        </div>
        <span className="text-[11px] font-sans text-[#6B7280]">
          State → District → City → Area
        </span>
      </div>

      {validationError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">warning</span>
          <span>{validationError}</span>
        </div>
      )}

      {/* Grid for State, District, City */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1. STATE SELECTOR */}
        <div className="relative" ref={stateRef}>
          <div className="flex items-center justify-between mb-1">
            <label className="font-mono text-[11px] text-[#6B7280] font-semibold">
              STATE / UT
            </label>
            {renderBadge('state')}
          </div>

          <div
            onClick={() => setIsStateOpen((prev) => !prev)}
            className="w-full p-2.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-sm flex items-center justify-between cursor-pointer hover:border-[#356AE6] transition-colors shadow-xs"
          >
            <span className={state ? 'text-[#15171A] font-medium' : 'text-[#9CA3AF]'}>
              {state || 'Search state...'}
            </span>
            <span className="material-symbols-outlined text-[18px] text-[#6B7280]">
              arrow_drop_down
            </span>
          </div>

          {/* State Search Dropdown */}
          {isStateOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] shadow-xl z-50 p-2 max-h-60 overflow-y-auto animate-fadeIn">
              <div className="relative mb-2">
                <span className="material-symbols-outlined absolute left-2 top-2 text-[16px] text-[#9CA3AF]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Filter 28 States & 8 UTs..."
                  value={stateQuery}
                  onChange={(e) => setStateQuery(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs bg-[#F7F6F2] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#356AE6]"
                  autoFocus
                />
              </div>

              <div className="space-y-0.5">
                {filteredStates.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectState(s)}
                    className={`w-full px-2.5 py-1.5 text-left text-xs rounded-lg flex items-center justify-between transition-colors ${
                      state === s.name
                        ? 'bg-[#EBF0FF] text-[#356AE6] font-semibold'
                        : 'hover:bg-[#F7F6F2] text-[#15171A]'
                    }`}
                  >
                    <span>{s.name}</span>
                    <span className="font-mono text-[10px] text-[#6B7280]">
                      {s.type === 'ut' ? 'UT' : 'State'} ({s.code})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. DISTRICT SELECTOR (Scoped to state) */}
        <div className="relative" ref={districtRef}>
          <div className="flex items-center justify-between mb-1">
            <label className="font-mono text-[11px] text-[#6B7280] font-semibold">
              DISTRICT
            </label>
            {renderBadge('district')}
          </div>

          <div
            onClick={() => {
              if (state) setIsDistrictOpen((prev) => !prev);
            }}
            className={`w-full p-2.5 border rounded-xl text-sm flex items-center justify-between shadow-xs transition-colors ${
              !state
                ? 'bg-[#F7F6F2] border-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                : 'bg-[#FFFFFF] border-[#E5E7EB] cursor-pointer hover:border-[#356AE6]'
            }`}
          >
            <span className={district ? 'text-[#15171A] font-medium' : 'text-[#9CA3AF]'}>
              {district || (state ? 'Select district...' : 'Select state first')}
            </span>
            <span className="material-symbols-outlined text-[18px] text-[#6B7280]">
              arrow_drop_down
            </span>
          </div>

          {/* District Search Dropdown */}
          {isDistrictOpen && state && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] shadow-xl z-50 p-2 max-h-60 overflow-y-auto animate-fadeIn">
              <div className="relative mb-2">
                <span className="material-symbols-outlined absolute left-2 top-2 text-[16px] text-[#9CA3AF]">
                  search
                </span>
                <input
                  type="text"
                  placeholder={`Search ${state} districts...`}
                  value={districtQuery}
                  onChange={(e) => setDistrictQuery(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs bg-[#F7F6F2] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#356AE6]"
                  autoFocus
                />
              </div>

              <div className="space-y-0.5">
                {filteredDistricts.length === 0 ? (
                  <p className="p-2 text-xs text-[#6B7280] text-center">No district matches</p>
                ) : (
                  filteredDistricts.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleSelectDistrict(d)}
                      className={`w-full px-2.5 py-1.5 text-left text-xs rounded-lg flex items-center justify-between transition-colors ${
                        district === d.name
                          ? 'bg-[#EBF0FF] text-[#356AE6] font-semibold'
                          : 'hover:bg-[#F7F6F2] text-[#15171A]'
                      }`}
                    >
                      <span>{d.name}</span>
                      <span className="font-mono text-[10px] text-[#6B7280]">District</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. CITY / TOWN SELECTOR (Searchable autocomplete with City, District, State) */}
        <div className="relative" ref={cityRef}>
          <div className="flex items-center justify-between mb-1">
            <label className="font-mono text-[11px] text-[#6B7280] font-semibold">
              CITY / TOWN
            </label>
            {renderBadge('city')}
          </div>

          <div
            onClick={() => setIsCityOpen((prev) => !prev)}
            className="w-full p-2.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-sm flex items-center justify-between cursor-pointer hover:border-[#356AE6] transition-colors shadow-xs"
          >
            <span className={city ? 'text-[#15171A] font-medium' : 'text-[#9CA3AF]'}>
              {city || 'Search city (e.g. Pune, Jaipur)...'}
            </span>
            <span className="material-symbols-outlined text-[18px] text-[#6B7280]">
              search
            </span>
          </div>

          {/* City Autocomplete Dropdown */}
          {isCityOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] shadow-xl z-50 p-2 max-h-68 overflow-y-auto animate-fadeIn w-full max-w-full">
              <div className="relative mb-2">
                <span className="material-symbols-outlined absolute left-2 top-2 text-[16px] text-[#9CA3AF]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Type city or alias (e.g. Bombay, Bangalore)..."
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs bg-[#F7F6F2] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#356AE6]"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                {filteredCities.length === 0 ? (
                  <div className="p-3 text-center">
                    <p className="text-xs text-[#6B7280]">No city matched "{cityQuery}"</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCityOpen(false);
                        onChange({
                          state: state || '',
                          district: district || '',
                          city: cityQuery,
                          area,
                        });
                      }}
                      className="mt-1 text-xs text-[#356AE6] font-medium hover:underline"
                    >
                      Use "{cityQuery}" as custom city
                    </button>
                  </div>
                ) : (
                  filteredCities.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCity(c)}
                      className={`w-full px-2.5 py-2 text-left rounded-lg transition-colors border ${
                        city === c.canonicalCity
                          ? 'bg-[#EBF0FF] border-[#356AE6]/30 text-[#356AE6]'
                          : 'bg-[#FFFFFF] border-transparent hover:bg-[#F7F6F2] text-[#15171A]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs">{c.name}</span>
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#F7F6F2] text-[#6B7280] uppercase">
                          {c.cityType}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-[#6B7280] flex items-center gap-1 mt-0.5">
                        <span>{c.districtName} District</span>
                        <span>•</span>
                        <span className="text-[#356AE6]">{c.stateName}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. AREA / LOCALITY (Flexible user-entered text field, Requirement 16 & 21) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[11px] text-[#6B7280] font-semibold">
            AREA / LOCALITY / NEIGHBOURHOOD
          </label>
          {renderBadge('area')}
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. Kothrud, Vastrapur, Whitefield, Gomti Nagar, Salt Lake..."
            value={area}
            onChange={(e) => handleAreaChange(e.target.value)}
            className="w-full p-2.5 text-sm bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#356AE6]/30 text-[#15171A] shadow-xs"
          />
        </div>
        <p className="font-sans text-[11px] text-[#6B7280] mt-1">
          Specify the street, colony, or landmark where the civic issue is located.
        </p>
      </div>
    </div>
  );
};
