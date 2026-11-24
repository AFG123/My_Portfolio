import { useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function BlogPage() {
  useEffect(() => {
    document.title = "Technical Blog — Coming Soon | Aryan Damai";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Aryan Damai's technical blog is coming soon. Future articles will cover backend engineering, system design, PostgreSQL, APIs, and lessons from real projects.");
  }, []);

  return <main id="main" className="blog-page container">
    <nav className="page-crumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Blog</span></nav>
    <section className="blog-intro" aria-labelledby="blog-title">
      <span className="eyebrow"><span className="eyebrow-line" /> WRITING / IN PROGRESS</span>
      <h1 id="blog-title">Technical Blog <em>— Coming Soon.</em></h1>
      <p>I'm preparing articles about backend engineering, system design, PostgreSQL, APIs, and lessons from building real projects. There are no published posts yet.</p>
      <div className="blog-actions"><Link className="button button-primary" to="/projects">Explore projects <ArrowRight size={17} /></Link><Link className="button button-secondary" to="/"><ArrowLeft size={17} /> Back to home</Link></div>
    </section>
    <div className="blog-note" aria-label="Writing status"><span className="blog-note-mark" aria-hidden="true">01 /</span><div><strong>Ideas become clearer when you explain the engineering behind them.</strong><p>In the meantime, the project case studies show the workflows, tradeoffs, and source code behind my work.</p></div><span className="blog-note-status">ARTICLES IN PREPARATION</span></div>
  </main>;
}
