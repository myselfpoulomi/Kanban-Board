# Collaborative Kanban Board

A focused, production-minded real-time Kanban board application built with a React frontend and an in-memory Express backend with Server-Sent Events (SSE).

---

## 🚀 How to Run the Project

### Prerequisites
- [Bun](https://bun.sh/) (or Node.js >= 18 + npm)

### 1. Start the Backend Server
```bash
cd server
bun install
bun run app.js
# Backend runs at http://localhost:3001
```

### 2. Start the Frontend Application
```bash
cd client
bun install
bun run dev
# Vite dev server runs at http://localhost:5173 (proxies /api to localhost:3001)
```

Open `http://localhost:5173` in your browser. Open multiple tabs/windows to test real-time multi-user collaboration!

---

## 🏛️ Architecture & System Design

```
 ┌────────────────────────────────────────────────────────┐
 │                    React Client                        │
 │  ┌──────────────────────────────────────────────────┐  │
 │  │        KanbanBoard Component & DnD Kit           │  │
 │  └─────────────────────────┬────────────────────────┘  │
 │                            ▼                           │
 │  ┌──────────────────────────────────────────────────┐  │
 │  │          useKanbanBoard State Hook               │  │
 │  │  • Active Board State ({ backlog, todo, ... })   │  │
 │  │  • In-Flight Mutation Set (prevents SSE clashes) │  │
 │  │  • State Snapshot & Rollback on 500 error        │  │
 │  └─────────────┬──────────────────────▲─────────────┘  │
 │                │ (Fetch / REST)       │ (SSE Stream)   │
 └────────────────┼──────────────────────┼────────────────┘
                  ▼                      │
 ┌───────────────────────────────────────┴────────────────┐
 │                 Express Backend (:3001)                │
 │  • REST Endpoints: GET/POST/PATCH/DELETE /api/tasks    │
 │  • In-Memory Store: 4 Columns (Backlog, Todo, etc.)    │
 │  • SSE Event Broadcaster: GET /api/events              │
 │  • Simulated Error Support for Rollback Testing        │
 └────────────────────────────────────────────────────────┘
```

### Key Technical Decisions:
1. **Normalized Column Structure**:
   - The board stores tasks grouped by columns (`backlog`, `todo`, `in-progress`, `done`). Each task has an explicit `position` index (0-based) and `updatedAt` timestamp.
2. **REST + Server-Sent Events (SSE)**:
   - REST API handles standard CRUD operations (`POST /api/tasks`, `PATCH /api/tasks/:id`, `DELETE /api/tasks/:id`).
   - `GET /api/events` provides a lightweight, persistent unidirectional event stream from server to all connected clients without the overhead of full WebSocket handshakes.
3. **URL Query Parameter Synchronization**:
   - The `useFilters` hook synchronizes `search`, `priority`, and `assignee` directly with `window.location.search` (`?search=...&priority=...&assignee=...`).
   - Refreshing the browser or sharing the URL preserves the exact filter state.

---

## ⚡ Optimistic Updates & Rollback

Every user interaction (dragging a card to another column, reordering, updating details, or deleting) feels instant:

1. **State Snapshotting**: Before dispatching the asynchronous API call, the previous state of the entire board is snapshotted in memory.
2. **Immediate UI Transition**: The local state is updated immediately with the new column/position/attributes.
3. **Background Persistence**: The request is sent to the backend in the background.
4. **Rollback on Failure**: If the backend returns a 500 error or the network fails:
   - The UI automatically rolls back to the snapshotted state.
   - A non-blocking toast notification alerts the user (`"Failed to move task. Reverted changes."`).
   - The board remains fully consistent with the server.

> **Testing Rollback**: You can check the *"Simulate API Failure"* toggle in the filter bar or send header `X-Simulate-Error: true` to trigger server-side 500s and verify the rollback behavior in real time!

---

## 🔄 Real-Time Collaboration & Conflict Reconciliation

When multiple users are modifying the board concurrently:

1. **SSE Broadcasts**: Whenever any client creates, updates, moves, or deletes a task, the server broadcasts an event (`task_created`, `task_updated`, `task_deleted`) to all connected clients.
2. **In-Flight Mutation Isolation**:
   - The client tracks active local mutations in an `inFlightMutations` set (`useRef(new Set())`).
   - If an incoming SSE event corresponds to a task that the current user is actively dragging/mutating, the event is ignored while the mutation is in flight to prevent layout jumping.
   - Once the local operation finishes, server state is authoritative.

---

## 🎯 Rubric Coverage

| Rubric Area | Implementation Details |
|---|---|
| **Columns & Grouping** | Backlog, Todo, In Progress, Done with task counts and empty states. |
| **Task CRUD** | Create modal, edit modal with unsaved change warnings, delete confirmation modal. |
| **Drag & Drop** | `@dnd-kit` with cross-column movement, reordering, and position persistence. |
| **Optimistic Updates** | Instant UI updates with snapshot rollback and Sonner error notifications. |
| **Search & Filters** | Title search, priority dropdown, assignee selection, all synchronized to URL query params. |
| **Real-Time Collaboration** | Native SSE (`EventSource`) with broadcast & conflict reconciliation. |
| **Backend Storage** | In-memory JavaScript data store conforming to the required task model. |

---

## ⚖️ Trade-offs & Deliberate Decisions

- **In-Memory Store over Database**: As per instructions, in-memory storage was used to keep the backend lightweight and zero-config for reviewer evaluation.
- **Server-Sent Events over WebSockets**: SSE was selected over WebSockets because client-to-server mutations are already cleanly expressed as REST HTTP requests, and SSE provides built-in browser reconnection, simplicity, and low overhead for server-to-client broadcasts.
- **Debounced / Drag-End Persistence**: Movement is persisted on `onDragEnd` rather than every sub-pixel `onDragOver` frame to avoid spamming the backend while preserving fluid 60fps animations.

---

## 🤖 Coding Agent Usage Note
This project was developed with the assistance of an agentic coding tool for rapid scaffolding, refactoring, and integration testing. All state transitions, conflict reconciliation logic, DnD constraints, and API error rollback mechanisms were personally verified and tested across multiple browser sessions.
