import type { Metadata } from 'next';
import Link from 'next/link';
import { PrintResumeButton } from '@/components/PrintResumeButton';

export const metadata: Metadata = {
  title: 'Resume | Alexander Bernal — Embedded Systems & AI-Augmented Engineer',
  description:
    'Resume of Alexander Bernal: Senior Embedded Systems, Industrial IoT (IIoT), Edge Networking, and AI-Augmented Software Engineer.',
};

const SKILL_GROUPS = [
  {
    category: 'Systems & Languages',
    accent: 'text-emerald-400',
    skills: [
      'Systems Architecture',
      'Python',
      'C',
      'C++',
      'Bash',
      'TypeScript',
      'JavaScript',
      'SQL',
    ],
  },
  {
    category: 'Embedded Linux, Networking & Edge Ops',
    accent: 'text-cyan-400',
    skills: [
      'Embedded Linux (Ubuntu / User-Space Daemons)',
      'Cellular Gateways (Cradlepoint, Teltonika, MultiTech, Milesight)',
      'Embedded Cellular Modems & Wi-Fi',
      'DHCP Servers & NAT / Port Forwarding',
      'Azure IoT & Docker',
      'Remote Fleet Upgrades',
    ],
  },
  {
    category: 'Industrial I/O & Fieldbus',
    accent: 'text-amber-400',
    skills: [
      'Closed-Loop Actuator/Pump Control',
      'Self-Healing Protocol State Machines',
      'OPC UA',
      'Modbus (TCP/IP & RTU)',
      'MQTT',
      'Analog & Digital I/O',
      'PLCs & Ladder Logic',
    ],
  },
  {
    category: 'AI, Digitization & Full-Stack',
    accent: 'text-purple-400',
    skills: [
      'Claude Code',
      'Google Antigravity (agy)',
      'Gemini',
      'Context Architecture (CLAUDE.md / AGENTS.md)',
      'Rule-Based Decision Engines',
      'React / Next.js',
      'GitHub Actions (CI/CD)',
    ],
  },
];

const EXPERIENCE = [
  {
    title: 'Digital Innovation Engineer',
    period: 'March 2022 – Present',
    badge: 'CURRENT // SYSTEMS ARCHITECTURE & IIOT LEAD',
    bullets: [
      {
        lead: 'Global IIoT & Closed-Loop Architecture',
        text: 'Lead the end-to-end systems architecture, Embedded Linux software design, and field network integration for smart automated chemical dosing systems—orchestrating closed-loop sensor-to-actuator control from concept through global commercial deployment across 20+ countries spanning 6 continents.',
      },
      {
        lead: 'Self-Healing Fieldbus & Hardware Fault Tolerance',
        text: 'Engineered fault-tolerant Modbus (TCP/IP & RTU), OPC UA, and MQTT communication state machines with automated session recovery and state reconciliation to mask unannounced 20–40 minute hardware resets on legacy third-party pump controllers—guaranteeing continuous closed-loop operation with zero customer-visible disruption.',
      },
      {
        lead: 'Enterprise SME Knowledge Digitization',
        text: 'Architected a guided technical configuration and decision-support platform that codifies Subject Matter Expert (SME) domain heuristics into a deterministic recommendation engine—automating equipment and chemistry selection to standardize global commercial proposals.',
      },
      {
        lead: 'AI-Augmented Systems Engineering',
        text: 'Pioneered agentic development workflows (Claude Code, Google Antigravity, declarative CLAUDE.md / AGENTS.md context guardrails, and automated diagnostic tooling) to translate system architecture into verified C/C++, Python, and TypeScript implementations while accelerating protocol debugging and cross-OS refactoring.',
      },
      {
        lead: 'Fleet OS Modernization & Runtime Optimization',
        text: 'Ported and compiled core C/C++ edge software to support remote in-field Embedded Linux LTS distribution upgrades, while replacing heavy containerized edge runtimes with lightweight native cloud SDK daemons (cutting deployment footprint by ~50%).',
      },
    ],
  },
  {
    title: 'Associate Digital Innovation Engineer',
    period: 'June 2019 – March 2022',
    bullets: [
      {
        lead: 'Multi-Protocol Sensor & Actuator Integration',
        text: 'Developed production edge software and Python/Bash/C++ daemons to integrate multi-vendor industrial sensors, variable-rate dosing pumps, and PLCs across OPC UA, Modbus (TCP/IP & RTU), and analog/digital I/O networks, routing real-time telemetry to Azure IoT via MQTT.',
      },
      {
        lead: 'Industrial Edge Networking & Cellular Backhaul',
        text: 'Designed and configured multi-device field networks behind dedicated cellular gateways (Cradlepoint, Teltonika, MultiTech, Milesight) as well as onboard embedded cellular modems and Wi-Fi interfaces on headless Linux SBCs—configuring DHCP servers, NAT / port-forwarding rules, and automated Linux provisioning scripts to streamline global hardware bring-up and remote diagnostics.',
      },
    ],
  },
  {
    title: 'Regulatory Specialist (Automation & Data Engineering)',
    period: 'September 2016 – May 2019',
    bullets: [
      {
        lead: 'Compliance Automation Pipeline',
        text: 'Designed and deployed an automated Python and XML data aggregation pipeline to compile, validate, and submit federal EPA Pesticide Production Reports, saving hundreds of engineering hours annually.',
      },
      {
        lead: 'Automated Document Verification',
        text: 'Engineered custom Python parsing and diffing tooling to audit EPA-registered labels, eliminating manual review bottlenecks and mitigating regulatory compliance risk.',
      },
    ],
  },
  {
    title: 'Technical Services Chemist & Product Development Intern',
    period: 'September 2014 – September 2016',
    bullets: [
      {
        lead: 'Laboratory & Computer Vision Automation',
        text: 'Self-initiated and deployed standalone Python (Tkinter) desktop applications and Java (ImageJ) computer-vision scripts to automate sample area/oil-level analysis and data entry, returning hundreds of laboratory hours per month to the chemistry team.',
      },
    ],
  },
];

