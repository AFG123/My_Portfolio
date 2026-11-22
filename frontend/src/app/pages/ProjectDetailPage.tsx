import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { projects } from "../../data/projects";
import { trackPortfolioEvent } from "../../lib/api";
import { ArchitectureViewer } from "../../features/architecture/ArchitectureViewer";
import { reachInboxArchitecture } from "../../features/architecture/reachInbox";
import { NotFoundPage } from "./NotFoundPage";

const decisions = [
  { title: "Write first, enqueue second", detail: "A Prisma transaction creates the campaign and email records together. BullMQ jobs are added only after the database commit, so a rolled-back campaign cannot produce queued work." },
  { title: "Keep scheduled work in Redis", detail: "BullMQ delayed jobs survive an application restart. Queue retries use exponential backoff, while PostgreSQL remains the source for email status." },
  { title: "Control each sender", detail: "The worker uses a Redis fixed-hour counter and a last-sent timestamp to enforce the configured hourly limit and spacing between messages." },
  { title: "Check saved state before sending", detail: "A worker skips emails already marked SENT or currently PROCESSING. A recovery loop requeues older stuck PROCESSING records." },
];
const limitations = [
  { title: "Database-to-queue gap", detail: "The PostgreSQL commit and BullMQ enqueue are separate operations. If enqueueing fails after the commit, a PENDING email can remain without a job. A transactional outbox is documented as a future fix." },
  { title: "Exactly-once SMTP is not guaranteed", detail: "A crash after SMTP accepts a message but before PostgreSQL records SENT can cause a retry and a duplicate message. Status checks reduce common duplicates but cannot close that boundary." },
  { title: "Fixed-hour rate window", detail: "The Redis counter resets at each UTC hour, so traffic near an hour boundary is not limited like a true sliding window." },
  { title: "Live demo transport", detail: "The repository documents that Render's free deployment blocks outbound SMTP ports. Campaign creation and dashboard flows can run there; actual Ethereal test emails require a local environment with SMTP access." },
];

export function ProjectDetailPage() {
  const { slug } = useParams();
  useEffect(() => {
    if (slug !== "reachinbox-email-scheduler") return;
    document.title = "ReachInbox Email Scheduler — Aryan Damai";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Explore the real architecture behind ReachInbox Email Scheduler: PostgreSQL scheduling, BullMQ delayed jobs, Redis sender limits, worker processing, and SMTP delivery.");
  }, [slug]);
  if (slug !== "reachinbox-email-scheduler") return <NotFoundPage unavailableProject={slug} />;
  const project = projects[0];
  function track(target: string, linkType: "github" | "live") {
    void trackPortfolioEvent({ eventType: "project_click", path: window.location.pathname, projectSlug: project.slug, metadata: { target, linkType } });
  }
  return <main id="main" className="case-page">
    <div className="container">
      <nav className="page-crumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><Link to="/projects">Projects</Link><span aria-hidden="true">/</span><span aria-current="page">ReachInbox</span></nav>
      <section className="case-hero">
        <div><span className="eyebrow"><span className="eyebrow-line" /> PROJECT CASE STUDY / 01</span><h1>ReachInbox <em>Email Scheduler.</em></h1><p>A scheduled campaign is more than a timer. It needs durable jobs, sender controls, safe worker state, and an honest account of what happens when systems fail.</p>
          <div className="case-hero-actions"><a className="button button-primary" href={project.github} target="_blank" rel="noopener noreferrer" onClick={() => track(project.github, "github")}><Github size={17} /> View source <ArrowUpRight size={16} /></a>{project.demo && <a className="button button-secondary" href={project.demo} target="_blank" rel="noopener noreferrer" onClick={() => track(project.demo!, "live")}>Open demo <ArrowUpRight size={16} /></a>}</div>
        </div>
        <div className="case-hero-meta"><span>TYPE <strong>FULL-STACK SCHEDULER</strong></span><span>FOCUS <strong>ASYNC JOB PROCESSING</strong></span><span>STACK <strong>EXPRESS · PRISMA · POSTGRESQL · REDIS · BULLMQ</strong></span></div>
      </section>
      <section className="case-overview case-section" aria-labelledby="case-problem"><div className="case-section-label">01 / THE PROBLEM</div><div><h2 id="case-problem">Scheduling must survive the server.</h2><p>Simple timers and cron-style jobs are a poor fit for campaigns with individual send times, sender-specific limits, and multiple workers. ReachInbox stores each email as a database record and places its delivery work in a delayed queue.</p><p>The React interface supports Google sign-in, lead entry from CSV or text, campaign scheduling, and a dashboard that polls for status changes. The backend coordinates the durable job and the delivery attempt.</p></div></section>
      <section className="case-section" aria-labelledby="case-features"><div className="case-section-label">02 / WHAT IT DOES</div><div><h2 id="case-features">The working pieces.</h2><div className="case-feature-grid"><div><span>01</span><h3>Campaign scheduling</h3><p>Validates recipients, sender ownership, start time, delays, and hourly limit before writing campaign and email rows.</p></div><div><span>02</span><h3>Delayed job queue</h3><p>Enqueues one BullMQ job for each email after the database transaction commits.</p></div><div><span>03</span><h3>Sender controls</h3><p>Uses Redis to count sends per fixed UTC hour and reserve spacing between sends.</p></div><div><span>04</span><h3>Status dashboard</h3><p>Shows scheduled, sent, and failed states from PostgreSQL through authenticated API reads.</p></div></div></div></section>
      <ArchitectureViewer config={reachInboxArchitecture} />
      <section className="case-section" aria-labelledby="case-decisions"><div className="case-section-label">03 / TECHNICAL DECISIONS</div><div><h2 id="case-decisions">Choices behind the flow.</h2><div className="case-detail-list">{decisions.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.detail}</p></article>)}</div></div></section>
      <section className="case-section" aria-labelledby="case-limits"><div className="case-section-label">04 / CHALLENGES & LIMITS</div><div><h2 id="case-limits">Where the boundaries still are.</h2><p className="case-section-lede">The implementation handles common restart, limit, and duplicate-processing cases. These are the documented gaps that remain.</p><div className="case-detail-list">{limitations.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.detail}</p></article>)}</div><p className="case-source-note">Architecture and limitations verified against the <a href="https://github.com/AFG123/reachinbox-email-scheduler" target="_blank" rel="noopener noreferrer">project repository</a> and its <a href="https://github.com/AFG123/reachinbox-email-scheduler/blob/main/docs/ARCHITECTURE-NOTES.md" target="_blank" rel="noopener noreferrer">architecture notes</a>.</p></div></section>
      <div className="case-bottom-nav"><Link to="/projects"><ArrowLeft size={17} /> All projects</Link><Link to="/#contact">Discuss a project <ArrowRight size={17} /></Link></div>
    </div>
  </main>;
}
