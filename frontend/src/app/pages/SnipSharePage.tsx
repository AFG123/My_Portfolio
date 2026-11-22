import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { projects } from "../../data/projects";
import { trackPortfolioEvent } from "../../lib/api";
import { ArchitectureViewer } from "../../features/architecture/ArchitectureViewer";
import { snipShareAccessArchitecture, snipShareLifecycleArchitecture } from "../../features/architecture/snipShare";

type FlowMode = "access" | "lifecycle";

const decisions = [
  { area: "LINK IDENTITY", title: "Separate viewer and manager links", detail: "A six-character short ID opens a snippet. A separate 32-character random token authorizes the management page and delete endpoint; the creator needs to retain that private link." },
  { area: "PASSWORD", title: "Hash passwords before insertion", detail: "An optional password is hashed with bcrypt cost 10, then compared on verification. Creation is limited to ten requests per hour per IP; failed password attempts are limited to five per 15 minutes per IP." },
  { area: "DATA LIFECYCLE", title: "Check now, clean later", detail: "Request handlers check expiry_at before returning content. A node-cron task removes expired rows every 15 minutes while the backend process runs, so expiry does not depend solely on cleanup timing." },
  { area: "BURN RECORD", title: "Distinguish destroyed from missing", detail: "Burning inserts a destroyed_snippets marker and deletes the live row in one PostgreSQL transaction. Later requests can return 410 for a burned link instead of a generic 404." },
];

const limitations = [
  { area: "CONCURRENCY", title: "Burn is not an atomic consume", detail: "The row is selected and the view count is updated before the burn transaction starts. Concurrent requests can read the same content before deletion. A locked or conditional consume operation would be a future improvement; the current code does not provide a strict single-view guarantee." },
  { area: "STORAGE", title: "Snippet content is plaintext", detail: "PostgreSQL stores content directly. bcrypt protects only the optional password. Encryption or end-to-end secrecy is not implemented, so the case study does not present SnipShare as a secret vault." },
  { area: "SESSION", title: "Verification cookie is unsigned", detail: "The API accepts verified_<shortId>=true from the Cookie header as proof of access. The cookie has HttpOnly and SameSite=Lax, but no signature or server-side session binding. A signed, scoped access token would strengthen this gate." },
  { area: "RAW ACCESS", title: "Raw route accepts a URL password", detail: "The raw endpoint accepts a password in the query string as well as an x-snippet-password header. A URL can appear in browser history and logs; the header path avoids putting the password in the URL." },
  { area: "OPERATIONS", title: "Open CORS and process-local cleanup", detail: "app.js calls cors() without an origin allowlist. Its cleanup cron runs in the Node process and does not purge destroyed markers. A configured origin policy and managed cleanup schedule are potential production improvements." },
];

