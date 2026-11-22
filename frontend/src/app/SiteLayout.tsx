import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from "react-router";
import { trackPortfolioEvent, trackResumeDownload } from "../lib/api";

type Theme = "dark" | "light";

export function SiteLayout() {
  const location = useLocation();
  const [theme, setTheme] = useState<Theme>(() => {
    try { return localStorage.getItem("portfolio-theme") === "light" ? "light" : "dark"; }
    catch { return "dark"; }
  });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#080e19" : "#f4f7fb");
    try { localStorage.setItem("portfolio-theme", theme); } catch { /* Storage may be unavailable. */ }
  }, [theme]);
  useEffect(() => {
    if (location.pathname === "/") return; // The homepage already tracks its own visit.
    void trackPortfolioEvent({ eventType: "page_view", path: location.pathname, metadata: { referrer: document.referrer || null } });
  }, [location.pathname]);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    const apply = () => { root.dataset.theme = next; flushSync(() => setTheme(next)); };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { apply(); return; }
    const viewDocument = document as Document & { startViewTransition?: (callback: () => void) => unknown };
    if (viewDocument.startViewTransition) viewDocument.startViewTransition(apply);
    else {
      root.classList.add("theme-changing");
      apply();
      window.setTimeout(() => root.classList.remove("theme-changing"), 400);
    }
  }

  const sectionLinks = [
    { label: "About", to: "/#about" },
    { label: "Experience", to: "/#experience" },
    { label: "Skills", to: "/#skills" },
    { label: "Contact", to: "/#contact" },
  ];

  return <div className="site-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <div className="header-inner container">
        <Link className="brand" to="/" aria-label="Aryan Damai, home">AD<span>.</span><span className="brand-caption">ARYAN DAMAI <small>BACKEND ENGINEER</small></span></Link>
        <nav className={`site-nav ${menuOpen ? "open" : ""}`} aria-label="Primary navigation">
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
          {sectionLinks.slice(0, 2).map((item) => <Link key={item.label} to={item.to} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
          <NavLink to="/projects" onClick={() => setMenuOpen(false)}>Projects</NavLink>
          {sectionLinks.slice(2).map((item) => <Link key={item.label} to={item.to} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
          <a className="nav-resume" href="/resume.pdf" download onClick={() => void trackResumeDownload("navigation")}>Resume <ArrowUpRight size={14} /></a>
        </nav>
        <div className="header-actions">
          <button className="theme-toggle icon-button" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>{theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}</button>
          <button className="mobile-menu icon-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
    </header>
    <div key={location.pathname} className="route-stage"><Outlet /></div>
    <footer className="site-footer"><div className="container footer-inner"><span className="footer-brand">AD<span>.</span></span><p>Designed and built by Aryan Damai.</p><a href="#main">Back to top ↑</a></div></footer>
    <ScrollRestoration />
  </div>;
}
