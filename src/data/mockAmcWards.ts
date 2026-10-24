import mockWardsData from '../../data/mock_amc_wards.json';

export interface MockWard {
  wardId: string;
  wardName: string;
  zone: string;
  pincode: string;
  officeAddress: string;
  supportedAreas: string[];
}

export interface WardLookupResult {
  found: boolean;
  wardId?: string;
  wardName?: string;
  zone?: string;
  matchedArea?: string;
  message: string;
}

export interface DepartmentRoutingResult {
  department: string;
  rationale: string;
  category: string;
}

export const MOCK_AMC_WARDS: MockWard[] = mockWardsData.wards;
export const DEPARTMENT_ROUTING_CONFIG = mockWardsData.departmentRouting;

/**
 * Deterministic Ward Lookup Tool: searches provided Mock AMC dataset
 * W12 - Navrangpura, W27 - Maninagar, etc.
 */
export function lookupWard(location: string, coordinates?: { lat: number; lng: number }): WardLookupResult {
  if (!location || !location.trim()) {
    return {
      found: false,
      message: 'Please provide a location to determine the municipal ward.',
    };
  }

  const query = location.toLowerCase().trim();

  // Search each ward's name and supported areas
  for (const ward of MOCK_AMC_WARDS) {
    if (
      ward.wardName.toLowerCase().includes(query) ||
      query.includes(ward.wardName.toLowerCase()) ||
      ward.wardId.toLowerCase() === query
    ) {
      return {
        found: true,
        wardId: ward.wardId,
        wardName: ward.wardName,
        zone: ward.zone,
        matchedArea: ward.wardName,
        message: `Successfully matched to Ward ${ward.wardId} (${ward.wardName}, ${ward.zone})`,
      };
    }

    for (const area of ward.supportedAreas) {
      if (
        area.toLowerCase().includes(query) ||
        query.includes(area.toLowerCase())
      ) {
        return {
          found: true,
          wardId: ward.wardId,
          wardName: ward.wardName,
          zone: ward.zone,
          matchedArea: area,
          message: `Successfully matched "${area}" to Ward ${ward.wardId} (${ward.wardName}, ${ward.zone})`,
        };
      }
    }
  }

  // Exact failure message required by Problem Statement
  return {
    found: false,
    message: 'Your location could not be matched to an available demo ward. Please select a supported area.',
  };
}

/**
 * Deterministic Department Routing Tool
 * - Pothole → Roads & Buildings
 * - Garbage → Solid Waste Management
 * - Broken Streetlight → Light Department
 * - Waterlogging → Storm Water Drainage
 */
export function routeDepartment(issueCategory: string): DepartmentRoutingResult {
  const normCategory = (issueCategory || '').trim();

  // Match standard hackathon categories
  if (normCategory.toLowerCase().includes('pothole') || normCategory === 'Pothole' || normCategory.toLowerCase().includes('road')) {
    return {
      department: DEPARTMENT_ROUTING_CONFIG['Pothole'].department,
      rationale: DEPARTMENT_ROUTING_CONFIG['Pothole'].rationale,
      category: 'Pothole',
    };
  }
  if (normCategory.toLowerCase().includes('garbage') || normCategory === 'Garbage' || normCategory.toLowerCase().includes('waste')) {
    return {
      department: DEPARTMENT_ROUTING_CONFIG['Garbage'].department,
      rationale: DEPARTMENT_ROUTING_CONFIG['Garbage'].rationale,
      category: 'Garbage',
    };
  }
  if (
    normCategory.toLowerCase().includes('streetlight') ||
    normCategory.toLowerCase().includes('light') ||
    normCategory === 'Broken Streetlight' ||
    normCategory.toLowerCase().includes('electrical')
  ) {
    return {
      department: DEPARTMENT_ROUTING_CONFIG['Broken Streetlight'].department,
      rationale: DEPARTMENT_ROUTING_CONFIG['Broken Streetlight'].rationale,
      category: 'Broken Streetlight',
    };
  }
  if (
    normCategory.toLowerCase().includes('waterlog') ||
    normCategory === 'Waterlogging' ||
    normCategory.toLowerCase().includes('drainage') ||
    normCategory.toLowerCase().includes('water')
  ) {
    return {
      department: DEPARTMENT_ROUTING_CONFIG['Waterlogging'].department,
      rationale: DEPARTMENT_ROUTING_CONFIG['Waterlogging'].rationale,
      category: 'Waterlogging',
    };
  }

  return {
    department: DEPARTMENT_ROUTING_CONFIG['Other Civic Issue'].department,
    rationale: DEPARTMENT_ROUTING_CONFIG['Other Civic Issue'].rationale,
    category: 'Other Civic Issue',
  };
}
