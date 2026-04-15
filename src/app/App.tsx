import { Github, Linkedin, Mail, Terminal, ChevronDown } from "lucide-react";
import { ProjectCard } from "./components/ProjectCard";
import { SkillCategory } from "./components/SkillCategory";

export default function App() {
  const projects = [
    {
      title: "real-time chat system",
      problem: "Needed a scalable messaging platform for distributed teams",
      solution: "Built WebSocket-based chat with Redis pub/sub, handling 10k+ concurrent connections",
      techStack: ["Node.js", "Redis", "WebSocket", "React"],
      liveLink: "#",
      githubLink: "#"
    },
    {
      title: "task automation CLI",
      problem: "Repetitive deployment workflows wasting developer time",
      solution: "Created CLI tool automating builds, tests, and deployments with rollback support",
      techStack: ["Python", "Docker", "Bash", "CI/CD"],
      githubLink: "#"
    },
    {
      title: "inventory tracker",
      problem: "Local gym needed simple equipment tracking without complex software",
      solution: "Lightweight progressive web app with offline support and barcode scanning",
      techStack: ["TypeScript", "IndexedDB", "PWA", "Tailwind"],
      liveLink: "#",
      githubLink: "#"
    }
  ];

  const skillCategories = [
    {
      category: "Backend",
      skills: [
        { name: "Node.js", highlight: true },
        { name: "Python", highlight: true },
        { name: "PostgreSQL", highlight: false },
        { name: "Redis", highlight: true },
        { name: "REST APIs", highlight: false },
        { name: "WebSockets", highlight: false },
      ]
    },
    {
      category: "Frontend",
      skills: [
        { name: "React", highlight: true },
        { name: "TypeScript", highlight: true },
        { name: "JavaScript", highlight: false },
        { name: "Tailwind CSS", highlight: false },
      ]
    },
    {
      category: "Systems",
      skills: [
        { name: "Docker", highlight: true },
        { name: "Linux/Bash", highlight: false },
        { name: "Git", highlight: false },
        { name: "CI/CD", highlight: false },
      ]
    }
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

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
            {["about", "projects", "skills", "contact"].map((section) => (
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
            <div className="font-mono text-xl text-white pl-2">
              Aryan Damai
            </div>

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

          <div className="text-center">
            <button
              onClick={() => scrollToSection("projects")}
              className="font-mono px-6 py-3 border-2 border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black transition-all"
            >
              View Projects
            </button>
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
          <div className="max-w-2xl space-y-6 font-mono text-base leading-8 text-gray-400">
            <p>
              I&apos;m a backend developer focused on <span className="text-[#00ff41]">building systems</span>, not just writing code. My approach goes beyond implementation. I think in terms of architecture, data flow, and how each component interacts under real-world conditions.
            </p>

            <p>
              I believe good software is defined by purpose. Before building anything, I question why it should exist, what problem it solves, and how it behaves when things go wrong. Designing for edge cases and failure scenarios is not an afterthought. It&apos;s a core part of how I work.
            </p>

            <p>
              My work reflects a systems-first mindset, from structuring scalable APIs to handling concurrency, data consistency, and performance under load. I focus on creating solutions that are not only functional, but reliable and maintainable over time.
            </p>

            <p>
              I&apos;m self-taught, which means I&apos;ve learned by building, breaking, and refining real systems. That process shaped my discipline, attention to detail, and ability to stay consistent, principles I also apply outside of tech through boxing and training.
            </p>

            <p className="text-white">
              I don&apos;t aim to build more code. I aim to build systems that actually hold up.
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

          <p className="font-mono text-gray-400 mb-8">
            Open to interesting projects and collaborations. Let&apos;s build something.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:aryan@example.com"
              className="flex items-center gap-2 font-mono px-5 py-3 border-2 border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Email Me</span>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-mono px-5 py-3 border border-[#00ff41]/40 text-gray-300 hover:bg-[#00ff41]/10 hover:border-[#00ff41] hover:text-[#00ff41] transition-all"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <a
              href="https://linkedin.com"
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
            Built with React & Tailwind CSS · No frameworks, just fundamentals
          </p>
        </div>
      </footer>
    </div>
  );
}
