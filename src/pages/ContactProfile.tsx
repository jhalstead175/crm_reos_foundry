import { useParams } from "react-router-dom";

export default function ContactProfile() {
  const { id } = useParams<{ id: string }>();

  // Mock contact data
  const contact = {
    id,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    role: "Buyer",
    notes: "Prequalified for $500K. Looking for 3BR/2BA in downtown area.",
  };

  const transactions = [
    { id: "1", address: "123 Main St", status: "Active", role: "Buyer" },
    { id: "2", address: "789 Elm Blvd", status: "Closed", role: "Buyer" },
  ];

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Contact Header */}
        <div className="bg-surface-panel rounded-lg border border-surface-subtle p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-accent-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {contact.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-title-1">{contact.name}</h1>
              <p className="text-subheadline text-secondary mt-1">{contact.role}</p>
            </div>
            <button className="px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-gray-800 text-subheadline-emphasized motion-button">
              Send Message
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-subheadline-emphasized text-primary">Email</label>
              <p className="mt-1 text-subheadline text-primary">{contact.email}</p>
            </div>
            <div>
              <label className="block text-subheadline-emphasized text-primary">Phone</label>
              <p className="mt-1 text-subheadline text-primary">{contact.phone}</p>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-surface-panel rounded-lg border border-surface-subtle p-6 mb-6">
          <h2 className="text-title-2 mb-4">Notes</h2>
          <p className="text-body text-primary">{contact.notes}</p>
          <button className="mt-4 text-subheadline text-accent-primary hover:text-blue-700 motion-text">
            Edit Notes
          </button>
        </div>

        {/* Transactions Section */}
        <div className="bg-surface-panel rounded-lg border border-surface-subtle p-6">
          <h2 className="text-title-2 mb-4">Transactions</h2>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center border rounded-lg p-4">
                <div>
                  <h3 className="text-body-emphasized">{transaction.address}</h3>
                  <p className="text-subheadline text-secondary mt-1">Role: {transaction.role}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-footnote rounded-full">
                  {transaction.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
