import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router";
import { ArrowUpRight, Check, ChevronDown, Download, Github, Linkedin, Mail, Pause, Play, RotateCcw } from "lucide-react";
import { trackPortfolioEvent, trackResumeDownload } from "../lib/api";
import { projects, type PortfolioProject } from "../data/projects";
import { ContactForm } from "./components/ContactForm";
import { SystemStats } from "./components/SystemStats";
const workflow = [
  { label: "React form", type: "CLIENT", description: "A visitor submits a name, email, and message from the contact form." },
  { label: "Express route", type: "API", description: "POST /api/contact receives the JSON request and passes it through the contact route." },
  { label: "Validation + limit", type: "BOUNDARY", description: "The route limits requests by IP; the controller checks name, email, and message before saving." },
  { label: "PostgreSQL", type: "DATA", description: "The service inserts a contact message through a database query and returns a success response." },
];
const skills = [
  { title: "Backend & APIs", items: ["Node.js", "Express.js", "REST API design", "TypeScript", "PHP", "Python"] },
  { title: "Data & async", items: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "BullMQ", "Schema design"] },
  { title: "Security & tools", items: ["JWT", "RBAC", "Input validation", "Git & GitHub", "Postman", "Linux"] },
];
function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { element.classList.add("is-visible"); observer.disconnect(); }
    }, { threshold: 0.09 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}
