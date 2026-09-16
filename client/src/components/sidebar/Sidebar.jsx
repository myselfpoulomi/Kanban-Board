import {
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock3,
  Inbox,
  Layers3,
  List,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Target,
  Users,
  Workflow,
} from "lucide-react";

function SidebarItem({
  icon: Icon,
  children,
  active = false,
  badge,
  indent = false,
}) {
  return (
    <button
      type="button"
      className={`
        group flex w-full items-center gap-2 rounded-md
        px-2 py-[5px]
        text-left text-[11px]
        transition-colors
        ${
          active
            ? "bg-[#29292c] text-[#e8e8ea]"
            : "text-[#8a8a8f] hover:bg-[#1b1b1d] hover:text-[#c9c9cc]"
        }
        ${indent ? "pl-5" : ""}
      `}
    >
      <Icon
        size={13}
        strokeWidth={1.6}
        className={
          active
            ? "text-[#d7d7da]"
            : "text-[#707075]"
        }
      />

      <span className="min-w-0 flex-1 truncate">
        {children}
      </span>

      {badge && (
        <span className="text-[9px] text-[#67676c]">
          {badge}
        </span>
      )}
    </button>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="mb-1 mt-5 flex items-center px-2">
      <span className="text-[9px] font-medium uppercase tracking-wide text-[#55555a]">
        {children}
      </span>

      <button
        type="button"
        className="ml-auto rounded p-0.5 text-[#55555a] hover:bg-white/5 hover:text-[#88888d]"
      >
        <Plus size={12} strokeWidth={1.6} />
      </button>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col border-r border-[#242426] bg-[#111112]">
      {/* Workspace header */}
      <div className="flex h-12 items-center px-3">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-white/[0.04]"
        >
          {/* Workspace avatar */}
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#087fca] text-[9px] font-bold text-white">
            D
          </span>

          <span className="min-w-0 flex-1 truncate text-left text-[11px] font-medium text-[#d0d0d3]">
            Demo Workspace
          </span>

          <ChevronDown
            size={12}
            className="shrink-0 text-[#67676b]"
          />
        </button>

        <button
          type="button"
          className="ml-1 rounded-md p-1.5 text-[#68686d] hover:bg-white/5 hover:text-[#b5b5b9]"
        >
          <Search size={13} strokeWidth={1.7} />
        </button>

        <button
          type="button"
          className="rounded-md p-1.5 text-[#68686d] hover:bg-white/5 hover:text-[#b5b5b9]"
        >
          <Settings size={13} strokeWidth={1.7} />
        </button>
      </div>

      {/* Main navigation */}
      <nav className="px-2">
        <SidebarItem icon={Sparkles}>
          Pulse
        </SidebarItem>

        <SidebarItem
          icon={Inbox}
          badge="29"
        >
          Inbox
        </SidebarItem>

        <SidebarItem icon={CircleDot}>
          My issues
        </SidebarItem>

        <SidebarItem icon={Clock3}>
          Reviews
        </SidebarItem>

        <SidebarItem icon={Sparkles}>
          Agent
        </SidebarItem>
      </nav>

      {/* Workspace */}
      <div className="px-2">
        <SectionTitle>
          Workspace
        </SectionTitle>

        <SidebarItem icon={Layers3}>
          Projects
        </SidebarItem>

        <SidebarItem icon={List}>
          Views
        </SidebarItem>

        <SidebarItem icon={Workflow}>
          Loops
        </SidebarItem>

        <SidebarItem icon={MoreHorizontal}>
          More
        </SidebarItem>
      </div>

      {/* Your teams */}
      <div className="px-2">
        <SectionTitle>
          Your teams
        </SectionTitle>

        {/* Team */}
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-[5px] text-left text-[11px] text-[#aaaab0] hover:bg-white/[0.04]"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-[3px] bg-emerald-500/90 text-[8px] text-black">
            D
          </span>

          <span className="flex-1">
            Demo Workspace
          </span>

          <ChevronDown
            size={11}
            className="text-[#626267]"
          />
        </button>

        {/* Team navigation */}
        <div className="mt-0.5">
          <SidebarItem
            icon={Target}
            indent
          >
            Home
          </SidebarItem>

          <SidebarItem
            icon={CircleDot}
            indent
          >
            Issues
          </SidebarItem>

          <SidebarItem
            icon={Workflow}
            indent
          >
            Cycles
          </SidebarItem>

          {/* Cycle sub-navigation */}
          <div className="ml-5 border-l border-[#29292b] pl-2">
            <button
              type="button"
              className="flex w-full items-center rounded-md bg-[#29292c] px-2 py-[5px] text-left text-[10px] font-medium text-[#dedee1]"
            >
              Current
            </button>

            <button
              type="button"
              className="flex w-full items-center rounded-md px-2 py-[5px] text-left text-[10px] text-[#747479] hover:bg-white/[0.04] hover:text-[#aaaab0]"
            >
              Upcoming
            </button>
          </div>

          <SidebarItem
            icon={Layers3}
            indent
          >
            Projects
          </SidebarItem>

          <SidebarItem
            icon={List}
            indent
          >
            Views
          </SidebarItem>
        </div>
      </div>

      {/* Bottom area */}
      <div className="mt-auto border-t border-[#202022] p-2">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[10px] text-[#6e6e73] hover:bg-white/[0.04] hover:text-[#aaaab0]"
        >
          <PanelLeft size={13} strokeWidth={1.6} />
          Collapse sidebar
        </button>
      </div>
    </aside>
  );
}