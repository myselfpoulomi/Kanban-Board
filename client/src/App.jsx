import { Toaster } from "sonner";
import KanbanBoard from "./components/kanban/KanbanBoard";

function App() {
  return (
    <>
      <Toaster theme="dark" position="bottom-right" />
      <div className="flex h-screen overflow-hidden bg-[#0f0f10]">
        <main className="min-w-0 flex-1">
          <KanbanBoard />
        </main>
      </div>
    </>
  );
}

export default App;