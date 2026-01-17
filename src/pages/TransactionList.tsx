import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Contact } from "../types/contact";

interface Transaction {
  id: string;
  address: string;
  type: "Purchase" | "Sale";
  status: "Active" | "Pending" | "Closed";
  contact_id?: string;
  created_at: string;
}

export default function TransactionList() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "Active" | "Pending" | "Closed">("all");

  // New Transaction Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    address: "",
    type: "Purchase" as "Purchase" | "Sale",
    status: "Active" as "Active" | "Pending" | "Closed",
    contact_id: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);

      // Load contacts for the contact picker
      const { data: contactsData, error: contactsError } = await supabase
        .from("contacts")
        .select("*")
        .order("name", { ascending: true });

      if (contactsError) throw contactsError;
      setContacts(contactsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      // For demo mode, use mock data
      setTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTransaction.address.trim()) {
      alert("Address is required");
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert([
          {
            address: newTransaction.address.trim(),
            type: newTransaction.type,
            status: newTransaction.status,
            contact_id: newTransaction.contact_id || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Close modal and navigate to new transaction
      setShowCreateModal(false);
      navigate(`/transactions/${data.id}`);
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert("Failed to create transaction. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      searchQuery === "" ||
      transaction.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Active":
        return "status-active";
      case "Pending":
        return "badge-warning";
      case "Closed":
        return "status-closed";
      default:
        return "badge-neutral";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="spinner-lg"></div>
        <div className="text-subheadline text-secondary">Loading transactions</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-title-1">Transactions</h1>
          <p className="text-subheadline text-secondary mt-1">
            {filteredTransactions.length} of {transactions.length} transactions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary px-5 py-2.5"
        >
          New Transaction
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-surface-panel rounded-lg border border-surface-subtle shadow-sm p-6 mb-8">
        <div className="flex gap-4">
          <input
            type="search"
            placeholder="Search by address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base flex-1 px-4 py-2"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="input-base px-4 py-2"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-surface-panel rounded-lg border border-surface-subtle p-12 text-center">
          <p className="text-subheadline text-secondary">
            {searchQuery || filterStatus !== "all"
              ? "No transactions found. Try adjusting your filters."
              : "No transactions yet. Create your first transaction to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <Link
              key={transaction.id}
              to={`/transactions/${transaction.id}`}
              className="block bg-surface-panel rounded-lg border border-surface-subtle p-6 hover:border-accent-primary hover:shadow-md motion-card"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-headline text-primary">{transaction.address}</h2>
                  <p className="text-subheadline text-secondary mt-1">{transaction.type}</p>
                </div>
                <span
                  className={`px-3 py-1 text-footnote rounded-full ${getStatusBadgeClass(
                    transaction.status
                  )}`}
                >
                  {transaction.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Transaction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-panel rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-title-2">Create New Transaction</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-secondary hover:text-primary"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-6">
              {/* Address (Required) */}
              <div>
                <label className="block text-subheadline-emphasized text-primary mb-2">
                  Property Address *
                </label>
                <input
                  type="text"
                  value={newTransaction.address}
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, address: e.target.value })
                  }
                  className="input-base w-full px-3 py-2"
                  placeholder="123 Main St, City, State ZIP"
                  required
                />
              </div>

              {/* Type, Status, Contact */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-subheadline-emphasized text-primary mb-2">
                    Type
                  </label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        type: e.target.value as "Purchase" | "Sale",
                      })
                    }
                    className="input-base w-full px-3 py-2"
                  >
                    <option value="Purchase">Purchase</option>
                    <option value="Sale">Sale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-subheadline-emphasized text-primary mb-2">
                    Status
                  </label>
                  <select
                    value={newTransaction.status}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        status: e.target.value as "Active" | "Pending" | "Closed",
                      })
                    }
                    className="input-base w-full px-3 py-2"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-subheadline-emphasized text-primary mb-2">
                    Primary Contact
                  </label>
                  <select
                    value={newTransaction.contact_id}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, contact_id: e.target.value })
                    }
                    className="input-base w-full px-3 py-2"
                  >
                    <option value="">-- Optional --</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving || !newTransaction.address.trim()}
                  className="flex-1 btn-primary px-4 py-2"
                >
                  {saving ? "Creating..." : "Create Transaction"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
const mockTransactions: Transaction[] = [
  {
    id: "1",
    address: "123 Main St",
    status: "Active",
    type: "Purchase",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    address: "456 Oak Ave",
    status: "Pending",
    type: "Sale",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    address: "789 Elm Blvd",
    status: "Active",
    type: "Purchase",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
