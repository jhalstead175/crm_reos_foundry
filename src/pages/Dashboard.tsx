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
      // Demo mode fallback
      setContacts(mockContacts);
    } finally {
      setLoading(false);
    }
  };

  // Calculate segments
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

  // Calculate stats
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
      <div className="min-h-screen bg-surface-app flex items-center justify-center">
        <div className="text-subheadline text-secondary">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-title-1">Dashboard</h1>
          <p className="text-subheadline text-secondary mt-1">
            Your CRM command center
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface-panel rounded-lg border border-surface-subtle p-4">
            <div className="text-footnote-emphasized text-secondary uppercase tracking-wide mb-1">
              Total Contacts
            </div>
            <div className="text-title-1">{contacts.length}</div>
          </div>
          <div className="bg-surface-panel rounded-lg border border-surface-subtle p-4">
            <div className="text-footnote-emphasized text-secondary uppercase tracking-wide mb-1">
              Due Today
            </div>
            <div className="text-title-1 text-red-600">{todayFollowUps.length}</div>
          </div>
          <div className="bg-surface-panel rounded-lg border border-surface-subtle p-4">
            <div className="text-footnote-emphasized text-secondary uppercase tracking-wide mb-1">
              Hot Leads
            </div>
            <div className="text-title-1 text-orange-600">{hotLeads.length}</div>
          </div>
          <div className="bg-surface-panel rounded-lg border border-surface-subtle p-4">
            <div className="text-footnote-emphasized text-secondary uppercase tracking-wide mb-1">
              This Week
            </div>
            <div className="text-title-1 text-green-600">{thisWeekActivity}</div>
            <div className="text-footnote text-secondary">contacts touched</div>
          </div>
        </div>

        {/* Main Widgets */}
        <div className="space-y-6">
          {/* Today's Follow-Ups */}
          <div className="bg-surface-panel rounded-lg border border-surface-subtle">
            <div className="border-b border-surface-subtle p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-title-2">Today's Follow-Ups</h2>
                  <p className="text-footnote text-secondary mt-1">
                    {todayFollowUps.length} contacts need attention today
                  </p>
                </div>
                <Link
                  to="/contacts"
                  className="text-subheadline text-accent-primary hover:text-blue-700"
                >
                  View All →
                </Link>
              </div>
            </div>
            <div className="p-4">
              {todayFollowUps.length === 0 ? (
                <div className="text-center py-8 text-subheadline text-secondary">
                  🎉 No follow-ups due today! You're all caught up.
                </div>
              ) : (
                <div className="space-y-3">
                  {todayFollowUps.slice(0, 5).map((contact) => (
                    <Link
                      key={contact.id}
                      to={`/contacts/${contact.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-surface-subtle hover:border-accent-primary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent-primary rounded-full flex items-center justify-center text-white font-bold">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-subheadline-emphasized text-primary">
                            {contact.name}
                          </div>
                          <div className="text-footnote text-secondary">
                            {contact.email || contact.phone}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-footnote">
                            {contact.lead_score}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-footnote">
                            {contact.status}
                          </span>
                        </div>
                        <div className="text-footnote text-red-600 font-semibold">
                          Due: {formatDate(contact.next_follow_up_date)} ⚠️
                        </div>
                      </div>
                    </Link>
                  ))}
                  {todayFollowUps.length > 5 && (
                    <div className="text-center pt-2">
                      <Link
                        to="/contacts"
                        className="text-subheadline text-accent-primary hover:text-blue-700"
                      >
                        +{todayFollowUps.length - 5} more
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Hot Leads */}
          <div className="bg-surface-panel rounded-lg border border-surface-subtle">
            <div className="border-b border-surface-subtle p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-title-2">Hot Leads</h2>
                  <p className="text-footnote text-secondary mt-1">
                    {hotLeads.length} A-scored leads with Hot status
                  </p>
                </div>
                <Link
                  to="/contacts"
                  className="text-subheadline text-accent-primary hover:text-blue-700"
                >
                  View All →
                </Link>
              </div>
            </div>
            <div className="p-4">
              {hotLeads.length === 0 ? (
                <div className="text-center py-8 text-subheadline text-secondary">
                  No hot leads right now. Focus on nurturing your pipeline.
                </div>
              ) : (
                <div className="space-y-3">
                  {hotLeads.slice(0, 5).map((contact) => (
                    <Link
                      key={contact.id}
                      to={`/contacts/${contact.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-surface-subtle hover:border-accent-primary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-subheadline-emphasized text-primary">
                            {contact.name}
                          </div>
                          <div className="text-footnote text-secondary">
                            {contact.email || contact.phone}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-footnote text-secondary mb-1">
                          Last contact: {formatDate(contact.last_contact_date)}
                        </div>
                        <div className="text-footnote text-secondary">
                          Source: {contact.source}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {hotLeads.length > 5 && (
                    <div className="text-center pt-2">
                      <Link
                        to="/contacts"
                        className="text-subheadline text-accent-primary hover:text-blue-700"
                      >
                        +{hotLeads.length - 5} more
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Need Attention */}
          <div className="bg-surface-panel rounded-lg border border-surface-subtle">
            <div className="border-b border-surface-subtle p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-title-2">Need Attention</h2>
                  <p className="text-footnote text-secondary mt-1">
                    {needAttention.length} contacts haven't been contacted in 7+ days
                  </p>
                </div>
                <Link
                  to="/contacts"
                  className="text-subheadline text-accent-primary hover:text-blue-700"
                >
                  View All →
                </Link>
              </div>
            </div>
            <div className="p-4">
              {needAttention.length === 0 ? (
                <div className="text-center py-8 text-subheadline text-secondary">
                  Great job! You're staying in touch with all your contacts.
                </div>
              ) : (
                <div className="space-y-3">
                  {needAttention.slice(0, 5).map((contact) => (
                    <Link
                      key={contact.id}
                      to={`/contacts/${contact.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-surface-subtle hover:border-accent-primary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-subheadline-emphasized text-primary">
                            {contact.name}
                          </div>
                          <div className="text-footnote text-secondary">
                            {contact.email || contact.phone}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-footnote">
                            {contact.lead_score}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-footnote">
                            {contact.status}
                          </span>
                        </div>
                        <div className="text-footnote text-orange-600">
                          Last contact: {formatDate(contact.last_contact_date)}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {needAttention.length > 5 && (
                    <div className="text-center pt-2">
                      <Link
                        to="/contacts"
                        className="text-subheadline text-accent-primary hover:text-blue-700"
                      >
                        +{needAttention.length - 5} more
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-3">
          <Link
            to="/contacts"
            className="px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-gray-800 text-subheadline-emphasized motion-button"
          >
            View All Contacts
          </Link>
          <Link
            to="/transactions"
            className="px-4 py-2 bg-surface-panel border border-surface-subtle rounded-md hover:border-accent-primary text-subheadline-emphasized motion-button"
          >
            View Transactions
          </Link>
          <Link
            to="/tasks"
            className="px-4 py-2 bg-surface-panel border border-surface-subtle rounded-md hover:border-accent-primary text-subheadline-emphasized motion-button"
          >
            View Tasks
          </Link>
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
    next_follow_up_date: new Date().toISOString(), // Due today
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
    last_contact_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago - needs attention
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
    status: "Hot",
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
    status: "Nurturing",
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    last_contact_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago - needs attention
    notes: "Interested but timing uncertain. Check back in Q2.",
  },
];
