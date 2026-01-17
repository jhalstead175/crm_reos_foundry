import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Contact, LeadScore, ContactSource, ContactStatus } from "../types/contact";

export default function ContactsList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterScore, setFilterScore] = useState<LeadScore | "all">("all");
  const [filterStatus, setFilterStatus] = useState<ContactStatus | "all">("all");
  const [filterSource, setFilterSource] = useState<ContactSource | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Add Contact Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    lead_score: "C" as LeadScore,
    status: "New Lead" as ContactStatus,
    source: "Website" as ContactSource,
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error("Error loading contacts:", error);
      setContacts(mockContacts);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newContact.name.trim()) {
      alert("Name is required");
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("contacts")
        .insert([
          {
            name: newContact.name.trim(),
            email: newContact.email.trim() || null,
            phone: newContact.phone.trim() || null,
            lead_score: newContact.lead_score,
            status: newContact.status,
            source: newContact.source,
            notes: newContact.notes.trim() || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setContacts((prev) => [data, ...prev]);
      setNewContact({
        name: "",
        email: "",
        phone: "",
        lead_score: "C",
        status: "New Lead",
        source: "Website",
        notes: "",
      });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error creating contact:", error);
      alert("Failed to create contact. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Calculate metrics
  const scoreBreakdown = {
    A: contacts.filter((c) => c.lead_score === "A").length,
    B: contacts.filter((c) => c.lead_score === "B").length,
    C: contacts.filter((c) => c.lead_score === "C").length,
    D: contacts.filter((c) => c.lead_score === "D").length,
    F: contacts.filter((c) => c.lead_score === "F").length,
  };

  // Filter and search logic
  const filteredContacts = contacts.filter((contact) => {
    const matchesScore = filterScore === "all" || contact.lead_score === filterScore;
    const matchesStatus = filterStatus === "all" || contact.status === filterStatus;
    const matchesSource = filterSource === "all" || contact.source === filterSource;
    const matchesSearch =
      searchQuery === "" ||
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone?.includes(searchQuery);

    return matchesScore && matchesStatus && matchesSource && matchesSearch;
  });

  const getScoreBadgeColor = (score: LeadScore) => {
    switch (score) {
      case "A":
        return "bg-green-100 text-green-700 border-green-200";
      case "B":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "C":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "D":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "F":
        return "bg-red-100 text-red-700 border-red-200";
    }
  };

  const getStatusBadgeColor = (status: ContactStatus) => {
    switch (status) {
      case "Hot":
        return "bg-red-100 text-red-700 border-red-200";
      case "Under Contract":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Closed":
        return "bg-green-100 text-green-700 border-green-200";
      case "Dead":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isFollowUpOverdue = (date?: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
        <div className="text-sm text-gray-500">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
              <p className="text-sm text-gray-600 mt-1">
                {contacts.length} total contacts • {filteredContacts.length} shown
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add Contact
            </button>
          </div>

          {/* Lead Score Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-1">{scoreBreakdown.A}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">A Leads</div>
            </div>
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-1">{scoreBreakdown.B}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">B Leads</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600 mb-1">{scoreBreakdown.C}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">C Leads</div>
            </div>
            <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-1">{scoreBreakdown.D}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">D Leads</div>
            </div>
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-3xl font-bold text-red-600 mb-1">{scoreBreakdown.F}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">F Leads</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, email, phone..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Lead Score</label>
              <select
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value as LeadScore | "all")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                <option value="all">All Scores</option>
                <option value="A">A - Hot</option>
                <option value="B">B - Warm</option>
                <option value="C">C - Medium</option>
                <option value="D">D - Cool</option>
                <option value="F">F - Cold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ContactStatus | "all")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                <option value="all">All Statuses</option>
                <option value="New Lead">New Lead</option>
                <option value="Nurturing">Nurturing</option>
                <option value="Hot">Hot</option>
                <option value="Under Contract">Under Contract</option>
                <option value="Closed">Closed</option>
                <option value="Dead">Dead</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Source</label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value as ContactSource | "all")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                <option value="all">All Sources</option>
                <option value="Website">Website</option>
                <option value="Zillow">Zillow</option>
                <option value="Realtor.com">Realtor.com</option>
                <option value="Referral">Referral</option>
                <option value="Past Client">Past Client</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Open House">Open House</option>
                <option value="Social Media">Social Media</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setFilterScore("A");
                setFilterStatus("all");
                setFilterSource("all");
              }}
              className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
            >
              A Leads Only
            </button>
            <button
              onClick={() => {
                setFilterStatus("Hot");
                setFilterScore("all");
                setFilterSource("all");
              }}
              className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              Hot Status
            </button>
            <button
              onClick={() => {
                setFilterScore("all");
                setFilterStatus("all");
                setFilterSource("all");
                setSearchQuery("");
              }}
              className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-gray-500 mb-1">No contacts found</p>
              <p className="text-xs text-gray-400">
                {searchQuery || filterScore !== "all" || filterStatus !== "all" || filterSource !== "all"
                  ? "Try adjusting your filters."
                  : "Add your first contact to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Follow Up
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={`/contacts/${contact.id}`}
                          className="block hover:text-orange-500 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {contact.email || contact.phone || "No contact info"}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getScoreBadgeColor(contact.lead_score)}`}>
                          {contact.lead_score}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusBadgeColor(contact.status)}`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {contact.source}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(contact.last_contact_date)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-medium ${
                            isFollowUpOverdue(contact.next_follow_up_date)
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {formatDate(contact.next_follow_up_date)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-gray-200 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add New Contact</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Name *</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Lead Score</label>
                  <select
                    value={newContact.lead_score}
                    onChange={(e) => setNewContact({ ...newContact, lead_score: e.target.value as LeadScore })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
                  <select
                    value={newContact.status}
                    onChange={(e) => setNewContact({ ...newContact, status: e.target.value as ContactStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="Nurturing">Nurturing</option>
                    <option value="Hot">Hot</option>
                    <option value="Under Contract">Under Contract</option>
                    <option value="Closed">Closed</option>
                    <option value="Dead">Dead</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Source</label>
                  <select
                    value={newContact.source}
                    onChange={(e) => setNewContact({ ...newContact, source: e.target.value as ContactSource })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="Website">Website</option>
                    <option value="Zillow">Zillow</option>
                    <option value="Realtor.com">Realtor.com</option>
                    <option value="Referral">Referral</option>
                    <option value="Past Client">Past Client</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Open House">Open House</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Notes</label>
                <textarea
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="Add any relevant notes about this contact..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving || !newContact.name.trim()}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Creating..." : "Create Contact"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:border-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Mock data for demo mode
const mockContacts: Contact[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    lead_score: "A",
    source: "Website",
    status: "Hot",
    created_at: new Date().toISOString(),
    last_contact_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    next_follow_up_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Prequalified for $500K. Looking for 3BR/2BA in downtown area.",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "(555) 234-5678",
    lead_score: "B",
    source: "Zillow",
    status: "Nurturing",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    last_contact_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    next_follow_up_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "First-time buyer. Needs education on the process.",
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mchen@example.com",
    phone: "(555) 345-6789",
    lead_score: "C",
    source: "Referral",
    status: "New Lead",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    next_follow_up_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Referred by John Doe. Interested in investment properties.",
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    email: "emily.r@example.com",
    phone: "(555) 456-7890",
    lead_score: "A",
    source: "Past Client",
    status: "Under Contract",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_contact_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    next_follow_up_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Upgrading from previous home. Closing in 2 weeks.",
  },
  {
    id: "5",
    name: "David Kim",
    email: "dkim@example.com",
    phone: "(555) 567-8901",
    lead_score: "D",
    source: "Cold Call",
    status: "Dead",
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    last_contact_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Not interested at this time. May revisit in 2 years.",
  },
];
