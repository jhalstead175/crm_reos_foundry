export interface Property {
  id: string;
  address: string;
  address_line1: string;
  city: string;
  state: string;
  zip_code: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_footage?: number;
  lot_size?: number;
  year_built?: number;
  last_sale_date?: string;
  last_sale_price?: number;
  assessed_value?: number;
  estimated_value?: number;
  estimated_rent?: number;
  features?: string[];
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface PropertyContact {
  id: string;
  property_id: string;
  contact_id: string;
  relationship: "Buyer" | "Seller" | "Landlord" | "Tenant" | "Interest";
  created_at: string;
}

export interface PropertyTransaction {
  id: string;
  property_id: string;
  transaction_id: string;
  created_at: string;
}
