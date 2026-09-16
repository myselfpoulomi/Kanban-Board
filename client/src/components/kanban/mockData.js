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
      id: "DEMO-102",
      title: "Webhooks to be truly Async",
      created: "Mar 26, 2026",
      labels: [
        { name: "Backend", color: "orange" },
      ],
    },
    {
      id: "DEMO-104",
      title: "Build a collaborative kanban board",
      created: "Apr 7, 2026",
      labels: [
        { name: "needs-human-only", color: "red" },
        { name: "Backend", color: "orange" },
      ],
      priority: "High",
      type: "Improvement",
      progress: "1/1",
    },
  ],

  "in-progress": [
    {
      id: "DEMO-106",
      title: "Add optimistic updates for card moves",
      created: "Jun 10, 2026",
      labels: [
        { name: "needs-human-only", color: "red" },
        { name: "Backend", color: "orange" },
      ],
      type: "Improvement",
      issue: "#3864",
    },
    {
      id: "DEMO-108",
      title: "Nest Upgrade",
      created: "Aug 11, 2026",
      labels: [
        { name: "agent-assisted", color: "gray" },
        { name: "Backend", color: "orange" },
      ],
      priority: "Mid",
    },
  ],

  waiting: [
    {
      id: "DEMO-110",
      title: "Implement real-time presence indicators",
      created: "Aug 3, 2026",
      labels: [
        { name: "ai-eligible", color: "gray" },
        { name: "Backend", color: "orange" },
      ],
      priority: "Mid",
    },
    {
      id: "DEMO-112",
      title: "Oredoo",
      created: "Aug 31, 2026",
      labels: [],
    },
  ],

  "code-review": [
    {
      id: "DEMO-114",
      title: "Add drag-and-drop column reordering",
      created: "Aug 25, 2026",
      labels: [
        { name: "ai-eligible", color: "gray" },
        { name: "Backend", color: "orange" },
      ],
      type: "Mid",
      issue: "#4717",
    },
    {
      id: "DEMO-116",
      title: "Create a reusable command palette",
      created: "Jun 13, 2026",
      labels: [
        { name: "ai-eligible", color: "gray" },
        { name: "Info", color: "green" },
      ],
      type: "refactor",
      progress: "9/42",
    },
    {
      id: "DEMO-118",
      title: "Implement server-side issue search",
      created: "Aug 25, 2026",
      labels: [
        { name: "ai-eligible", color: "gray" },
        { name: "Backend", color: "orange" },
      ],
      type: "Mid",
      issue: "#4171",
    },
    {
      id: "DEMO-120",
      title: "Add keyboard shortcuts for board navigation",
      created: "Jul 9, 2026",
      labels: [
        { name: "needs-human-only", color: "red" },
        { name: "Backend", color: "orange" },
      ],
      priority: "Mid",
      progress: "0/2",
    },
  ],

  done: [
    {
      id: "DEMO-122",
      title: "Build activity history for issue changes",
      created: "Sep 7, 2026",
      labels: [
        { name: "ai-eligible", color: "gray" },
        { name: "Backend", color: "orange" },
      ],
      type: "Feature",
    },
    {
      id: "DEMO-101",
      title: "Add bulk issue selection and actions",
      created: "Aug 26, 2026",
      labels: [
        { name: "ai-eligible", color: "gray" },
        { name: "Backend", color: "orange" },
      ],
      priority: "Low",
      type: "Feature",
    },
    {
      id: "DEMO-103",
      title: "Implement issue labels and filtering",
      created: "Aug 14, 2026",
      labels: [
        { name: "Bug", color: "red" },
      ],
    },
    {
      id: "DEMO-105",
      title: "Add pagination and infinite scrolling",
      created: "Jun 18, 2026",
      labels: [
        { name: "Backend", color: "orange" },
        { name: "Bug", color: "red" },
      ],
    },
    {
      id: "DEMO-107",
      title: "Create a notification preferences panel",
      created: "Aug 26, 2026",
      labels: [
        { name: "ai-eligible", color: "gray" },
        { name: "Backend", color: "orange" },
      ],
      priority: "Mid",
    },
  ],
};