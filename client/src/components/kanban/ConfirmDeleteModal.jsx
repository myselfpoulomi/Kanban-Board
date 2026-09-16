import { X, Trash2 } from "lucide-react";

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-[#222222] bg-[#0a0a0a] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Delete Task</h2>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded p-1 text-[#646469] hover:bg-white/5 hover:text-[#aaaab0] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="mb-6 text-sm text-[#9ca3af]">
          Are you sure you want to delete this task? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-md px-4 py-2 text-sm font-medium text-[#9ca3af] hover:bg-white/5 hover:text-[#e6e6e7] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
          >
            {isDeleting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isDeleting ? "Deleting..." : "Delete Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
