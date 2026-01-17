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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="text-sm text-gray-500">Loading contact...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Contact Header */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold bg-orange-500">
                {contact.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{contact.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getScoreBadgeColor(contact.lead_score)}`}>
                    Score: {contact.lead_score}
                  </span>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusBadgeColor(contact.status)}`}>
                    {contact.status}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
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
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium text-sm"
              >
                Log Call
              </button>
              <button
                onClick={() => {
                  setLogType("email");
                  setShowLogForm(true);
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium text-sm"
              >
                Log Email
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600">Email</label>
              <p className="mt-1 text-sm text-gray-900">{contact.email || "Not provided"}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600">Phone</label>
              <p className="mt-1 text-sm text-gray-900">{contact.phone || "Not provided"}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600">Last Contact</label>
              <p className="mt-1 text-sm text-gray-900">{formatDateShort(contact.last_contact_date)}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600">Next Follow-Up</label>
              <p
                className={`mt-1 text-sm ${
                  contact.next_follow_up_date && new Date(contact.next_follow_up_date) < new Date()
                    ? "text-red-600 font-semibold"
                    : "text-gray-900"
                }`}
              >
                {formatDateShort(contact.next_follow_up_date)}
                {contact.next_follow_up_date && new Date(contact.next_follow_up_date) < new Date() && (
                  <span className="ml-1 text-xs">(Overdue)</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <button
            onClick={() => {
              setLogType("text");
              setShowLogForm(true);
            }}
            className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-orange-500 text-sm font-medium text-gray-700 transition-colors"
          >
            Log Text
          </button>
          <button
            onClick={() => {
              setLogType("meeting");
              setShowLogForm(true);
            }}
            className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-orange-500 text-sm font-medium text-gray-700 transition-colors"
          >
            Log Meeting
          </button>
          <button
            onClick={() => {
              setLogType("note");
              setShowLogForm(true);
            }}
            className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-orange-500 text-sm font-medium text-gray-700 transition-colors"
          >
            Add Note
          </button>
          <button
            onClick={() => setShowFollowUpForm(true)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-orange-500 text-sm font-medium text-gray-700 transition-colors"
          >
            Set Follow-Up
          </button>
          <button
            onClick={openEditForm}
            className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-orange-500 text-sm font-medium text-gray-700 transition-colors"
          >
            Edit Contact
          </button>
        </div>

        {/* Log Communication Form */}
        {showLogForm && (
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Log {logType.charAt(0).toUpperCase() + logType.slice(1)}
              </h2>
              <button
                onClick={() => setShowLogForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {(logType === "call" || logType === "text") && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      <span className="text-sm text-gray-700">Outbound</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="direction"
                        value="inbound"
                        checked={logDirection === "inbound"}
                        onChange={(e) => setLogDirection(e.target.value as "inbound")}
                      />
                      <span className="text-sm text-gray-700">Inbound</span>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  placeholder={`What happened during this ${logType}?`}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={logCommunication}
                  disabled={!logNote.trim()}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowLogForm(false);
                    setLogNote("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Set Follow-Up Form */}
        {showFollowUpForm && (
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Set Follow-Up Date</h2>
              <button
                onClick={() => setShowFollowUpForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Follow-Up Date
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="mt-2 text-xs text-gray-600">
                  {contact.next_follow_up_date
                    ? `Current follow-up: ${formatDateShort(contact.next_follow_up_date)}`
                    : "No follow-up date set"}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={setFollowUp}
                  disabled={!followUpDate}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Set Follow-Up
                </button>
                <button
                  onClick={() => {
                    setShowFollowUpForm(false);
                    setFollowUpDate("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Contact Form */}
        {showEditForm && (
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Contact</h2>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Lead Score, Status, Source */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lead Score
                  </label>
                  <select
                    value={editData.lead_score}
                    onChange={(e) => setEditData({ ...editData, lead_score: e.target.value as LeadScore })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="A">A - Hot</option>
                    <option value="B">B - Warm</option>
                    <option value="C">C - Medium</option>
                    <option value="D">D - Cool</option>
                    <option value="F">F - Cold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value as ContactStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Source
                  </label>
                  <select
                    value={editData.source}
                    onChange={(e) => setEditData({ ...editData, source: e.target.value as ContactSource })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveContact}
                  disabled={!editData.name.trim()}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Section */}
        {contact.notes && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Notes</h2>
            <p className="text-sm text-gray-700">{contact.notes}</p>
          </div>
        )}

        {/* Transactions Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Transactions</h2>
          <div className="space-y-3">
            {mockTransactions.map((transaction) => (
              <Link
                key={transaction.id}
                to={`/transactions/${transaction.id}`}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-orange-500 transition-colors"
              >
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {transaction.address}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Role: {transaction.role}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                    transaction.status === "Active"
                      ? "bg-blue-100 text-blue-700 border-blue-200"
                      : transaction.status === "Closed"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-yellow-100 text-yellow-700 border-yellow-200"
                  }`}
                >
                  {transaction.status}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Communication Timeline */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Communication History</h2>

          {events.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-500">
              No communications logged yet. Use the buttons above to log your first interaction.
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold bg-blue-100 text-blue-700 flex-shrink-0">
                    {getEventLabel(event.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 capitalize">
                        {event.type}
                      </span>
                      {event.direction && (
                        <span className="text-xs text-gray-600">
                          ({event.direction})
                        </span>
                      )}
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-gray-600">
                        {formatDate(event.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {event.payload.note || "No notes provided"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
