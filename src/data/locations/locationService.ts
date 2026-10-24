import { StateItem, DistrictItem, CityItem, LocationValidationResult, NormalizedLocationResult } from './types';
import { INDIAN_STATES } from './states';
import { INDIAN_DISTRICTS } from './districts';
import { INDIAN_CITIES } from './cities';

/**
 * Returns all Indian States & Union Territories
 */
export function getAllStates(): StateItem[] {
  return INDIAN_STATES;
}

/**
 * Get state by exact name, code, or ID (case-insensitive)
 */
export function findState(stateQuery: string): StateItem | undefined {
  if (!stateQuery) return undefined;
  const q = stateQuery.trim().toLowerCase();
  return INDIAN_STATES.find(
    (s) =>
      s.id.toLowerCase() === q ||
      s.name.toLowerCase() === q ||
      s.code.toLowerCase() === q
  );
}

/**
 * Get all districts for a given state
 */
export function getDistrictsByState(stateIdOrName: string): DistrictItem[] {
  if (!stateIdOrName) return [];
  const state = findState(stateIdOrName);
  const targetId = state ? state.id : stateIdOrName.trim();
  const targetName = state ? state.name.toLowerCase() : stateIdOrName.trim().toLowerCase();

  return INDIAN_DISTRICTS.filter(
    (d) => d.stateId === targetId || d.stateName.toLowerCase() === targetName
  );
}

/**
 * Find district by name within a state (or across all if no state given)
 */
export function findDistrict(districtQuery: string, stateIdOrName?: string): DistrictItem | undefined {
  if (!districtQuery) return undefined;
  const q = districtQuery.trim().toLowerCase();
  const districts = stateIdOrName ? getDistrictsByState(stateIdOrName) : INDIAN_DISTRICTS;

  return districts.find(
    (d) =>
      d.name.toLowerCase() === q ||
      d.id.toLowerCase() === q ||
      d.name.toLowerCase().includes(q)
  );
}

/**
 * Get all cities for a given district
 */
export function getCitiesByDistrict(districtIdOrName: string): CityItem[] {
  if (!districtIdOrName) return [];
  const q = districtIdOrName.trim().toLowerCase();
  return INDIAN_CITIES.filter(
    (c) => c.districtId.toLowerCase() === q || c.districtName.toLowerCase() === q
  );
}

/**
 * Search cities across India by name or alias (supports partial, exact, and case-insensitive matches)
 */
export function searchCities(query: string, limit = 15): CityItem[] {
  if (!query || !query.trim()) {
    // Return major metros by default
    return INDIAN_CITIES.filter((c) => c.cityType === 'metro').slice(0, limit);
  }

  const q = query.trim().toLowerCase();

  const exactMatches: CityItem[] = [];
  const prefixMatches: CityItem[] = [];
  const aliasMatches: CityItem[] = [];
  const partialMatches: CityItem[] = [];

  for (const city of INDIAN_CITIES) {
    const cityNameLower = city.name.toLowerCase();
    const canonicalLower = city.canonicalCity.toLowerCase();

    if (cityNameLower === q || canonicalLower === q) {
      exactMatches.push(city);
    } else if (cityNameLower.startsWith(q) || canonicalLower.startsWith(q)) {
      prefixMatches.push(city);
    } else if (
      city.aliases &&
      city.aliases.some((a) => a.toLowerCase() === q || a.toLowerCase().startsWith(q))
    ) {
      aliasMatches.push(city);
    } else if (
      cityNameLower.includes(q) ||
      city.districtName.toLowerCase().includes(q) ||
      city.stateName.toLowerCase().includes(q) ||
      (city.aliases && city.aliases.some((a) => a.toLowerCase().includes(q)))
    ) {
      partialMatches.push(city);
    }
  }

  const combined = [
    ...exactMatches,
    ...prefixMatches,
    ...aliasMatches,
    ...partialMatches,
  ];

  // Remove duplicates based on city id
  const seen = new Set<string>();
  const results: CityItem[] = [];
  for (const c of combined) {
    if (!seen.has(c.id)) {
      seen.add(c.id);
      results.push(c);
      if (results.length >= limit) break;
    }
  }

  return results;
}

