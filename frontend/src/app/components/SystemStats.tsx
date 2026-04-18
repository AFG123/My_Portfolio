import { useEffect, useState } from "react";
import { fetchPortfolioStats, type PortfolioStats } from "../../lib/api";

const fallbackStats: PortfolioStats = {
  portfolioViews: 0,
  projectClicks: 0,
  messagesReceived: 0,
  resumeDownloads: 0,
  apiStatus: "loading",
};

export function SystemStats() {
  const [stats, setStats] = useState<PortfolioStats>(fallbackStats);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const data = await fetchPortfolioStats();
        if (isMounted) {
          setStats(data);
        }
      } catch {
        if (isMounted) {
          setStats((current) => ({ ...current, apiStatus: "offline" }));
        }
      }
    }

    void loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const items = [
    { label: "portfolio_views", value: stats.portfolioViews },
    { label: "project_clicks", value: stats.projectClicks },
    { label: "messages_received", value: stats.messagesReceived },
    { label: "resume_downloads", value: stats.resumeDownloads },
    { label: "api_status", value: stats.apiStatus },
  ];

  return (
    <div className="mt-10 border border-[#00ff41]/20 bg-black/40 p-5">
      <div className="mb-4 font-mono text-sm text-[#00ff41]/70">
        <span className="text-[#00ff41]/50">$ </span>
        system_stats
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="border border-[#00ff41]/10 bg-black/70 px-4 py-3"
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#00ff41]/50">
              {item.label}
            </div>
            <div className="mt-2 font-mono text-lg text-white">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
