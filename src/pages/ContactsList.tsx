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
      // For demo mode, load mock data
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

      // Add new contact to the list
      setContacts((prev) => [data, ...prev]);

      // Reset form and close modal
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
        return "score-a";
      case "B":
        return "score-b";
      case "C":
        return "score-c";
      case "D":
        return "score-d";
      case "F":
        return "score-f";
    }
  };

  const getStatusBadgeColor = (status: ContactStatus) => {
    switch (status) {
      case "Hot":
        return "status-hot";
      case "Under Contract":
        return "badge-info";
      case "Closed":
        return "status-closed";
      case "Dead":
        return "badge-neutral";
      default:
        return "status-active";
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
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="spinner-lg"></div>
        <div className="text-subheadline text-secondary">Loading contacts</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-title-1">Contacts</h1>
            <p className="text-subheadline text-secondary mt-1">
              {filteredContacts.length} of {contacts.length} contacts
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 text-white rounded-lg text-subheadline-emphasized btn-primary"
          >
            Add Contact
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-surface-panel rounded-lg border border-surface-subtle shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-footnote-emphasized text-secondary mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, email, phone..."
                className="input-base w-full px-3 py-2 text-subheadline"
              />
            </div>

            {/* Score Filter */}
            <div>
              <label className="block text-footnote-emphasized text-secondary mb-2">Lead Score</label>
              <select
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value as LeadScore | "all")}
                className="input-base w-full px-3 py-2 text-subheadline"
              >
                <option value="all">All Scores</option>
                <option value="A">A - Hot</option>
                <option value="B">B - Warm</option>
                <option value="C">C - Medium</option>
                <option value="D">D - Cool</option>
                <option value="F">F - Cold</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-footnote-emphasized text-secondary mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ContactStatus | "all")}
                className="input-base w-full px-3 py-2 text-subheadline"
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

            {/* Source Filter */}
            <div>
              <label className="block text-footnote-emphasized text-secondary mb-2">Source</label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value as ContactSource | "all")}
                className="input-base w-full px-3 py-2 text-subheadline"
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
          <div className="flex gap-2 mt-6 pt-4 border-t border-surface-subtle">
            <button
              onClick={() => {
                setFilterScore("A");
                setFilterStatus("all");
              }}
              className="px-3 py-1.5 text-footnote badge-success rounded-md hover:opacity-80 transition-opacity"
            >
              A Leads
            </button>
            <button
              onClick={() => {
                setFilterStatus("Hot");
                setFilterScore("all");
              }}
              className="px-3 py-1.5 text-footnote badge-error rounded-md hover:opacity-80 transition-opacity"
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
              className="px-3 py-1.5 text-footnote badge-neutral rounded-md hover:opacity-80 transition-opacity"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-surface-panel rounded-lg border border-surface-subtle shadow-sm overflow-hidden">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-subheadline text-secondary">
              No contacts found. {searchQuery || filterScore !== "all" || filterStatus !== "all" ? "Try adjusting your filters." : "Add your first contact to get started."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-muted border-b border-surface-subtle">
                  <tr>
                    <th className="px-6 py-3 text-left text-footnote-emphasized text-secondary uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-footnote-emphasized text-secondary uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-footnote-emphasized text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-footnote-emphasized text-secondary uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-footnote-emphasized text-secondary uppercase tracking-wider">
                      Last Contact
                    </th>
                    <th className="px-6 py-3 text-left text-footnote-emphasized text-secondary uppercase tracking-wider">
                      Follow Up
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-subtle">
                  {filteredContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="hover:bg-surface-muted transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          to={`/contacts/${contact.id}`}
                          className="block hover:text-accent-primary transition-colors"
                        >
                          <div className="text-subheadline-emphasized text-primary">
                            {contact.name}
                          </div>
                          <div className="text-footnote text-secondary mt-0.5">
                            {contact.email || contact.phone || "No contact info"}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-footnote-emphasized ${getScoreBadgeColor(contact.lead_score)}`}>
                          {contact.lead_score}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-footnote ${getStatusBadgeColor(contact.status)}`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-subheadline text-secondary">
                        {contact.source}
                      </td>
                      <td className="px-6 py-4 text-subheadline text-secondary">
                        {formatDate(contact.last_contact_date)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-subheadline"
                          style={
                            isFollowUpOverdue(contact.next_follow_up_date)
                              ? { color: 'var(--color-error)', fontWeight: 600 }
                              : { color: 'var(--text-secondary)' }
                          }
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

        {/* Add Contact Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-panel rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-title-2">Add New Contact</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-secondary hover:text-primary"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddContact} className="space-y-6">
                {/* Name (Required) */}
                <div>
                  <label className="block text-subheadline-emphasized text-primary mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="input-base w-full px-3 py-2"
                    required
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-subheadline-emphasized text-primary mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      className="input-base w-full px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-subheadline-emphasized text-primary mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      className="input-base w-full px-3 py-2"
                    />
                  </div>
                </div>

                {/* Lead Score, Status, Source */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-subheadline-emphasized text-primary mb-2">
                      Lead Score
                    </label>
                    <select
                      value={newContact.lead_score}
                      onChange={(e) => setNewContact({ ...newContact, lead_score: e.target.value as LeadScore })}
                      className="input-base w-full px-3 py-2"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="F">F</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-subheadline-emphasized text-primary mb-2">
                      Status
                    </label>
                    <select
                      value={newContact.status}
                      onChange={(e) => setNewContact({ ...newContact, status: e.target.value as ContactStatus })}
                      className="input-base w-full px-3 py-2"
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
                    <label className="block text-subheadline-emphasized text-primary mb-2">
                      Source
                    </label>
                    <select
                      value={newContact.source}
                      onChange={(e) => setNewContact({ ...newContact, source: e.target.value as ContactSource })}
                      className="input-base w-full px-3 py-2"
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

                {/* Notes */}
                <div>
                  <label className="block text-subheadline-emphasized text-primary mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newContact.notes}
                    onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                    rows={4}
                    className="input-base w-full px-3 py-2"
                    placeholder="Add any relevant notes about this contact..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving || !newContact.name.trim()}
                    className="flex-1 btn-primary px-4 py-2"
                  >
                    {saving ? "Creating..." : "Create Contact"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-surface-muted text-primary rounded-md hover:bg-surface-subtle text-subheadline-emphasized motion-button"
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
