import React from "react";
import { ExternalLink, Code, Layers, Sparkles, Terminal } from "lucide-react";

interface ProjectItem {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  link: string;
  glowColor: string;
  icon: React.ReactNode;
}

const projects: ProjectItem[] = [
  {
    id: "proj-1",
    title: "Aetherial Canvas",
    category: "WebGL / Interactive Art",
    description: "An immersive, hardware-accelerated 3D audio visualizer built using Three.js and GLSL shaders. Displays real-time sound frequencies as morphing fluid particles with responsive color physics.",
    tags: ["Three.js", "GLSL", "React Three Fiber", "Web Audio API"],
    link: "#",
    glowColor: "group-hover:border-purple-500/30 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
    icon: <Sparkles className="w-6 h-6 text-purple-400" />,
  },
  {
    id: "proj-2",
    title: "Nova Design System",
    category: "UI/UX / Engineering",
    description: "A highly customizable, responsive component ecosystem supporting multi-brand theme tokenization. Written from scratch with CSS variables, Tailwind configurations, and accessibility compliance.",
    tags: ["React", "TypeScript", "Tailwind CSS", "Storybook"],
    link: "#",
    glowColor: "group-hover:border-blue-500/30 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    icon: <Layers className="w-6 h-6 text-blue-400" />,
  },
  {
    id: "proj-3",
    title: "Cognitive Engine",
    category: "AI / Interface Design",
    description: "A sleek dashboard interface showcasing predictive modeling for server telemetry. Uses responsive canvas-based graphs and real-time WebSockets data feeds.",
    tags: ["Next.js", "Recharts", "WebSockets", "Node.js"],
    link: "#",
    glowColor: "group-hover:border-emerald-500/30 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    icon: <Terminal className="w-6 h-6 text-emerald-400" />,
  },
  {
    id: "proj-4",
    title: "Exim Platform",
    category: "B2B SaaS / Supply Chain",
    description: "A bespoke logistics management tool for international B2B agricultural trading. Handles cargo pipelines, document verifications, custom audits, and container shipping telemetry.",
    tags: ["React", "Express", "Vite", "REST APIs"],
    link: "#",
    glowColor: "group-hover:border-pink-500/30 group-hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]",
    icon: <Code className="w-6 h-6 text-pink-400" />,
  },
];

export default function Projects() {
  return (
    <section id="work" className="py-32 px-6 md:px-24 bg-black relative border-t border-neutral-900 z-20">
      {/* Glow Backdrops */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-20">
          <span className="font-mono text-xs text-purple-400 uppercase tracking-[0.2em] block mb-3">
            SELECTED PROJECTS
          </span>
          <h2 className="font-display font-black text-4xl md:text-6xl tracking-tight">
            CASE STUDIES.
          </h2>
          <p className="font-sans text-neutral-400 text-sm md:text-base font-light max-w-xl mt-4 leading-relaxed">
            A handpicked collection of applications pushing the boundaries of web animation, frontend architectures, and pixel-perfect design.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map((proj) => (
            <a
              key={proj.id}
              href={proj.link}
              className={`group block bg-[#0a0a0a]/60 backdrop-blur-md border border-neutral-800 p-8 md:p-10 rounded-3xl transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1 ${proj.glowColor}`}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="p-3 bg-neutral-900/80 rounded-2xl border border-neutral-800 group-hover:border-neutral-700 transition-colors">
                  {proj.icon}
                </div>
                <div className="flex items-center gap-1 text-xs font-mono text-neutral-500 group-hover:text-white transition-colors">
                  <span>View Case</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>

              <span className="font-mono text-xs text-neutral-500 uppercase tracking-wider block mb-2">
                {proj.category}
              </span>
              <h3 className="font-display font-bold text-xl md:text-2xl text-white group-hover:text-white transition-colors mb-4">
                {proj.title}
              </h3>
              <p className="font-sans text-neutral-400 text-xs md:text-sm leading-relaxed font-light mb-8">
                {proj.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {proj.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-[10px] bg-neutral-900/60 border border-neutral-800 text-neutral-400 px-3 py-1 rounded-full group-hover:bg-neutral-800/50 group-hover:border-neutral-700 group-hover:text-neutral-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
