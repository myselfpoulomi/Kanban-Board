import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { initialColumns } from "./mockData";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import TaskModal from "./TaskModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import FilterBar from "./FilterBar";
import { useKanbanBoard } from "../../hooks/useKanbanBoard";
import { useFilters } from "../../hooks/useFilters";

export default function KanbanBoard() {
  const [columns] = useState(initialColumns);
  const [filters, updateFilters] = useFilters();
  const [simulateErrors, setSimulateErrors] = useState(false);

  const {
    tasks,
    isLoading,
    error,
    refetch,
    moveTask,
    createTask,
    updateTask,
    deleteTask,
  } = useKanbanBoard();

  const [activeTask, setActiveTask] = useState(null);
  const [activeSourceCol, setActiveSourceCol] = useState(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeColumnForNewTask, setActiveColumnForNewTask] = useState("backlog");
  const [editingTask, setEditingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // DnD Sensors with distance activation to allow click events on cards
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Derive unique assignees list from all current tasks
  const assignees = useMemo(() => {
    const set = new Set();
    Object.values(tasks).forEach((colTasks) => {
      colTasks.forEach((t) => {
        if (t.assignee && t.assignee.trim()) {
          set.add(t.assignee.trim());
        }
      });
    });
    return Array.from(set).sort();
  }, [tasks]);

  // Find column containing a task ID
  const findColumn = (taskId) => {
    if (taskId in tasks) {
      return taskId;
    }
    return Object.keys(tasks).find((columnId) =>
      tasks[columnId]?.some((task) => task.id === taskId)
    );
  };

  // Drag handlers
  const handleDragStart = ({ active }) => {
    const columnId = findColumn(active.id);
    if (!columnId) return;

    const task = tasks[columnId]?.find((item) => item.id === active.id);
    setActiveTask(task || null);
    setActiveSourceCol(columnId);
  };

  const handleDragEnd = ({ active, over }) => {
    const activeTaskId = active.id;
    const sourceCol = activeSourceCol || findColumn(activeTaskId);
    setActiveTask(null);
    setActiveSourceCol(null);

    if (!over || !sourceCol) return;

    const overId = over.id;
    let targetCol = findColumn(overId);

    // If dropped directly onto empty column container
    if (!targetCol && overId in tasks) {
      targetCol = overId;
    }

    if (!targetCol) return;

    // Calculate new index in target column
    const targetItems = tasks[targetCol] || [];
    const overItemIndex = targetItems.findIndex((t) => t.id === overId);
    let newPosition;

    if (overItemIndex >= 0) {
      newPosition = overItemIndex;
    } else {
      newPosition = targetItems.length;
    }

    // Trigger optimistic move with rollback on error
    moveTask(activeTaskId, sourceCol, targetCol, newPosition, simulateErrors);
  };

  // Apply Search & Filters
  const filteredTasks = useMemo(() => {
    const result = {};
    for (const [colId, colTasks] of Object.entries(tasks)) {
      result[colId] = (colTasks || []).filter((task) => {
        if (
          filters.assignee &&
          task.assignee?.toLowerCase() !== filters.assignee.toLowerCase()
        ) {
          return false;
        }
        if (
          filters.priority &&
          task.priority?.toLowerCase() !== filters.priority.toLowerCase()
        ) {
          return false;
        }
        if (
          filters.search &&
          !task.title?.toLowerCase().includes(filters.search.toLowerCase())
        ) {
          return false;
        }
        return true;
      });
    }
    return result;
  }, [tasks, filters]);

  const totalTasks = useMemo(
    () =>
      Object.values(filteredTasks).reduce(
        (total, columnTasks) => total + columnTasks.length,
        0
      ),
    [filteredTasks]
  );

  // Loading State
  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0f0f10] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#333336] border-t-violet-400" />
        <p className="mt-4 text-xs tracking-wide text-[#9ca3af]">
          Connecting to Kanban board...
        </p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0f0f10] text-white">
        <p className="mb-4 text-sm text-red-400 font-medium">{error}</p>
        <button
          onClick={refetch}
          className="rounded-md bg-[#252528] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#35353a]"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen min-h-0 flex-col bg-[#0f0f10] text-white select-none">
      {/* Top Header Bar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#242426] bg-[#0f0f10] px-4">
        <div className="flex items-center gap-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
          <span className="text-[13px] font-semibold text-[#f1f1f1]">
            Project Sprint Board
          </span>
          <span className="rounded-full bg-[#1c1c1f] px-2 py-0.5 text-[10px] font-medium text-[#7a7a82]">
            {totalTasks} active tasks
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingTask(null);
              setActiveColumnForNewTask("backlog");
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-md bg-violet-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-violet-600 active:scale-95"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Search, Filter & Rollback Simulation Bar */}
      <FilterBar
        filters={filters}
        updateFilters={updateFilters}
        assignees={assignees}
        simulateErrors={simulateErrors}
        setSimulateErrors={setSimulateErrors}
      />

      {/* Kanban Columns with DnD */}
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full gap-3">
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
              <div className="w-[260px] opacity-95 shadow-2xl rotate-1">
                <KanbanCard task={activeTask} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Create / Edit Task Modal */}
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
          try {
            setIsSubmitting(true);
            if (editingTask) {
              await updateTask(editingTask.id, taskData, simulateErrors);
            } else {
              await createTask(taskData, simulateErrors);
            }
            setIsModalOpen(false);
            setEditingTask(null);
          } catch {
            // Error handling & rollback is managed inside useKanbanBoard
          } finally {
            setIsSubmitting(false);
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(taskToDelete)}
        isDeleting={isDeleting}
        onClose={() => setTaskToDelete(null)}
        onConfirm={async () => {
          if (!taskToDelete) return;
          try {
            setIsDeleting(true);
            await deleteTask(taskToDelete.id, taskToDelete.status, simulateErrors);
            setTaskToDelete(null);
          } catch {
            // Error toast & rollback handled in hook
          } finally {
            setIsDeleting(false);
          }
        }}
      />
    </div>
  );
}