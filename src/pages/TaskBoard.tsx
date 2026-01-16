export default function TaskBoard() {
  // Mock columns for kanban board
  const columns = [
    {
      id: "todo",
      title: "To Do",
      tasks: [
        {
          id: "1",
          title: "Schedule home inspection",
          transaction: "123 Main St",
          dueDate: "2024-01-20",
          assignee: "John Agent",
          priority: "high"
        },
        {
          id: "2",
          title: "Request title search",
          transaction: "456 Oak Ave",
          dueDate: "2024-01-22",
          assignee: "Sarah Coordinator",
          priority: "medium"
        },
        {
          id: "3",
          title: "Send welcome package",
          transaction: "789 Elm Blvd",
          dueDate: "2024-01-25",
          assignee: "John Agent",
          priority: "low"
        }
      ]
    },
    {
      id: "doing",
      title: "In Progress",
      tasks: [
        {
          id: "4",
          title: "Review purchase agreement",
          transaction: "123 Main St",
          dueDate: "2024-01-18",
          assignee: "John Agent",
          priority: "high"
        },
        {
          id: "5",
          title: "Coordinate appraisal",
          transaction: "456 Oak Ave",
          dueDate: "2024-01-19",
          assignee: "Mike Appraiser",
          priority: "medium"
        }
      ]
    },
    {
      id: "done",
      title: "Done",
      tasks: [
        {
          id: "6",
          title: "Upload listing photos",
          transaction: "789 Elm Blvd",
          dueDate: "2024-01-15",
          assignee: "John Agent",
          priority: "medium"
        },
        {
          id: "7",
          title: "Send initial disclosure",
          transaction: "123 Main St",
          dueDate: "2024-01-14",
          assignee: "Sarah Coordinator",
          priority: "high"
        }
      ]
    }
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
              Manage tasks across all transactions
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-subheadline-emphasized motion-button">
            Add Task
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 motion-input">
            <option>All Transactions</option>
            <option>123 Main St</option>
            <option>456 Oak Ave</option>
            <option>789 Elm Blvd</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 motion-input">
            <option>All Assignees</option>
            <option>John Agent</option>
            <option>Sarah Coordinator</option>
            <option>Mike Appraiser</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 motion-input">
            <option>All Priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
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
                  <div
                    key={task.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-500 hover:shadow-md motion-card cursor-pointer"
                  >
                    {/* Task Header */}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-body-emphasized flex-1">{task.title}</h3>
                      <span className={`text-caption-1 px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Task Meta */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-subheadline text-secondary">{task.transaction}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-subheadline text-secondary">
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-subheadline text-secondary">{task.assignee}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
