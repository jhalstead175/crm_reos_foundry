import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Contact, ContactEvent, ContactEventType, LeadScore, ContactStatus, ContactSource } from "../types/contact";

export default function ContactProfile() {
  const { id } = useParams<{ id: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [events, setEvents] = useState<ContactEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logType, setLogType] = useState<ContactEventType>("call");
  const [logNote, setLogNote] = useState("");
  const [logDirection, setLogDirection] = useState<"inbound" | "outbound">("outbound");
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    lead_score: "C" as LeadScore,
    source: "Other" as ContactSource,
    status: "New Lead" as ContactStatus,
    notes: "",
  });

  useEffect(() => {
    loadContact();
    loadEvents();
  }, [id]);

  const loadContact = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setContact(data);
    } catch (error) {
      console.error("Error loading contact:", error);
      // Demo mode fallback
      setContact(mockContact);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_events")
        .select("*")
        .eq("contact_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error loading events:", error);
      // Demo mode fallback
      setEvents(mockEvents);
    }
  };

  const logCommunication = async () => {
    if (!contact || !logNote.trim()) return;

    try {
      // Create event
      const newEvent = {
        contact_id: contact.id,
        type: logType,
        direction: logDirection,
        payload: {
          note: logNote,
          timestamp: new Date().toISOString(),
        },
      };

      const { error: eventError } = await supabase
        .from("contact_events")
        .insert([newEvent]);

      if (eventError) throw eventError;

      // Update last_contact_date
      const { error: updateError } = await supabase
        .from("contacts")
        .update({ last_contact_date: new Date().toISOString() })
        .eq("id", contact.id);

      if (updateError) throw updateError;

      // Reload data
      await loadContact();
      await loadEvents();

      // Reset form
      setLogNote("");
      setShowLogForm(false);
    } catch (error) {
      console.error("Error logging communication:", error);
      // In demo mode, just update local state
      const demoEvent: ContactEvent = {
        id: Math.random().toString(),
        contact_id: contact.id,
        type: logType,
        direction: logDirection,
        payload: { note: logNote },
        created_at: new Date().toISOString(),
      };
      setEvents([demoEvent, ...events]);
      setContact({ ...contact, last_contact_date: new Date().toISOString() });
      setLogNote("");
      setShowLogForm(false);
    }
  };

  const setFollowUp = async () => {
    if (!contact || !followUpDate) return;

    try {
      const { error } = await supabase
        .from("contacts")
        .update({ next_follow_up_date: followUpDate })
        .eq("id", contact.id);

      if (error) throw error;

      // Reload contact
      await loadContact();

      // Reset form
      setFollowUpDate("");
      setShowFollowUpForm(false);
    } catch (error) {
      console.error("Error setting follow-up:", error);
      // In demo mode, just update local state
      setContact({ ...contact, next_follow_up_date: followUpDate });
      setFollowUpDate("");
      setShowFollowUpForm(false);
    }
  };

  const openEditForm = () => {
    if (!contact) return;
    setEditData({
      name: contact.name,
      email: contact.email || "",
      phone: contact.phone || "",
      lead_score: contact.lead_score,
      source: contact.source,
      status: contact.status,
      notes: contact.notes || "",
    });
    setShowEditForm(true);
  };

  const saveContact = async () => {
    if (!contact) return;

    try {
      const { error } = await supabase
        .from("contacts")
        .update(editData)
        .eq("id", contact.id);

      if (error) throw error;

      // Reload contact
      await loadContact();

      // Close form
      setShowEditForm(false);
    } catch (error) {
      console.error("Error saving contact:", error);
      // In demo mode, just update local state
      setContact({ ...contact, ...editData });
      setShowEditForm(false);
    }
  };

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

  const getEventLabel = (type: ContactEventType) => {
    switch (type) {
      case "call":
        return "Call";
      case "text":
        return "Text";
      case "email":
        return "Email";
      case "meeting":
        return "Meeting";
      case "note":
        return "Note";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading || !contact) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-subheadline text-secondary">Loading contact...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contact Header */}
        <div className="bg-surface-panel rounded-lg border border-surface-subtle shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: 'var(--accent-primary)' }}>
                {contact.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-title-1">{contact.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-md text-footnote-emphasized ${getScoreBadgeColor(contact.lead_score)}`}>
                    Score: {contact.lead_score}
                  </span>
                  <span className={`px-2 py-1 rounded-md text-footnote ${getStatusBadgeColor(contact.status)}`}>
                    {contact.status}
                  </span>
                  <span className="px-2 py-1 rounded-md text-footnote badge-neutral">
                    {contact.source}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setLogType("call");
                  setShowLogForm(true);
                }}
                className="px-5 py-2.5 text-white rounded-lg text-subheadline-emphasized btn-primary"
              >
                Log Call
              </button>
              <button
                onClick={() => {
                  setLogType("email");
                  setShowLogForm(true);
                }}
                className="px-5 py-2.5 text-white rounded-lg text-subheadline-emphasized btn-primary"
              >
                Log Email
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-footnote-emphasized text-secondary">Email</label>
              <p className="mt-1 text-subheadline text-primary">{contact.email || "Not provided"}</p>
            </div>
            <div>
              <label className="block text-footnote-emphasized text-secondary">Phone</label>
              <p className="mt-1 text-subheadline text-primary">{contact.phone || "Not provided"}</p>
            </div>
            <div>
              <label className="block text-footnote-emphasized text-secondary">Last Contact</label>
              <p className="mt-1 text-subheadline text-primary">{formatDateShort(contact.last_contact_date)}</p>
            </div>
            <div>
              <label className="block text-footnote-emphasized text-secondary">Next Follow-Up</label>
              <p
                className="mt-1 text-subheadline"
                style={
                  contact.next_follow_up_date && new Date(contact.next_follow_up_date) < new Date()
                    ? { color: 'var(--color-error)', fontWeight: 600 }
                    : { color: 'var(--text-primary)' }
                }
              >
                {formatDateShort(contact.next_follow_up_date)}
                {contact.next_follow_up_date && new Date(contact.next_follow_up_date) < new Date() && (
                  <span className="ml-1 text-footnote">(Overdue)</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <button
            onClick={() => {
              setLogType("text");
              setShowLogForm(true);
            }}
            className="px-4 py-3 bg-surface-panel border border-surface-subtle rounded-lg hover:border-accent-primary text-subheadline-emphasized motion-button"
          >
            Log Text
          </button>
          <button
            onClick={() => {
              setLogType("meeting");
              setShowLogForm(true);
            }}
            className="px-4 py-3 bg-surface-panel border border-surface-subtle rounded-lg hover:border-accent-primary text-subheadline-emphasized motion-button"
          >
            Log Meeting
          </button>
          <button
            onClick={() => {
              setLogType("note");
              setShowLogForm(true);
            }}
            className="px-4 py-3 bg-surface-panel border border-surface-subtle rounded-lg hover:border-accent-primary text-subheadline-emphasized motion-button"
          >
            Add Note
          </button>
          <button
            onClick={() => setShowFollowUpForm(true)}
            className="px-4 py-3 bg-surface-panel border border-surface-subtle rounded-lg hover:border-accent-primary text-subheadline-emphasized motion-button"
          >
            Set Follow-Up
          </button>
          <button
            onClick={openEditForm}
            className="px-4 py-3 bg-surface-panel border border-surface-subtle rounded-lg hover:border-accent-primary text-subheadline-emphasized motion-button"
          >
            Edit Contact
          </button>
        </div>

        {/* Log Communication Form */}
        {showLogForm && (
          <div className="bg-surface-panel border border-surface-subtle shadow-sm rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-title-2">
                Log {logType.charAt(0).toUpperCase() + logType.slice(1)}
              </h2>
              <button
                onClick={() => setShowLogForm(false)}
                className="text-secondary hover:text-primary text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {(logType === "call" || logType === "text") && (
                <div>
                  <label className="block text-subheadline-emphasized text-primary mb-2">
                    Direction
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="direction"
                        value="outbound"
                        checked={logDirection === "outbound"}
                        onChange={(e) => setLogDirection(e.target.value as "outbound")}
                      />
                      <span className="text-subheadline">Outbound</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="direction"
                        value="inbound"
                        checked={logDirection === "inbound"}
                        onChange={(e) => setLogDirection(e.target.value as "inbound")}
                      />
                      <span className="text-subheadline">Inbound</span>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-subheadline-emphasized text-primary mb-2">
                  Notes
                </label>
                <textarea
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  placeholder={`What happened during this ${logType}?`}
                  rows={3}
                  className="input-base w-full px-3 py-2"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={logCommunication}
                  disabled={!logNote.trim()}
                  className="px-5 py-2.5 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-subheadline-emphasized btn-primary"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowLogForm(false);
                    setLogNote("");
                  }}
                  className="px-5 py-2.5 bg-surface-panel border border-surface-subtle rounded-lg hover:border-accent-primary text-subheadline-emphasized motion-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Set Follow-Up Form */}
        {showFollowUpForm && (
          <div className="bg-surface-panel border border-surface-subtle shadow-sm rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-title-2">Set Follow-Up Date</h2>
              <button
                onClick={() => setShowFollowUpForm(false)}
                className="text-secondary hover:text-primary text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-subheadline-emphasized text-primary mb-2">
                  Follow-Up Date
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="input-base w-full px-3 py-2"
                />
                <p className="mt-2 text-footnote text-secondary">
                  {contact.next_follow_up_date
                    ? `Current follow-up: ${formatDateShort(contact.next_follow_up_date)}`
                    : "No follow-up date set"}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={setFollowUp}
                  disabled={!followUpDate}
                  className="px-5 py-2.5 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-subheadline-emphasized btn-primary"
                >
                  Set Follow-Up
                </button>
                <button
                  onClick={() => {
                    setShowFollowUpForm(false);
                    setFollowUpDate("");
                  }}
                  className="px-5 py-2.5 bg-surface-panel border border-surface-subtle rounded-lg hover:border-accent-primary text-subheadline-emphasized motion-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Contact Form */}
        {showEditForm && (
          <div className="bg-surface-panel border border-surface-subtle shadow-sm rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-title-2">Edit Contact</h2>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-secondary hover:text-primary text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-subheadline-emphasized text-primary mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="input-base w-full px-3 py-2"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-subheadline-emphasized text-primary mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="input-base w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-subheadline-emphasized text-primary mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="input-base w-full px-3 py-2"
                  />
                </div>
              </div>

              {/* Lead Score, Status, Source */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-subheadline-emphasized text-primary mb-2">
                    Lead Score
                  </label>
                  <select
                    value={editData.lead_score}
                    onChange={(e) => setEditData({ ...editData, lead_score: e.target.value as LeadScore })}
                    className="input-base w-full px-3 py-2"
                  >
                    <option value="A">A - Hot</option>
                    <option value="B">B - Warm</option>
                    <option value="C">C - Medium</option>
                    <option value="D">D - Cool</option>
                    <option value="F">F - Cold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-subheadline-emphasized text-primary mb-2">
                    Status
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value as ContactStatus })}
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
                    value={editData.source}
                    onChange={(e) => setEditData({ ...editData, source: e.target.value as ContactSource })}
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
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  rows={4}
                  className="input-base w-full px-3 py-2"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveContact}
                  disabled={!editData.name.trim()}
                  className="px-5 py-2.5 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-subheadline-emphasized btn-primary"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditForm(false)}
                  className="px-5 py-2.5 bg-surface-panel border border-surface-subtle rounded-lg hover:border-accent-primary text-subheadline-emphasized motion-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Section */}
        {contact.notes && (
          <div className="bg-surface-panel rounded-lg border border-surface-subtle shadow-sm p-6 mb-8">
            <h2 className="text-title-2 mb-4">Contact Notes</h2>
            <p className="text-body text-primary">{contact.notes}</p>
          </div>
        )}

        {/* Transactions Section */}
        <div className="bg-surface-panel rounded-lg border border-surface-subtle shadow-sm p-6 mb-8">
          <h2 className="text-title-2 mb-4">Transactions</h2>
          <div className="space-y-3">
            {mockTransactions.map((transaction) => (
              <Link
                key={transaction.id}
                to={`/transactions/${transaction.id}`}
                className="flex items-center justify-between p-4 rounded-lg border border-surface-subtle hover:border-accent-primary motion-card"
              >
                <div>
                  <div className="text-subheadline-emphasized text-primary">
                    {transaction.address}
                  </div>
                  <div className="text-footnote text-secondary mt-1">
                    Role: {transaction.role}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-footnote ${
                    transaction.status === "Active"
                      ? "status-active"
                      : transaction.status === "Closed"
                      ? "status-closed"
                      : "status-pending"
                  }`}
                >
                  {transaction.status}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Communication Timeline */}
        <div className="bg-surface-panel rounded-lg border border-surface-subtle shadow-sm p-6">
          <h2 className="text-title-2 mb-4">Communication History</h2>

          {events.length === 0 ? (
            <div className="text-center py-12 text-subheadline text-secondary">
              No communications logged yet. Use the buttons above to log your first interaction.
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex gap-4 pb-4 border-b border-surface-subtle last:border-0"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-footnote-emphasized badge-info flex-shrink-0">
                    {getEventLabel(event.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-subheadline-emphasized text-primary capitalize">
                        {event.type}
                      </span>
                      {event.direction && (
                        <span className="text-footnote text-secondary">
                          ({event.direction})
                        </span>
                      )}
                      <span className="text-footnote text-secondary">•</span>
                      <span className="text-footnote text-secondary">
                        {formatDate(event.created_at)}
                      </span>
                    </div>
                    <p className="text-subheadline text-secondary">
                      {event.payload.note || "No notes provided"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}

// Mock data for demo mode
const mockContact: Contact = {
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
};

const mockEvents: ContactEvent[] = [
  {
    id: "1",
    contact_id: "1",
    type: "call",
    direction: "outbound",
    payload: { note: "Discussed property preferences. Very interested in downtown condos." },
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    contact_id: "1",
    type: "email",
    direction: "outbound",
    payload: { note: "Sent listing recommendations for 3 properties in their price range." },
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    contact_id: "1",
    type: "text",
    direction: "inbound",
    payload: { note: "Asked about showing availability for this weekend." },
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockTransactions = [
  { id: "1", address: "123 Main St", status: "Active", role: "Buyer" },
  { id: "2", address: "789 Elm Blvd", status: "Closed", role: "Buyer" },
];
