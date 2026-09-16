import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  defaultStatus = "backlog",
  initialData = null,
  isSubmitting = false,
}) {
  const isEditing = !!initialData;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignee, setAssignee] = useState("");
  const [status, setStatus] = useState("backlog");

  const [isDirty, setIsDirty] = useState(false);

  // Initialize form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || "");
      setDescription(initialData?.description || "");
      setPriority(initialData?.priority || "medium");
      setAssignee(initialData?.assignee || "");
      setStatus(initialData?.status || defaultStatus || "backlog");
      setIsDirty(false);
    }
  }, [isOpen, initialData, defaultStatus]);

  if (!isOpen) return null;

  const handleFieldChange = (setter) => (e) => {
    setIsDirty(true);
    setter(e.target.value);
  };

  const handleClose = () => {
    if (isSubmitting) return;

    if (isDirty) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Are you sure you want to discard them?"
      );
      if (!confirmClose) return;
    }
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    const taskData = {
      ...(isEditing ? initialData : {}),
      title: title.trim(),
      description: description.trim(),
      priority,
      assignee: assignee.trim(),
      status,
      updatedAt: new Date().toISOString(),
    };

    onSave(taskData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-[#222222] bg-[#0a0a0a] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium text-[#f1f1f1]">
            {isEditing ? "Edit Task" : "Add New Task"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded p-1 text-[#646469] hover:bg-white/5 hover:text-[#aaaab0] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#9ca3af]">
              Title <span className="text-white">*</span>
            </label>
            <input
              type="text"
              autoFocus={!isEditing}
              required
              value={title}
              onChange={handleFieldChange(setTitle)}
              disabled={isSubmitting}
              className="w-full rounded-md border border-[#222222] bg-[#000000] px-3 py-2 text-sm text-[#e6e6e7] placeholder-[#55555a] focus:border-[#55555a] focus:outline-none focus:ring-1 focus:ring-[#55555a] disabled:opacity-50"
              placeholder="e.g. Implement OAuth login..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#9ca3af]">
              Description
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={handleFieldChange(setDescription)}
              disabled={isSubmitting}
              className="w-full resize-none rounded-md border border-[#222222] bg-[#000000] px-3 py-2 text-sm text-[#e6e6e7] placeholder-[#55555a] focus:border-[#55555a] focus:outline-none focus:ring-1 focus:ring-[#55555a] disabled:opacity-50"
              placeholder="Add optional context or details..."
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-[#9ca3af]">
                Status
              </label>
              <select
                value={status}
                onChange={handleFieldChange(setStatus)}
                disabled={isSubmitting}
                className="w-full rounded-md border border-[#222222] bg-[#000000] px-3 py-2 text-sm text-[#e6e6e7] focus:border-[#55555a] focus:outline-none focus:ring-1 focus:ring-[#55555a] disabled:opacity-50"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-[#9ca3af]">
                Priority
              </label>
              <select
                value={priority}
                onChange={handleFieldChange(setPriority)}
                disabled={isSubmitting}
                className="w-full rounded-md border border-[#222222] bg-[#000000] px-3 py-2 text-sm text-[#e6e6e7] focus:border-[#55555a] focus:outline-none focus:ring-1 focus:ring-[#55555a] disabled:opacity-50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#9ca3af]">
              Assignee
            </label>
            <input
              type="text"
              value={assignee}
              onChange={handleFieldChange(setAssignee)}
              disabled={isSubmitting}
              className="w-full rounded-md border border-[#222222] bg-[#000000] px-3 py-2 text-sm text-[#e6e6e7] placeholder-[#55555a] focus:border-[#55555a] focus:outline-none focus:ring-1 focus:ring-[#55555a] disabled:opacity-50"
              placeholder="e.g. Alice, Bob..."
            />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-md px-4 py-2 text-sm font-medium text-[#9ca3af] hover:bg-white/5 hover:text-[#e6e6e7] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting || (!isDirty && isEditing)}
              className="flex items-center gap-2 rounded-md bg-[#f1f1f1] px-4 py-2 text-sm font-medium text-[#000000] transition-colors hover:bg-white disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
