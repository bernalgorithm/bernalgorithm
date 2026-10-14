import Link from 'next/link';
import { HardwareWorkbench } from '@/components/HardwareWorkbench';
import { getSortedPostsData } from '@/lib/posts';

const ENGINEERING_DOMAINS = [
  {
    id: 'SYS_01',
    title: 'Embedded Linux & Fleet Architecture',
    subtitle: 'Global Edge Systems (20+ Countries)',
    accent: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    description:
      'Architecting production C/C++ firmware and Embedded Linux systems across 6 continents, including remote LTS fleet migrations and lightweight cloud SDK runtimes.',
    skills: ['C / C++', 'Embedded Linux (Ubuntu)', 'Cross-Compilation', 'Azure IoT', 'Python & Bash', 'Watchdog & OTA'],
  },
  {
    id: 'SYS_02',
    title: 'Self-Healing Fieldbus & Hardware I/O',
    subtitle: 'Fault-Tolerant Cyber-Physical Control',
    accent: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    description:
      'Architecting self-healing protocol state machines that mask hardware-layer resets and orchestrate closed-loop sensor-to-actuator control across industrial buses and raw signaling pins.',
    skills: ['Modbus (TCP/IP & RTU)', 'OPC UA', 'Analog Current Loops', 'Discrete Digital I/O', 'MQTT', 'PLCs & Pumps'],
  },
  {
    id: 'SYS_03',
    title: 'AI-Augmented & Digitization Platforms',
    subtitle: 'Agentic Velocity & SME Decision Engines',
    accent: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    description:
      'Codifying domain SME heuristics into enterprise decision engines and leveraging agentic AI workflows (CLAUDE.md, AGENTS.md) to ship verified C/C++, Python, and Next.js systems.',
    skills: ['Claude Code', 'Google Antigravity', 'Gemini', 'SME Decision Engines', 'Next.js & TypeScript', 'GitHub Actions CI/CD'],
  },
];

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-20">
      {/* Hero / Resume Extension Banner */}
      <section className="relative rounded-3xl border border-slate-800/90 bg-gradient-to-b from-slate-900/80 to-slate-950/95 p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs mb-5">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold">
            STATUS: ONLINE // CLOCK LOCKED
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            IIOT &bull; EMBEDDED LINUX &bull; CYBER-PHYSICAL &bull; AI-AUGMENTED
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-4">
          Bernalgorithm
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-3xl leading-relaxed mb-6">
          Engineering portfolio &amp; living lab notebook of{' '}
          <span className="text-white font-semibold">Alexander Bernal</span>—bridging{' '}
          <span className="text-emerald-400 font-semibold">
            industrial embedded systems &amp; closed-loop hardware control
          </span>{' '}
          with{' '}
          <span className="text-cyan-400 font-semibold">
            agentic AI workflows &amp; modern web architecture
          </span>
          .
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
          <Link
            href="/resume"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black tracking-wider transition shadow-lg shadow-emerald-500/10"
          >
            VIEW RESUME / CV &rarr;
          </Link>
          <a
            href="#workbench"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold transition"
          >
            LAUNCH HARDWARE WORKBENCH &darr;
          </a>
          <a
            href="#notebook"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold transition"
          >
            READ LAB NOTEBOOK ({allPostsData.length})
          </a>
        </div>
      </section>

      {/* Section 01: Interactive Hardware Workbench */}
      <section id="workbench" className="scroll-mt-20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="font-mono text-xs font-bold text-emerald-400 tracking-widest uppercase">
              01 // INTERACTIVE TELEMETRY &amp; SIMULATION
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
              Hardware Arcade Workbench
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Zero-asset Web Audio synthesis &bull; 60 FPS Canvas physics
          </p>
        </div>

        <HardwareWorkbench />
      </section>

      {/* Section 02: Engineering Domain Matrix */}
      <section id="architecture" className="scroll-mt-20 space-y-6">
        <div>
          <div className="font-mono text-xs font-bold text-cyan-400 tracking-widest uppercase">
            02 // CORE COMPETENCIES &amp; ARCHITECTURE
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Bridging Silicon &amp; the Browser
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            How low-level embedded constraints—memory boundaries, interrupt latency, and
            state-machine determinism—translate directly into resilient, high-performance web
            applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ENGINEERING_DOMAINS.map((domain) => (
            <div
              key={domain.id}
              className="rounded-2xl border border-slate-800/90 bg-slate-950/80 p-6 flex flex-col justify-between hover:border-slate-700 transition shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${domain.accent}`}
                  >
                    {domain.id}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {domain.subtitle}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{domain.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                  {domain.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-900">
                {domain.skills.map((skill) => (
                  <span
                    key={skill}
                    className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 03: Lab Notebook (Blog & Project Documentation) */}
      <section id="notebook" className="scroll-mt-20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="font-mono text-xs font-bold text-amber-400 tracking-widest uppercase">
              03 // LAB NOTEBOOK &amp; ARCHITECTURAL LOGS
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
              Project Dispatches &amp; Technical Notes
            </h2>
          </div>
          <span className="font-mono text-xs text-slate-400">
            Compiled statically via Next.js RSC + MDX
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {allPostsData.map((post, index) => {
            const logNumber = String(allPostsData.length - index).padStart(2, '0');
            const tags = Array.isArray(post.tags) ? post.tags : [];

            return (
              <article
                key={post.slug}
                className="group relative rounded-2xl border border-slate-800/90 bg-slate-950/85 p-6 hover:border-emerald-500/40 hover:bg-slate-900/50 transition shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
                      LOG_{logNumber}
                    </span>
                    <span className="text-slate-500">/{post.slug}.md</span>
                  </div>
                  {post.date && (
                    <time className="text-slate-400 bg-slate-900/70 px-2.5 py-0.5 rounded border border-slate-800/80">
                      {post.date}
                    </time>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition mb-2">
                  <Link href={`/posts/${post.slug}`} className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {post.title}
                  </Link>
                </h3>

                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  {post.description || `${post.content.slice(0, 160)}...`}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-900/90">
                  <div className="flex flex-wrap gap-1.5">
                    {tags.length > 0 ? (
                      tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-900 text-cyan-300/90 border border-slate-800"
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="font-mono text-[11px] text-slate-500">
                        #LabEntry
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    INSPECT ENTRY &rarr;
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
