import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import type { TransactionTask, TaskPriority } from "../types/task";
import { supabase } from "../lib/supabase";

export default function TaskBoard() {
  const [allTasks, setAllTasks] = useState<TransactionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock transaction mapping for display
  const transactionNames: Record<string, string> = {
    "1": "123 Main St",
    "2": "456 Oak Ave",
    "3": "789 Elm Blvd",
  };

  // Load all tasks from Supabase on mount
  useEffect(() => {
    async function loadAllTasks() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: tasksError } = await supabase
          .from("transaction_tasks")
          .select("*")
          .order("created_at", { ascending: false });

        if (tasksError) throw tasksError;

        // Transform DB data to frontend format
        const transformedTasks: TransactionTask[] = (data || []).map((row: any) => ({
          id: row.id,
          transactionId: row.transaction_id,
          title: row.title,
          status: row.status,
          priority: row.priority as TaskPriority,
          dueDate: row.due_date,
          assignee: row.assignee,
          createdAt: row.created_at,
        }));

        setAllTasks(transformedTasks);
      } catch (err) {
        console.error("Error loading tasks:", err);
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    }

    loadAllTasks();
  }, []);

  // Realtime subscriptions for live task updates
  useEffect(() => {
    // Subscribe to all task changes (INSERT and UPDATE)
    const tasksChannel = supabase
      .channel("all_transaction_tasks")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transaction_tasks",
        },
        (payload: any) => {
          const row = payload.new;
          const newTask: TransactionTask = {
            id: row.id,
            transactionId: row.transaction_id,
            title: row.title,
            status: row.status,
            priority: row.priority as TaskPriority,
            dueDate: row.due_date,
            assignee: row.assignee,
            createdAt: row.created_at,
          };

          // Add if not already present
          setAllTasks((prev) => {
            const exists = prev.some((t) => t.id === newTask.id);
            return exists ? prev : [...prev, newTask];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transaction_tasks",
        },
        (payload: any) => {
          const row = payload.new;
          const updatedTask: TransactionTask = {
            id: row.id,
            transactionId: row.transaction_id,
            title: row.title,
            status: row.status,
            priority: row.priority as TaskPriority,
            dueDate: row.due_date,
            assignee: row.assignee,
            createdAt: row.created_at,
          };

          // Merge by id (replace matching task)
          setAllTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      tasksChannel.unsubscribe();
    };
  }, []);

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
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "badge-neutral";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-subheadline text-secondary">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-title-1">Task Board</h1>
            <p className="text-subheadline text-secondary mt-1">
              View-only aggregation • Edit tasks in transaction detail
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-lg badge-error">
            <p className="text-subheadline">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-footnote hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Read-only Notice */}
        <div className="mb-8 p-4 rounded-lg badge-info">
          <p className="text-subheadline">
            <span className="text-body-emphasized">Read-only view:</span> Tasks can only be created
            or modified within their transaction. Click any task to navigate to its transaction.
          </p>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col">
              {/* Column Header */}
              <div className="bg-surface-panel rounded-t-lg border-x border-t border-surface-subtle shadow-sm p-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-title-3">{column.title}</h2>
                  <span className="text-caption-1 px-2 py-1 rounded badge-neutral">
                    {column.tasks.length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 bg-surface-muted rounded-b-lg border-x border-b border-surface-subtle shadow-sm p-4 space-y-3 min-h-[400px]">
                {column.tasks.length === 0 ? (
                  <p className="text-subheadline text-secondary">No tasks</p>
                ) : (
                  column.tasks.map((task) => (
                    <Link
                      key={task.id}
                      to={`/transactions/${task.transactionId}`}
                      className="block bg-surface-panel rounded-lg border border-surface-subtle p-4 hover:border-accent-primary hover:shadow-md motion-card"
                    >
                      {/* Task Header */}
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-body-emphasized flex-1">{task.title}</h3>
                        <span className={`text-caption-1 px-2 py-0.5 rounded flex-shrink-0 ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Task Meta */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-secondary flex-shrink-0"
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
                            {transactionNames[task.transactionId] || `Transaction ${task.transactionId}`}
                          </span>
                        </div>

                        {task.dueDate && (
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-secondary flex-shrink-0"
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
                              className="w-4 h-4 text-secondary flex-shrink-0"
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
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
