import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Contact } from "../types/contact";

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

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

  const todayFollowUps = contacts.filter((c) => {
    if (!c.next_follow_up_date) return false;
    const followUpDate = new Date(c.next_follow_up_date);
    const today = new Date();
    return (
      followUpDate.toDateString() === today.toDateString() ||
      followUpDate < today
    );
  });

  const hotLeads = contacts.filter(
    (c) => c.lead_score === "A" && c.status === "Hot"
  );

  const needAttention = contacts.filter((c) => {
    if (!c.last_contact_date) return true;
    const lastContact = new Date(c.last_contact_date);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return lastContact < sevenDaysAgo;
  });

  const thisWeekActivity = contacts.filter((c) => {
    if (!c.last_contact_date) return false;
    const lastContact = new Date(c.last_contact_date);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return lastContact >= sevenDaysAgo;
  }).length;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Your CRM overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Total Contacts
          </div>
          <div className="text-3xl font-semibold text-gray-900">{contacts.length}</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Due Today
          </div>
          <div className="text-3xl font-semibold text-gray-900">{todayFollowUps.length}</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Hot Leads
          </div>
          <div className="text-3xl font-semibold text-gray-900">{hotLeads.length}</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            This Week
          </div>
          <div className="text-3xl font-semibold text-gray-900">{thisWeekActivity}</div>
          <div className="text-xs text-gray-500 mt-1">contacts</div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-12">
        {/* Today's Follow-Ups */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Today's Follow-Ups</h2>
              <p className="text-sm text-gray-600 mt-1">
                {todayFollowUps.length} contacts need attention
              </p>
            </div>
            <Link
              to="/contacts"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              View all →
            </Link>
          </div>
          {todayFollowUps.length === 0 ? (
            <div className="border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-500">No follow-ups due today</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
              {todayFollowUps.slice(0, 5).map((contact) => (
                <Link
                  key={contact.id}
                  to={`/contacts/${contact.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {contact.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {contact.email || contact.phone}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {contact.lead_score}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {contact.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Due: {formatDate(contact.next_follow_up_date)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Hot Leads */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Hot Leads</h2>
              <p className="text-sm text-gray-600 mt-1">
                {hotLeads.length} A-scored leads
              </p>
            </div>
            <Link
              to="/contacts"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              View all →
            </Link>
          </div>
          {hotLeads.length === 0 ? (
            <div className="border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-500">No hot leads</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
              {hotLeads.slice(0, 5).map((contact) => (
                <Link
                  key={contact.id}
                  to={`/contacts/${contact.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {contact.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {contact.email || contact.phone}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600 mb-1">
                      Last: {formatDate(contact.last_contact_date)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {contact.source}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Need Attention */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Need Attention</h2>
              <p className="text-sm text-gray-600 mt-1">
                {needAttention.length} contacts haven't been contacted in 7+ days
              </p>
            </div>
            <Link
              to="/contacts"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              View all →
            </Link>
          </div>
          {needAttention.length === 0 ? (
            <div className="border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-500">All caught up!</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
              {needAttention.slice(0, 5).map((contact) => (
                <Link
                  key={contact.id}
                  to={`/contacts/${contact.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {contact.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {contact.email || contact.phone}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {contact.lead_score}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {contact.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Last: {formatDate(contact.last_contact_date)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
    next_follow_up_date: new Date().toISOString(),
    notes: "Prequalified for $500K",
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
    last_contact_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    next_follow_up_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "First-time buyer",
  },
];
