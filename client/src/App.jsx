import KanbanBoard from "./components/kanban/KanbanBoard";

function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f10]">
      <main className="min-w-0 flex-1">
        <KanbanBoard />
      </main>
    </div>
  );
}

export default App;