export default function ResumePage() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href="/"
          className="font-mono text-xs text-slate-400 hover:text-emerald-400 transition inline-flex items-center gap-2"
        >
          &larr; RETURN TO LAB WORKBENCH
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <PrintResumeButton />
          <a
            href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/Alexander_Bernal_Resume.docx`}
            download="Alexander_Bernal_Resume.docx"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-black tracking-wider transition shadow-lg shadow-emerald-500/10"
          >
            DOWNLOAD .DOCX &darr;
          </a>
        </div>
      </div>

      {/* Resume Sheet */}
      <article className="rounded-3xl border border-slate-800/90 bg-slate-950/90 p-6 sm:p-10 shadow-2xl space-y-8 print:border-none print:shadow-none print:p-0 print:bg-white print:text-slate-900">
        {/* Header */}
        <header className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs text-emerald-400 font-bold tracking-widest uppercase mb-1">
              CURRICULUM VITAE // SYSTEMS &amp; IIOT ARCHITECTURE
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Alexander Bernal
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium mt-1">
              Senior Embedded Systems, Industrial IoT &amp; AI-Augmented Software Engineer
            </p>
          </div>

          <div className="font-mono text-xs text-slate-400 space-y-1 sm:text-right">
            <div>Memphis, TN &bull; 901-220-1510</div>
            <div>
              <a
                href="mailto:me@alexanderbernal.dev"
                className="text-emerald-400 hover:underline"
              >
                me@alexanderbernal.dev
              </a>
            </div>
            <div className="flex sm:justify-end gap-3">
              <a
                href="https://linkedin.com/in/bernaale"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-400 transition"
              >
                linkedin.com/in/bernaale
              </a>
              <span>&bull;</span>
              <a
                href="https://github.com/bernalgorithm"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-400 transition"
              >
                github.com/bernalgorithm
              </a>
            </div>
          </div>
        </header>

        {/* Professional Summary */}
        <section className="space-y-2">
          <h2 className="font-mono text-xs font-bold tracking-widest text-emerald-400 uppercase">
            01 // Professional Summary
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Senior Embedded Systems and Industrial IoT (IIoT) Engineer with 7+ years of
            experience architecting fault-tolerant edge software, industrial
            cellular/network topologies, closed-loop sensor-to-actuator control systems,
            and enterprise digitization platforms deployed across{' '}
            <span className="text-white font-semibold">
              20+ countries spanning 6 continents
            </span>{' '}
            (12 years total industrial R&amp;D and automation tenure). Specializes in
            bridging physical plant hardware with cloud infrastructure across industrial
            fieldbuses and cellular backhaul gateways, masking field-hardware instability
            through self-healing protocol state machines, and leveraging agentic AI
            workflows (
            <span className="text-white font-semibold">
              Claude Code, Google Antigravity, Gemini
            </span>
            ) with strict architectural guardrails to deliver production systems across
            C/C++, Python, Bash, and TypeScript.
          </p>
        </section>

        {/* Technical Skills */}
        <section className="space-y-3">
          <h2 className="font-mono text-xs font-bold tracking-widest text-cyan-400 uppercase">
            02 // Technical Skills &amp; Protocols
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SKILL_GROUPS.map((group) => (
              <div
                key={group.category}
                className="rounded-2xl border border-slate-800/90 bg-slate-900/40 p-4 space-y-2.5"
              >
                <div className={`font-mono text-xs font-bold ${group.accent}`}>
                  {group.category}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="font-mono text-[11px] px-2.5 py-0.5 rounded-md bg-slate-950 text-slate-200 border border-slate-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Professional Experience */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h2 className="font-mono text-xs font-bold tracking-widest text-amber-400 uppercase">
              03 // Professional Experience
            </h2>
            <span className="font-mono text-xs text-slate-400">
              BUCKMAN &bull; MEMPHIS, TN (2014 – PRESENT)
            </span>
          </div>

          <div className="space-y-6">
            {EXPERIENCE.map((role) => (
              <div
                key={role.title}
                className="relative pl-4 sm:pl-6 border-l-2 border-slate-800 hover:border-emerald-500/60 transition space-y-2.5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{role.title}</h3>
                    {role.badge && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold">
                        {role.badge}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-slate-400">{role.period}</span>
                </div>

                <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                  {role.bullets.map((b) => (
                    <li key={b.lead} className="flex gap-2.5">
                      <span className="text-emerald-400 font-mono select-none">&rsaquo;</span>
                      <span>
                        <strong className="text-white font-semibold">{b.lead}:</strong>{' '}
                        {b.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Engineering Lab & Selected Projects */}
        <section className="space-y-3">
          <h2 className="font-mono text-xs font-bold tracking-widest text-emerald-400 uppercase border-b border-slate-800/80 pb-2">
            04 // Engineering Lab &amp; Selected Architecture
          </h2>
          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/30 p-4 space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white">
                AI-Augmented Engineering Portfolio &amp; Systems Lab (bernalgorithm.github.io)
              </h3>
              <span className="font-mono text-xs text-emerald-400">
                Next.js &bull; TypeScript &bull; Antigravity &bull; Gemini
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Architected and deployed a statically exported Next.js and TypeScript
              technical portfolio and lab notebook using Google Antigravity and Gemini,
              enforcing declarative{' '}
              <code className="font-mono text-xs text-cyan-300">AGENTS.md</code> context
              boundaries and automated GitHub Actions CI/CD pipelines.
            </p>
          </div>
        </section>

        {/* Education */}
        <section className="space-y-4">
          <h2 className="font-mono text-xs font-bold tracking-widest text-cyan-400 uppercase border-b border-slate-800/80 pb-2">
            05 // Education
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/30 p-4 space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-base font-bold text-white">Oregon State University</h3>
                <span className="font-mono text-xs text-slate-400">2017 – 2019</span>
              </div>
              <div className="font-mono text-xs text-emerald-400 font-semibold">
                B.S., Computer Science
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                Served as a university tutor and grader for Computer Science coursework,
                guiding students through object-oriented programming implementations and
                debugging in C++.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/30 p-4 space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-base font-bold text-white">University of Memphis</h3>
                <span className="font-mono text-xs text-slate-400">2008 – 2014</span>
              </div>
              <div className="font-mono text-xs text-cyan-400 font-semibold">
                B.S., Chemistry (ACS Certified) &amp; B.S., Biology
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                Awarded National Science Foundation (NSF) computational chemistry funding;
                utilized Linux supercomputing clusters to model energetic profiles of
                metallo-organic molecules.
              </p>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
