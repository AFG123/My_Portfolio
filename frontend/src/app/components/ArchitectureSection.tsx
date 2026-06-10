const diagram = String.raw`
┌─────────────────────────────────┐
│         React + Vite SPA        │
│   Tailwind · typed API client   │
│   fetch with retry + fallback   │
└────────────────┬────────────────┘
                 │  HTTPS / JSON
                 ▼
┌─────────────────────────────────┐
│         Express REST API        │
│  routes → controllers →         │
│        services → queries       │
│  rate limit · validation ·      │
│  central error handler          │
└────────────────┬────────────────┘
                 │  pg connection pool
                 ▼
┌─────────────────────────────────┐
│            PostgreSQL           │
│  contact messages · analytics   │
│  events (views/clicks/resumes)  │
└─────────────────────────────────┘
`;

const decisions = [
  {
    title: "Layered backend",
    detail:
      "Routes only wire URLs, controllers handle HTTP, services hold logic, and query modules own SQL. Each layer has one job, so a change in one place doesn't ripple through the rest.",
  },
  {
    title: "Rate limiting",
    detail:
      "The contact endpoint sits behind a sliding-window limiter keyed by client IP. Abusive traffic gets a clean 429 response instead of flooding the database.",
  },
  {
    title: "Fire-and-forget analytics",
    detail:
      "Page views, project clicks, and resume downloads are tracked asynchronously. If the tracking call fails, the user never notices — analytics must never break the actual page.",
  },
  {
    title: "Graceful degradation",
    detail:
      "The API client retries failed requests after a short delay to absorb backend cold starts. If the API stays down, the stats panel falls back to an offline state instead of crashing the page.",
  },
  {
    title: "Consistent error contract",
    detail:
      "Every error funnels through one middleware that shapes it into the same JSON envelope, so the frontend handles failures in exactly one way.",
  },
  {
    title: "Validation at the edge",
    detail:
      "Incoming payloads are validated before they reach business logic or SQL — bad input is rejected at the boundary, not deep inside the system.",
  },
];

export function ArchitectureSection() {
  return (
    <section id="architecture" className="py-20 px-6 border-t border-[#00ff41]/10">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-mono text-2xl text-[#00ff41] mb-4">
          <span className="text-[#00ff41]/60">$</span> cat architecture.md
        </h2>

        <p className="mb-10 max-w-2xl font-mono text-sm leading-7 text-gray-400">
          This portfolio is itself a running system, not a static page. The stats
          on the hero are live data flowing through the same stack described below.
        </p>

        <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-start">
          <div className="overflow-x-auto border border-[#00ff41]/20 bg-black/50 p-5">
            <pre className="font-mono text-[11px] leading-[1.35] text-[#00ff41]/80 sm:text-xs">
              {diagram.trim()}
            </pre>
          </div>

          <div className="space-y-5">
            {decisions.map((decision) => (
              <div key={decision.title} className="border-l-2 border-[#00ff41]/30 pl-4">
                <div className="font-mono text-sm text-[#00ff41]">
                  <span className="text-[#00ff41]/50">{">"} </span>
                  {decision.title}
                </div>
                <p className="mt-1 font-mono text-sm leading-6 text-gray-400">
                  {decision.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
