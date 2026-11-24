import { useEffect, useRef, useState } from "react";
import { fetchPortfolioStats, type PortfolioStats } from "../../lib/api";

export function SystemStats() {
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [status, setStatus] = useState<"loading" | "online" | "offline">("loading");
  const [latency, setLatency] = useState<number | null>(null);
  const mounted = useRef(true);
  async function loadStats() {
    setStatus("loading");
    const start = performance.now();
    try {
      const data = await fetchPortfolioStats();
      if (!mounted.current) return;
      setStats(data); setLatency(Math.round(performance.now() - start)); setStatus("online");
    } catch {
      if (mounted.current) setStatus("offline");
    }
  }
  useEffect(() => {
    mounted.current = true;
    void loadStats();
    return () => { mounted.current = false; };
  }, []);
  const items = [
    ["PORTFOLIO VIEWS", stats?.portfolioViews],
    ["PROJECT CLICKS", stats?.projectClicks],
    ["MESSAGES RECEIVED", stats?.messagesReceived],
    ["RESUME DOWNLOADS", stats?.resumeDownloads],
  ] as const;
  return <div className="stats-panel">
    <div className="stats-label"><span className={`status-dot ${status}`} /> LIVE SYSTEM METRICS <span className="stats-status">{status === "loading" ? "CONNECTING..." : status === "online" ? `API ONLINE · ${latency}MS` : "API OFFLINE"}</span></div>
    {status === "offline" ? <div className="stats-fallback" role="status"><p>Live metrics are taking a break. The rest of the portfolio is ready to explore.</p><button type="button" onClick={() => void loadStats()}>Retry connection</button></div>
      : <div className="stats-grid">{items.map(([label, value]) => <div className="stat" key={label}><span>{label}</span><strong>{status === "loading" ? "—" : value?.toLocaleString()}</strong></div>)}</div>}
  </div>;
}
