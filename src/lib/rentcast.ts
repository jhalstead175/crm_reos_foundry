// RentCast API Integration
// API Documentation: https://developers.rentcast.io/reference

const RENTCAST_API_KEY = import.meta.env.VITE_RENTCAST_API_KEY || "";
const RENTCAST_API_BASE = "https://api.rentcast.io/v1";

export interface PropertyDetails {
  id: string;
  address: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
  lastSaleDate?: string;
  lastSalePrice?: number;
  assessedValue?: number;
  features?: string[];
}

export interface PropertyValue {
  price: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  confidenceScore: number;
}

export interface RentalEstimate {
  rent: number;
  rentRangeLow: number;
  rentRangeHigh: number;
  confidenceScore: number;
}

export interface Comparable {
  id: string;
  address: string;
  distance: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  yearBuilt?: number;
  lastSalePrice?: number;
  lastSaleDate?: string;
}

class RentCastAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = RENTCAST_API_BASE) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    if (!this.apiKey) {
      console.warn("⚠️ RentCast API key not configured. Property features will use demo data.");
      throw new Error("RentCast API key not configured");
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        "X-Api-Key": this.apiKey,
        "accept": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`RentCast API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Search property by address
  async searchProperty(address: string, city?: string, state?: string, zipCode?: string): Promise<PropertyDetails> {
    return this.request<PropertyDetails>("/properties", {
      address,
      city,
      state,
      zipCode,
    });
  }

  // Get property value estimate (AVM)
  async getPropertyValue(address: string, city?: string, state?: string, zipCode?: string): Promise<PropertyValue> {
    return this.request<PropertyValue>("/avm/value", {
      address,
      city,
      state,
      zipCode,
    });
  }

  // Get rental estimate
  async getRentalEstimate(address: string, city?: string, state?: string, zipCode?: string, bedrooms?: number, bathrooms?: number, squareFootage?: number): Promise<RentalEstimate> {
    return this.request<RentalEstimate>("/avm/rent", {
      address,
      city,
      state,
      zipCode,
      bedrooms,
      bathrooms,
      squareFootage,
    });
  }

  // Get comparable sales
  async getComparables(address: string, city?: string, state?: string, zipCode?: string, limit: number = 5): Promise<Comparable[]> {
    const response = await this.request<{ comparables: Comparable[] }>("/avm/comparables", {
      address,
      city,
      state,
      zipCode,
      limit,
    });
    return response.comparables || [];
  }
}

export const rentcast = new RentCastAPI(RENTCAST_API_KEY);

// Mock data for demo mode when API key is not configured
export const mockPropertyData: PropertyDetails = {
  id: "demo-1",
  address: "123 Main St, San Francisco, CA 94102",
  addressLine1: "123 Main St",
  city: "San Francisco",
  state: "CA",
  zipCode: "94102",
  county: "San Francisco",
  latitude: 37.7749,
  longitude: -122.4194,
  propertyType: "Single Family",
  bedrooms: 3,
  bathrooms: 2,
  squareFootage: 1850,
  lotSize: 4500,
  yearBuilt: 1920,
  lastSaleDate: "2021-03-15",
  lastSalePrice: 1250000,
  assessedValue: 1180000,
  features: ["Hardwood Floors", "Updated Kitchen", "Garage", "Backyard"],
};

export const mockPropertyValue: PropertyValue = {
  price: 1350000,
  priceRangeLow: 1280000,
  priceRangeHigh: 1420000,
  confidenceScore: 0.85,
};

export const mockRentalEstimate: RentalEstimate = {
  rent: 4500,
  rentRangeLow: 4200,
  rentRangeHigh: 4800,
  confidenceScore: 0.82,
};

export const mockComparables: Comparable[] = [
  {
    id: "comp-1",
    address: "125 Main St",
    distance: 0.1,
    propertyType: "Single Family",
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1820,
    yearBuilt: 1925,
    lastSalePrice: 1280000,
    lastSaleDate: "2023-01-20",
  },
  {
    id: "comp-2",
    address: "456 Oak Ave",
    distance: 0.3,
    propertyType: "Single Family",
    bedrooms: 3,
    bathrooms: 2.5,
    squareFootage: 1900,
    yearBuilt: 1918,
    lastSalePrice: 1395000,
    lastSaleDate: "2023-05-10",
  },
  {
    id: "comp-3",
    address: "789 Elm Blvd",
    distance: 0.5,
    propertyType: "Single Family",
    bedrooms: 4,
    bathrooms: 2,
    squareFootage: 2100,
    yearBuilt: 1915,
    lastSalePrice: 1520000,
    lastSaleDate: "2022-11-05",
  },
];
