import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SignalHigh, CheckCircle, Bug, Sun } from "lucide-react";
import Label from "./Label";

export default function KanbanCard({ task }) {
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
    >
      {/* Top row */}
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#9ca3af]">
          {task.id}
        </span>
      </div>

      {/* Title */}
      <div className="flex items-center gap-2">
        <Sun className="h-4 w-4 text-[#facc15]" />
        <h3 className="text-[14px] font-medium leading-[17px] text-[#f1f1f1]">
          {task.title}
        </h3>
      </div>

      {/* Labels & Metadata combined */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {task.priority && (
          <Label icon={SignalHigh} />
        )}

        {task.labels?.map((label) => (
          <Label
            key={`${task.id}-${label.name}`}
            name={label.name}
            color={label.color}
          />
        ))}

        {task.priority && (
          <Label name={task.priority} color={task.priority === 'Mid' ? 'pink' : 'gray'} />
        )}
      </div>

      {/* Created date */}
      <div className="mt-4 text-[12px] font-medium text-[#9ca3af]">
        Created {task.created?.split(',')[0]}
      </div>
    </article>
  );
}