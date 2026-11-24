import { useEffect } from "react";
import { Link } from "react-router";
import { ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { trackPortfolioEvent } from "../../lib/api";
import { projects, type PortfolioProject } from "../../data/projects";

function ExternalLinks({ project }: { project: PortfolioProject }) {
  function track(target: string, linkType: "github" | "live") {
    void trackPortfolioEvent({ eventType: "project_click", path: window.location.pathname, projectSlug: project.slug, metadata: { target, linkType } });
  }
  return <div className="project-index-links">
    <a href={project.github} target="_blank" rel="noopener noreferrer" onClick={() => track(project.github, "github")}><Github size={16} /> GitHub <ArrowUpRight size={14} /></a>
    {project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer" onClick={() => track(project.demo!, "live")}>Live demo <ArrowUpRight size={14} /></a>}
  </div>;
}

export function ProjectsPage() {
  useEffect(() => {
    document.title = "Projects — Aryan Damai";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Backend projects by Aryan Damai: email scheduling, project generation, secure snippet sharing, and glucose tracking.");
  }, []);
  const [featured, ...rest] = projects;
  return <main id="main" className="projects-page">
    <section className="projects-hero container">
      <nav className="page-crumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Projects</span></nav>
      <span className="eyebrow"><span className="eyebrow-line" /> SELECTED ENGINEERING WORK</span>
      <h1>Projects built from the <em>inside out.</em></h1>
      <p>Systems shaped by real constraints: delayed work, secure access, useful data models, and clear failure states. Explore the implementation behind each idea.</p>
    </section>
    <section className="container project-index" aria-labelledby="project-list-title">
      <div className="project-index-heading"><h2 id="project-list-title">All projects <span>04</span></h2><span>EXPLORE THE WORK</span></div>
      <article className="index-feature">
        <div className="index-feature-copy">
          <span className="case-label">01 / FEATURED CASE STUDY</span>
          <h3>{featured.name}</h3>
          <p className="index-feature-lede">{featured.summary}</p>
          <p>{featured.detail}</p>
          <div className="tag-row">{featured.stack.map((tech) => <span key={tech}>{tech}</span>)}</div>
          <div className="index-feature-actions"><Link className="button button-primary" to={`/projects/${featured.slug}`}>Explore case study <ArrowRight size={17} /></Link><ExternalLinks project={featured} /></div>
        </div>
        <div className="index-feature-visual" aria-hidden="true">
          <div className="feature-visual-top">REACHINBOX / JOB LIFECYCLE <span>01</span></div>
          <div className="feature-pipeline"><span>API</span><i /><span>POSTGRES</span><i /><span>BULLMQ</span><i /><span>WORKER</span></div>
          <div className="feature-terminal"><span>$</span> schedule campaign<span className="terminal-cursor">_</span><small>DELAYED JOBS · SENDER LIMITS · DELIVERY STATE</small></div>
        </div>
      </article>
      <div className="project-index-grid">
        {rest.map((project, index) => <article className="index-card" key={project.slug}>
          <div className="index-card-top"><span>0{index + 2} / {project.category}</span><ArrowUpRight size={19} /></div>
          <div className="index-card-glyph" aria-hidden="true">{project.glyph}</div>
          <div className="index-card-content"><h3>{project.name}</h3><p>{project.summary}</p><div className="tag-row">{project.stack.map((tech) => <span key={tech}>{tech}</span>)}</div><Link className="index-case-link" to={`/projects/${project.slug}`}>Explore case study <ArrowRight size={15} /></Link><ExternalLinks project={project} /></div>
        </article>)}
      </div>
    </section>
  </main>;
}
