export type CityType = 'metro' | 'large' | 'medium' | 'small';

export interface StateItem {
  id: string; // e.g. "IN-GJ", "IN-MH"
  name: string; // Canonical state name
  code: string; // 2-letter postal code
  type: 'state' | 'ut';
}

export interface DistrictItem {
  id: string; // e.g. "IN-MH-PUN"
  name: string; // Canonical district name
  code?: string;
  stateId: string;
  stateName: string;
}

export interface CityItem {
  id: string; // e.g. "city-pune"
  name: string; // Canonical city name
  canonicalCity: string;
  districtId: string;
  districtName: string;
  stateId: string;
  stateName: string;
  cityType: CityType;
  latitude?: number;
  longitude?: number;
  aliases?: string[];
}

export interface LocationValidationResult {
  isValid: boolean;
  errors: {
    state?: string;
    district?: string;
    city?: string;
    area?: string;
  };
}

export interface NormalizedLocationResult {
  state: string;
  district: string;
  city: string;
  area: string;
  stateId?: string;
  districtId?: string;
  cityId?: string;
  canonicalCity?: string;
  isAmbiguous?: boolean;
  matchedCities?: CityItem[];
}
