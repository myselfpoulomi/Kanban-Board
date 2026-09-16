import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, MoreHorizontal, CircleDashed, CircleDot, Clock, Eye, CheckCircle2 } from "lucide-react";

import KanbanCard from "./KanbanCard";

const iconMap = {
  CircleDashed,
  CircleDot,
  Clock,
  Eye,
  CheckCircle2,
};

export default function KanbanColumn({
  column,
  tasks,
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
        w-[85vw]
        shrink-0
        sm:w-auto
        sm:min-w-[200px]
        sm:flex-1
        flex-col
        border-r
        border-[#222224]
        px-3
        transition-colors
        ${isOver ? "bg-white/[0.015]" : ""}
      `}
    >
      {/* Column header */}
      <header className="mb-3 flex h-10 items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color: column.color }} />

          <h2 className="text-[13px] font-medium text-[#e6e6e7]">
            {column.title}
          </h2>

          <span className="text-[12px] font-medium text-[#55555a]">
            {tasks.length} / {column.total || 0}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="flex h-6 w-6 items-center justify-center rounded text-[#646469] transition hover:bg-white/5 hover:text-[#aaaab0]"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onAddTask && onAddTask(column.id)}
            className="flex h-6 w-6 items-center justify-center rounded text-[#646469] transition hover:bg-white/5 hover:text-[#aaaab0]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Cards */}
      <div className="min-h-[100px] flex-1 overflow-y-auto overflow-x-hidden rounded-md">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 pb-4">
            {tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </section>
  );
}