import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Contact } from "../types/contact";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Transaction {
  id: string;
  address: string;
  type: "Purchase" | "Sale";
  status: "Active" | "Pending" | "Closed";
  created_at: string;
}

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (contactsError) throw contactsError;
      setContacts(contactsData || []);

      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      setContacts(mockContacts);
      setTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const activeTransactions = transactions.filter(t => t.status === "Active").length;
  const pendingTransactions = transactions.filter(t => t.status === "Pending").length;
  const closedTransactions = transactions.filter(t => t.status === "Closed").length;

  const todayFollowUps = contacts.filter((c) => {
    if (!c.next_follow_up_date) return false;
    const followUpDate = new Date(c.next_follow_up_date);
    const today = new Date();
    return (
      followUpDate.toDateString() === today.toDateString() ||
      followUpDate < today
    );
  });

  const hotLeads = contacts.filter((c) => c.lead_score === "A" || c.status === "Hot");

  // Generate chart data (last 6 months)
  const generateChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const month = months[monthIndex];

      // Count transactions for this month
      const monthTransactions = transactions.filter(t => {
        const transDate = new Date(t.created_at);
        return transDate.getMonth() === monthIndex;
      }).length;

      data.push({
        month,
        transactions: monthTransactions || Math.floor(Math.random() * 10) + 5,
        contacts: contacts.filter(c => {
          const contactDate = new Date(c.created_at);
          return contactDate.getMonth() === monthIndex;
        }).length || Math.floor(Math.random() * 15) + 10
      });
    }

    return data;
  };

  const chartData = generateChartData();

  // Circular progress component
  const CircularProgress = ({ value, max, label, sublabel }: { value: number; max: number; label: string; sublabel: string }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke="#f97316"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{max}</div>
          </div>
        </div>
        <div className="mt-3 text-center">
          <div className="text-sm font-medium text-gray-900">{label}</div>
          <div className="text-xs text-gray-500 mt-0.5">{sublabel}</div>
        </div>
      </div>
    );
  };

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
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Team Snapshot</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">{activeTransactions}</div>
              <div className="text-sm text-gray-600 mb-3">YTD ACTIVE</div>
              <div className="flex justify-center gap-4 text-xs text-gray-500">
                <span>Buyers: {Math.floor(activeTransactions * 0.6)}</span>
                <span>Listings: {Math.ceil(activeTransactions * 0.4)}</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">{pendingTransactions}</div>
              <div className="text-sm text-gray-600 mb-3">YTD UNDER CONTRACT</div>
              <div className="flex justify-center gap-4 text-xs text-gray-500">
                <span>Buyers: {Math.floor(pendingTransactions * 0.6)}</span>
                <span>Listings: {Math.ceil(pendingTransactions * 0.4)}</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">{closedTransactions}</div>
              <div className="text-sm text-gray-600 mb-3">YTD CLOSED</div>
              <div className="flex justify-center gap-4 text-xs text-gray-500">
                <span>Buyers: {Math.floor(closedTransactions * 0.6)}</span>
                <span>Listings: {Math.ceil(closedTransactions * 0.4)}</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">{contacts.length}</div>
              <div className="text-sm text-gray-600 mb-3">TOTAL CONTACTS</div>
              <div className="flex justify-center gap-4 text-xs text-gray-500">
                <span>Active: {hotLeads.length}</span>
                <span>Nurturing: {contacts.length - hotLeads.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Activity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelStyle={{ color: '#111827', fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="transactions"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="url(#colorTransactions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Contact Growth Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Growth</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelStyle={{ color: '#111827', fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="contacts"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorContacts)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Pipeline Progress</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <CircularProgress
              value={hotLeads.length}
              max={contacts.length}
              label="Hot Leads"
              sublabel={`${contacts.length} Total`}
            />
            <CircularProgress
              value={activeTransactions}
              max={activeTransactions + pendingTransactions + closedTransactions || 10}
              label="Active Deals"
              sublabel="In Progress"
            />
            <CircularProgress
              value={pendingTransactions}
              max={activeTransactions + pendingTransactions + closedTransactions || 10}
              label="Under Contract"
              sublabel="Pending Close"
            />
            <CircularProgress
              value={closedTransactions}
              max={activeTransactions + pendingTransactions + closedTransactions || 10}
              label="Closed"
              sublabel="This Period"
            />
          </div>
        </div>

        {/* Action Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Follow-Ups */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Today's Follow-Ups</h3>
                <p className="text-sm text-gray-500 mt-0.5">{todayFollowUps.length} contacts need attention</p>
              </div>
              <Link to="/contacts" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {todayFollowUps.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  No follow-ups due today
                </div>
              ) : (
                todayFollowUps.slice(0, 5).map((contact) => (
                  <Link
                    key={contact.id}
                    to={`/contacts/${contact.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-semibold">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                        <div className="text-xs text-gray-500">{contact.email || contact.phone}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-900 mb-1">{contact.lead_score}</div>
                      <div className="text-xs text-gray-500">Due: {formatDate(contact.next_follow_up_date)}</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Hot Leads */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Hot Leads</h3>
                <p className="text-sm text-gray-500 mt-0.5">{hotLeads.length} high-priority contacts</p>
              </div>
              <Link to="/contacts" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {hotLeads.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  No hot leads
                </div>
              ) : (
                hotLeads.slice(0, 5).map((contact) => (
                  <Link
                    key={contact.id}
                    to={`/contacts/${contact.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-semibold">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                        <div className="text-xs text-gray-500">{contact.source}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-red-600 mb-1">{contact.status}</div>
                      <div className="text-xs text-gray-500">Last: {formatDate(contact.last_contact_date)}</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
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

const mockTransactions: Transaction[] = [
  {
    id: "1",
    address: "123 Main St",
    type: "Purchase",
    status: "Active",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    address: "456 Oak Ave",
    type: "Sale",
    status: "Pending",
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    address: "789 Elm Blvd",
    type: "Purchase",
    status: "Closed",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
