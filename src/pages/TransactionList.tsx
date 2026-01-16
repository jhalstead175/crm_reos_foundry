import { Link } from "react-router-dom";

export default function TransactionList() {
  // Mock data for demonstration
  const transactions = [
    { id: "1", address: "123 Main St", status: "Active", type: "Purchase" },
    { id: "2", address: "456 Oak Ave", status: "Pending", type: "Sale" },
    { id: "3", address: "789 Elm Blvd", status: "Active", type: "Purchase" },
  ];

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-title-1">Transactions</h1>
          <button className="px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-gray-800 text-subheadline-emphasized motion-button">
            New Transaction
          </button>
        </div>

        <div className="mb-6 flex gap-4">
          <input
            type="search"
            placeholder="Search by address or client..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary motion-input"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary motion-input">
            <option>All Status</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Closed</option>
          </select>
        </div>

        <div className="space-y-4">
          {transactions.map((transaction) => (
            <Link
              key={transaction.id}
              to={`/transactions/${transaction.id}`}
              className="block bg-surface-panel rounded-lg border border-surface-subtle p-6 hover:border-accent-primary hover:shadow-md motion-card"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-headline">{transaction.address}</h2>
                  <p className="text-subheadline text-secondary mt-1">{transaction.type}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-footnote rounded-full">
                  {transaction.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
