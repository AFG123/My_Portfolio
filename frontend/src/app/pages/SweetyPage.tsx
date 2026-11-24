import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { projects } from "../../data/projects";
import { trackPortfolioEvent } from "../../lib/api";
import { ArchitectureViewer } from "../../features/architecture/ArchitectureViewer";
import { sweetyReadingArchitecture, sweetyReportArchitecture } from "../../features/architecture/sweety";

type FlowMode = "reading" | "report";

const decisions = [
  { area: "OWNERSHIP", title: "Scope every reading to the user", detail: "The authenticated user ID comes from a verified access token. Reading updates and deletes include both the row ID and user ID; report queries also filter by user ID." },
  { area: "TIME", title: "Use one calendar policy", detail: "The API uses Asia/Kolkata to decide whether a reading date is in the future. Reporting uses date-only, inclusive ranges: one day, month-to-date, or the full previous month." },
  { area: "SQL REPORTS", title: "Aggregate at the database", detail: "PostgreSQL calculates MAX, MIN, rounded AVG, and COUNT for the selected user and date range. A daily report makes a second query for its readings in fixed slot order." },
];

const security = [
  { area: "COOKIES", title: "Keep auth tokens HttpOnly", detail: "The API sets a 15-minute access-token cookie and a seven-day refresh-token cookie. Both are HttpOnly and SameSite=Lax; Secure is enabled in production mode." },
  { area: "CSRF", title: "Protect state-changing session calls", detail: "Reading writes, refresh, and logout use a submitted X-CSRF-Token header checked against the signed _csrf cookie. The browser API helper obtains and sends the token." },
  { area: "ROTATION", title: "Rotate refresh tokens with a row lock", detail: "A refresh transaction selects the stored token FOR UPDATE, marks it used, and inserts a replacement in the same family. Reuse triggers family revocation." },
];

const futureWork = [
  { area: "REPORTING", title: "Charts are not implemented", detail: "The current analytics screen shows summary cards and a daily slot breakdown. The README lists a trend chart as a future addition; the case study will not depict one as shipped." },
  { area: "SCALE", title: "History has no pagination", detail: "The readings endpoint returns all rows for a user, ordered by date and slot. The README proposes server-side pagination for longer histories." },
  { area: "SCOPE", title: "Reminders and clinician access remain ideas", detail: "Background reminders and a doctor role are potential improvements. A worker, reminder delivery, and clinician authorization are not implemented." },
  { area: "CALENDAR", title: "A fixed IST policy", detail: "Future-date validation uses Asia/Kolkata for every user. That is explicit and consistent in this app, but a user-specific timezone is not implemented." },
];

