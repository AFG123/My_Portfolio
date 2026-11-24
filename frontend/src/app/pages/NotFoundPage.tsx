import { useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { projects } from "../../data/projects";

export function NotFoundPage({ unavailableProject }: { unavailableProject?: string }) {
  const project = projects.find((item) => item.slug === unavailableProject);
  useEffect(() => {
    document.title = project ? `${project.name} case study — Aryan Damai` : "Page not found — Aryan Damai";
    document.querySelector('meta[name="description"]')?.setAttribute("content", project ? `${project.name} case study is in preparation. Explore its source code on GitHub.` : "Browse Aryan Damai's projects and backend engineering work.");
  }, [project]);
  return <main id="main" className="not-found-page container">
    <span className="eyebrow"><span className="eyebrow-line" /> {project ? "CASE STUDY IN PREPARATION" : "404 / PAGE NOT FOUND"}</span>
    <h1>{project ? "This walkthrough is still taking shape." : "That page isn't here."}</h1>
    <p>{project ? `The ${project.name} case study will be added after its architecture is verified. Its source is available now.` : "The address may have changed. Head back to the projects to keep exploring."}</p>
    <div className="not-found-actions"><Link className="button button-primary" to="/projects"><ArrowLeft size={17} /> Browse projects</Link>{project && <a className="button button-secondary" href={project.github} target="_blank" rel="noopener noreferrer">View GitHub source</a>}</div>
  </main>;
}
