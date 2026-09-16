import { User, SignalHigh, CheckCircle, Bug, ArrowUpCircle } from "lucide-react";

const colorClasses = {
  red: "bg-gray-200 text-black",
  pink: "bg-gray-300 text-black",
  orange: "bg-gray-400 text-black",
  green: "bg-gray-500 text-white",
  gray: "bg-[#9ca3af]",
  blue: "bg-gray-600 text-white",
};

export default function Label({ name, color = "gray", icon: Icon }) {
  const dotColor = colorClasses[color] || colorClasses.gray;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium border border-[#222222] bg-transparent text-[#9ca3af]`}
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