export function SweetyPage() {
  const [mode, setMode] = useState<FlowMode>("reading");
  const project = projects.find((item) => item.slug === "sweety")!;
  const config = mode === "reading" ? sweetyReadingArchitecture : sweetyReportArchitecture;

  useEffect(() => {
    document.title = "Sweety — Aryan Damai";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Explore Sweety's authentication, glucose-reading validation, PostgreSQL constraints, and date-based report queries.");
  }, []);

  function trackSource() {
    void trackPortfolioEvent({ eventType: "project_click", path: window.location.pathname, projectSlug: project.slug, metadata: { target: project.github, linkType: "github" } });
  }

  return <main id="main" className="case-page sweety-case">
    <div className="container">
      <nav className="page-crumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><Link to="/projects">Projects</Link><span aria-hidden="true">/</span><span aria-current="page">Sweety</span></nav>
      <section className="case-hero">
        <div><span className="eyebrow"><span className="eyebrow-line" /> PROJECT CASE STUDY / 04</span><h1>Sweety<span className="accent-dot">.</span></h1><p>A blood glucose tracker built around four daily recording slots and date-based reports. Its backend keeps each reading tied to a user, validates the input, and lets PostgreSQL enforce the rules that must hold under concurrent requests.</p>
          <div className="case-hero-actions"><a className="button button-primary" href={project.github} target="_blank" rel="noopener noreferrer" onClick={trackSource}><Github size={17} /> View source <ArrowUpRight size={16} /></a></div>
        </div>
        <div className="case-hero-meta"><span>TYPE <strong>GLUCOSE RECORDING</strong></span><span>FOCUS <strong>VALIDATION · CONSTRAINTS · REPORTS</strong></span><span>STACK <strong>REACT · EXPRESS · POSTGRESQL</strong></span></div>
      </section>

      <section className="case-section" aria-labelledby="sweety-problem"><div className="case-section-label">01 / THE PROBLEM</div><div><h2 id="sweety-problem">Keep daily readings consistent and useful.</h2><p>A user can record readings for morning fasting, after breakfast, after lunch, and after dinner. The application needs to reject invalid values and dates, prevent duplicate entries for a slot, and keep each person's history separate.</p><p>The reporting side turns those saved rows into daily, month-to-date, and previous-month summaries without changing the underlying readings. The app records and summarizes values; it does not provide a clinical diagnosis.</p></div></section>

      <section className="case-section" aria-labelledby="sweety-features"><div className="case-section-label">02 / PRODUCT JOURNEY</div><div><h2 id="sweety-features">What is implemented.</h2><div className="case-feature-grid"><div><span>01</span><h3>Sign in and keep a session</h3><p>Register or log in, then use HttpOnly access and refresh cookies. The browser can refresh an expired access token.</p></div><div><span>02</span><h3>Record four daily slots</h3><p>Add, edit, or delete a reading for one of the fixed slots. Deleting a row frees that date and slot again.</p></div><div><span>03</span><h3>Validate at two boundaries</h3><p>Express checks dates, slots, and whole-number values. PostgreSQL enforces a unique user/date/slot and a 40–600 value check.</p></div><div><span>04</span><h3>Explore reports</h3><p>Review daily details, month-to-date totals, or the entire previous month's highest, lowest, average, and reading count.</p></div></div></div></section>

      <div className="projectpilot-flow sweety-flow" data-mode={mode}>
        <div className="projectpilot-flow-switch" role="group" aria-label="Sweety architecture workflow">
          <div><span className="eyebrow"><span className="eyebrow-line" /> 03 / SYSTEM WALKTHROUGH</span><p>Choose a workflow, then select a numbered step or component to follow the request path.</p></div>
          <div className="projectpilot-mode-buttons"><button type="button" aria-pressed={mode === "reading"} className={mode === "reading" ? "is-current" : ""} onClick={() => setMode("reading")}>01 <span>Record a reading</span></button><button type="button" aria-pressed={mode === "report"} className={mode === "report" ? "is-current" : ""} onClick={() => setMode("report")}>02 <span>Generate a report</span></button></div>
        </div>
        <div className="projectpilot-branch-guide sweety-flow-guide" aria-label={mode === "reading" ? "Reading safeguards" : "Report date ranges"}>
          {mode === "reading" ? <><div><span>REQUEST GATE</span><p>Access cookie and CSRF header are checked before a write.</p></div><div><span>INPUT RULES</span><p>Real date, one of four slots, whole number from 40 to 600.</p></div><div><span>DATABASE RULES</span><p>UNIQUE prevents duplicate slots; CHECK rejects out-of-range values.</p></div></> : <><div><span>DAILY</span><p>Selected date, summary plus ordered slot rows.</p></div><div><span>MONTH TO DATE</span><p>First of the month through the selected date.</p></div><div><span>PREVIOUS MONTH</span><p>The entire calendar month before the selected month.</p></div></>}
        </div>
        <ArchitectureViewer key={mode} config={config} />
      </div>

      <section className="case-section" aria-labelledby="sweety-constraints"><div className="case-section-label">04 / DATABASE SAFETY</div><div><h2 id="sweety-constraints">Two constraints finish the validation job.</h2><p>The API checks inputs first so it can return useful errors. The database constraints remain authoritative when requests arrive at the same time or another writer reaches PostgreSQL.</p><div className="case-detail-list"><article><div><span className="pilot-detail-area">UNIQUE</span><h3>One user, date, and slot</h3></div><p><code>UNIQUE (user_id, reading_date, slot)</code> stops two rows for the same slot. The service catches a unique violation and reports a 409 conflict if concurrent requests both pass its earlier existence check.</p></article><article><div><span className="pilot-detail-area">CHECK</span><h3>Values stay within range</h3></div><p>The value column is an integer with <code>CHECK (value BETWEEN 40 AND 600)</code>. This enforces the stored range independently of the React form or Express middleware.</p></article></div></div></section>
      <section className="case-section" aria-labelledby="sweety-decisions"><div className="case-section-label">05 / TECHNICAL DECISIONS</div><div><h2 id="sweety-decisions">Choices behind the data flow.</h2><div className="case-detail-list">{decisions.map((item) => <article key={item.title}><div><span className="pilot-detail-area">{item.area}</span><h3>{item.title}</h3></div><p>{item.detail}</p></article>)}</div></div></section>
      <section className="case-section" aria-labelledby="sweety-security"><div className="case-section-label">06 / SESSION SECURITY</div><div><h2 id="sweety-security">How signed-in writes stay scoped.</h2><div className="case-detail-list">{security.map((item) => <article key={item.title}><div><span className="pilot-detail-area">{item.area}</span><h3>{item.title}</h3></div><p>{item.detail}</p></article>)}</div></div></section>
      <section className="case-section" aria-labelledby="sweety-limits"><div className="case-section-label">07 / LIMITS & FUTURE WORK</div><div><h2 id="sweety-limits">What remains for later.</h2><p>These are current implementation boundaries and possible future improvements, not features already shipped.</p><div className="case-detail-list">{futureWork.map((item) => <article key={item.title}><div><span className="pilot-detail-area">{item.area}</span><h3>{item.title}</h3></div><p>{item.detail}</p></article>)}</div></div></section>
      <div className="case-bottom-nav"><Link to="/projects"><ArrowLeft size={17} /> All projects</Link><Link to="/projects/snipshare">SnipShare case study <ArrowRight size={17} /></Link></div>
    </div>
  </main>;
}
