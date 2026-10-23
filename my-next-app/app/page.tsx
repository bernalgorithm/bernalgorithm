import Link from 'next/link';
import { DemoMiniPreviewGrid } from '@/components/DemoMiniPreview';
import { SpacetimeBackground } from '@/components/SpacetimeBackground';
import { getSortedPostsData } from '@/lib/posts';

const IMPACT_METRICS = [
  {
    id: 'KPI 01',
    metric: '20+ Countries',
    label: 'Global distributed Linux & IoT fleets across 6 continents',
    accentBar: 'bg-blue-600',
  },
  {
    id: 'KPI 02',
    metric: '~50% Footprint',
    label: 'Edge memory reduction via native C/C++ & Python daemons',
    accentBar: 'bg-emerald-600',
  },
  {
    id: 'KPI 03',
    metric: 'Self-Healing',
    label: 'Automated state recovery across industrial fieldbuses',
    accentBar: 'bg-indigo-600',
  },
  {
    id: 'KPI 04',
    metric: '12+ Years R&D',
    label: 'From C/C++, Embedded Linux & IoT to TypeScript & AI',
    accentBar: 'bg-amber-500',
  },
];

const ENGINEERING_DOMAINS = [
  {
    id: '01',
    title: 'Distributed Linux Fleets & Edge Infrastructure',
    subtitle: 'IoT • Edge Linux • Remote Ops',
    accentBar: 'bg-blue-600',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    description:
      'Headless Linux systems, native C/C++ and Python daemons, remote OTA upgrades, and resilient network topologies (DHCP, NAT, out-of-band cellular & LoRa backhaul).',
    skills: [
      'Embedded Linux (Multi-Distro)',
      'C / C++ & Python',
      'DHCP, NAT & Routing',
      'Cellular & LoRaWAN',
      'Docker & Azure IoT',
    ],
  },
  {
    id: '02',
    title: 'Closed-Loop Control Systems & Industrial Telemetry',
    subtitle: 'ICS/OT • Automation • Fieldbus',
    accentBar: 'bg-emerald-600',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    description:
      'Closed-loop PID sensor-to-actuator regulation, multi-vendor PLC and sensor integration, and self-healing communication state machines across industrial facilities.',
    skills: [
      'Closed-Loop PID Control',
      'Modbus (TCP/IP & RTU)',
      'OPC UA & MQTT',
      '4–20mA Analog & Digital I/O',
      'Self-Healing State Machines',
    ],
  },
  {
    id: '03',
    title: 'Full-Stack Platforms, Cloud & Agentic AI',
    subtitle: 'Web Apps • Decision Engines • AI',
    accentBar: 'bg-indigo-600',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    description:
      'Real-time cloud telemetry pipelines, offline-first web applications, deterministic configuration engines, and AI-augmented engineering workflows (CLAUDE.md, AGENTS.md).',
    skills: [
      'TypeScript, React & Next.js',
      'Claude Code & Antigravity',
      'Rule-Based Decision Engines',
      'Offline-First Sync',
      'CI/CD & GitHub Actions',
    ],
  },
];

