export interface PortfolioProject {
  slug: string;
  name: string;
  category: string;
  summary: string;
  detail: string;
  stack: string[];
  github: string;
  demo: string | null;
  glyph: string;
  caption: string;
}

export const projects: PortfolioProject[] = [
  {
    slug: "reachinbox-email-scheduler",
    name: "ReachInbox Email Scheduler",
    category: "Async systems / Email infrastructure",
    summary: "A campaign scheduler built around durable delayed jobs, sender limits, and worker-safe delivery states.",
    detail: "BullMQ stores scheduled jobs in Redis so work can resume after a server restart. Sender limits and database states help coordinate delivery across workers.",
    stack: ["TypeScript", "Express", "BullMQ", "Redis", "PostgreSQL", "React"],
    github: "https://github.com/AFG123/reachinbox-email-scheduler",
    demo: "https://reachinbox-email-scheduler-gules.vercel.app",
    glyph: "enqueue( )",
    caption: "JOBS · WORKERS · DELIVERY",
  },
  {
    slug: "projectpilot",
    name: "ProjectPilot",
    category: "SaaS / Project generation",
    summary: "Personalized software project blueprints shaped around a student's skills and target role.",
    detail: "The platform produces architecture, schema, API, and phased build guidance, with a one-time paid unlock.",
    stack: ["Node.js", "Express", "PostgreSQL", "Razorpay"],
    github: "https://github.com/AFG123/ProjectPilot",
    demo: "https://projectpilot.devbyaryan.me/",
    glyph: "{ blueprint }",
    caption: "IDEA · ARCHITECTURE · BUILD",
  },
  {
    slug: "snipshare",
    name: "SnipShare",
    category: "Security / Data lifecycle",
    summary: "Share snippets with expiry, password protection, and burn-after-read access.",
    detail: "PostgreSQL stores snippets and expiry times. Burn-after-read deletes a snippet after access, but concurrent reads are not serialized.",
    stack: ["Node.js", "Express", "PostgreSQL", "React"],
    github: "https://github.com/AFG123/Snip-share",
    demo: "https://www.devbyaryan.me/",
    glyph: "< / >",
    caption: "CREATE · PROTECT · EXPIRE",
  },
  {
    slug: "sweety",
    name: "Sweety",
    category: "Health data / API design",
    summary: "A blood glucose tracker for daily readings and date-based reports.",
    detail: "Patients can log up to four readings per day. Its Express API handles authenticated reading management and daily, month-to-date, and monthly reports.",
    stack: ["React", "TypeScript", "Express", "PostgreSQL"],
    github: "https://github.com/AFG123/Sweety-Blood-Glucose-Tracker",
    demo: null,
    glyph: "40–600",
    caption: "READINGS · VALIDATION · REPORTS",
  },
];
