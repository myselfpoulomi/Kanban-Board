import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { api } from "../api";

export function useKanbanBoard() {
  const [tasks, setTasks] = useState({
    backlog: [],
    todo: [],
    "in-progress": [],
    done: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set of task IDs that have a local mutation in flight
  // Prevents SSE from clobbering optimistic UI while request is running
  const inFlightMutationsRef = useRef(new Set());

  // Fetch initial board from API
  const fetchBoard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getBoard();
      setTasks({
        backlog: data.backlog || [],
        todo: data.todo || [],
        "in-progress": data["in-progress"] || [],
        done: data.done || [],
      });
    } catch (err) {
      setError(err.message || "Failed to load board");
      toast.error("Failed to load Kanban board");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  // Subscribe to real-time events via Server-Sent Events (SSE)
  useEffect(() => {
    const unsubscribe = api.listenToEvents((event) => {
      const { type, payload } = event;

      if (!payload || !payload.id) return;

      // If we are currently mutating this task locally, don't overwrite local state
      if (inFlightMutationsRef.current.has(payload.id)) {
        return;
      }

      setTasks((current) => {
        const next = {
          backlog: [...(current.backlog || [])],
          todo: [...(current.todo || [])],
          "in-progress": [...(current["in-progress"] || [])],
          done: [...(current.done || [])],
        };

        if (type === "task_created") {
          const col = payload.status || "backlog";
          // Check if already in list to prevent duplicate insertion
          const exists = Object.values(next).some((list) =>
            list.some((t) => t.id === payload.id)
          );
          if (!exists && next[col]) {
            next[col] = [...next[col], payload];
          }
        } else if (type === "task_updated") {
          // Remove from old column if exists
          for (const col of Object.keys(next)) {
            next[col] = next[col].filter((t) => t.id !== payload.id);
          }
          // Insert into target column
          const col = payload.status || "backlog";
          if (next[col]) {
            const insertPos =
              typeof payload.position === "number" && payload.position >= 0
                ? payload.position
                : next[col].length;
            next[col].splice(insertPos, 0, payload);
          }
        } else if (type === "task_deleted") {
          for (const col of Object.keys(next)) {
            next[col] = next[col].filter((t) => t.id !== payload.id);
          }
        }

        return next;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Helper to clone current tasks for snapshotting
  const createSnapshot = () => ({
    backlog: [...(tasks.backlog || [])],
    todo: [...(tasks.todo || [])],
    "in-progress": [...(tasks["in-progress"] || [])],
    done: [...(tasks.done || [])],
  });

  // Move task (Drag and drop reorder & cross-column moves)
  const moveTask = useCallback(
    async (taskId, sourceColumn, targetColumn, newPosition, simulatedFailure = false) => {
      const snapshot = createSnapshot();
      inFlightMutationsRef.current.add(taskId);

      // Optimistic update
      setTasks((current) => {
        const next = {
          backlog: [...(current.backlog || [])],
          todo: [...(current.todo || [])],
          "in-progress": [...(current["in-progress"] || [])],
          done: [...(current.done || [])],
        };

        let movedItem = null;
        if (next[sourceColumn]) {
          const itemIdx = next[sourceColumn].findIndex((t) => t.id === taskId);
          if (itemIdx !== -1) {
            movedItem = {
              ...next[sourceColumn][itemIdx],
              status: targetColumn,
              position: newPosition,
            };
            next[sourceColumn].splice(itemIdx, 1);
          }
        }

        if (movedItem && next[targetColumn]) {
          const safePos = Math.min(Math.max(0, newPosition), next[targetColumn].length);
          next[targetColumn].splice(safePos, 0, movedItem);
          // Re-index position
          next[targetColumn].forEach((t, i) => {
            t.position = i;
          });
        }

        return next;
      });

      try {
        await api.updateTask(
          taskId,
          { status: targetColumn, position: newPosition },
          { simulateFailure: simulatedFailure }
        );
      } catch (err) {
        // Rollback
        setTasks(snapshot);
        toast.error(`Failed to move task. Reverted changes.`);
      } finally {
        inFlightMutationsRef.current.delete(taskId);
      }
    },
    [tasks]
  );

  // Create task
  const createTask = useCallback(
    async (taskData, simulatedFailure = false) => {
      const snapshot = createSnapshot();
      const tempId = `TEMP-${Date.now()}`;
      const optimisticTask = {
        ...taskData,
        id: tempId,
        position: (tasks[taskData.status] || []).length,
        updatedAt: new Date().toISOString(),
      };

      // Optimistic addition
      setTasks((current) => ({
        ...current,
        [taskData.status]: [...(current[taskData.status] || []), optimisticTask],
      }));

      try {
        const createdTask = await api.createTask(taskData, {
          simulateFailure: simulatedFailure,
        });
        // Replace temp task with confirmed server task
        setTasks((current) => {
          const colList = current[taskData.status] || [];
          const sseAddedAlready = colList.some((t) => t.id === createdTask.id);
          return {
            ...current,
            [taskData.status]: sseAddedAlready
              ? colList.filter((t) => t.id !== tempId)
              : colList.map((t) => (t.id === tempId ? createdTask : t)),
          };
        });
        toast.success("Task created successfully");
        return createdTask;
      } catch (err) {
        // Rollback
        setTasks(snapshot);
        toast.error(
          err.message
            ? `Failed to create task: ${err.message}`
            : "Failed to create task. Reverted changes."
        );
        throw err;
      }
    },
    [tasks]
  );

  // Update task (Edit details, priority, assignee, status)
  const updateTask = useCallback(
    async (taskId, updates, simulatedFailure = false) => {
      const snapshot = createSnapshot();
      inFlightMutationsRef.current.add(taskId);

      // Optimistic update
      setTasks((current) => {
        const next = {
          backlog: [...(current.backlog || [])],
          todo: [...(current.todo || [])],
          "in-progress": [...(current["in-progress"] || [])],
          done: [...(current.done || [])],
        };

        let currentTask = null;
        let oldCol = null;

        for (const col of Object.keys(next)) {
          const idx = next[col].findIndex((t) => t.id === taskId);
          if (idx !== -1) {
            currentTask = next[col][idx];
            oldCol = col;
            break;
          }
        }

        if (!currentTask) return current;

        const updated = {
          ...currentTask,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        const targetCol = updates.status || oldCol;

        if (targetCol !== oldCol) {
          next[oldCol] = next[oldCol].filter((t) => t.id !== taskId);
          next[targetCol] = [...(next[targetCol] || []), updated];
        } else {
          next[oldCol] = next[oldCol].map((t) => (t.id === taskId ? updated : t));
        }

        return next;
      });

      try {
        const updated = await api.updateTask(taskId, updates, {
          simulateFailure: simulatedFailure,
        });
        toast.success("Task updated successfully");
        return updated;
      } catch (err) {
        // Rollback
        setTasks(snapshot);
        toast.error("Failed to update task. Reverted changes.");
        throw err;
      } finally {
        inFlightMutationsRef.current.delete(taskId);
      }
    },
    [tasks]
  );

  // Delete task
  const deleteTask = useCallback(
    async (taskId, status, simulatedFailure = false) => {
      const snapshot = createSnapshot();
      inFlightMutationsRef.current.add(taskId);

      // Optimistic delete
      setTasks((current) => {
        const next = {
          backlog: [...(current.backlog || [])],
          todo: [...(current.todo || [])],
          "in-progress": [...(current["in-progress"] || [])],
          done: [...(current.done || [])],
        };

        for (const col of Object.keys(next)) {
          next[col] = next[col].filter((t) => t.id !== taskId);
        }

        return next;
      });

      try {
        await api.deleteTask(taskId, { simulateFailure: simulatedFailure });
        toast.success("Task deleted successfully");
      } catch (err) {
        // Rollback
        setTasks(snapshot);
        toast.error("Failed to delete task. Reverted changes.");
        throw err;
      } finally {
        inFlightMutationsRef.current.delete(taskId);
      }
    },
    [tasks]
  );

  return {
    tasks,
    setTasks,
    isLoading,
    error,
    refetch: fetchBoard,
    moveTask,
    createTask,
    updateTask,
    deleteTask,
  };
}
