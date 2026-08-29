import { Download, Github, Linkedin, Mail, Terminal, ChevronDown } from "lucide-react";
import { useEffect } from "react";
import { trackPortfolioEvent, trackResumeDownload } from "../lib/api";
import { ArchitectureSection } from "./components/ArchitectureSection";
import { ContactForm } from "./components/ContactForm";
import { ProjectCard } from "./components/ProjectCard";
import { SkillCategory } from "./components/SkillCategory";
import { SystemStats } from "./components/SystemStats";

export default function App() {
  const projects = [
    {
      slug: "projectpilot",
      title: "projectpilot",
      problem: "CS students build repetitive portfolio projects and struggle to design production-ready applications from scratch.",
      solution: "Built a SaaS that generates personalized project blueprints from a student's skills and target role — system architecture, database schema, REST endpoints, a phased build guide, deployment tips, and role-specific interview questions. Launched publicly with active users and a premium tier for detailed implementation guides.",
      techStack: ["Node.js", "Express", "PostgreSQL", "SaaS"],
      liveLink: "https://projectpilot.devbyaryan.me/",
      githubLink: "https://github.com/AFG123/ProjectPilot"
    },
    {
      slug: "snipshare",
      title: "snipshare",
      problem: "Sharing code snippets safely needs more than a textbox. Links must expire, sensitive snippets need protection, and abandoned data shouldn't pile up in the database forever.",
      solution: "Built a full-stack pastebin with short links, expiry, password protection, and burn-after-read. Designed per-endpoint rate limits to prevent abuse, token-based snippet management, and a cron job that cleans up expired snippets every 15 minutes.",
      techStack: ["Node.js", "Express", "PostgreSQL", "React", "Rate Limiting"],
      liveLink: "https://www.devbyaryan.me/",
      githubLink: "https://github.com/AFG123/Snip-share"
    },
    {
      slug: "wedding-website-preview-platform",
      title: "wedding website preview platform",
      problem: "A freelance client needed a catalog-style website that could present card designs cleanly while still being easy to manage from the backend.",
      solution: "Built a PHP-based wedding card preview platform with an admin dashboard, product and category management, reusable backend functions, and an API layer to serve dynamic product content to the frontend.",
      techStack: ["PHP", "MySQL", "JavaScript", "REST API"],
      liveLink: "https://houseofcards.in/",
      githubLink: "https://github.com/AFG123/WebsitePreview"
    },
    {
      slug: "reachinbox-email-scheduler",
      title: "reachinbox email scheduler",
      problem: "Scheduling cold email campaigns reliably is difficult when server restarts interrupt cron jobs, and lack of rate-limiting/concurrency control leads to duplicate sending or email provider blocks.",
      solution: "Built a full-stack email scheduler using BullMQ and Redis for persistent delayed jobs that survive restarts. Implemented Redis-backed hourly rate limiting per sender and database-tracked job states to prevent duplicate processing across concurrent workers. Integrated Google OAuth and a live status dashboard.",
      techStack: ["TypeScript", "Express.js", "PostgreSQL", "Prisma", "BullMQ", "Redis", "React"],
      liveLink: "https://reachinbox-email-scheduler-gules.vercel.app",
      githubLink: "https://github.com/AFG123/reachinbox-email-scheduler"
    }
  ];

  const skillCategories = [
    {
      category: "Backend & Databases",
      skills: [
        { name: "Node.js", highlight: true },
        { name: "Express.js", highlight: true },
        { name: "PostgreSQL", highlight: true },
        { name: "MongoDB", highlight: false },
        { name: "Redis / BullMQ", highlight: true },
        { name: "MySQL", highlight: false },
        { name: "REST APIs", highlight: false },
        { name: "Schema Design", highlight: false },
      ]
    },
    {
      category: "Languages & Security",
      skills: [
        { name: "TypeScript", highlight: true },
        { name: "JavaScript", highlight: false },
        { name: "Java (DSA)", highlight: false },
        { name: "Python / PHP", highlight: false },
        { name: "JWT Auth", highlight: false },
        { name: "RBAC", highlight: true },
        { name: "MVC Architecture", highlight: false },
        { name: "Input Validation", highlight: false },
      ]
    },
    {
      category: "Tools & Frontend",
      skills: [
        { name: "React", highlight: true },
        { name: "Tailwind CSS", highlight: false },
        { name: "Git & GitHub", highlight: true },
        { name: "Postman", highlight: false },
        { name: "Jira", highlight: false },
        { name: "Linux", highlight: false },
        { name: "Microsoft Azure", highlight: false },
        { name: "Vercel", highlight: false },
      ]
    }
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    void trackPortfolioEvent({
      eventType: "page_view",
      path: window.location.pathname,
      metadata: {
        referrer: document.referrer || null,
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-300">
      {/* Terminal Header */}
      <header className="border-b border-[#00ff41]/20 bg-black/90 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#00ff41]" />
            <span className="font-mono text-sm text-[#00ff41]">~/portfolio</span>
          </div>
          <nav className="hidden md:flex gap-6">
            {["about", "projects", "architecture", "skills", "contact"].map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className="font-mono text-sm text-gray-400 hover:text-[#00ff41] transition-colors"
              >
                {section}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 relative">
        <div className="max-w-3xl w-full">
          <div className="mb-12 space-y-2">
            <div className="font-mono text-sm">
              <span className="text-[#00ff41]/60">$ </span>
              <span className="text-gray-400">whoami</span>
            </div>
            <h1 className="font-mono text-xl text-white pl-2">
              Aryan Damai
            </h1>

            <div className="font-mono text-sm mt-4">
              <span className="text-[#00ff41]/60">$ </span>
              <span className="text-gray-400">current_focus</span>
            </div>
            <div className="font-mono text-xl text-white pl-2">
              Building scalable backend systems
            </div>

            <div className="font-mono text-sm text-[#00ff41]/60 pl-0 pt-2">
              $ _
            </div>
          </div>

          <SystemStats />

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => scrollToSection("projects")}
              className="font-mono px-6 py-3 border-2 border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black transition-all"
            >
              View Projects
            </button>

            <a
              href="/resume.pdf"
              download
              onClick={() => {
                void trackResumeDownload("hero");
              }}
              className="inline-flex items-center gap-2 font-mono px-6 py-3 border border-[#00ff41]/40 text-gray-300 hover:bg-[#00ff41]/10 hover:border-[#00ff41] hover:text-[#00ff41] transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Resume</span>
            </a>
          </div>
        </div>
        <button
          onClick={() => scrollToSection("about")}
          className="absolute bottom-8 text-[#00ff41]/40 hover:text-[#00ff41]/80 transition-colors"
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </button>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 border-t border-[#00ff41]/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-mono text-2xl text-[#00ff41] mb-8">
            <span className="text-[#00ff41]/60">$</span> cat about.txt
          </h2>
          <div className="max-w-2xl space-y-5 font-mono text-base leading-8 text-gray-400">
            <p>
              I&apos;m a backend developer focused on <span className="text-[#00ff41]">building systems that solve real problems</span>. I care about how data moves, how components interact, and whether the software still makes sense once it grows beyond the first version.
            </p>

            <p>
              Most of my work is around APIs, backend flows, database-driven applications, and the logic behind admin and user-facing systems. I like building software that is clear in structure, practical in use, and maintainable over time.
            </p>

            <p>
              I&apos;m self-taught, so the way I learned was by building, breaking, and refining projects until they worked the way they should. That process shaped how I approach engineering: stay curious, keep the fundamentals strong, and build things that hold up in practice.
            </p>

            <p className="text-white">
              I&apos;m interested in backend roles where reliability, structure, and thoughtful problem-solving matter.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-6 border-t border-[#00ff41]/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-mono text-2xl text-[#00ff41] mb-8">
            <span className="text-[#00ff41]/60">$</span> ls projects/
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <ProjectCard key={index} {...project} />
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <ArchitectureSection />

      {/* Skills Section */}
      <section id="skills" className="py-20 px-6 border-t border-[#00ff41]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-mono text-2xl text-[#00ff41] mb-8">
            <span className="text-[#00ff41]/60">$</span> grep skills
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {skillCategories.map((category, index) => (
              <SkillCategory key={index} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 border-t border-[#00ff41]/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-mono text-2xl text-[#00ff41] mb-4">
            <span className="text-[#00ff41]/60">$</span> ./contact.sh
          </h2>

          <div className="mb-6 p-4 border border-[#00ff41]/30 bg-[#00ff41]/5">
            <p className="font-mono text-sm text-[#00ff41]">
              Open to opportunities
            </p>
          </div>

          <p className="mb-8 font-mono text-gray-400">
            Open to interesting projects and collaborations. Let&apos;s build something.
          </p>

          <ContactForm />

          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:aryan123damai@gmail.com"
              className="flex items-center gap-2 font-mono px-5 py-3 border-2 border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Email Me</span>
            </a>
            <a
              href="https://github.com/AFG123"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-mono px-5 py-3 border border-[#00ff41]/40 text-gray-300 hover:bg-[#00ff41]/10 hover:border-[#00ff41] hover:text-[#00ff41] transition-all"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/aryan-damai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-mono px-5 py-3 border border-[#00ff41]/40 text-gray-300 hover:bg-[#00ff41]/10 hover:border-[#00ff41] hover:text-[#00ff41] transition-all"
            >
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#00ff41]/10 py-8 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="font-mono text-sm text-gray-600">
            A portfolio powered by real APIs, tracking, and PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  );
}
