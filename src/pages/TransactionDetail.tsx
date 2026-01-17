import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import type { TransactionTask, TransactionEvent, TaskStatus, TaskPriority } from "../types/task";
import { supabase } from "../lib/supabase";
import { executeAutomationRules, persistAutomationActions } from "../lib/automation";
import { useAuth } from "../contexts/AuthContext";

type TabType = "timeline" | "documents" | "tasks" | "messages";

interface Message {
  id: string;
  transaction_id: string;
  content: string;
  sender_name: string;
  created_at: string;
}

interface Document {
  id: string;
  transaction_id: string;
  name: string;
  document_type: string;
  status: "Pending" | "Signed" | "Reviewed";
  created_at: string;
}

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("timeline");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Task and event state
  const [tasks, setTasks] = useState<TransactionTask[]>([]);
  const [events, setEvents] = useState<TransactionEvent[]>([]);

  // Message state
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Document state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: "",
    document_type: "Purchase Agreement",
    status: "Pending" as "Pending" | "Signed" | "Reviewed",
  });
  const [uploading, setUploading] = useState(false);

  // Transaction state (mock for MVP - would load from DB in production)
  const [transactionStatus, setTransactionStatus] = useState("Active");
  const transaction = {
    id,
    address: "123 Main St",
    type: "Purchase",
    status: transactionStatus,
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
            case "task.auto_created":
              return {
                ...baseEvent,
                type: "task.auto_created" as const,
                taskId: payload.taskId,
                taskTitle: payload.taskTitle || payload.title,
                reason: payload.reason,
                transactionId: row.transaction_id,
              };
            case "milestone.reached":
              return {
                ...baseEvent,
                type: "milestone.reached" as const,
                title: payload.title,
                description: payload.description,
              };
            case "deadline.created":
              return {
                ...baseEvent,
                type: "deadline.created" as const,
                title: payload.title,
                dueDate: payload.dueDate,
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

        // Load messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("transaction_id", id)
          .order("created_at", { ascending: true });

        if (messagesError) throw messagesError;

        // Load documents
        const { data: documentsData, error: documentsError } = await supabase
          .from("documents")
          .select("*")
          .eq("transaction_id", id)
          .order("created_at", { ascending: false });

        if (documentsError) throw documentsError;

        setTasks(transformedTasks);
        setEvents(transformedEvents);
        setMessages(messagesData || []);
        setDocuments(documentsData || []);
      } catch (err) {
        console.error("Error loading transaction data:", err);
        setError("Failed to load transaction data");
      } finally {
        setLoading(false);
      }
    }

    loadTransactionData();
  }, [id]);

  // Realtime subscriptions for live updates
  useEffect(() => {
    if (!id) return;

    // Subscribe to new events (timeline updates)
    const eventsChannel = supabase
      .channel(`transaction_events:${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transaction_events",
          filter: `transaction_id=eq.${id}`,
        },
        (payload: any) => {
          const row = payload.new;
          const eventPayload = row.payload;

          // Transform to frontend format
          let newEvent: TransactionEvent | null = null;

          switch (row.type) {
            case "task.created":
              newEvent = {
                type: "task.created" as const,
                taskId: eventPayload.taskId,
                taskTitle: eventPayload.taskTitle || eventPayload.title,
                transactionId: row.transaction_id,
                timestamp: row.created_at,
              };
              break;
            case "task.status_changed":
              newEvent = {
                type: "task.status_changed" as const,
                taskId: eventPayload.taskId,
                taskTitle: eventPayload.taskTitle || eventPayload.title,
                from: eventPayload.from,
                to: eventPayload.to,
                timestamp: row.created_at,
              };
              break;
            case "task.completed":
              newEvent = {
                type: "task.completed" as const,
                taskId: eventPayload.taskId,
                taskTitle: eventPayload.taskTitle || eventPayload.title,
                timestamp: row.created_at,
              };
              break;
            case "task.auto_created":
              newEvent = {
                type: "task.auto_created" as const,
                taskId: eventPayload.taskId,
                taskTitle: eventPayload.taskTitle || eventPayload.title,
                reason: eventPayload.reason,
                transactionId: row.transaction_id,
                timestamp: row.created_at,
              };
              break;
            case "milestone.reached":
              newEvent = {
                type: "milestone.reached" as const,
                title: eventPayload.title,
                description: eventPayload.description,
                timestamp: row.created_at,
              };
              break;
            case "deadline.created":
              newEvent = {
                type: "deadline.created" as const,
                title: eventPayload.title,
                dueDate: eventPayload.dueDate,
                timestamp: row.created_at,
              };
              break;
            case "system":
              newEvent = {
                type: "system" as const,
                title: eventPayload.title,
                timestamp: row.created_at,
              };
              break;
            case "milestone":
              newEvent = {
                type: "milestone" as const,
                title: eventPayload.title,
                timestamp: row.created_at,
              };
              break;
          }

          if (newEvent) {
            // Dedupe: only add if not already present (by timestamp + taskId or title)
            setEvents((prev) => {
              const isDuplicate = prev.some((e) => {
                if (e.timestamp === newEvent!.timestamp) {
                  if ("taskId" in e && "taskId" in newEvent!) {
                    return e.taskId === newEvent!.taskId;
                  }
                  if ("title" in e && "title" in newEvent!) {
                    return e.title === newEvent!.title;
                  }
                }
                return false;
              });

              return isDuplicate ? prev : [...prev, newEvent!];
            });
          }
        }
      )
      .subscribe();

    // Subscribe to task changes (INSERT and UPDATE)
    const tasksChannel = supabase
      .channel(`transaction_tasks:${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transaction_tasks",
          filter: `transaction_id=eq.${id}`,
        },
        (payload: any) => {
          const row = payload.new;
          const newTask: TransactionTask = {
            id: row.id,
            transactionId: row.transaction_id,
            title: row.title,
            status: row.status as TaskStatus,
            priority: row.priority as TaskPriority,
            dueDate: row.due_date,
            assignee: row.assignee,
            createdAt: row.created_at,
          };

          // Merge by id (replace temp id or add new)
          setTasks((prev) => {
            const exists = prev.some((t) => t.id === newTask.id);
            if (exists) return prev;
            // Remove any temp tasks and add the real one
            return [...prev.filter((t) => !t.id.startsWith(Date.now().toString().slice(0, -3))), newTask];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transaction_tasks",
          filter: `transaction_id=eq.${id}`,
        },
        (payload: any) => {
          const row = payload.new;
          const updatedTask: TransactionTask = {
            id: row.id,
            transactionId: row.transaction_id,
            title: row.title,
            status: row.status as TaskStatus,
            priority: row.priority as TaskPriority,
            dueDate: row.due_date,
            assignee: row.assignee,
            createdAt: row.created_at,
          };

          // Merge by id (replace matching task)
          setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
        }
      )
      .subscribe();

    // Subscribe to messages
    const messagesChannel = supabase
      .channel(`messages:${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `transaction_id=eq.${id}`,
        },
        (payload: any) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    // Subscribe to documents
    const documentsChannel = supabase
      .channel(`documents:${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "documents",
          filter: `transaction_id=eq.${id}`,
        },
        (payload: any) => {
          const newDoc = payload.new as Document;
          setDocuments((prev) => [newDoc, ...prev]);
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      eventsChannel.unsubscribe();
      tasksChannel.unsubscribe();
      messagesChannel.unsubscribe();
      documentsChannel.unsubscribe();
    };
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

      // Trigger automation rules if task was completed
      if (newStatus === "done") {
        const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
        const automationActions = executeAutomationRules({
          type: "task_completed",
          transactionId: id!,
          tasks: updatedTasks,
        });

        if (automationActions.length > 0) {
          const { createdTasks, createdEvents } = await persistAutomationActions(automationActions, id!);

          // Update local state with automated tasks and events
          setTasks((prev) => [...prev, ...createdTasks]);
          setEvents((prev) => [...prev, ...createdEvents]);
        }
      }
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

  // Change transaction status handler (triggers automation)
  const handleTransactionStatusChange = async (newStatus: string) => {
    const previousStatus = transactionStatus;

    // Optimistic update
    setTransactionStatus(newStatus);

    try {
      // Trigger automation rules for status change
      const automationActions = executeAutomationRules({
        type: "status_change",
        transactionStatus: newStatus,
        previousStatus,
        transactionId: id!,
      });

      if (automationActions.length > 0) {
        const { createdTasks, createdEvents } = await persistAutomationActions(automationActions, id!);

        // Update local state with automated tasks and events
        setTasks((prev) => [...prev, ...createdTasks]);
        setEvents((prev) => [...prev, ...createdEvents]);
      }
    } catch (err) {
      console.error("Error changing transaction status:", err);
      // Rollback
      setTransactionStatus(previousStatus);
      setError("Failed to change transaction status");
    }
  };

  // Send message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase.from("messages").insert([
        {
          transaction_id: id,
          content: newMessage.trim(),
          sender_name: user?.user_metadata?.full_name || user?.email || "Agent",
        },
      ]);

      if (error) throw error;

      // Clear input
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Upload document handler
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDocument.name.trim()) {
      alert("Document name is required");
      return;
    }

    setUploading(true);
    try {
      const { error } = await supabase.from("documents").insert([
        {
          transaction_id: id,
          name: newDocument.name.trim(),
          document_type: newDocument.document_type,
          status: newDocument.status,
        },
      ]);

      if (error) throw error;

      // Reset form and close modal
      setNewDocument({
        name: "",
        document_type: "Purchase Agreement",
        status: "Pending",
      });
      setShowUploadModal(false);
    } catch (err) {
      console.error("Error uploading document:", err);
      alert("Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="text-sm text-gray-500">Loading transaction...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Transaction Header */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{transaction.address}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {transaction.type} • Created {new Date(transaction.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <select
                value={transaction.status}
                onChange={(e) => handleTransactionStatusChange(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Under Contract">Under Contract</option>
                <option value="Contingency Period">Contingency Period</option>
                <option value="Clear to Close">Clear to Close</option>
                <option value="Closed">Closed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Primary Contact */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-orange-500">
                J
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">
                  Primary Contact: John Doe
                </div>
                <div className="text-xs text-gray-600">
                  john.doe@example.com • (555) 123-4567
                </div>
              </div>
              <Link
                to="/contacts/1"
                className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 transition-colors"
              >
                View Profile →
              </Link>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex gap-6 border-t border-gray-200 pt-4 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          {activeTab === "timeline" && <TimelineView events={events} />}
          {activeTab === "documents" && (
            <DocumentsView
              documents={documents}
              showUploadModal={showUploadModal}
              setShowUploadModal={setShowUploadModal}
              newDocument={newDocument}
              setNewDocument={setNewDocument}
              onUploadDocument={handleUploadDocument}
              uploading={uploading}
            />
          )}
          {activeTab === "tasks" && (
            <TasksView
              tasks={tasks}
              onAddTask={handleAddTask}
              onStatusChange={handleStatusChange}
            />
          )}
          {activeTab === "messages" && (
            <MessagesView
              messages={messages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSendMessage={handleSendMessage}
              sendingMessage={sendingMessage}
              messagesEndRef={messagesEndRef}
            />
          )}
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
        return { title: `Task created: ${event.taskTitle}`, badgeText: "task", badgeClass: "bg-gray-100 text-gray-700" };
      case "task.status_changed":
        return {
          title: `Task "${event.taskTitle}" moved from ${event.from} to ${event.to}`,
          badgeText: "task",
          badgeClass: "bg-blue-100 text-blue-700",
        };
      case "task.completed":
        return { title: `Task completed: ${event.taskTitle}`, badgeText: "task", badgeClass: "bg-green-100 text-green-700" };
      case "task.auto_created":
        return {
          title: `System created task: ${event.taskTitle}`,
          subtitle: event.reason,
          badgeText: "automation",
          badgeClass: "bg-blue-100 text-blue-700",
        };
      case "milestone.reached":
        return {
          title: `Milestone: ${event.title}`,
          subtitle: event.description,
          badgeText: "milestone",
          badgeClass: "bg-green-100 text-green-700",
        };
      case "deadline.created":
        return {
          title: `Deadline set: ${event.title}`,
          subtitle: `Due ${new Date(event.dueDate).toLocaleDateString()}`,
          badgeText: "deadline",
          badgeClass: "bg-yellow-100 text-yellow-700",
        };
      case "system":
        return { title: event.title, badgeText: "system", badgeClass: "bg-gray-100 text-gray-700" };
      case "milestone":
        return { title: event.title, badgeText: "milestone", badgeClass: "bg-green-100 text-green-700" };
      default:
        return { title: "Unknown event", badgeText: "unknown", badgeClass: "bg-gray-100 text-gray-700" };
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Timeline</h2>
      {sortedEvents.length === 0 ? (
        <p className="text-sm text-gray-500">No events yet.</p>
      ) : (
        sortedEvents.map((event, index) => {
          const display = getEventDisplay(event);
          const eventId = "timestamp" in event ? event.timestamp + index : index;

          return (
            <div key={eventId} className="border-l-2 border-gray-200 pl-4 pb-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">{display.title}</h3>
                  {display.subtitle && (
                    <p className="text-sm text-gray-600 mt-1">{display.subtitle}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded flex-shrink-0 ${display.badgeClass}`}>
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

function DocumentsView({
  documents,
  showUploadModal,
  setShowUploadModal,
  newDocument,
  setNewDocument,
  onUploadDocument,
  uploading,
}: {
  documents: Document[];
  showUploadModal: boolean;
  setShowUploadModal: (show: boolean) => void;
  newDocument: { name: string; document_type: string; status: "Pending" | "Signed" | "Reviewed" };
  setNewDocument: (doc: { name: string; document_type: string; status: "Pending" | "Signed" | "Reviewed" }) => void;
  onUploadDocument: (e: React.FormEvent) => void;
  uploading: boolean;
}) {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Signed":
        return "bg-green-100 text-green-700 border border-green-200";
      case "Reviewed":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Documents</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium text-sm"
        >
          Upload Document
        </button>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-12">
          No documents yet. Upload your first document to get started.
        </p>
      ) : (
        documents.map((doc) => (
          <div key={doc.id} className="flex justify-between items-center border border-gray-200 rounded-lg p-4 bg-white">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{doc.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {doc.document_type} • Uploaded {new Date(doc.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${getStatusBadgeClass(doc.status)}`}>
              {doc.status}
            </span>
          </div>
        ))
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={onUploadDocument} className="space-y-4">
              {/* Document Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document Name *
                </label>
                <input
                  type="text"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Purchase Agreement.pdf"
                  required
                />
              </div>

              {/* Document Type & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={newDocument.document_type}
                    onChange={(e) => setNewDocument({ ...newDocument, document_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Purchase Agreement">Purchase Agreement</option>
                    <option value="Inspection Report">Inspection Report</option>
                    <option value="Appraisal">Appraisal</option>
                    <option value="Title Report">Title Report</option>
                    <option value="Disclosure">Disclosure</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newDocument.status}
                    onChange={(e) => setNewDocument({ ...newDocument, status: e.target.value as "Pending" | "Signed" | "Reviewed" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Signed">Signed</option>
                  </select>
                </div>
              </div>

              {/* Note about file upload */}
              <p className="text-xs text-gray-500">
                Note: For MVP, document metadata is tracked. File storage can be added with Supabase Storage.
              </p>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={uploading || !newDocument.name.trim()}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {uploading ? "Uploading..." : "Upload Document"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
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
        return "bg-red-100 text-red-700 border border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border border-green-200";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium text-sm"
        >
          {showAddForm ? "Cancel" : "Add Task"}
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
          <div>
            <label htmlFor="task-title" className="block text-sm font-semibold text-gray-700 mb-2">
              Task Title
            </label>
            <input
              id="task-title"
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-priority" className="block text-sm font-semibold text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="task-priority"
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-due-date" className="block text-sm font-semibold text-gray-700 mb-2">
                Due Date (Optional)
              </label>
              <input
                id="task-due-date"
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium"
          >
            Create Task
          </button>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500">No tasks yet. Click "Add Task" to create one.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`text-sm font-semibold ${task.status === "done" ? "line-through text-gray-500" : "text-gray-900"}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="text-sm text-gray-600">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Control */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <select
                  value={task.status}
                  onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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

function MessagesView({
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  sendingMessage,
  messagesEndRef,
}: {
  messages: Message[];
  newMessage: string;
  setNewMessage: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  sendingMessage: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>

      {/* Messages List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-12">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold text-gray-900">{msg.sender_name}</span>
                <span className="text-xs text-gray-500">
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">{msg.content}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={onSendMessage} className="mt-4 pt-4 border-t border-gray-200">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          rows={3}
        />
        <button
          type="submit"
          disabled={sendingMessage || !newMessage.trim()}
          className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {sendingMessage ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
