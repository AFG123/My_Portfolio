import { ExternalLink, Github } from "lucide-react";
import { trackPortfolioEvent } from "../../lib/api";

interface ProjectCardProps {
  title: string;
  problem: string;
  solution: string;
  techStack: string[];
  slug?: string;
  liveLink?: string;
  githubLink?: string;
}

export function ProjectCard({ title, problem, solution, techStack, slug, liveLink, githubLink }: ProjectCardProps) {
  return (
    <div className="border border-[#00ff41]/20 bg-black/50 p-6 hover:border-[#00ff41]/60 hover:shadow-[0_0_20px_rgba(0,255,65,0.15)] transition-all group">
      <h3 className="font-mono text-2xl text-[#00ff41] mb-4">
        {title}
      </h3>
      
      <div className="space-y-3 mb-6">
        <div>
          <span className="font-mono text-xs text-[#00ff41]/60">Problem:</span>
          <p className="font-mono text-sm text-gray-400 mt-1">{problem}</p>
        </div>
        <div>
          <span className="font-mono text-xs text-[#00ff41]/60">Solution:</span>
          <p className="font-mono text-sm text-gray-400 mt-1">{solution}</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {techStack.map((tech, index) => (
          <span 
            key={index} 
            className="font-mono text-xs px-2 py-1 border border-[#00ff41]/30 text-[#00ff41]/80"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        {liveLink && (
          <a 
            href={liveLink} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => {
              void trackPortfolioEvent({
                eventType: "project_click",
                path: window.location.pathname,
                projectSlug: slug,
                metadata: { target: liveLink, linkType: "live" },
              });
            }}
            className="flex items-center gap-2 font-mono text-xs px-3 py-2 border border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black transition-all"
          >
            <ExternalLink className="w-3 h-3" />
            Live Demo
          </a>
        )}
        {githubLink && (
          <a 
            href={githubLink} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => {
              void trackPortfolioEvent({
                eventType: "project_click",
                path: window.location.pathname,
                projectSlug: slug,
                metadata: { target: githubLink, linkType: "github" },
              });
            }}
            className="flex items-center gap-2 font-mono text-xs px-3 py-2 border border-[#00ff41]/40 text-gray-400 hover:border-[#00ff41] hover:text-[#00ff41] transition-all"
          >
            <Github className="w-3 h-3" />
            GitHub
          </a>
        )}
      </div>
    </div>
  );
}