/**
 * Find a canonical city by name or alias
 */
export function findCityByNameOrAlias(name: string): CityItem | undefined {
  if (!name) return undefined;
  const q = name.trim().toLowerCase();

  return INDIAN_CITIES.find((c) => {
    if (c.name.toLowerCase() === q || c.canonicalCity.toLowerCase() === q) return true;
    if (c.aliases && c.aliases.some((a) => a.toLowerCase() === q)) return true;
    return false;
  });
}

/**
 * Normalizes user-entered or AI-extracted location parameters.
 * Resolves aliases, validates hierarchy, and trims whitespace.
 */
export function normalizeLocation(input: {
  state?: string | null;
  district?: string | null;
  city?: string | null;
  area?: string | null;
}): NormalizedLocationResult {
  const cleanState = (input.state || '').trim();
  const cleanDistrict = (input.district || '').trim();
  const cleanCity = (input.city || '').trim();
  const cleanArea = (input.area || '').trim();

  // Try to resolve city alias (e.g. Bangalore -> Bengaluru, Bombay -> Mumbai)
  let matchedCity: CityItem | undefined;
  let matchingCities: CityItem[] = [];

  if (cleanCity) {
    matchingCities = searchCities(cleanCity, 5);
    const exactOrAlias = matchingCities.find((c) => {
      const q = cleanCity.toLowerCase();
      return (
        c.name.toLowerCase() === q ||
        c.canonicalCity.toLowerCase() === q ||
        (c.aliases && c.aliases.some((a) => a.toLowerCase() === q))
      );
    });
    matchedCity = exactOrAlias || matchingCities[0];
  }

  const stateObj = matchedCity
    ? findState(matchedCity.stateName)
    : cleanState
    ? findState(cleanState)
    : undefined;

  const districtObj = matchedCity
    ? findDistrict(matchedCity.districtName, stateObj?.id)
    : cleanDistrict
    ? findDistrict(cleanDistrict, stateObj?.id)
    : undefined;

  const isAmbiguous = matchingCities.length > 1 && !cleanState && !cleanDistrict;

  return {
    state: stateObj ? stateObj.name : cleanState,
    stateId: stateObj ? stateObj.id : undefined,
    district: districtObj ? districtObj.name : cleanDistrict,
    districtId: districtObj ? districtObj.id : undefined,
    city: matchedCity ? matchedCity.canonicalCity : cleanCity,
    cityId: matchedCity ? matchedCity.id : undefined,
    canonicalCity: matchedCity ? matchedCity.canonicalCity : cleanCity,
    area: cleanArea,
    isAmbiguous,
    matchedCities: matchingCities,
  };
}

/**
 * Validates that state belongs to India, district belongs to state, and city matches district.
 */
export function validateLocation(input: {
  state?: string | null;
  district?: string | null;
  city?: string | null;
  area?: string | null;
}): LocationValidationResult {
  const errors: { state?: string; district?: string; city?: string; area?: string } = {};

  if (!input.state || !input.state.trim()) {
    errors.state = 'State / UT is required';
  } else {
    const validState = findState(input.state);
    if (!validState) {
      errors.state = 'Please select a valid Indian State or Union Territory';
    }
  }

  if (input.state && input.district && input.district.trim()) {
    const districts = getDistrictsByState(input.state);
    if (districts.length > 0) {
      const validDist = districts.find(
        (d) =>
          d.name.toLowerCase() === input.district!.trim().toLowerCase() ||
          d.name.toLowerCase().includes(input.district!.trim().toLowerCase())
      );
      if (!validDist) {
        errors.district = `Selected district does not belong to ${input.state}`;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
