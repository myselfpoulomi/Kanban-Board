import { useState } from "react";
import { Search, User, SlidersHorizontal, X, AlertTriangle } from "lucide-react";

export default function FilterBar({
  filters,
  updateFilters,
  assignees = [],
  simulateErrors,
  setSimulateErrors,
}) {
  const [isAddingAssignee, setIsAddingAssignee] = useState(false);
  const [assigneeInput, setAssigneeInput] = useState("");

  const hasActiveFilters = Boolean(
    filters.search || filters.priority || filters.assignee
  );

  const handleClear = () => {
    updateFilters({ search: "", priority: "", assignee: "" });
  };

  const handleAssigneeSubmit = (e) => {
    e.preventDefault();
    if (assigneeInput.trim()) {
      updateFilters({ assignee: assigneeInput.trim() });
    }
    setAssigneeInput("");
    setIsAddingAssignee(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#242426] bg-[#121214] px-4 py-2 text-xs">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-[#6d6d72]" />
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => updateFilters({ search: e.target.value })}
            placeholder="Search tasks..."
            className="h-7 w-48 rounded-md border border-[#2f3032] bg-[#1a1a1c] pl-8 pr-2 text-xs text-[#e6e6e7] placeholder-[#6d6d72] focus:border-[#55555a] focus:outline-none focus:ring-1 focus:ring-[#55555a]"
          />
          {filters.search && (
            <button
              onClick={() => updateFilters({ search: "" })}
              className="absolute right-2 text-[#6d6d72] hover:text-[#e6e6e7]"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#6d6d72]" />
          <select
            value={filters.priority || ""}
            onChange={(e) => updateFilters({ priority: e.target.value })}
            className="h-7 rounded-md border border-[#2f3032] bg-[#1a1a1c] px-2 text-xs text-[#d5d5d8] focus:border-[#55555a] focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>

        {/* Assignee Filter */}
        <div className="flex items-center gap-1.5">
          {filters.assignee ? (
            <div className="flex h-7 items-center gap-1.5 rounded-md border border-[#303033] bg-[#1b1b1d] px-2 text-xs text-[#d5d5d8]">
              <User className="h-3.5 w-3.5 text-[#9ca3af]" />
              <span className="text-[#9ca3af]">Assignee:</span>
              <span className="font-semibold text-violet-300">
                {filters.assignee}
              </span>
              <button
                onClick={() => updateFilters({ assignee: "" })}
                className="ml-1 rounded text-[#6d6d72] hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : isAddingAssignee ? (
            <form onSubmit={handleAssigneeSubmit} className="flex items-center">
              <input
                autoFocus
                type="text"
                value={assigneeInput}
                onChange={(e) => setAssigneeInput(e.target.value)}
                onBlur={() => {
                  if (assigneeInput.trim()) {
                    updateFilters({ assignee: assigneeInput.trim() });
                  }
                  setIsAddingAssignee(false);
                }}
                placeholder="Type assignee name..."
                className="h-7 w-36 rounded-md border border-[#303033] bg-[#1b1b1d] px-2 text-xs text-[#e6e6e7] placeholder-[#6d6d72] focus:border-[#55555a] focus:outline-none"
              />
            </form>
          ) : (
            <div className="flex items-center gap-1">
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setIsAddingAssignee(true);
                  } else if (e.target.value) {
                    updateFilters({ assignee: e.target.value });
                  }
                }}
                className="h-7 rounded-md border border-[#2f3032] bg-[#1a1a1c] px-2 text-xs text-[#d5d5d8] focus:border-[#55555a] focus:outline-none"
              >
                <option value="">All Assignees</option>
                {assignees.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
                <option value="__custom__">+ Custom Assignee...</option>
              </select>
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="flex h-7 items-center gap-1 rounded-md px-2 text-xs text-[#9ca3af] transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Dev / Interview Testing Toggle: Deliberate API Failures */}
      {setSimulateErrors && (
        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-[11px] text-amber-300 transition hover:bg-amber-500/10">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>Simulate API Failure (Test Rollback)</span>
            <input
              type="checkbox"
              checked={simulateErrors}
              onChange={(e) => setSimulateErrors(e.target.checked)}
              className="ml-1 accent-amber-500"
            />
          </label>
        </div>
      )}
    </div>
  );
}
