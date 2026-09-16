import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SignalHigh, CheckCircle, Bug, Sun, Trash2 } from "lucide-react";
import Label from "./Label";

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

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group
        cursor-grab
        select-none
        rounded-[8px]
        border border-[#2f3032]
        bg-[#1b1b1d]
        px-3.5
        py-3
        shadow-sm
        transition-colors
        hover:border-[#414145]
        active:cursor-grabbing
        ${isDragging ? "z-50 opacity-50 ring-1 ring-[#414145]" : ""}
      `}
      onClick={() => onEditClick && onEditClick(task)}
    >
      {/* Top row */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[12px] font-medium text-[#9ca3af]">
          {task.id}
        </span>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick && onDeleteClick(task);
          }}
          className="rounded p-1 text-[#646469] opacity-0 transition-opacity hover:bg-white/5 hover:text-red-400 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Title */}
      <div className="flex items-center gap-2">
        <Sun className="h-4 w-4 shrink-0 text-[#facc15]" />
        <h3 className="text-[14px] font-medium leading-[17px] text-[#f1f1f1]">
          {task.title}
        </h3>
      </div>

      {/* Description */}
      {task.description && (
        <p className="mt-2 text-[12px] leading-relaxed text-[#9ca3af] line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Priority Badge */}
      {task.priority && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Label 
            name={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} 
            color={task.priority === 'high' ? 'red' : task.priority === 'low' ? 'gray' : 'pink'} 
            icon={SignalHigh}
          />
        </div>
      )}

      {/* Assignee and Date row */}
      <div className="mt-4 flex items-center justify-between">
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-400">
              {task.assignee.charAt(0).toUpperCase()}
            </div>
            <span className="text-[11px] text-[#9ca3af]">{task.assignee}</span>
          </div>
        ) : <div />}

        <div className="text-[11px] font-medium text-[#77777c]">
          {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
        </div>
      </div>
    </article>
  );
}