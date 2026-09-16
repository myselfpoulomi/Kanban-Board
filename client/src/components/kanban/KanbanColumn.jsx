import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Plus,
  CircleDashed,
  CircleDot,
  Clock,
  CheckCircle2,
} from "lucide-react";

import KanbanCard from "./KanbanCard";

const iconMap = {
  CircleDashed,
  CircleDot,
  Clock,
  CheckCircle2,
};

export default function KanbanColumn({
  column,
  tasks = [],
  onAddTask,
  onEditClick,
  onDeleteClick,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const Icon = iconMap[column.icon] || CircleDashed;

  return (
    <section
      ref={setNodeRef}
      className={`
        flex
        w-[80vw]
        shrink-0
        sm:w-auto
        sm:min-w-[240px]
        sm:flex-1
        flex-col
        rounded-xl
        border
        border-[#222225]
        bg-[#141416]/70
        p-2.5
        backdrop-blur-sm
        transition-colors
        ${isOver ? "bg-[#1f1f24]/90 border-violet-500/40 ring-1 ring-violet-500/30" : ""}
      `}
    >
      {/* Column header */}
      <header className="mb-2 flex h-9 items-center justify-between px-1.5">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color: column.color }} />

          <h2 className="text-[13px] font-semibold text-[#e6e6e7]">
            {column.title}
          </h2>

          <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#202024] px-1.5 text-[10px] font-semibold text-[#8b8b92]">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddTask && onAddTask(column.id)}
          className="flex h-6 w-6 items-center justify-center rounded text-[#646469] transition hover:bg-white/10 hover:text-white"
          title={`Add task to ${column.title}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </header>

      {/* Droppable Card Area */}
      <div className="min-h-[140px] flex-1 overflow-y-auto overflow-x-hidden rounded-lg p-0.5">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2.5 pb-2 min-h-full">
            {tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
              />
            ))}

            {tasks.length === 0 && (
              <div
                onClick={() => onAddTask && onAddTask(column.id)}
                className="flex flex-1 min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#28282c] p-4 text-center transition hover:border-[#404048] hover:bg-white/[0.02]"
              >
                <p className="text-[11px] font-medium text-[#5c5c62]">
                  No tasks in {column.title}
                </p>
                <span className="mt-1 text-[10px] text-violet-400">
                  + Add task
                </span>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </section>
  );
}