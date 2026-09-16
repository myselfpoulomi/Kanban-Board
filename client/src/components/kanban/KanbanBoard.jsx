import { useMemo, useState } from "react";

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

import { initialColumns, initialTasks } from "./mockData";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";

export default function KanbanBoard() {
  const [columns] = useState(initialColumns);
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState(null);

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

    if (activeColumn !== overColumn) {
      return;
    }

    if (active.id === over.id) {
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

      return {
        ...current,
        [activeColumn]: arrayMove(
          items,
          oldIndex,
          newIndex
        ),
      };
    });
  };

  const totalTasks = useMemo(
    () =>
      Object.values(tasks).reduce(
        (total, columnTasks) =>
          total + columnTasks.length,
        0
      ),
    [tasks]
  );

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

      {/* Kanban */}
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full min-w-max">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasks[column.id]}
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
    </div>
  );
}