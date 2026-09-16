export const initialColumns = [
  {
    id: "todo",
    title: "Todo",
    total: 23,
    icon: "CircleDashed",
    color: "#94a3b8",
  },
  {
    id: "in-progress",
    title: "In Progress",
    total: 71,
    icon: "CircleDot",
    color: "#facc15",
  },
  {
    id: "waiting",
    title: "Waiting",
    total: 40,
    icon: "Clock",
    color: "#94a3b8",
  },
  {
    id: "code-review",
    title: "Code Review",
    total: 52,
    icon: "Eye",
    color: "#22c55e",
  },
  {
    id: "done",
    title: "Done",
    total: 131,
    icon: "CheckCircle2",
    color: "#6366f1",
  },
];

export const initialTasks = {
  todo: [
    {
      id: "TASK-8492",
      title: "Implement user authentication",
      description: "Set up JWT-based authentication and create login/register pages. Secure API endpoints.",
      priority: "high",
      assignee: "Alice Smith",
      status: "todo",
      position: 1,
      updatedAt: new Date().toISOString(),
    },
  ],

  "in-progress": [
    {
      id: "TASK-3109",
      title: "Design new landing page",
      description: "Create a modern, responsive landing page using Tailwind CSS and Framer Motion.",
      priority: "medium",
      assignee: "Bob Jones",
      status: "in-progress",
      position: 1,
      updatedAt: new Date().toISOString(),
    },
  ],

  waiting: [],

  "code-review": [
    {
      id: "TASK-5211",
      title: "Fix memory leak in data processing worker",
      description: "The background worker for data import is leaking memory over time. Needs profiling and fix.",
      priority: "high",
      assignee: "Charlie Brown",
      status: "code-review",
      position: 1,
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],

  done: [],
};