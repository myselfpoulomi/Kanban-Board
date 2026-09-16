// API client connecting to Express server

const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request(url, options = {}) {
  const { headers, ...restOptions } = options;
  const res = await fetch(url, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
  });

  if (!res.ok) {
    let errorMessage = `Request failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Ignore JSON parse error if response body is empty or non-JSON
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

export const api = {
  // GET /api/board
  getBoard: async () => {
    return request(`${API_BASE}/board`);
  },

  // POST /api/tasks
  createTask: async (taskData, options = {}) => {
    const headers = {};
    if (options.simulateFailure) {
      headers["X-Simulate-Error"] = "true";
    }
    return request(`${API_BASE}/tasks`, {
      method: "POST",
      headers,
      body: JSON.stringify(taskData),
    });
  },

  // PATCH /api/tasks/:id
  updateTask: async (id, updates, options = {}) => {
    const headers = {};
    if (options.simulateFailure) {
      headers["X-Simulate-Error"] = "true";
    }
    return request(`${API_BASE}/tasks/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updates),
    });
  },

  // DELETE /api/tasks/:id
  deleteTask: async (id, options = {}) => {
    const headers = {};
    if (options.simulateFailure) {
      headers["X-Simulate-Error"] = "true";
    }
    return request(`${API_BASE}/tasks/${id}`, {
      method: "DELETE",
      headers,
    });
  },

  // Real-time SSE event listener
  listenToEvents: (onEvent) => {
    const eventSource = new EventSource(`${API_BASE}/events`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onEvent) {
          onEvent(data);
        }
      } catch (err) {
        console.error("Failed to parse SSE event data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("SSE connection error, browser will auto-reconnect:", err);
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  },
};
