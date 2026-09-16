import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory data store for Kanban tasks
const VALID_STATUSES = ["backlog", "todo", "in-progress", "done"];

let board = {
  backlog: [
    {
      id: "TASK-101",
      title: "Set up CI/CD pipeline",
      description: "Automate build, lint, and test workflows on GitHub Actions.",
      priority: "high",
      assignee: "Alice",
      status: "backlog",
      position: 0,
      updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: "TASK-102",
      title: "Design database schema",
      description: "Draft ER diagrams and relationship models for multi-tenant accounts.",
      priority: "medium",
      assignee: "David",
      status: "backlog",
      position: 1,
      updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
  ],
  todo: [
    {
      id: "TASK-201",
      title: "Implement user authentication",
      description: "Add JWT authentication, sign in/sign up screens, and session refresh.",
      priority: "high",
      assignee: "Bob",
      status: "todo",
      position: 0,
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: "TASK-202",
      title: "Add dark mode toggle",
      description: "Create theme switcher component and integrate with Tailwind dark class.",
      priority: "low",
      assignee: "Alice",
      status: "todo",
      position: 1,
      updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
  ],
  "in-progress": [
    {
      id: "TASK-301",
      title: "Real-time SSE event listener",
      description: "Connect frontend to /api/events stream and reconcile incoming updates.",
      priority: "high",
      assignee: "Charlie",
      status: "in-progress",
      position: 0,
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "TASK-302",
      title: "Refactor drag-and-drop animations",
      description: "Smooth drop animations with @dnd-kit and prevent layout shifts.",
      priority: "medium",
      assignee: "Bob",
      status: "in-progress",
      position: 1,
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  done: [
    {
      id: "TASK-401",
      title: "Project boilerplate setup",
      description: "Initial React + Vite client and Express in-memory server scaffold.",
      priority: "medium",
      assignee: "Alice",
      status: "done",
      position: 0,
      updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
  ],
};

// SSE Connected Clients set
const sseClients = new Set();

// Broadcast event to all SSE clients
function broadcastEvent(type, payload) {
  const eventMessage = `data: ${JSON.stringify({
    type,
    payload,
    timestamp: new Date().toISOString(),
  })}\n\n`;

  for (const client of sseClients) {
    try {
      client.write(eventMessage);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Re-index position property for all tasks in a column
function normalizePositions(columnId) {
  if (board[columnId]) {
    board[columnId].forEach((task, idx) => {
      task.position = idx;
    });
  }
}

// Find a task across all columns
function findTask(id) {
  for (const [status, tasks] of Object.entries(board)) {
    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      return { task: tasks[index], status, index };
    }
  }
  return null;
}

// Helper middleware for deliberate failure simulation when requested
function maybeSimulateFailure(req, res, next) {
  const shouldFail =
    req.headers["x-simulate-error"] === "true" ||
    req.query.simulateFailure === "true";

  if (shouldFail) {
    return res.status(500).json({
      error: "Deliberate simulated failure (for testing rollback UI)",
    });
  }
  next();
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// GET /api/board - Returns board grouped by columns
app.get("/api/board", (req, res) => {
  res.json(board);
});

// GET /api/events - Server-Sent Events stream
app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: "connected", timestamp: new Date().toISOString() })}\n\n`);

  sseClients.add(res);

  // Heartbeat to keep connection open through proxies
  const heartbeat = setInterval(() => {
    res.write(":ping\n\n");
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// POST /api/tasks - Create task
app.post("/api/tasks", maybeSimulateFailure, (req, res) => {
  const body = req.body || {};
  const { title, description = "", priority = "medium", assignee = "", status = "backlog" } = body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }

  const targetStatus = VALID_STATUSES.includes(status) ? status : "backlog";
  const newTask = {
    id: `TASK-${Math.floor(1000 + Math.random() * 9000)}`,
    title: title.trim(),
    description: (description || "").trim(),
    priority: ["low", "medium", "high"].includes(priority) ? priority : "medium",
    assignee: (assignee || "").trim(),
    status: targetStatus,
    position: board[targetStatus].length,
    updatedAt: new Date().toISOString(),
  };

  board[targetStatus].push(newTask);
  normalizePositions(targetStatus);

  broadcastEvent("task_created", newTask);

  res.status(201).json(newTask);
});

// PATCH /api/tasks/:id - Update task details, status, or position
app.patch("/api/tasks/:id", maybeSimulateFailure, (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};

  const found = findTask(id);
  if (!found) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { task, status: currentStatus, index: currentIndex } = found;
  const newStatus = updates.status && VALID_STATUSES.includes(updates.status) ? updates.status : currentStatus;
  const targetPosition = typeof updates.position === "number" ? updates.position : undefined;

  // Build updated task object
  const updatedTask = {
    ...task,
    ...updates,
    id: task.id, // Prevent ID mutation
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  if (newStatus !== currentStatus) {
    // Moved across columns
    board[currentStatus].splice(currentIndex, 1);
    normalizePositions(currentStatus);

    if (targetPosition !== undefined && targetPosition >= 0) {
      board[newStatus].splice(targetPosition, 0, updatedTask);
    } else {
      board[newStatus].push(updatedTask);
    }
    normalizePositions(newStatus);
  } else {
    // Moved within same column or simple field update
    if (targetPosition !== undefined && targetPosition !== currentIndex) {
      board[currentStatus].splice(currentIndex, 1);
      board[currentStatus].splice(targetPosition, 0, updatedTask);
      normalizePositions(currentStatus);
    } else {
      board[currentStatus][currentIndex] = updatedTask;
    }
  }

  broadcastEvent("task_updated", updatedTask);

  res.json(updatedTask);
});

// DELETE /api/tasks/:id - Delete task
app.delete("/api/tasks/:id", maybeSimulateFailure, (req, res) => {
  const { id } = req.params;

  const found = findTask(id);
  if (!found) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { status, index, task } = found;
  board[status].splice(index, 1);
  normalizePositions(status);

  broadcastEvent("task_deleted", { id: task.id, status });

  res.json({ success: true, id: task.id, status });
});

app.listen(PORT, () => {
  console.log(`Kanban API server running on http://localhost:${PORT}`);
});
