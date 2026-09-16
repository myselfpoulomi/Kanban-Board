import { User, SignalHigh, CheckCircle, Bug, ArrowUpCircle } from "lucide-react";

const colorClasses = {
  red: "bg-[#f87171]",
  pink: "bg-[#f4a3b5]",
  orange: "bg-[#fb923c]",
  green: "bg-[#4ade80]",
  gray: "bg-[#9ca3af]",
  blue: "bg-[#38bdf8]",
};

export default function Label({ name, color = "gray", icon: Icon }) {
  const dotColor = colorClasses[color] || colorClasses.gray;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium border border-[#303033] bg-transparent text-[#9ca3af]`}
    >
      {Icon ? (
        <Icon className="h-3 w-3 text-[#646469]" />
      ) : (
        <span className={`h-2 w-2 rounded-full ${dotColor}`} />
      )}
      {name && <span>{name}</span>}
    </span>
  );
}