export default function Home() {
  const allPostsData = getSortedPostsData();
  const leadArticle =
    allPostsData.find((p) => p.slug === 'robotic-arm-inverse-kinematics') || allPostsData[0];
  const secondaryArticles = allPostsData
    .filter((p) => p.slug !== leadArticle?.slug)
    .slice(0, 3);

  return (
    <main className="min-h-screen w-full">
      {/* =====================================================================
          BAND 01: ABOUT ALEXANDER BERNAL & RESUME (STUDIO-LIT EXECUTIVE BAND)
      ===================================================================== */}
      <section
        id="about-resume"
        aria-label="About Alexander Bernal and Resume"
        className="relative overflow-hidden w-full bg-studio-grid border-b border-slate-200/90 pt-6 sm:pt-10 pb-14 sm:pb-20"
      >
        <SpacetimeBackground variant="starlight" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          {/* Section 01 Identity Ribbon with Single Deep-Red Printable Resume Button on the Right */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-5 sm:px-7 py-3 shadow-md border border-blue-500/40 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md bg-white/20 font-mono uppercase tracking-wider shadow-2xs">
                Section 01 // Profile &amp; Resume
              </span>
              <span className="text-blue-50">
                About Alexander Bernal &bull; Experience &amp; System Architecture
              </span>
            </div>
            <Link
              href="/resume"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold border border-red-950/40 ring-1 ring-white/25 shadow-sm transition"
            >
              <span>Open Printable Resume / CV</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          {/* Two-Column Asymmetric Hero: 60% Bio (Left) + 40% Recessed Hardware Metric Wells (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Executive Bio & Direct Contact Actions */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200/90 text-xs font-semibold text-blue-800 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>
                  Embedded Systems &bull; IoT / OT &bull; Control Systems &bull; Edge Linux &bull; Full-Stack
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
                  Alexander Bernal
                </h1>
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed border-l-2 border-blue-600/30 pl-4">
                  With 12+ years across R&amp;D, automation, and software engineering, I architect and ship{' '}
                  <strong className="text-slate-900 font-semibold">
                    fault-tolerant Embedded Linux fleets, automated sensor-to-actuator control systems, and full-stack web platforms across 20+ countries
                  </strong>
                  &mdash;bridging physical sensors, actuators, and industrial telemetry (Modbus, OPC UA, MQTT) with cloud infrastructure and AI-augmented engineering.
                </p>
              </div>

              {/* Tactile Secondary Contact & DOCX Row */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs sm:text-sm">
                <a
                  href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/Alexander_Bernal_Resume.docx`}
                  download="Alexander_Bernal_Resume.docx"
                  className="card-tactile px-4 py-2 rounded-xl text-slate-800 border border-slate-300/90 font-semibold hover:border-slate-400"
                >
                  Download .DOCX Copy &darr;
                </a>
                <a
                  href="mailto:me@alexanderbernal.dev"
                  className="card-tactile px-4 py-2 rounded-xl text-slate-700 border border-slate-200/90 font-medium hover:border-blue-300 hover:text-blue-700"
                >
                  me@alexanderbernal.dev
                </a>
                <a
                  href="https://www.linkedin.com/in/bernaale/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-tactile px-4 py-2 rounded-xl text-slate-700 border border-slate-200/90 font-medium hover:border-blue-300 hover:text-blue-700"
                >
                  LinkedIn ↗
                </a>
              </div>
            </div>

            {/* Right Column: Recessed "Hardware Instrument" Metric Wells */}
            <div className="lg:col-span-5">
              <div className="instrument-well rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between px-1 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                  <span className="font-semibold text-slate-700">
                    Verified Production Impact
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    4 Key Metrics
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {IMPACT_METRICS.map((item) => (
                    <div
                      key={item.metric}
                      className="relative rounded-xl bg-white border border-slate-200/90 p-3.5 shadow-2xs overflow-hidden flex flex-col justify-between space-y-1.5"
                    >
                      <div className={`
                        absolute top-0 inset-x-0 h-1
                        ${item.accentBar}
                      `} />
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 pt-0.5">
                        {item.id}
                      </div>
                      <div className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight tabular-nums">
                        {item.metric}
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-600 leading-snug">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3 Core Engineering Capability Pillars with Tactile Surface Elevation */}
          <div className="space-y-4 pt-6 border-t border-slate-200/80">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                Core Engineering Domains
              </h2>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 hidden sm:inline">
                Edge &bull; Control Systems &bull; Full-Stack
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {ENGINEERING_DOMAINS.map((domain) => (
                <div
                  key={domain.title}
                  className="card-tactile relative rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between space-y-5 overflow-hidden"
                >
                  <div className={`
                    absolute top-0 inset-x-0 h-1
                    ${domain.accentBar}
                  `} />

                  <div className="space-y-2.5 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`
                          text-[11px] font-semibold px-2.5 py-0.5 rounded-full border
                          ${domain.badgeClass}
                        `}
                      >
                        {domain.subtitle}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {domain.id}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {domain.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {domain.description}
                    </p>
                  </div>

                  <div className="-mx-6 -mb-6 px-6 py-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-wrap gap-1.5">
                    {domain.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200/90 shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          BAND 02: INTERACTIVE 60 FPS SIMULATOR LAB (FULL-BLEED OBSIDIAN STAGE)
      ===================================================================== */}
      <section
        id="demos-preview"
        aria-label="Interactive 60 FPS Technical Demos"
        className="relative overflow-hidden w-full scroll-mt-16 bg-obsidian-stage text-white border-b border-slate-800/90 py-14 sm:py-16"
      >
        <SpacetimeBackground variant="cosmos" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 space-y-7">
          {/* Dark Hardware Stage Ribbon */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 px-5 sm:px-7 py-3 flex flex-wrap items-center justify-between gap-2 text-xs shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 font-mono font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Section 02 // Interactive Simulator Lab
              </span>
              <span className="text-slate-300 font-medium hidden sm:inline">
                Click any live 3D animation below to open and control that simulator
              </span>
            </div>
            <Link
              href="/demos"
              className="text-sky-400 hover:text-sky-300 font-semibold transition"
            >
              Open Full Workbench &rarr;
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Interactive Hobby Simulators &amp; Demos
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Independent 60 FPS browser simulations and arcade experiments built for fun to explore control theory, 3D kinematics math, and real-time physics. All demos are personal hobby projects unrelated to my employer.
              </p>
            </div>

            <Link
              href="/demos"
              className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md transition shrink-0 self-start sm:self-auto"
            >
              Launch Simulator Workbench &rarr;
            </Link>
          </div>

          <DemoMiniPreviewGrid />
        </div>
      </section>

      {/* =====================================================================
          BAND 03: ENGINEERING BLOG & ARCHITECTURE JOURNAL (WARM EDITORIAL BAND)
      ===================================================================== */}
      <section
        id="case-studies"
        aria-label="Engineering Blog and Case Studies"
        className="relative overflow-hidden w-full scroll-mt-16 bg-editorial-paper py-14 sm:py-16"
      >
        <SpacetimeBackground variant="solar" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 space-y-7">
          {/* Editorial Ribbon */}
          <div className="rounded-2xl bg-amber-100/85 border border-amber-300/80 px-5 sm:px-7 py-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-amber-950 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded bg-amber-900 text-amber-50 font-mono uppercase tracking-wider">
                Section 03 // Engineering Blog
              </span>
              <span className="hidden sm:inline">
                Independent Technical Notes, Hobby Projects &amp; Architecture Explorations
              </span>
            </div>
            <Link
              href="/blog"
              className="text-amber-950 hover:text-amber-700 underline decoration-amber-700/50 font-bold transition"
            >
              Browse All {allPostsData.length} Articles &rarr;
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Engineering Blog &amp; Hobby Lab Notes
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                Independent articles and personal project write-ups exploring control theory, 3D kinematics math, state machines, and web architecture from a hobbyist perspective.
              </p>
            </div>

            <Link
              href="/blog"
              className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition shrink-0 self-start sm:self-auto"
            >
              View All Articles ({allPostsData.length}) &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {leadArticle && (
              <article className="lg:col-span-6 card-tactile group relative rounded-2xl border border-amber-300/90 p-6 flex flex-col justify-between space-y-5 overflow-hidden hover:border-amber-500">
                <div className="absolute top-0 inset-x-0 h-1 bg-amber-500" />
                <div className="space-y-3 pt-0.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                      Featured Deep-Dive
                    </span>
                    <span className="font-mono text-slate-500">
                      {leadArticle.date} &bull; {leadArticle.readingTimeMinutes} min read
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-700 transition leading-snug">
                    <Link href={`/posts/${leadArticle.slug}`} className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      {leadArticle.title}
                    </Link>
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {leadArticle.description}
                  </p>
                </div>

                <div className="text-sm font-bold text-blue-600 pt-3 border-t border-slate-100 inline-flex items-center gap-1">
                  Read Full Article &rarr;
                </div>
              </article>
            )}

            <div className="lg:col-span-6 flex flex-col justify-between space-y-3.5">
              {secondaryArticles.map((post, idx) => (
                <article
                  key={post.slug}
                  className="card-tactile group relative rounded-2xl border border-slate-200/90 px-5 py-4 hover:border-amber-400 flex items-start gap-4"
                >
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/90 text-amber-900 font-mono text-xs font-bold flex items-center justify-center mt-0.5 shadow-2xs">
                    0{idx + 2}
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
                      <span>{post.date}</span>
                      <span>{post.readingTimeMinutes} min read</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                      <Link href={`/posts/${post.slug}`} className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-1 leading-relaxed">
                      {post.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

