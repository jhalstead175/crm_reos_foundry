import { useState } from "react";
import { rentcast, mockPropertyData, mockPropertyValue, mockRentalEstimate, mockComparables } from "../lib/rentcast";
import type { PropertyDetails, PropertyValue, RentalEstimate, Comparable } from "../lib/rentcast";
import { supabase } from "../lib/supabase";
import type { Contact } from "../types/contact";

export default function PropertySearch() {
  const [searchAddress, setSearchAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [propertyValue, setPropertyValue] = useState<PropertyValue | null>(null);
  const [rentalEstimate, setRentalEstimate] = useState<RentalEstimate | null>(null);
  const [comparables, setComparables] = useState<Comparable[]>([]);
  const [activeTab, setActiveTab] = useState<"details" | "value" | "rental" | "comps">("details");
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [relationship, setRelationship] = useState<"Buyer" | "Seller" | "Landlord" | "Tenant" | "Interest">("Interest");
  const [linking, setLinking] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>("");
  const [linkingTransaction, setLinkingTransaction] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchAddress.trim()) return;

    setLoading(true);
    setError(null);
    setSavedPropertyId(null); // Reset saved state for new search

    try {
      // Search property
      const propertyData = await rentcast.searchProperty(
        searchAddress,
        city || undefined,
        state || undefined,
        zipCode || undefined
      );
      setProperty(propertyData);

      // Get property value
      const valueData = await rentcast.getPropertyValue(
        searchAddress,
        city || undefined,
        state || undefined,
        zipCode || undefined
      );
      setPropertyValue(valueData);

      // Get rental estimate
      const rentalData = await rentcast.getRentalEstimate(
        searchAddress,
        city || undefined,
        state || undefined,
        zipCode || undefined,
        propertyData.bedrooms,
        propertyData.bathrooms,
        propertyData.squareFootage
      );
      setRentalEstimate(rentalData);

      // Get comparables
      const compsData = await rentcast.getComparables(
        searchAddress,
        city || undefined,
        state || undefined,
        zipCode || undefined,
        5
      );
      setComparables(compsData);

    } catch (err) {
      console.error("Error fetching property data:", err);
      setError("Could not fetch property data. Using demo data.");

      // Load demo data
      setProperty(mockPropertyData);
      setPropertyValue(mockPropertyValue);
      setRentalEstimate(mockRentalEstimate);
      setComparables(mockComparables);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value?: number) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("en-US").format(value);
  };

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const saveProperty = async () => {
    if (!property || !propertyValue || !rentalEstimate) return;

    setSaving(true);
    try {
      // Parse address to extract components
      const addressParts = property.address.split(",").map((p) => p.trim());
      const addressLine1 = addressParts[0] || property.address;
      const cityFromAddress = addressParts[1] || city || property.city || "";
      const stateFromAddress = addressParts[2] || state || property.state || "";

      const propertyData = {
        address: property.address,
        address_line1: addressLine1,
        city: cityFromAddress,
        state: stateFromAddress,
        zip_code: zipCode || property.zipCode || "",
        county: property.county,
        latitude: property.latitude,
        longitude: property.longitude,
        property_type: property.propertyType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        square_footage: property.squareFootage,
        lot_size: property.lotSize,
        year_built: property.yearBuilt,
        last_sale_date: property.lastSaleDate,
        last_sale_price: property.lastSalePrice,
        assessed_value: property.assessedValue,
        estimated_value: propertyValue.price,
        estimated_rent: rentalEstimate.rent,
        features: property.features || [],
      };

      const { data, error } = await supabase
        .from("properties")
        .insert([propertyData])
        .select()
        .single();

      if (error) throw error;

      setSavedPropertyId(data.id);
      alert("Property saved successfully!");
    } catch (error) {
      console.error("Error saving property:", error);
      alert("Failed to save property. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const openLinkModal = async () => {
    if (!savedPropertyId) {
      alert("Please save the property first before linking to a contact.");
      return;
    }
    await loadContacts();
    setShowLinkModal(true);
  };

  const linkToContact = async () => {
    if (!savedPropertyId || !selectedContactId) return;

    setLinking(true);
    try {
      const { error } = await supabase
        .from("property_contacts")
        .insert([
          {
            property_id: savedPropertyId,
            contact_id: selectedContactId,
            relationship: relationship,
          },
        ]);

      if (error) throw error;

      alert("Property linked to contact successfully!");
      setShowLinkModal(false);
      setSelectedContactId("");
    } catch (error: any) {
      console.error("Error linking property:", error);
      if (error?.message?.includes("duplicate")) {
        alert("This property is already linked to this contact.");
      } else {
        alert("Failed to link property. Please try again.");
      }
    } finally {
      setLinking(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  const openTransactionModal = async () => {
    if (!savedPropertyId) {
      alert("Please save the property first before linking to a transaction.");
      return;
    }
    await loadTransactions();
    setShowTransactionModal(true);
  };

  const linkToTransaction = async () => {
    if (!savedPropertyId || !selectedTransactionId) return;

    setLinkingTransaction(true);
    try {
      const { error } = await supabase
        .from("property_transactions")
        .insert([
          {
            property_id: savedPropertyId,
            transaction_id: selectedTransactionId,
          },
        ]);

      if (error) throw error;

      alert("Property linked to transaction successfully!");
      setShowTransactionModal(false);
      setSelectedTransactionId("");
    } catch (error: any) {
      console.error("Error linking property:", error);
      if (error?.message?.includes("duplicate")) {
        alert("This property is already linked to this transaction.");
      } else {
        alert("Failed to link property. Please try again.");
      }
    } finally {
      setLinkingTransaction(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Property Search</h1>
          <p className="text-gray-600">
            Search properties using RentCast MLS data
          </p>
        </div>

        {/* Search Form */}
        <div className="border border-gray-200 rounded-lg p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Search Property</h2>
            <p className="text-sm text-gray-600">Enter an address to get property details</p>
          </div>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder="123 Main St"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="San Francisco"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="CA"
                    maxLength={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="94102"
                    maxLength={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !searchAddress.trim()}
              className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Searching..." : "Search Property"}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-3 rounded-md bg-yellow-50 border border-yellow-200">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          )}
        </div>

        {/* Property Results */}
        {property && (
          <div className="space-y-6">
            {/* Property Header */}
            <div className="border border-gray-200 rounded-lg p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">{property.address}</h2>
                  <p className="text-sm text-gray-600">
                    {property.propertyType} • {property.bedrooms} bed • {property.bathrooms} bath • {formatNumber(property.squareFootage)} sqft
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  <button
                    onClick={saveProperty}
                    disabled={saving || !!savedPropertyId}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {savedPropertyId ? "Saved" : saving ? "Saving..." : "Save Property"}
                  </button>
                  <button
                    onClick={openLinkModal}
                    disabled={!savedPropertyId}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Link to Contact
                  </button>
                  <button
                    onClick={openTransactionModal}
                    disabled={!savedPropertyId}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Link to Transaction
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-200">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Estimated Value</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(propertyValue?.price)}
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Estimated Rent</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(rentalEstimate?.rent)}/mo
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Last Sale</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(property.lastSalePrice)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {property.lastSaleDate && new Date(property.lastSaleDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Year Built</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {property.yearBuilt || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border border-gray-200 rounded-lg">
              <nav className="flex border-b border-gray-200 px-6 -mb-px overflow-x-auto">
                {[
                  { id: "details" as const, label: "Property Details" },
                  { id: "value" as const, label: "Value Estimate" },
                  { id: "rental" as const, label: "Rental Estimate" },
                  { id: "comps" as const, label: `Comparables (${comparables.length})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-4 text-sm border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-gray-900 text-gray-900 font-medium"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="p-8">
                {/* Details Tab */}
                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Bedrooms</div>
                        <div className="text-sm font-medium text-gray-900">{property.bedrooms || "N/A"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Bathrooms</div>
                        <div className="text-sm font-medium text-gray-900">{property.bathrooms || "N/A"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Square Footage</div>
                        <div className="text-sm font-medium text-gray-900">{formatNumber(property.squareFootage)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Lot Size</div>
                        <div className="text-sm font-medium text-gray-900">{formatNumber(property.lotSize)} sqft</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Property Type</div>
                        <div className="text-sm font-medium text-gray-900">{property.propertyType || "N/A"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">County</div>
                        <div className="text-sm font-medium text-gray-900">{property.county || "N/A"}</div>
                      </div>
                    </div>

                    {property.features && property.features.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-500 mb-2">Features</div>
                        <div className="flex flex-wrap gap-2">
                          {property.features.map((feature, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Value Estimate Tab */}
                {activeTab === "value" && propertyValue && (
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs text-gray-500 mb-2">Estimated Value</div>
                      <div className="text-4xl font-semibold text-gray-900">{formatCurrency(propertyValue.price)}</div>
                      <div className="text-sm text-gray-600 mt-2">
                        Range: {formatCurrency(propertyValue.priceRangeLow)} - {formatCurrency(propertyValue.priceRangeHigh)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-xs text-gray-500">Confidence Score</div>
                      <div className="flex-1 h-2 rounded-full overflow-hidden bg-gray-200">
                        <div
                          className="h-full bg-gray-900"
                          style={{ width: `${propertyValue.confidenceScore * 100}%` }}
                        />
                      </div>
                      <div className="text-sm font-medium text-gray-900">{Math.round(propertyValue.confidenceScore * 100)}%</div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600">
                        This automated valuation model (AVM) is based on recent comparable sales, property characteristics, and local market trends. The actual market value may vary.
                      </p>
                    </div>
                  </div>
                )}

                {/* Rental Estimate Tab */}
                {activeTab === "rental" && rentalEstimate && (
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs text-gray-500 mb-2">Estimated Monthly Rent</div>
                      <div className="text-4xl font-semibold text-gray-900">{formatCurrency(rentalEstimate.rent)}/mo</div>
                      <div className="text-sm text-gray-600 mt-2">
                        Range: {formatCurrency(rentalEstimate.rentRangeLow)} - {formatCurrency(rentalEstimate.rentRangeHigh)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-xs text-gray-500">Confidence Score</div>
                      <div className="flex-1 h-2 rounded-full overflow-hidden bg-gray-200">
                        <div
                          className="h-full bg-gray-900"
                          style={{ width: `${rentalEstimate.confidenceScore * 100}%` }}
                        />
                      </div>
                      <div className="text-sm font-medium text-gray-900">{Math.round(rentalEstimate.confidenceScore * 100)}%</div>
                    </div>

                    {propertyValue && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 border border-gray-200 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Gross Yield</div>
                          <div className="text-2xl font-semibold text-gray-900">
                            {((rentalEstimate.rent * 12 / propertyValue.price) * 100).toFixed(2)}%
                          </div>
                        </div>
                        <div className="p-6 border border-gray-200 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Annual Rent</div>
                          <div className="text-2xl font-semibold text-gray-900">
                            {formatCurrency(rentalEstimate.rent * 12)}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600">
                        Rental estimate based on comparable properties, local market data, and property characteristics. Actual rental income may vary based on condition, amenities, and current market demand.
                      </p>
                    </div>
                  </div>
                )}

                {/* Comparables Tab */}
                {activeTab === "comps" && (
                  <div className="space-y-4">
                    {comparables.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-sm text-gray-500">No comparable sales found</p>
                        <p className="text-xs text-gray-400 mt-1">Try searching for a different property</p>
                      </div>
                    ) : (
                      comparables.map((comp) => (
                        <div
                          key={comp.id}
                          className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{comp.address}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {comp.distance} miles away
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">
                                {formatCurrency(comp.lastSalePrice)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {comp.lastSaleDate && new Date(comp.lastSaleDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-center pt-4 border-t border-gray-200">
                            <div>
                              <div className="text-xs text-gray-500">Beds</div>
                              <div className="text-sm font-medium text-gray-900 mt-1">{comp.bedrooms}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Baths</div>
                              <div className="text-sm font-medium text-gray-900 mt-1">{comp.bathrooms}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Sqft</div>
                              <div className="text-sm font-medium text-gray-900 mt-1">{formatNumber(comp.squareFootage)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Built</div>
                              <div className="text-sm font-medium text-gray-900 mt-1">{comp.yearBuilt || "N/A"}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Link to Contact Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Link Property to Contact</h2>
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Select Contact
                  </label>
                  <select
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  >
                    <option value="">-- Choose a contact --</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} {contact.email && `(${contact.email})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Relationship
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  >
                    <option value="Interest">Interest</option>
                    <option value="Buyer">Buyer</option>
                    <option value="Seller">Seller</option>
                    <option value="Landlord">Landlord</option>
                    <option value="Tenant">Tenant</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={linkToContact}
                    disabled={!selectedContactId || linking}
                    className="flex-1 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {linking ? "Linking..." : "Link Contact"}
                  </button>
                  <button
                    onClick={() => {
                      setShowLinkModal(false);
                      setSelectedContactId("");
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:border-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Link to Transaction Modal */}
        {showTransactionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Link Property to Transaction</h2>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Select Transaction
                  </label>
                  <select
                    value={selectedTransactionId}
                    onChange={(e) => setSelectedTransactionId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  >
                    <option value="">-- Choose a transaction --</option>
                    {transactions.map((transaction) => (
                      <option key={transaction.id} value={transaction.id}>
                        {transaction.address} - {transaction.type} ({transaction.status})
                      </option>
                    ))}
                  </select>
                  {transactions.length === 0 && (
                    <p className="mt-2 text-xs text-gray-500">
                      No transactions found. Create a transaction first.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={linkToTransaction}
                    disabled={!selectedTransactionId || linkingTransaction}
                    className="flex-1 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {linkingTransaction ? "Linking..." : "Link Transaction"}
                  </button>
                  <button
                    onClick={() => {
                      setShowTransactionModal(false);
                      setSelectedTransactionId("");
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:border-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
