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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-title-1">Property Search</h1>
          <p className="text-subheadline text-secondary mt-1">
            Search properties using RentCast MLS data
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-surface-panel rounded-lg border border-surface-subtle p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-subheadline-emphasized text-primary mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder="123 Main St"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary motion-input"
                  required
                />
              </div>
              <div>
                <label className="block text-subheadline-emphasized text-primary mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="San Francisco"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary motion-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-subheadline-emphasized text-primary mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="CA"
                    maxLength={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary motion-input"
                  />
                </div>
                <div>
                  <label className="block text-subheadline-emphasized text-primary mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="94102"
                    maxLength={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary motion-input"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !searchAddress.trim()}
              className="px-6 py-2 bg-accent-primary text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-subheadline-emphasized motion-button"
            >
              {loading ? "Searching..." : "Search Property"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-footnote text-yellow-800">{error}</p>
            </div>
          )}
        </div>

        {/* Property Results */}
        {property && (
          <div className="space-y-6">
            {/* Property Header */}
            <div className="bg-surface-panel rounded-lg border border-surface-subtle p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-title-2">{property.address}</h2>
                  <p className="text-subheadline text-secondary mt-1">
                    {property.propertyType} • {property.bedrooms} bed • {property.bathrooms} bath • {formatNumber(property.squareFootage)} sqft
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveProperty}
                    disabled={saving || !!savedPropertyId}
                    className="px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-subheadline-emphasized motion-button"
                  >
                    {savedPropertyId ? "✓ Saved" : saving ? "Saving..." : "Save Property"}
                  </button>
                  <button
                    onClick={openLinkModal}
                    disabled={!savedPropertyId}
                    className="px-4 py-2 bg-surface-panel border border-surface-subtle rounded-md hover:border-accent-primary disabled:opacity-50 disabled:cursor-not-allowed text-subheadline-emphasized motion-button"
                  >
                    Link to Contact
                  </button>
                  <button
                    onClick={openTransactionModal}
                    disabled={!savedPropertyId}
                    className="px-4 py-2 bg-surface-panel border border-surface-subtle rounded-md hover:border-accent-primary disabled:opacity-50 disabled:cursor-not-allowed text-subheadline-emphasized motion-button"
                  >
                    Link to Transaction
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-surface-subtle">
                <div>
                  <div className="text-footnote text-secondary">Estimated Value</div>
                  <div className="text-title-3 text-accent-primary mt-1">
                    {formatCurrency(propertyValue?.price)}
                  </div>
                </div>
                <div>
                  <div className="text-footnote text-secondary">Estimated Rent</div>
                  <div className="text-title-3 text-green-600 mt-1">
                    {formatCurrency(rentalEstimate?.rent)}/mo
                  </div>
                </div>
                <div>
                  <div className="text-footnote text-secondary">Last Sale</div>
                  <div className="text-title-3 mt-1">
                    {formatCurrency(property.lastSalePrice)}
                  </div>
                  <div className="text-footnote text-secondary">
                    {property.lastSaleDate && new Date(property.lastSaleDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-footnote text-secondary">Year Built</div>
                  <div className="text-title-3 mt-1">
                    {property.yearBuilt || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-surface-panel rounded-lg border border-surface-subtle">
              <nav className="flex border-b border-surface-subtle px-6">
                {[
                  { id: "details" as const, label: "Property Details" },
                  { id: "value" as const, label: "Value Estimate" },
                  { id: "rental" as const, label: "Rental Estimate" },
                  { id: "comps" as const, label: `Comparables (${comparables.length})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-subheadline-emphasized border-b-2 motion-tab ${
                      activeTab === tab.id
                        ? "border-accent-primary text-accent-primary"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="p-6">
                {/* Details Tab */}
                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-footnote text-secondary">Bedrooms</div>
                        <div className="text-subheadline-emphasized mt-1">{property.bedrooms || "N/A"}</div>
                      </div>
                      <div>
                        <div className="text-footnote text-secondary">Bathrooms</div>
                        <div className="text-subheadline-emphasized mt-1">{property.bathrooms || "N/A"}</div>
                      </div>
                      <div>
                        <div className="text-footnote text-secondary">Square Footage</div>
                        <div className="text-subheadline-emphasized mt-1">{formatNumber(property.squareFootage)}</div>
                      </div>
                      <div>
                        <div className="text-footnote text-secondary">Lot Size</div>
                        <div className="text-subheadline-emphasized mt-1">{formatNumber(property.lotSize)} sqft</div>
                      </div>
                      <div>
                        <div className="text-footnote text-secondary">Property Type</div>
                        <div className="text-subheadline-emphasized mt-1">{property.propertyType || "N/A"}</div>
                      </div>
                      <div>
                        <div className="text-footnote text-secondary">County</div>
                        <div className="text-subheadline-emphasized mt-1">{property.county || "N/A"}</div>
                      </div>
                    </div>

                    {property.features && property.features.length > 0 && (
                      <div>
                        <div className="text-footnote text-secondary mb-2">Features</div>
                        <div className="flex flex-wrap gap-2">
                          {property.features.map((feature, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-surface-muted text-primary rounded-full text-footnote"
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
                      <div className="text-footnote text-secondary mb-2">Estimated Value</div>
                      <div className="text-display text-accent-primary">{formatCurrency(propertyValue.price)}</div>
                      <div className="text-subheadline text-secondary mt-2">
                        Range: {formatCurrency(propertyValue.priceRangeLow)} - {formatCurrency(propertyValue.priceRangeHigh)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-footnote text-secondary">Confidence Score</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-primary"
                          style={{ width: `${propertyValue.confidenceScore * 100}%` }}
                        />
                      </div>
                      <div className="text-subheadline-emphasized">{Math.round(propertyValue.confidenceScore * 100)}%</div>
                    </div>

                    <div className="p-4 bg-surface-muted rounded-lg">
                      <p className="text-footnote text-secondary">
                        This automated valuation model (AVM) is based on recent comparable sales, property characteristics, and local market trends. The actual market value may vary.
                      </p>
                    </div>
                  </div>
                )}

                {/* Rental Estimate Tab */}
                {activeTab === "rental" && rentalEstimate && (
                  <div className="space-y-6">
                    <div>
                      <div className="text-footnote text-secondary mb-2">Estimated Monthly Rent</div>
                      <div className="text-display text-green-600">{formatCurrency(rentalEstimate.rent)}/mo</div>
                      <div className="text-subheadline text-secondary mt-2">
                        Range: {formatCurrency(rentalEstimate.rentRangeLow)} - {formatCurrency(rentalEstimate.rentRangeHigh)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-footnote text-secondary">Confidence Score</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600"
                          style={{ width: `${rentalEstimate.confidenceScore * 100}%` }}
                        />
                      </div>
                      <div className="text-subheadline-emphasized">{Math.round(rentalEstimate.confidenceScore * 100)}%</div>
                    </div>

                    {propertyValue && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-surface-muted rounded-lg">
                          <div className="text-footnote text-secondary mb-1">Gross Yield</div>
                          <div className="text-title-3 text-accent-primary">
                            {((rentalEstimate.rent * 12 / propertyValue.price) * 100).toFixed(2)}%
                          </div>
                        </div>
                        <div className="p-4 bg-surface-muted rounded-lg">
                          <div className="text-footnote text-secondary mb-1">Annual Rent</div>
                          <div className="text-title-3 text-green-600">
                            {formatCurrency(rentalEstimate.rent * 12)}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-surface-muted rounded-lg">
                      <p className="text-footnote text-secondary">
                        Rental estimate based on comparable properties, local market data, and property characteristics. Actual rental income may vary based on condition, amenities, and current market demand.
                      </p>
                    </div>
                  </div>
                )}

                {/* Comparables Tab */}
                {activeTab === "comps" && (
                  <div className="space-y-4">
                    {comparables.length === 0 ? (
                      <div className="text-center py-8 text-subheadline text-secondary">
                        No comparable sales found for this property.
                      </div>
                    ) : (
                      comparables.map((comp) => (
                        <div
                          key={comp.id}
                          className="p-4 border border-surface-subtle rounded-lg hover:border-accent-primary transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="text-subheadline-emphasized text-primary">{comp.address}</div>
                              <div className="text-footnote text-secondary mt-1">
                                {comp.distance} miles away
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-title-3 text-accent-primary">
                                {formatCurrency(comp.lastSalePrice)}
                              </div>
                              <div className="text-footnote text-secondary">
                                {comp.lastSaleDate && new Date(comp.lastSaleDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <div className="text-footnote text-secondary">Beds</div>
                              <div className="text-subheadline-emphasized">{comp.bedrooms}</div>
                            </div>
                            <div>
                              <div className="text-footnote text-secondary">Baths</div>
                              <div className="text-subheadline-emphasized">{comp.bathrooms}</div>
                            </div>
                            <div>
                              <div className="text-footnote text-secondary">Sqft</div>
                              <div className="text-subheadline-emphasized">{formatNumber(comp.squareFootage)}</div>
                            </div>
                            <div>
                              <div className="text-footnote text-secondary">Built</div>
                              <div className="text-subheadline-emphasized">{comp.yearBuilt || "N/A"}</div>
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
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-title-2">Link Property to Contact</h2>
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="text-secondary hover:text-primary"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-subheadline-emphasized text-primary mb-2">
                    Select Contact
                  </label>
                  <select
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary motion-input"
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
                  <label className="block text-subheadline-emphasized text-primary mb-2">
                    Relationship
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary motion-input"
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
                    className="flex-1 px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-subheadline-emphasized motion-button"
                  >
                    {linking ? "Linking..." : "Link Contact"}
                  </button>
                  <button
                    onClick={() => {
                      setShowLinkModal(false);
                      setSelectedContactId("");
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-subheadline-emphasized motion-button"
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
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-title-2">Link Property to Transaction</h2>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="text-secondary hover:text-primary"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-subheadline-emphasized text-primary mb-2">
                    Select Transaction
                  </label>
                  <select
                    value={selectedTransactionId}
                    onChange={(e) => setSelectedTransactionId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary motion-input"
                  >
                    <option value="">-- Choose a transaction --</option>
                    {transactions.map((transaction) => (
                      <option key={transaction.id} value={transaction.id}>
                        {transaction.address} - {transaction.type} ({transaction.status})
                      </option>
                    ))}
                  </select>
                  {transactions.length === 0 && (
                    <p className="mt-2 text-footnote text-secondary">
                      No transactions found. Create a transaction first.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={linkToTransaction}
                    disabled={!selectedTransactionId || linkingTransaction}
                    className="flex-1 px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-subheadline-emphasized motion-button"
                  >
                    {linkingTransaction ? "Linking..." : "Link Transaction"}
                  </button>
                  <button
                    onClick={() => {
                      setShowTransactionModal(false);
                      setSelectedTransactionId("");
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-subheadline-emphasized motion-button"
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
