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
        return "bg-green-100 text-green-800 border-green-200";
      case "B":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "C":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "D":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "F":
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  const getStatusBadgeColor = (status: ContactStatus) => {
    switch (status) {
      case "Hot":
        return "bg-red-100 text-red-800";
      case "Under Contract":
        return "bg-purple-100 text-purple-800";
      case "Closed":
        return "bg-green-100 text-green-800";
      case "Dead":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
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
      <div className="min-h-screen bg-surface-app flex items-center justify-center">
        <div className="text-subheadline text-secondary">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-title-1">Contacts</h1>
            <p className="text-subheadline text-secondary mt-1">
              {filteredContacts.length} of {contacts.length} contacts
            </p>
          </div>
          <button className="px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-gray-800 text-subheadline-emphasized motion-button">
            Add Contact
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-surface-panel rounded-lg border border-surface-subtle p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-footnote-emphasized text-secondary mb-1">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, email, phone..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-subheadline focus:outline-none focus:ring-2 focus:ring-accent-primary motion-input"
              />
            </div>

            {/* Score Filter */}
            <div>
              <label className="block text-footnote-emphasized text-secondary mb-1">Lead Score</label>
              <select
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value as LeadScore | "all")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-subheadline focus:outline-none focus:ring-2 focus:ring-accent-primary"
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
              <label className="block text-footnote-emphasized text-secondary mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ContactStatus | "all")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-subheadline focus:outline-none focus:ring-2 focus:ring-accent-primary"
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
              <label className="block text-footnote-emphasized text-secondary mb-1">Source</label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value as ContactSource | "all")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-subheadline focus:outline-none focus:ring-2 focus:ring-accent-primary"
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
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                setFilterScore("A");
                setFilterStatus("all");
              }}
              className="px-3 py-1 text-footnote bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
            >
              A Leads
            </button>
            <button
              onClick={() => {
                setFilterStatus("Hot");
                setFilterScore("all");
              }}
              className="px-3 py-1 text-footnote bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
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
              className="px-3 py-1 text-footnote bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-surface-panel rounded-lg border border-surface-subtle overflow-hidden">
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
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-footnote-emphasized border ${getScoreBadgeColor(
                            contact.lead_score
                          )}`}
                        >
                          {contact.lead_score}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-footnote ${getStatusBadgeColor(
                            contact.status
                          )}`}
                        >
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
                          className={`text-subheadline ${
                            isFollowUpOverdue(contact.next_follow_up_date)
                              ? "text-red-600 font-semibold"
                              : "text-secondary"
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
