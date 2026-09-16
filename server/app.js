import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));
app.use(express.json());

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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

// Normalizes positions to be contiguous integers for a given status
async function normalizePositions(status) {
  const tasks = await prisma.task.findMany({
    where: { status },
    orderBy: { position: "asc" },
  });

  const updates = tasks.map((t, index) => {
    if (t.position !== index) {
      return prisma.task.update({
        where: { id: t.id },
        data: { position: index },
      });
    }
    return null;
  }).filter(Boolean);

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// GET /api/board - Returns board grouped by columns
app.get("/api/board", async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { position: "asc" },
    });

    const board = {
      backlog: [],
      todo: [],
      "in-progress": [],
      done: [],
    };

    tasks.forEach(task => {
      if (board[task.status]) {
        board[task.status].push(task);
      } else {
         board[task.status] = [task];
      }
    });

    res.json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch board" });
  }
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
app.post("/api/tasks", maybeSimulateFailure, async (req, res) => {
  const body = req.body || {};
  const { title, description = "", priority = "medium", assignee = "", status = "backlog" } = body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }

  const VALID_STATUSES = ["backlog", "todo", "in-progress", "done"];
  const targetStatus = VALID_STATUSES.includes(status) ? status : "backlog";

  try {
    const count = await prisma.task.count({ where: { status: targetStatus } });
    const generatedId = `TASK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTask = await prisma.task.create({
      data: {
        id: generatedId,
        title: title.trim(),
        description: (description || "").trim(),
        priority: ["low", "medium", "high"].includes(priority) ? priority : "medium",
        assignee: (assignee || "").trim(),
        status: targetStatus,
        position: count,
      },
    });

    broadcastEvent("task_created", newTask);
    res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// PATCH /api/tasks/:id - Update task details, status, or position
app.patch("/api/tasks/:id", maybeSimulateFailure, async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};

  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const VALID_STATUSES = ["backlog", "todo", "in-progress", "done"];
    const newStatus = updates.status && VALID_STATUSES.includes(updates.status) ? updates.status : task.status;
    const targetPosition = typeof updates.position === "number" ? updates.position : undefined;
    const oldStatus = task.status;

    let updatedTask;

    if (newStatus !== oldStatus) {
      // Moved across columns
      updatedTask = await prisma.task.update({
        where: { id },
        data: {
          title: updates.title,
          description: updates.description,
          priority: updates.priority,
          assignee: updates.assignee,
          status: newStatus,
          position: targetPosition !== undefined ? targetPosition : await prisma.task.count({ where: { status: newStatus } })
        }
      });
      
      if (targetPosition !== undefined) {
         // Shift other items in new column down
         await prisma.task.updateMany({
           where: { status: newStatus, id: { not: id }, position: { gte: targetPosition } },
           data: { position: { increment: 1 } }
         });
      }
      
      await normalizePositions(oldStatus);
      await normalizePositions(newStatus);
      
    } else {
      // Moved within same column or simple field update
      const oldPosition = task.position;
      
      if (targetPosition !== undefined && targetPosition !== oldPosition) {
        if (targetPosition > oldPosition) {
           await prisma.task.updateMany({
              where: { status: newStatus, id: { not: id }, position: { gt: oldPosition, lte: targetPosition } },
              data: { position: { decrement: 1 } }
           });
        } else {
           await prisma.task.updateMany({
              where: { status: newStatus, id: { not: id }, position: { gte: targetPosition, lt: oldPosition } },
              data: { position: { increment: 1 } }
           });
        }
      }
      
      updatedTask = await prisma.task.update({
        where: { id },
        data: {
          title: updates.title,
          description: updates.description,
          priority: updates.priority,
          assignee: updates.assignee,
          status: newStatus,
          position: targetPosition !== undefined ? targetPosition : oldPosition
        }
      });
      
      await normalizePositions(newStatus);
    }

    broadcastEvent("task_updated", updatedTask);
    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE /api/tasks/:id - Delete task
app.delete("/api/tasks/:id", maybeSimulateFailure, async (req, res) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    await prisma.task.delete({ where: { id } });
    await normalizePositions(task.status);

    broadcastEvent("task_deleted", { id: task.id, status: task.status });
    res.json({ success: true, id: task.id, status: task.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

app.listen(PORT, () => {
  console.log(`Kanban API server running on http://localhost:${PORT}`);
});
