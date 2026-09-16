import { initialTasks } from "../components/kanban/mockData";

const STORAGE_KEY = "kanban-tasks-v3";

// Initialize local storage if empty
const initDB = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTasks));
  }
};

initDB();

const getDB = () => JSON.parse(localStorage.getItem(STORAGE_KEY));
const saveDB = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const simulateNetwork = async (probabilityOfFailure = 0.15) => {
  const delay = Math.floor(Math.random() * 500) + 300; // 300-800ms
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < probabilityOfFailure) {
        reject(new Error("Deliberate network failure simulation"));
      } else {
        resolve();
      }
    }, delay);
  });
};

export const api = {
  // GET /api/board
  getBoard: async () => {
    await simulateNetwork(0); // Never fail on initial load for simplicity
    return getDB();
  },

  // POST /api/tasks
  createTask: async (task) => {
    await simulateNetwork(0.15); // 15% chance to fail
    const db = getDB();
    
    if (!db[task.status]) {
      db[task.status] = [];
    }
    db[task.status].push(task);
    saveDB(db);
    return task;
  },

  // PATCH /api/tasks/:id
  // Updates task details, or its position/status if moved
  updateTask: async (id, updates) => {
    await simulateNetwork(0.15); // 15% chance to fail
    const db = getDB();
    
    let taskFound = null;
    let oldStatus = null;
    let oldIndex = -1;

    // Find the task
    for (const [status, tasksList] of Object.entries(db)) {
      const idx = tasksList.findIndex((t) => t.id === id);
      if (idx !== -1) {
        taskFound = { ...tasksList[idx] };
        oldStatus = status;
        oldIndex = idx;
        break;
      }
    }

    if (!taskFound) {
      throw new Error("Task not found");
    }

    const updatedTask = { ...taskFound, ...updates, updatedAt: new Date().toISOString() };

    // If status changed, remove from old column and insert into new
    if (updates.status && updates.status !== oldStatus) {
      db[oldStatus].splice(oldIndex, 1);
      
      if (!db[updatedTask.status]) {
        db[updatedTask.status] = [];
      }

      // If position is provided, insert there, otherwise append
      if (updates.position !== undefined) {
        db[updatedTask.status].splice(updates.position, 0, updatedTask);
      } else {
        db[updatedTask.status].push(updatedTask);
      }
    } else {
      // Just update in place, or handle reordering within same column
      db[oldStatus].splice(oldIndex, 1);
      if (updates.position !== undefined) {
        db[oldStatus].splice(updates.position, 0, updatedTask);
      } else {
        db[oldStatus].splice(oldIndex, 0, updatedTask);
      }
    }

    saveDB(db);
    return updatedTask;
  },

  // DELETE /api/tasks/:id
  deleteTask: async (id) => {
    await simulateNetwork(0.15);
    const db = getDB();

    for (const [status, tasksList] of Object.entries(db)) {
      const idx = tasksList.findIndex((t) => t.id === id);
      if (idx !== -1) {
        tasksList.splice(idx, 1);
        saveDB(db);
        return { success: true };
      }
    }

    throw new Error("Task not found");
  },

  // GET /api/events (stubbed for now)
  listenToEvents: (callback) => {
    // In a real app, this would setup SSE or WebSockets.
    console.log("Subscribed to /api/events");
    return () => console.log("Unsubscribed from /api/events");
  }
};
