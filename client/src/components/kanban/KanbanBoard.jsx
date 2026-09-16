import { useMemo, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { api } from "../../api";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
} from "@dnd-kit/sortable";

import { initialColumns } from "./mockData";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import TaskModal from "./TaskModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import FilterBar from "./FilterBar";
import { useFilters } from "../../hooks/useFilters";

export default function KanbanBoard() {
  const [columns] = useState(initialColumns);
  const [filters, updateFilters] = useFilters();
  const [tasks, setTasks] = useState({});
  const [activeTask, setActiveTask] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeColumnForNewTask, setActiveColumnForNewTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Store the previous state for rollbacks
  const previousTasksRef = useRef({});

  useEffect(() => {
    let mounted = true;
    const fetchBoard = async () => {
      try {
        setIsLoading(true);
        const data = await api.getBoard();
        if (mounted) setTasks(data);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchBoard();
    return () => { mounted = false; };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  /*
   * Find which column contains a task.
   */
  const findColumn = (taskId) => {
    if (taskId in tasks) {
      return taskId;
    }

    return Object.keys(tasks).find((columnId) =>
      tasks[columnId].some(
        (task) => task.id === taskId
      )
    );
  };

  /*
   * Start dragging.
   */
  const handleDragStart = ({ active }) => {
    const columnId = findColumn(active.id);

    if (!columnId) return;

    const task = tasks[columnId].find(
      (item) => item.id === active.id
    );

    setActiveTask(task || null);
  };

  /*
   * Handle movement between columns.
   */
  const handleDragOver = ({ active, over }) => {
    if (!over) return;

    const activeColumn = findColumn(active.id);
    const overColumn = findColumn(over.id);

    if (!activeColumn || !overColumn) return;

    if (activeColumn === overColumn) {
      return;
    }

    setTasks((current) => {
      const activeItems = current[activeColumn];
      const overItems = current[overColumn];

      const activeIndex = activeItems.findIndex(
        (item) => item.id === active.id
      );

      if (activeIndex === -1) {
        return current;
      }

      const movedTask = activeItems[activeIndex];

      const newActiveItems = activeItems.filter(
        (item) => item.id !== active.id
      );

      /*
       * If dropping over another task,
       * insert before that task.
       */
      const overIndex = overItems.findIndex(
        (item) => item.id === over.id
      );

      const insertAt =
        overIndex >= 0
          ? overIndex
          : overItems.length;

      const newOverItems = [
        ...overItems.slice(0, insertAt),
        movedTask,
        ...overItems.slice(insertAt),
      ];

      return {
        ...current,
        [activeColumn]: newActiveItems,
        [overColumn]: newOverItems,
      };
    });

    // We don't persist handleDragOver to API immediately to avoid spamming the network,
    // wait for handleDragEnd.
  };

  /*
   * Reorder cards after dropping.
   */
  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null);

    if (!over) return;

    const activeColumn = findColumn(active.id);
    const overColumn = findColumn(over.id);

    if (!activeColumn || !overColumn) return;

    if (active.id === over.id) {
      return;
    }

    // Capture state for rollback
    const previousState = { ...tasks };
    const newIndex = tasks[overColumn].findIndex(item => item.id === over.id);

    // If moved between columns, handleDragOver already handled local state optimistically, 
    // but we need to persist it here.
    if (activeColumn !== overColumn) {
       const insertAt = newIndex >= 0 ? newIndex : tasks[overColumn].length;
       const promise = api.updateTask(active.id, { status: overColumn, position: insertAt });
       toast.promise(promise, {
          loading: "Moving task...",
          success: "Task moved",
          error: (err) => {
            setTasks(previousState); // rollback
            return "Failed to move task. Reverted changes.";
          }
       });
       return;
    }

    setTasks((current) => {
      const items = current[activeColumn];

      const oldIndex = items.findIndex(
        (item) => item.id === active.id
      );

      const newIndex = items.findIndex(
        (item) => item.id === over.id
      );

      if (oldIndex === -1 || newIndex === -1) {
        return current;
      }

      const newItems = arrayMove(items, oldIndex, newIndex);
      
      return {
        ...current,
        [activeColumn]: newItems,
      };
    });

    // Trigger API call for reorder within same column
    const promise = api.updateTask(active.id, { position: newIndex });
    toast.promise(promise, {
      loading: "Saving...",
      success: "Reordered successfully",
      error: (err) => {
        setTasks(previousState);
        return "Failed to save reorder. Reverted changes.";
      }
    });
  };

  const filteredTasks = useMemo(() => {
    const result = {};
    for (const [colId, colTasks] of Object.entries(tasks)) {
      result[colId] = colTasks.filter(task => {
        if (filters.assignee && task.assignee?.toLowerCase() !== filters.assignee.toLowerCase()) return false;
        if (filters.priority && task.priority?.toLowerCase() !== filters.priority.toLowerCase()) return false;
        if (filters.search && !task.title?.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
      });
    }
    return result;
  }, [tasks, filters]);

  const totalTasks = useMemo(
    () =>
      Object.values(filteredTasks).reduce(
        (total, columnTasks) =>
          total + columnTasks.length,
        0
      ),
    [filteredTasks]
  );

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0f0f10] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-2 border-[#55555a] border-t-[#f1f1f1]" />
        <p className="mt-4 text-sm text-[#9ca3af]">Loading board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0f0f10] text-white">
        <p className="mb-4 text-sm text-red-400">{error}</p>
        <button onClick={() => window.location.reload()} className="rounded bg-[#2c2c2f] px-4 py-2 hover:bg-[#3c3c3f]">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen min-h-0 flex-col bg-[#0f0f10] text-white">
      {/* Board top bar */}
      <div className="flex h-11 shrink-0 items-center border-b border-[#242426] px-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-violet-400" />

          <span className="text-[12px] font-semibold text-[#d5d5d8]">
            Demo Board
          </span>

          <span className="text-[10px] text-[#55555a]">
            {totalTasks} issues
          </span>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button className="rounded px-2 py-1 text-[10px] text-[#6d6d72] hover:bg-white/5 hover:text-[#aaaab0]">
            Filter
          </button>

          <button className="rounded px-2 py-1 text-[10px] text-[#6d6d72] hover:bg-white/5 hover:text-[#aaaab0]">
            Sort
          </button>

          <button className="rounded px-2 py-1 text-[10px] text-[#6d6d72] hover:bg-white/5 hover:text-[#aaaab0]">
            •••
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filters} updateFilters={updateFilters} />

      {/* Kanban */}
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={(e) => {
            previousTasksRef.current = tasks;
            handleDragStart(e);
          }}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full w-max sm:w-full">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={filteredTasks[column.id] || []}
                onAddTask={(colId) => {
                  setEditingTask(null);
                  setActiveColumnForNewTask(colId);
                  setIsModalOpen(true);
                }}
                onEditClick={(task) => {
                  setEditingTask(task);
                  setIsModalOpen(true);
                }}
                onDeleteClick={(task) => {
                  setTaskToDelete(task);
                }}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="w-[190px]">
                <KanbanCard task={activeTask} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        defaultStatus={activeColumnForNewTask}
        initialData={editingTask}
        isSubmitting={isSubmitting}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={async (taskData) => {
          setIsSubmitting(true);
          const previousState = { ...tasks };
          const isEdit = !!editingTask;
          
          // Optimistic update
          setTasks((prev) => {
            const next = { ...prev };
            // If edit, remove from old location first
            if (isEdit) {
              const oldStatus = editingTask.status;
              if (next[oldStatus]) {
                next[oldStatus] = next[oldStatus].filter(t => t.id !== taskData.id);
              }
            }
            next[taskData.status] = [...(next[taskData.status] || []), taskData];
            return next;
          });

          try {
            if (isEdit) {
               await api.updateTask(taskData.id, taskData);
               toast.success("Task updated");
            } else {
               await api.createTask(taskData);
               toast.success("Task created");
            }
            setIsModalOpen(false);
            setEditingTask(null);
          } catch (err) {
            setTasks(previousState);
            toast.error(isEdit ? "Failed to update task" : "Failed to create task");
          } finally {
            setIsSubmitting(false);
          }
        }}
      />

      <ConfirmDeleteModal
        isOpen={!!taskToDelete}
        isDeleting={isDeleting}
        onClose={() => setTaskToDelete(null)}
        onConfirm={async () => {
          if (!taskToDelete) return;
          setIsDeleting(true);
          const previousState = { ...tasks };
          
          // Optimistic delete
          setTasks((prev) => {
            const next = { ...prev };
            if (next[taskToDelete.status]) {
              next[taskToDelete.status] = next[taskToDelete.status].filter(t => t.id !== taskToDelete.id);
            }
            return next;
          });

          try {
            await api.deleteTask(taskToDelete.id);
            toast.success("Task deleted");
            setTaskToDelete(null);
          } catch (err) {
            setTasks(previousState);
            toast.error("Failed to delete task");
          } finally {
            setIsDeleting(false);
          }
        }}
      />
    </div>
  );
}