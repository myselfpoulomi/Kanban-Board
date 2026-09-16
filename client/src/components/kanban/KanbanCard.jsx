import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, AlertCircle, AlertTriangle, ArrowDown, User } from "lucide-react";

const priorityConfig = {
  high: {
    label: "High",
    icon: AlertCircle,
    badgeClass: "bg-white/10 text-white border-white/20",
  },
  medium: {
    label: "Medium",
    icon: AlertTriangle,
    badgeClass: "bg-white/10 text-gray-300 border-white/20",
  },
  low: {
    label: "Low",
    icon: ArrowDown,
    badgeClass: "bg-white/10 text-gray-300 border-white/20",
  },
};

export default function KanbanCard({ task, onEditClick, onDeleteClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const PriorityIcon = priority.icon;

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onEditClick && onEditClick(task)}
      className={`
        group
        relative
        cursor-grab
        select-none
        rounded-lg
        border
        border-[#2b2b2f]
        bg-[#1b1b1e]
        p-3
        shadow-sm
        transition-all
        hover:border-[#424248]
        hover:bg-[#111111]
        active:cursor-grabbing
        ${isDragging ? "z-50 opacity-40 ring-1 ring-white" : ""}
      `}
    >
      {/* Top row: ID + Delete Action */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-mono font-medium text-[#7a7a82]">
          {task.id}
        </span>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick && onDeleteClick(task);
          }}
          className="rounded p-1 text-[#646469] opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
          title="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Task Title */}
      <h3 className="text-[13px] font-medium leading-snug text-[#f1f1f1]">
        {task.title}
      </h3>

      {/* Description Preview */}
      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-[#8e8e96]">
          {task.description}
        </p>
      )}

      {/* Bottom Metadata: Priority & Assignee */}
      <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#26262a]">
        {/* Priority Badge */}
        <span
          className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium ${priority.badgeClass}`}
        >
          <PriorityIcon className="h-2.5 w-2.5" />
          {priority.label}
        </span>

        {/* Assignee Avatar / Name */}
        {task.assignee ? (
          <div className="flex items-center gap-1.5 text-[#9ca3af]">
            <User className="h-3.5 w-3.5" />
            <span className="max-w-[80px] truncate text-[11px]">
              {task.assignee}
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-[#55555a]">Unassigned</span>
        )}
      </div>
    </article>
  );
}