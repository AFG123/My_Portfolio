import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { projects } from "../../data/projects";
import { trackPortfolioEvent } from "../../lib/api";
import { ArchitectureViewer } from "../../features/architecture/ArchitectureViewer";
import { projectPilotDeepDiveArchitecture, projectPilotIdeasArchitecture } from "../../features/architecture/projectPilot";

type FlowMode = "ideas" | "deep-dive";

const decisions = [
  { area: "CACHE KEY", title: "Normalize before caching", detail: "The idea-cache key hashes sorted skill names and levels alongside role, company, and time. Equivalent input order shares a result, while different skill levels remain distinct." },
  { area: "CACHE SCOPE", title: "Keep two cache scopes", detail: "Five-idea results can be shared across identical profiles for 14 days. Full deep dives live in a separate per-user PostgreSQL table and are reused by user ID and project name." },
  { area: "AI RELIABILITY", title: "Centralize Gemini handling", detail: "The current model is gemini-2.5-flash-lite. The shared client can switch configured keys on quota errors; the AI service retries transient failures and repairs some malformed JSON before parsing." },
  { area: "PAYMENT", title: "Check signed payment callbacks", detail: "The backend fixes the ₹49 order price and checks checkout signatures with HMAC. Payment-ledger insertion and the paid flag update share a PostgreSQL transaction. The current verify route does not check order ownership or fetch the payment's amount, currency, and capture status; the separate webhook also needs a reliable order-to-user mapping." },
];

const limitations = [
  { area: "RELIABILITY", title: "Best-effort writes", detail: "Idea-cache refreshes and signed-in generation history writes do not block the response. A visitor can receive ideas even if one of those background writes fails." },
  { area: "CONCURRENCY", title: "Free-plan concurrency", detail: "The deep-dive controller reads the free slot before generation and updates it afterward. Simultaneous first-time requests are not serialized, so the one-free-plan rule can race. This is an inference from the controller flow." },
  { area: "PAYMENT", title: "Order ownership and capture checks", detail: "The checkout HMAC authenticates the supplied order/payment pair, but /api/payment/verify does not compare the order with one created for the signed-in user or confirm a captured ₹49 INR payment with Razorpay. A valid callback could therefore be replayed from another account; the existing unique payment ID prevents a second ledger row but does not stop that account's paid flag from being set." },
  { area: "WEBHOOK", title: "Webhook user mapping", detail: "Order creation puts userId in order notes, while the payment.captured handler reads payment.notes.userId. That field is not guaranteed to carry the order note. If it is missing, the handler returns success without unlocking the purchaser or requesting a retry." },
  { area: "CLIENT CACHE", title: "Browser cache scope", detail: "The client stores an unlocked deep dive in localStorage under its project name. That key is not user-specific, so same-named projects or accounts sharing one browser can collide. This is an inference from the client key." },
  { area: "REPRODUCIBILITY", title: "Public schema coverage", detail: "The public init script defines payments and generation_cache. The controllers also use users, generations, and deep_dives, but their full creation scripts are not included in the public repo." },
];

const cacheLayers = [
  { name: "Idea cache", scope: "Shared across matching inputs", behavior: "A normalized SHA-256 key finds a fresh generation_cache row for up to 14 days. A miss calls Gemini; a later write refreshes the row." },
  { name: "Deep-dive cache", scope: "Per signed-in user", behavior: "deep_dives is read by user ID and project name before the access gate. A successful plan is stored and reused on later requests." },
  { name: "Browser copy", scope: "This browser", behavior: "The React deep-dive page keeps a successful unlocked response in localStorage for instant reopening. Its key uses the project name." },
];

