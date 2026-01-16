import { Link } from "react-router-dom";
import type { TransactionTask } from "../types/task";

export default function TaskBoard() {
  // Mock tasks aggregated from all transactions (read-only)
  const allTasks: TransactionTask[] = [
    {
      id: "1",
      transactionId: "1",
      title: "Schedule home inspection",
      status: "todo",
      priority: "high",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      assignee: { id: "1", name: "John Agent" },
    },
    {
      id: "2",
      transactionId: "1",
      title: "Review purchase agreement",
      status: "done",
      priority: "medium",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      assignee: { id: "1", name: "John Agent" },
    },
    {
      id: "3",
      transactionId: "2",
      title: "Request title search",
      status: "todo",
      priority: "medium",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      assignee: { id: "2", name: "Sarah Coordinator" },
    },
    {
      id: "4",
      transactionId: "2",
      title: "Coordinate appraisal",
      status: "in_progress",
      priority: "high",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      assignee: { id: "3", name: "Mike Appraiser" },
    },
    {
      id: "5",
      transactionId: "3",
      title: "Send welcome package",
      status: "todo",
      priority: "low",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      assignee: { id: "1", name: "John Agent" },
    },
    {
      id: "6",
      transactionId: "3",
      title: "Upload listing photos",
      status: "done",
      priority: "medium",
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      assignee: { id: "1", name: "John Agent" },
    },
  ];

  // Mock transaction mapping for display
  const transactionNames: Record<string, string> = {
    "1": "123 Main St",
    "2": "456 Oak Ave",
    "3": "789 Elm Blvd",
  };

  // Group tasks by status
  const columns = [
    {
      id: "todo",
      title: "To Do",
      tasks: allTasks.filter((t) => t.status === "todo"),
    },
    {
      id: "in_progress",
      title: "In Progress",
      tasks: allTasks.filter((t) => t.status === "in_progress"),
    },
    {
      id: "done",
      title: "Done",
      tasks: allTasks.filter((t) => t.status === "done"),
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-title-1">Task Board</h1>
            <p className="text-subheadline text-secondary mt-1">
              View-only aggregation • Edit tasks in transaction detail
            </p>
          </div>
        </div>

        {/* Read-only Notice */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-subheadline text-primary">
            <span className="text-body-emphasized">Read-only view:</span> Tasks can only be created
            or modified within their transaction. Click any task to navigate to its transaction.
          </p>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col">
              {/* Column Header */}
              <div className="bg-white rounded-t-lg border-x border-t border-gray-200 p-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-title-3">{column.title}</h2>
                  <span className="text-caption-1 px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {column.tasks.length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 bg-gray-100 rounded-b-lg border-x border-b border-gray-200 p-4 space-y-3 min-h-[400px]">
                {column.tasks.map((task) => (
                  <Link
                    key={task.id}
                    to={`/transactions/${task.transactionId}`}
                    className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-500 hover:shadow-md motion-card"
                  >
                    {/* Task Header */}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-body-emphasized flex-1">{task.title}</h3>
                      <span
                        className={`text-caption-1 px-2 py-0.5 rounded ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {/* Task Meta */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        <span className="text-subheadline text-secondary">
                          {transactionNames[task.transactionId]}
                        </span>
                      </div>

                      {task.dueDate && (
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-subheadline text-secondary">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {task.assignee && (
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span className="text-subheadline text-secondary">
                            {task.assignee.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