export function SnipSharePage() {
  const [mode, setMode] = useState<FlowMode>("access");
  const project = projects.find((item) => item.slug === "snipshare")!;
  const config = mode === "access" ? snipShareAccessArchitecture : snipShareLifecycleArchitecture;

  useEffect(() => {
    document.title = "SnipShare — Aryan Damai";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Explore SnipShare's verified snippet creation, protected access, expiry, burn-after-read, and PostgreSQL cleanup paths.");
  }, []);

  function track(target: string, linkType: "github" | "live") {
    void trackPortfolioEvent({ eventType: "project_click", path: window.location.pathname, projectSlug: project.slug, metadata: { target, linkType } });
  }

  return <main id="main" className="case-page snipshare-case">
    <div className="container">
      <nav className="page-crumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><Link to="/projects">Projects</Link><span aria-hidden="true">/</span><span aria-current="page">SnipShare</span></nav>
      <section className="case-hero">
        <div><span className="eyebrow"><span className="eyebrow-line" /> PROJECT CASE STUDY / 03</span><h1>SnipShare<span className="accent-dot">.</span></h1><p>A short-link workspace for sharing code and text. It adds optional expiry, password protection, burn-after-read, and private management links to a simple paste flow.</p>
          <div className="case-hero-actions"><a className="button button-primary" href={project.github} target="_blank" rel="noopener noreferrer" onClick={() => track(project.github, "github")}><Github size={17} /> View source <ArrowUpRight size={16} /></a>{project.demo && <a className="button button-secondary" href={project.demo} target="_blank" rel="noopener noreferrer" onClick={() => track(project.demo!, "live")}>Open demo <ArrowUpRight size={16} /></a>}</div>
        </div>
        <div className="case-hero-meta"><span>TYPE <strong>SNIPPET SHARING</strong></span><span>FOCUS <strong>ACCESS · EXPIRY · DATA LIFECYCLE</strong></span><span>STACK <strong>REACT · EXPRESS · POSTGRESQL · BCRYPT</strong></span></div>
      </section>

      <section className="case-section" aria-labelledby="snip-problem"><div className="case-section-label">01 / THE PROBLEM</div><div><h2 id="snip-problem">Share a snippet with control over its lifetime.</h2><p>A paste link is convenient, but the author may need to limit when it can be opened, require a password, or remove it after viewing. SnipShare puts those options in a small create form and returns a short viewer link plus a separate management link.</p><p>The engineering story is the lifecycle behind that simple link: an API stores the row, gates retrieval, counts successful reads, and eventually removes content by burn, manual deletion, or scheduled expiry cleanup.</p></div></section>

      <section className="case-section" aria-labelledby="snip-features"><div className="case-section-label">02 / PRODUCT JOURNEY</div><div><h2 id="snip-features">What the app implements.</h2><div className="case-feature-grid"><div><span>01</span><h3>Create a paste</h3><p>Write code or text with a language, optional title and note, preset or custom expiry, password, burn setting, and download toggle.</p></div><div><span>02</span><h3>Open or unlock</h3><p>Use a six-character short link. Protected pastes prompt for a password; the raw text endpoint is separate.</p></div><div><span>03</span><h3>Track and manage</h3><p>A private management token opens view count and dates and can delete the snippet. The browser also keeps a local recent-links list.</p></div><div><span>04</span><h3>Expire or burn</h3><p>Expiry is checked on access. Burn removes the stored content after a successful read; a periodic task deletes expired rows.</p></div></div></div></section>

      <div className="projectpilot-flow snipshare-flow" data-mode={mode}>
        <div className="projectpilot-flow-switch" role="group" aria-label="SnipShare architecture workflow">
          <div><span className="eyebrow"><span className="eyebrow-line" /> 03 / SYSTEM WALKTHROUGH</span><p>Select a path, then a numbered step or component to inspect the actual request and database flow.</p></div>
          <div className="projectpilot-mode-buttons"><button type="button" aria-pressed={mode === "access"} className={mode === "access" ? "is-current" : ""} onClick={() => setMode("access")}>01 <span>Create + protected access</span></button><button type="button" aria-pressed={mode === "lifecycle"} className={mode === "lifecycle" ? "is-current" : ""} onClick={() => setMode("lifecycle")}>02 <span>Expiry + burn + cleanup</span></button></div>
        </div>
        <div className="projectpilot-branch-guide snipshare-route-guide" aria-label={mode === "access" ? "Creation and access paths" : "Snippet lifecycle paths"}>
          {mode === "access" ? <><div><span>CREATE</span><p>Browser → API → PostgreSQL. A supplied password is hashed first.</p></div><div><span>OPEN</span><p>API reads the row and checks expiry before exposing content.</p></div><div><span>UNLOCK</span><p>A protected paste needs a bcrypt comparison or accepted cookie.</p></div></> : <><div><span>EXPIRY</span><p>The API rejects an expired row when it is requested.</p></div><div><span>BURN</span><p>After a read, the API writes a marker and deletes the row.</p></div><div><span>CLEANUP</span><p>A separate cron task deletes expired rows every 15 minutes.</p></div></>}
        </div>
        {mode === "lifecycle" && <p className="snipshare-race-note"><strong>Concurrency limit:</strong> the read happens before the burn transaction, so two simultaneous requests may both receive content.</p>}
        <ArchitectureViewer key={mode} config={config} />
      </div>

      <section className="case-section" aria-labelledby="snip-decisions"><div className="case-section-label">04 / TECHNICAL DECISIONS</div><div><h2 id="snip-decisions">How the current implementation works.</h2><div className="case-detail-list">{decisions.map((item) => <article key={item.title}><div><span className="pilot-detail-area">{item.area}</span><h3>{item.title}</h3></div><p>{item.detail}</p></article>)}</div></div></section>
      <section className="case-section" aria-labelledby="snip-limits"><div className="case-section-label">05 / LIMITATIONS & NEXT STEPS</div><div><h2 id="snip-limits">The boundaries in the source.</h2><p>The following are implementation observations and possible improvements, not claims of production incidents or features already shipped.</p><div className="case-detail-list">{limitations.map((item) => <article key={item.title}><div><span className="pilot-detail-area">{item.area}</span><h3>{item.title}</h3></div><p>{item.detail}</p></article>)}</div><p className="case-source-note">Verified against the <a href={project.github} target="_blank" rel="noopener noreferrer">SnipShare repository</a>, especially the <a href="https://github.com/AFG123/Snip-share/blob/main/backend/src/controllers/snippetController.js" target="_blank" rel="noopener noreferrer">controller</a>, <a href="https://github.com/AFG123/Snip-share/blob/main/backend/src/services/snippetService.js" target="_blank" rel="noopener noreferrer">service</a>, <a href="https://github.com/AFG123/Snip-share/blob/main/backend/app.js" target="_blank" rel="noopener noreferrer">cron and CORS setup</a>, and <a href="https://github.com/AFG123/Snip-share/blob/main/backend/full_dump.sql" target="_blank" rel="noopener noreferrer">schema</a>.</p></div></section>
      <div className="case-bottom-nav"><Link to="/projects"><ArrowLeft size={17} /> All projects</Link><Link to="/projects/projectpilot">ProjectPilot case study <ArrowRight size={17} /></Link></div>
    </div>
  </main>;
}