export function ProjectPilotPage() {
  const [mode, setMode] = useState<FlowMode>("ideas");
  const project = projects.find((item) => item.slug === "projectpilot")!;

  useEffect(() => {
    document.title = "ProjectPilot — Aryan Damai";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Explore ProjectPilot's AI idea generation, PostgreSQL caches, deep-dive access checks, and Razorpay payment architecture.");
  }, []);

  function track(target: string, linkType: "github" | "live") {
    void trackPortfolioEvent({ eventType: "project_click", path: window.location.pathname, projectSlug: project.slug, metadata: { target, linkType } });
  }

  const config = mode === "ideas" ? projectPilotIdeasArchitecture : projectPilotDeepDiveArchitecture;

  return <main id="main" className="case-page projectpilot-case">
    <div className="container">
      <nav className="page-crumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><Link to="/projects">Projects</Link><span aria-hidden="true">/</span><span aria-current="page">ProjectPilot</span></nav>
      <section className="case-hero">
        <div><span className="eyebrow"><span className="eyebrow-line" /> PROJECT CASE STUDY / 02</span><h1>ProjectPilot<span className="accent-dot">.</span></h1><p>An idea generator for students planning placement-ready projects. The engineering challenge is to make expensive AI calls useful and repeatable, then give each user a controlled path from free ideas to a detailed build plan.</p>
          <div className="case-hero-actions"><a className="button button-primary" href={project.github} target="_blank" rel="noopener noreferrer" onClick={() => track(project.github, "github")}><Github size={17} /> View source <ArrowUpRight size={16} /></a>{project.demo && <a className="button button-secondary" href={project.demo} target="_blank" rel="noopener noreferrer" onClick={() => track(project.demo!, "live")}>Open demo <ArrowUpRight size={16} /></a>}</div>
        </div>
        <div className="case-hero-meta"><span>TYPE <strong>AI-ASSISTED PROJECT PLANNING</strong></span><span>FOCUS <strong>CACHING · ACCESS · PAYMENT FLOW</strong></span><span>STACK <strong>EXPRESS · POSTGRESQL · GEMINI · RAZORPAY</strong></span></div>
      </section>

      <section className="case-section" aria-labelledby="pilot-problem"><div className="case-section-label">01 / THE PROBLEM</div><div><h2 id="pilot-problem">From generic ideas to a buildable plan.</h2><p>ProjectPilot asks for skills, skill levels, a target role, optional company, and available time. It uses that context to propose five projects and a skill gap, then lets a signed-in user request a detailed plan for one idea.</p><p>The product has two different cost and access problems: repeated profiles should avoid unnecessary Gemini calls, while full plans must respect a one-free-deep-dive allowance and a one-time paid unlock.</p></div></section>

      <section className="case-section" aria-labelledby="pilot-features"><div className="case-section-label">02 / PRODUCT JOURNEY</div><div><h2 id="pilot-features">What a student can do.</h2><div className="case-feature-grid"><div><span>01</span><h3>Describe a profile</h3><p>Enter skills and levels manually or upload a PDF resume to prefill them, then choose a role and time budget.</p></div><div><span>02</span><h3>Explore five ideas</h3><p>Receive five generated or cached project suggestions with a skill-gap note. Signed-in requests also create a saved-history entry.</p></div><div><span>03</span><h3>Open a deep dive</h3><p>Request a structured plan with setup, build steps, API and database guidance, common mistakes, and interview questions.</p></div><div><span>04</span><h3>Unlock more plans</h3><p>A signed-in unpaid user gets one free deep dive. The UI offers a one-time ₹49 checkout for broader access.</p></div></div></div></section>

      <div className="projectpilot-flow" data-mode={mode}>
        <div className="projectpilot-flow-switch" role="group" aria-label="ProjectPilot architecture workflow">
          <div><span className="eyebrow"><span className="eyebrow-line" /> 03 / SYSTEM WALKTHROUGH</span><p>Choose a workflow to follow its real request and data paths.</p></div>
          <div className="projectpilot-mode-buttons"><button type="button" aria-pressed={mode === "ideas"} className={mode === "ideas" ? "is-current" : ""} onClick={() => setMode("ideas")}>01 <span>AI idea generation</span></button><button type="button" aria-pressed={mode === "deep-dive"} className={mode === "deep-dive" ? "is-current" : ""} onClick={() => setMode("deep-dive")}>02 <span>Deep dive + payment</span></button></div>
        </div>
        {mode === "deep-dive" && <div className="projectpilot-branch-guide" aria-label="Deep-dive outcomes"><div><span>HIT / OPEN</span><p>Existing plan returns immediately. No new AI call or payment.</p></div><div><span>AUTHORIZED MISS</span><p>Free allowance or paid access permits Gemini to generate a new plan.</p></div><div><span>OPTIONAL PURCHASE</span><p>A locked user may start checkout; client and webhook callbacks follow separate handlers.</p></div></div>}
        <ArchitectureViewer key={mode} config={config} />
      </div>

      <section className="case-section" aria-labelledby="pilot-cache"><div className="case-section-label">04 / CACHE BEHAVIOR</div><div><h2 id="pilot-cache">Three scopes, different jobs.</h2><div className="pilot-cache-list">{cacheLayers.map((layer) => <article key={layer.name}><h3>{layer.name}</h3><span>{layer.scope}</span><p>{layer.behavior}</p></article>)}</div></div></section>
      <section className="case-section" aria-labelledby="pilot-decisions"><div className="case-section-label">05 / TECHNICAL DECISIONS</div><div><h2 id="pilot-decisions">Choices behind the product.</h2><div className="case-detail-list">{decisions.map((item) => <article key={item.title}><div><span className="pilot-detail-area">{item.area}</span><h3>{item.title}</h3></div><p>{item.detail}</p></article>)}</div></div></section>
      <section className="case-section" aria-labelledby="pilot-limits"><div className="case-section-label">06 / CHALLENGES & LIMITS</div><div><h2 id="pilot-limits">What remains open.</h2><p>These are implementation limits and potential failure modes, not claims of reported production incidents.</p><div className="case-detail-list">{limitations.map((item) => <article key={item.title}><div><span className="pilot-detail-area">{item.area}</span><h3>{item.title}</h3></div><p>{item.detail}</p></article>)}</div></div></section>
      <div className="case-bottom-nav"><Link to="/projects"><ArrowLeft size={17} /> All projects</Link><Link to="/projects/reachinbox-email-scheduler">ReachInbox case study <ArrowRight size={17} /></Link></div>
    </div>
  </main>;
}
