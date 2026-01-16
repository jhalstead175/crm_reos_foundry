import React, { useState } from "react";
import "./styles/task-board.css";

import { Event } from "../lib/events";
import { deriveTasksFromEvents, TaskStatus } from "../lib/tasks";
import { NarrativeHeader } from "../components/NarrativeHeader";

/* =====================================================
   Initial Mock Events
   ===================================================== */

const INITIAL_EVENTS: Event[] = [
  {
    id: "e1",
    type: "offer.accepted",
    timestamp: "2026-01-10T10:00:00Z",
    actor: "Agent",
  },
  {
    id: "e2",
    type: "inspection.completed",
    timestamp: "2026-01-12T15:30:00Z",
    actor: "Inspector",
  },
  {
    id: "e3",
    type: "document.uploaded",
    timestamp: "2026-01-13T09:00:00Z",
    actor: "Buyer",
    payload: {
      documentType: "addendum",
    },
  },
];

/* =====================================================
   Column Definition
   ===================================================== */

const columns: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "doing", label: "Doing" },
  { key: "done", label: "Done" },
];

/* =====================================================
   Task Board Screen
   ===================================================== */

export default function TaskBoard() {
  /**
   * Event log lives here (for now).
   * In production, this will come from the backend
   * and be append-only.
   */
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);

  /**
   * Tasks are always derived.
   */
  const tasks = deriveTasksFromEvents(events);

  /**
   * Emit task.completed event
   */
  function completeTask(taskId: string) {
    const completionEvent: Event = {
      id: `e-${Date.now()}`,
      type: "task.completed",
      timestamp: new Date().toISOString(),
      actor: "You",
      payload: {
        taskId,
      },
    };

    setEvents((prev) => [...prev, completionEvent]);
  }

return (
  <main className="task-board motion-fade-in">
    {/* Narrative context */}
    <NarrativeHeader events={events} tasks={tasks} />

    {/* Header */}
    <header className="task-board-header stack">
      <h1 className="text-headline">Task Board</h1>
      <p className="text-subtitle">
        What needs attention, based on what’s happened so far.
      </p>
    </header>

      {/* Columns */}
      <section className="task-board-columns">
        {columns.map((column) => {
          const columnTasks = tasks.filter(
            (task) => task.status === column.key
          );

          return (
            <div key={column.key} className="task-column">
              {/* Column Header */}
              <div className="task-column-header">
                <h2 className="text-label">
                  {column.label}
                  <span className="task-count">
                    {columnTasks.length}
                  </span>
                </h2>
              </div>

              {/* Column Body */}
              <div className="task-column-body">
                {columnTasks.length === 0 ? (
                  <div className="task-empty stack-tight">
                    <p className="text-body">
                      Nothing here yet.
                    </p>
                    <p className="text-caption">
                      Tasks appear automatically as events occur.
                    </p>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div key={task.id} className="task-card">
                      <div className="stack-tight">
                        <p className="text-body">
                          {task.title}
                        </p>

                        {(task.dueDate || task.assignee) && (
                          <div className="task-meta">
                            {task.dueDate && (
                              <span className="text-caption">
                                {task.dueDate}
                              </span>
                            )}
                            {task.assignee && (
                              <span className="text-caption">
                                Assigned to {task.assignee}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Completion Action */}
                        {task.status !== "done" && (
                          <div>
                            <button
                              className="text-label"
                              onClick={() => completeTask(task.id)}
                            >
                              Mark complete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