function trackProject(slug: string, target: string, linkType: "github" | "live") {
  void trackPortfolioEvent({ eventType: "project_click", path: window.location.pathname, projectSlug: slug, metadata: { target, linkType } });
}
function ArchitectureVisual() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [runId, setRunId] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (active === workflow.length - 1) setPlaying(false);
      else setActive(active + 1);
    }, 1450);
    return () => window.clearTimeout(timer);
  }, [playing, active, runId]);
  const progressStyle = { "--signal-step": active } as CSSProperties;
  const visibleTip = hovered ?? (playing ? active : null);
  return <div className="architecture-panel" aria-label="Interactive walkthrough of this portfolio's contact API">
    <div className="panel-topline"><span className="live-pip" /> SYSTEM WALKTHROUGH <span className="panel-topline-right">PORTFOLIO / CONTACT</span></div>
    <div className="architecture-heading"><div><span className="eyebrow">VERIFIED WORKFLOW</span><h2>From message to database.</h2></div><span className="flow-method">POST /api/contact</span></div>
    <div className={`signal-rail ${playing ? "is-playing" : ""}`} style={progressStyle} aria-hidden="true"><span className="signal-line" /><span className="signal-progress" /><span className="signal-packet"><span /></span></div>
    <div className="flow-track" role="group" aria-label="Contact API stages">{workflow.map((step, index) => <div className="flow-unit" key={step.label} onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)}><div className={`flow-node ${active === index ? "active" : ""}`} role="group" tabIndex={0} aria-label={`Step ${index + 1}: ${step.label}`} aria-describedby={`flow-tip-${index}`} onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) setHovered(index); }} onBlur={() => setHovered(null)}><span className="flow-node-type">{step.type}</span><span className="flow-node-label">{step.label}</span><span className="flow-node-index">0{index + 1}</span></div><span className={`flow-tooltip ${visibleTip === index ? "is-visible" : ""}`} id={`flow-tip-${index}`} role="tooltip"><strong>{step.label}</strong><span>{step.description}</span></span>{index < workflow.length - 1 && <span className={`flow-connector ${active > index ? "passed" : ""}`} aria-hidden="true"><span /></span>}</div>)}</div>
    <div className="flow-controls" aria-label="Walkthrough controls"><button type="button" onClick={() => { if (active === workflow.length - 1) setActive(0); setPlaying(true); }} disabled={playing} aria-label="Play walkthrough"><Play size={14} /> Play</button><button type="button" onClick={() => setPlaying(false)} disabled={!playing} aria-label="Pause walkthrough"><Pause size={14} /> Pause</button><button type="button" onClick={() => { setActive(0); setPlaying(true); setRunId((id) => id + 1); }} aria-label="Replay walkthrough"><RotateCcw size={14} /> Replay</button></div>
    <div className="panel-footer"><span>REQUEST → VALIDATE → STORE</span><span>HOVER OR FOCUS A STAGE <ArrowUpRight size={13} /></span></div>
  </div>;
}
function Welcome({ onClose }: { onClose: () => void }) {
  const [exiting, setExiting] = useState(false);
  const closeRef = useRef(onClose);
  const skipTimer = useRef<number | null>(null);
  closeRef.current = onClose;
  useEffect(() => {
    const exitTimer = window.setTimeout(() => setExiting(true), 2050);
    const closeTimer = window.setTimeout(() => closeRef.current(), 2400);
    return () => { window.clearTimeout(exitTimer); window.clearTimeout(closeTimer); if (skipTimer.current !== null) window.clearTimeout(skipTimer.current); };
  }, []);
  return <div className={`welcome-overlay ${exiting ? "is-exiting" : ""}`} role="region" aria-label="Welcome to Aryan Damai's portfolio">
    <button className="welcome-skip" type="button" onClick={() => { setExiting(true); skipTimer.current = window.setTimeout(() => closeRef.current(), 350); }}>Skip intro <ArrowUpRight size={15} /></button>
    <div className="welcome-content"><div className="welcome-identity"><span className="welcome-mark">AD<span>.</span></span><span className="welcome-name">ARYAN DAMAI <small>BACKEND DEVELOPER</small></span></div>
      <svg className="welcome-network" viewBox="0 0 420 110" role="img" aria-label="Connected client, API, and database nodes">
        <path className="network-path path-one" d="M48 55 H210" /><path className="network-path path-two" d="M210 55 H372" />
        {[48, 210, 372].map((cx, index) => <g className={`network-node node-${index}`} key={cx}><circle cx={cx} cy="55" r="20" /><circle cx={cx} cy="55" r="4" /></g>)}
        <text x="48" y="98" textAnchor="middle">CLIENT</text><text x="210" y="98" textAnchor="middle">API</text><text x="372" y="98" textAnchor="middle">DATA</text>
      </svg><p>Building systems that make sense.</p>
    </div>
  </div>;
}
function ProjectLinks({ project }: { project: PortfolioProject }) {
  return <div className="project-links">{["reachinbox-email-scheduler", "projectpilot"].includes(project.slug) && <Link to={`/projects/${project.slug}`}>Case study <ArrowUpRight size={15} /></Link>}<a href={project.github} target="_blank" rel="noopener noreferrer" onClick={() => trackProject(project.slug, project.github, "github")}><Github size={16} /> GitHub <ArrowUpRight size={15} /></a>{project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer" onClick={() => trackProject(project.slug, project.demo!, "live")}>Live demo <ArrowUpRight size={15} /></a>}</div>;
}
export default function App() {
  const [showWelcome, setShowWelcome] = useState(() => { try { return sessionStorage.getItem("portfolio-welcomed") !== "1" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } });
  useEffect(() => {
    document.title = "Aryan Damai — Backend Developer";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Aryan Damai is a backend developer building APIs, database-driven products, and reliable workflows with Node.js, Express, and PostgreSQL.");
    void trackPortfolioEvent({ eventType: "page_view", path: window.location.pathname, metadata: { referrer: document.referrer || null } });
  }, []);
  function dismissWelcome() { setShowWelcome(false); try { sessionStorage.setItem("portfolio-welcomed", "1"); } catch { /* Continue without storage. */ } }
  return <>{showWelcome && <Welcome onClose={dismissWelcome} />}
    <main id="main">
      <section className="hero container"><div className="hero-copy"><div className="availability"><span className="availability-dot" /> OPEN TO BACKEND OPPORTUNITIES <span className="availability-line" /></div><p className="hero-kicker">HI, I'M ARYAN DAMAI</p><h1>I build the systems <em>behind</em> great products.</h1><p className="hero-lede">Backend developer working across APIs, databases, and reliable workflows. I turn complex requirements into systems that are clear to use and maintain.</p><div className="hero-actions"><a className="button button-primary" href="#projects">Explore my work <ArrowUpRight size={18} /></a><a className="button button-secondary" href="/resume.pdf" download onClick={() => void trackResumeDownload("hero")}>Download resume <Download size={17} /></a></div><div className="hero-meta"><span>BASED IN BENGALURU, INDIA</span><span>SCROLL TO EXPLORE <ChevronDown size={14} /></span></div></div><ArchitectureVisual /></section>
      <section className="stats-strip container" aria-label="Live portfolio statistics"><SystemStats /></section>
      <section className="section about-section" id="about"><div className="container section-grid"><Reveal className="section-intro"><span className="eyebrow"><span className="eyebrow-line" /> 01 / ABOUT</span><h2>Engineering with<br /><em>intent.</em></h2></Reveal><Reveal className="about-content"><p className="large-copy">I focus on the parts of software that have to keep working after the first demo: data models, API boundaries, permissions, and background work.</p><p>My work spans production sports software, client systems, and independent products. I enjoy making complex flows understandable, choosing practical tools, and building a foundation others can extend.</p><div className="about-signals"><span><Check size={16} /> Production API experience</span><span><Check size={16} /> Database-first thinking</span><span><Check size={16} /> Full-stack collaboration</span></div></Reveal></div></section>
      <section className="section experience-section" id="experience"><div className="container"><Reveal className="section-heading"><div><span className="eyebrow"><span className="eyebrow-line" /> 02 / EXPERIENCE</span><h2>Where I've built.</h2></div><p>Real products, real constraints, and the engineering decisions that connect them.</p></Reveal><Reveal className="experience-list"><article className="experience-item"><div className="experience-date">FEB — JUN 2026</div><div><h3>Backend Developer Intern <span>↗</span></h3><p className="experience-company">Jeffs Group of Companies · SportERP / NexSport</p><p>Built and maintained REST APIs across athlete, event, scoring, and registration modules. Worked on a MongoDB to PostgreSQL migration and role-based access controls for a sports ERP platform.</p><div className="tag-row"><span>Node.js</span><span>PostgreSQL</span><span>JWT / RBAC</span><span>REST APIs</span></div></div></article><article className="experience-item"><div className="experience-date">JAN 2024 — JAN 2026</div><div><h3>Freelance Backend Developer <span>↗</span></h3><p className="experience-company">Independent client work</p><p>Delivered backend systems using PHP and Python, including REST APIs, admin dashboards, authentication, and database-driven workflows.</p><div className="tag-row"><span>PHP</span><span>Python</span><span>MySQL</span><span>Client delivery</span></div></div></article></Reveal></div></section>
      <section className="section projects-section" id="projects"><div className="container"><Reveal className="section-heading"><div><span className="eyebrow"><span className="eyebrow-line" /> 03 / SELECTED WORK</span><h2>Featured projects<span className="accent-dot">.</span></h2></div><p>Four projects, each centered on a different backend problem.</p></Reveal><div className="project-grid">{projects.map((project, index) => <Reveal className={`project-card ${index < 2 ? "project-card-featured" : ""}`} key={project.slug}><div className="project-card-top"><span>0{index + 1} / {project.category}</span><span className="project-card-icon"><ArrowUpRight size={20} /></span></div><div className="project-visual" aria-hidden="true"><span className={`project-glyph glyph-${index}`}>{project.glyph}</span><span className="project-visual-caption">{project.caption}</span></div><div className="project-card-body"><h3>{project.name}</h3><p className="project-summary">{project.summary}</p><p className="project-detail">{project.detail}</p><div className="tag-row">{project.stack.map((item) => <span key={item}>{item}</span>)}</div><ProjectLinks project={project} /></div></Reveal>)}</div></div></section>
      <section className="section skills-section" id="skills"><div className="container section-grid"><Reveal className="section-intro"><span className="eyebrow"><span className="eyebrow-line" /> 04 / TOOLKIT</span><h2>Tools for the<br /><em>right problem.</em></h2><p>Technologies I use to design, ship, and maintain backend systems.</p></Reveal><Reveal className="skill-groups">{skills.map((group) => <div className="skill-group" key={group.title}><h3>{group.title}</h3><div className="skill-list">{group.items.map((item) => <span key={item}>{item}</span>)}</div></div>)}</Reveal></div></section>
      <section className="section writing-section" id="writing"><div className="container"><Reveal className="writing-panel"><div><span className="eyebrow"><span className="eyebrow-line" /> 05 / WRITING</span><h2>Notes from the build.</h2><p>Technical writing on backend architecture and the decisions behind my projects is coming soon.</p></div><span className="coming-soon">COMING SOON <span>✦</span></span></Reveal></div></section>
      <section className="section contact-section" id="contact"><div className="container contact-grid"><Reveal><span className="eyebrow"><span className="eyebrow-line" /> 06 / CONTACT</span><h2>Let's build something <em>that lasts.</em></h2><p>Have a backend role, a product problem, or a project in mind? Send me a note and I’ll get back to you.</p><div className="contact-links"><a href="mailto:aryan123damai@gmail.com"><Mail size={17} /> aryan123damai@gmail.com</a><a href="https://github.com/AFG123" target="_blank" rel="noopener noreferrer"><Github size={17} /> GitHub <ArrowUpRight size={14} /></a><a href="https://www.linkedin.com/in/aryan-damai" target="_blank" rel="noopener noreferrer"><Linkedin size={17} /> LinkedIn <ArrowUpRight size={14} /></a></div></Reveal><Reveal className="contact-form-wrap"><ContactForm /></Reveal></div></section>
    </main>
  </>;
}
