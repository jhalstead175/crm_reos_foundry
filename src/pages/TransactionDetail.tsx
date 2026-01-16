import { useParams } from "react-router-dom";
import { useState } from "react";

type TabType = "timeline" | "documents" | "tasks" | "messages";

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("timeline");

  // Mock transaction data
  const transaction = {
    id,
    address: "123 Main St",
    type: "Purchase",
    status: "Active",
    createdAt: new Date().toISOString(),
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "timeline", label: "Timeline" },
    { id: "documents", label: "Documents" },
    { id: "tasks", label: "Tasks" },
    { id: "messages", label: "Messages" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Transaction Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">{transaction.address}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {transaction.type} • Created {new Date(transaction.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              {transaction.status}
            </span>
          </div>

          {/* Tab Navigation */}
          <nav className="flex gap-4 border-t pt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {activeTab === "timeline" && <TimelineView />}
          {activeTab === "documents" && <DocumentsView />}
          {activeTab === "tasks" && <TasksView />}
          {activeTab === "messages" && <MessagesView />}
        </div>
      </div>
    </div>
  );
}

function TimelineView() {
  const events = [
    { id: "1", title: "Transaction created", date: new Date().toISOString(), type: "system" },
    { id: "2", title: "Initial offer submitted", date: new Date().toISOString(), type: "milestone" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-4">Timeline</h2>
      {events.map((event) => (
        <div key={event.id} className="border-l-2 border-blue-600 pl-4 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{event.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{new Date(event.date).toLocaleString()}</p>
            </div>
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {event.type}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DocumentsView() {
  const documents = [
    { id: "1", name: "Purchase Agreement.pdf", uploadedAt: new Date().toISOString(), status: "Signed" },
    { id: "2", name: "Inspection Report.pdf", uploadedAt: new Date().toISOString(), status: "Pending" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Documents</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Upload Document
        </button>
      </div>
      {documents.map((doc) => (
        <div key={doc.id} className="flex justify-between items-center border rounded-lg p-4">
          <div>
            <h3 className="font-medium">{doc.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
              Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {doc.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function TasksView() {
  const tasks = [
    { id: "1", title: "Schedule home inspection", dueDate: new Date().toISOString(), status: "todo" },
    { id: "2", title: "Review purchase agreement", dueDate: new Date().toISOString(), status: "done" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Add Task
        </button>
      </div>
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-3 border rounded-lg p-4">
          <input
            type="checkbox"
            checked={task.status === "done"}
            className="h-4 w-4 text-blue-600 rounded"
            readOnly
          />
          <div className="flex-1">
            <h3 className={`font-medium ${task.status === "done" ? "line-through text-gray-500" : ""}`}>
              {task.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Due {new Date(task.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function MessagesView() {
  const messages = [
    { id: "1", from: "Agent", content: "Welcome to your transaction!", timestamp: new Date().toISOString() },
    { id: "2", from: "Client", content: "Thank you! Looking forward to working with you.", timestamp: new Date().toISOString() },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-4">Messages</h2>
      <div className="space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium">{msg.from}</span>
              <span className="text-xs text-gray-500">
                {new Date(msg.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-700">{msg.content}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <textarea
          placeholder="Type your message..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Send Message
        </button>
      </div>
    </div>
  );
}
