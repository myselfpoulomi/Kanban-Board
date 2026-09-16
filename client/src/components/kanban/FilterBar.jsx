import { useState } from 'react';
import { User, X, Plus } from 'lucide-react';

export default function FilterBar({ filters, updateFilters }) {
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleClear = () => {
    updateFilters({ search: '', priority: '', assignee: '' });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      updateFilters({ assignee: inputValue.trim() });
    }
    setInputValue('');
    setIsAdding(false);
  };

  return (
    <div className="flex h-10 items-center border-b border-[#242426] bg-[#0f0f10] px-4">
      <div className="flex flex-1 items-center gap-2">
        {filters.assignee && (
          <div className="flex items-center gap-2 rounded-md border border-[#303033] bg-[#1b1b1d] px-2 py-1 text-[11px]">
            <User className="h-3 w-3 text-[#9ca3af]" />
            <span className="text-[#9ca3af]">Assignee</span>
            <span className="text-[#55555a]">is</span>
            <div className="flex items-center gap-1.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-amber-500">
               <div className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-[9px] font-bold">
                 {filters.assignee.charAt(0).toUpperCase()}
               </div>
               <span className="font-medium">{filters.assignee}</span>
            </div>
            <button 
              onClick={() => updateFilters({ assignee: '' })}
              className="ml-1 flex items-center justify-center rounded text-[#646469] hover:bg-white/10 hover:text-[#f1f1f1]"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        
        {!isAdding && !filters.assignee && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 rounded-md border border-dashed border-[#303033] bg-transparent px-2 py-1 text-[11px] text-[#646469] transition hover:border-[#55555a] hover:text-[#f1f1f1]"
          >
            <User className="h-3 w-3" />
            <span>choose assignee</span>
          </button>
        )}

        {isAdding && (
          <form onSubmit={handleAddSubmit} className="flex items-center">
            <input
              autoFocus
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={() => setIsAdding(false)}
              placeholder="Type assignee name..."
              className="h-6 rounded border border-[#303033] bg-[#1b1b1d] px-2 text-[11px] text-[#e6e6e7] placeholder-[#55555a] focus:border-[#55555a] focus:outline-none"
            />
          </form>
        )}
      </div>

      <div className="flex items-center gap-3">
        {(filters.search || filters.priority || filters.assignee) && (
          <button 
            onClick={handleClear}
            className="text-[11px] font-medium text-[#9ca3af] transition hover:text-[#f1f1f1]"
          >
            Clear
          </button>
        )}
        <button className="rounded bg-[#2f3032] px-3 py-1 text-[11px] font-medium text-[#f1f1f1] transition hover:bg-[#414145]">
          Save
        </button>
      </div>
    </div>
  );
}
