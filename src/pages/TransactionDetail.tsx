import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import type { TransactionTask, TransactionEvent, TaskStatus, TaskPriority } from "../types/task";
import { supabase } from "../lib/supabase";

type TabType = "timeline" | "documents" | "tasks" | "messages";

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("timeline");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Task and event state
  const [tasks, setTasks] = useState<TransactionTask[]>([]);
  const [events, setEvents] = useState<TransactionEvent[]>([]);

  // Mock transaction data
  const transaction = {
    id,
    address: "123 Main St",
    type: "Purchase",
    status: "Active",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "timeline", label: "Timeline" },
    { id: "documents", label: "Documents" },
    { id: "tasks", label: "Tasks" },
    { id: "messages", label: "Messages" },
  ];

  // Load tasks and events from Supabase on mount
  useEffect(() => {
    async function loadTransactionData() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Load tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("transaction_tasks")
          .select("*")
          .eq("transaction_id", id);

        if (tasksError) throw tasksError;

        // Load events
        const { data: eventsData, error: eventsError } = await supabase
          .from("transaction_events")
          .select("*")
          .eq("transaction_id", id)
          .order("created_at", { ascending: false });

        if (eventsError) throw eventsError;

        // Transform DB data to frontend format
        const transformedTasks: TransactionTask[] = (tasksData || []).map((row: any) => ({
          id: row.id,
          transactionId: row.transaction_id,
          title: row.title,
          status: row.status as TaskStatus,
          priority: row.priority as TaskPriority,
          dueDate: row.due_date,
          assignee: row.assignee,
          createdAt: row.created_at,
        }));

        const transformedEvents: TransactionEvent[] = (eventsData || []).map((row: any) => {
          const payload = row.payload;
          const baseEvent = {
            timestamp: row.created_at,
          };

          switch (row.type) {
            case "task.created":
              return {
                ...baseEvent,
                type: "task.created" as const,
                taskId: payload.taskId,
                taskTitle: payload.title,
                transactionId: row.transaction_id,
              };
            case "task.status_changed":
              return {
                ...baseEvent,
                type: "task.status_changed" as const,
                taskId: payload.taskId,
                taskTitle: payload.title,
                from: payload.from,
                to: payload.to,
              };
            case "task.completed":
              return {
                ...baseEvent,
                type: "task.completed" as const,
                taskId: payload.taskId,
                taskTitle: payload.title,
              };
            case "system":
              return {
                ...baseEvent,
                type: "system" as const,
                title: payload.title,
              };
            case "milestone":
              return {
                ...baseEvent,
                type: "milestone" as const,
                title: payload.title,
              };
            default:
              return {
                ...baseEvent,
                type: "system" as const,
                title: "Unknown event",
              };
          }
        });

        setTasks(transformedTasks);
        setEvents(transformedEvents);
      } catch (err) {
        console.error("Error loading transaction data:", err);
        setError("Failed to load transaction data");
      } finally {
        setLoading(false);
      }
    }

    loadTransactionData();
  }, [id]);

  // Add task handler
  const handleAddTask = async (title: string, priority: TaskPriority, dueDate?: string) => {
    const tempId = Date.now().toString();
    const newTask: TransactionTask = {
      id: tempId,
      transactionId: id!,
      title,
      status: "todo",
      priority,
      dueDate,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setTasks((prev) => [...prev, newTask]);

    const event: TransactionEvent = {
      type: "task.created",
      taskId: tempId,
      taskTitle: title,
      transactionId: id!,
      timestamp: new Date().toISOString(),
    };
    setEvents((prev) => [...prev, event]);

    try {
      // Persist to Supabase
      const { data: taskData, error: taskError } = await supabase
        .from("transaction_tasks")
        .insert({
          transaction_id: id,
          title,
          status: "todo",
          priority,
          due_date: dueDate || null,
          assignee: null,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Update with real ID from DB
      setTasks((prev) =>
        prev.map((t) => (t.id === tempId ? { ...t, id: taskData.id } : t))
      );

      // Persist event
      await supabase.from("transaction_events").insert({
        transaction_id: id,
        type: "task.created",
        payload: {
          taskId: taskData.id,
          taskTitle: title,
          transactionId: id!,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error("Error creating task:", err);
      // Rollback optimistic update
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      setEvents((prev) => prev.filter((e) => e.type !== "task.created" || e.taskId !== tempId));
      setError("Failed to create task");
    }
  };

  // Change task status handler
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const oldStatus = task.status;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    const statusChangeEvent: TransactionEvent = {
      type: "task.status_changed",
      taskId: task.id,
      taskTitle: task.title,
      from: oldStatus,
      to: newStatus,
      timestamp: new Date().toISOString(),
    };
    setEvents((prev) => [...prev, statusChangeEvent]);

    if (newStatus === "done") {
      const completeEvent: TransactionEvent = {
        type: "task.completed",
        taskId: task.id,
        taskTitle: task.title,
        timestamp: new Date().toISOString(),
      };
      setEvents((prev) => [...prev, completeEvent]);
    }

    try {
      // Persist status change to Supabase
      const { error: updateError } = await supabase
        .from("transaction_tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (updateError) throw updateError;

      // Persist events
      const eventsToInsert = [
        {
          transaction_id: id!,
          type: "task.status_changed",
          payload: {
            taskId: task.id,
            taskTitle: task.title,
            from: oldStatus,
            to: newStatus,
            timestamp: new Date().toISOString(),
          },
        },
      ];

      if (newStatus === "done") {
        eventsToInsert.push({
          transaction_id: id!,
          type: "task.completed",
          payload: {
            taskId: task.id,
            taskTitle: task.title,
            timestamp: new Date().toISOString(),
          } as any,
        });
      }

      await supabase.from("transaction_events").insert(eventsToInsert);
    } catch (err) {
      console.error("Error updating task status:", err);
      // Rollback optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: oldStatus } : t))
      );
      setEvents((prev) =>
        prev.filter(
          (e) =>
            !(
              (e.type === "task.status_changed" || e.type === "task.completed") &&
              e.taskId === taskId &&
              e.timestamp === statusChangeEvent.timestamp
            )
        )
      );
      setError("Failed to update task status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-subheadline text-secondary">Loading transaction...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-subheadline text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-footnote text-red-600 hover:text-red-800 motion-text"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Transaction Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-title-1">{transaction.address}</h1>
              <p className="text-subheadline text-secondary mt-1">
                {transaction.type} • Created {new Date(transaction.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-footnote rounded-full">
              {transaction.status}
            </span>
          </div>

          {/* Tab Navigation */}
          <nav className="flex gap-4 border-t pt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-subheadline-emphasized pb-2 border-b-2 motion-tab ${
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
          {activeTab === "timeline" && <TimelineView events={events} />}
          {activeTab === "documents" && <DocumentsView />}
          {activeTab === "tasks" && (
            <TasksView
              tasks={tasks}
              onAddTask={handleAddTask}
              onStatusChange={handleStatusChange}
            />
          )}
          {activeTab === "messages" && <MessagesView />}
        </div>
      </div>
    </div>
  );
}

function TimelineView({ events }: { events: TransactionEvent[] }) {
  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getEventDisplay = (event: TransactionEvent) => {
    switch (event.type) {
      case "task.created":
        return { title: `Task created: ${event.taskTitle}`, badgeText: "task" };
      case "task.status_changed":
        return {
          title: `Task "${event.taskTitle}" moved from ${event.from} to ${event.to}`,
          badgeText: "task",
        };
      case "task.completed":
        return { title: `Task completed: ${event.taskTitle}`, badgeText: "task" };
      case "system":
        return { title: event.title, badgeText: "system" };
      case "milestone":
        return { title: event.title, badgeText: "milestone" };
      default:
        return { title: "Unknown event", badgeText: "unknown" };
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-title-2 mb-4">Timeline</h2>
      {sortedEvents.length === 0 ? (
        <p className="text-subheadline text-secondary">No events yet.</p>
      ) : (
        sortedEvents.map((event, index) => {
          const display = getEventDisplay(event);
          const eventId = "timestamp" in event ? event.timestamp + index : index;

          return (
            <div key={eventId} className="border-l-2 border-blue-600 pl-4 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-body-emphasized">{display.title}</h3>
                  <p className="text-subheadline text-secondary mt-1">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
                <span className="text-caption-1 px-2 py-1 bg-gray-100 text-gray-700 rounded">
                  {display.badgeText}
                </span>
              </div>
            </div>
          );
        })
      )}
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
        <h2 className="text-title-2">Documents</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-subheadline-emphasized motion-button">
          Upload Document
        </button>
      </div>
      {documents.map((doc) => (
        <div key={doc.id} className="flex justify-between items-center border rounded-lg p-4">
          <div>
            <h3 className="text-body-emphasized">{doc.name}</h3>
            <p className="text-subheadline text-secondary mt-1">
              Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-footnote rounded-full">
            {doc.status}
          </span>
        </div>
      ))}
    </div>
  );
}

interface TasksViewProps {
  tasks: TransactionTask[];
  onAddTask: (title: string, priority: TaskPriority, dueDate?: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

function TasksView({ tasks, onAddTask, onStatusChange }: TasksViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle, newTaskPriority, newTaskDueDate || undefined);
      setNewTaskTitle("");
      setNewTaskPriority("medium");
      setNewTaskDueDate("");
      setShowAddForm(false);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-title-2">Tasks</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-subheadline-emphasized motion-button"
        >
          {showAddForm ? "Cancel" : "Add Task"}
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-gray-50 space-y-3">
          <div>
            <label htmlFor="task-title" className="block text-subheadline-emphasized text-primary mb-1">
              Task Title
            </label>
            <input
              id="task-title"
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 motion-input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-priority" className="block text-subheadline-emphasized text-primary mb-1">
                Priority
              </label>
              <select
                id="task-priority"
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 motion-input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-due-date" className="block text-subheadline-emphasized text-primary mb-1">
                Due Date (Optional)
              </label>
              <input
                id="task-due-date"
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 motion-input"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-subheadline-emphasized motion-button"
          >
            Create Task
          </button>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-subheadline text-secondary">No tasks yet. Click "Add Task" to create one.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`text-body-emphasized ${task.status === "done" ? "line-through text-gray-500" : ""}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-caption-1 px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="text-subheadline text-secondary">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Control */}
              <div className="flex items-center gap-2">
                <span className="text-subheadline text-secondary">Status:</span>
                <select
                  value={task.status}
                  onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-subheadline focus:outline-none focus:ring-2 focus:ring-blue-500 motion-input"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
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
      <h2 className="text-title-2 mb-4">Messages</h2>
      <div className="space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-body-emphasized">{msg.from}</span>
              <span className="text-caption-1 text-tertiary">
                {new Date(msg.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-subheadline text-primary">{msg.content}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <textarea
          placeholder="Type your message..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-body motion-input"
          rows={3}
        />
        <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-subheadline-emphasized motion-button">
          Send Message
        </button>
      </div>
    </div>
  );
}
