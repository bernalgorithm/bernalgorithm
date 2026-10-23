import Link from 'next/link';
import { DemoMiniPreviewGrid } from '@/components/DemoMiniPreview';
import { getSortedPostsData } from '@/lib/posts';

const CORE_CAPABILITIES = [
  {
    title: 'Embedded Linux, Edge Services & Field Networking',
    subtitle: 'Linux Daemons • Edge Infrastructure • Remote Connectivity',
    description:
      'Designing and maintaining production C/C++, Python, and Bash background services on headless Linux devices. Experienced in reducing edge runtime memory/storage footprints (~50% reduction moving from containers to native services), managing remote OTA OS upgrades, and configuring segmented cellular and LoRaWAN field networks.',
    skills: [
      'Embedded Linux (Multi-Distro)',
      'C / C++ & Python',
      'Bash & Systemd Daemons',
      'Cellular & LoRaWAN Gateways',
      'Subnet Routing, DHCP & NAT',
      'Docker & Remote OTA Upgrades',
    ],
  },
  {
    title: 'Industrial Control Systems (ICS/OT) & Telemetry',
    subtitle: 'Closed-Loop Control • Fieldbus Protocols • Cloud Ingestion',
    description:
      'Integrating physical sensors, variable-rate pumps/actuators, and multi-vendor PLCs into automated closed-loop control systems. Experienced in building self-healing communication state machines that detect device dropouts, quarantine bad sensor reads, and reconcile volatile registers upon reboot.',
    skills: [
      'Closed-Loop Control (PID)',
      'Modbus (TCP/IP & RTU)',
      'OPC UA & MQTT',
      '4–20mA Analog & Digital I/O',
      'PLC & Sensor Integration',
      'Azure IoT Telemetry',
    ],
  },
  {
    title: 'Full-Stack Web Platforms & AI-Augmented Delivery',
    subtitle: 'Web Applications • Configuration Engines • CI/CD',
    description:
      'Building full-stack web applications, rule-based technical configuration platforms, and offline-first cloud synchronization layers. Experienced in pairing structured AI-assisted development workflows with automated verification to accelerate delivery across C/C++, Python, and TypeScript.',
    skills: [
      'TypeScript & JavaScript',
      'React & Next.js',
      'Rule-Based Decision Engines',
      'Firebase / Firestore & SQL',
      'GitHub Actions & Azure DevOps',
      'Claude Code, Antigravity, Copilot & Gemini',
    ],
  },
];

const EXPERIENCE_TIMELINE = [
  {
    years: 'March 2022 – Present',
    role: 'Digital Innovation Engineer',
    functionalTitle: 'Senior Embedded Systems, IoT & Full-Stack Engineer',
    summary:
      'Lead end-to-end software architecture, Embedded Linux development, and network integration for automated industrial control systems across water treatment, chemical, and process manufacturing facilities in 20+ countries.',
    bullets: [
      'Engineered fault-tolerant Modbus (TCP/RTU), OPC UA, and MQTT communication state machines with automated session recovery and register reconciliation to mitigate 20–40 minute third-party hardware resets.',
      'Cut edge device memory and storage footprint by ~50% by replacing heavy container runtimes with native C/C++ cloud services, and ported core software for remote Embedded Linux OS upgrades.',
      'Architected a web-based technical configuration and recommendation platform that standardizes commercial system proposals worldwide.',
    ],
    highlights: ['Embedded Linux', 'C/C++ & Python', 'Modbus / OPC UA / MQTT', 'TypeScript & React'],
  },
  {
    years: 'June 2019 – March 2022',
    role: 'Associate Digital Innovation Engineer',
    functionalTitle: 'Embedded Linux & IoT Software Engineer',
    summary:
      'Developed production Linux edge services and field network architectures to connect industrial hardware to cloud telemetry platforms.',
    bullets: [
      'Built Python, C++, and Bash background services to integrate multi-vendor sensors, variable-rate actuators, and PLCs across OPC UA, Modbus, LoRa, and 4–20mA analog/digital I/O, streaming telemetry to Azure IoT via MQTT.',
      'Configured segmented local, cellular, and LoRaWAN field networks across industrial gateways (Cradlepoint, Teltonika, MultiTech, Milesight) and headless Linux SBCs (DHCP, NAT/port forwarding, subnet routing, and automated provisioning scripts).',
    ],
    highlights: ['Python, C++ & Bash', 'Azure IoT & MQTT', 'Cellular & LoRaWAN', 'DHCP, NAT & Routing'],
  },
  {
    years: 'September 2016 – May 2019',
    role: 'Regulatory Specialist',
    functionalTitle: 'Automation & Data Engineering',
    summary:
      'Designed automated data processing and document verification software while completing a B.S. in Computer Science at Oregon State University.',
    bullets: [
      'Engineered an automated Python and XML data aggregation and validation pipeline for federal U.S. EPA production reporting, saving hundreds of engineering hours annually.',
      'Built custom Python parsing and diffing tools to audit registered product labels against federal regulatory standards.',
    ],
    highlights: ['Python & XML Pipelines', 'Automated Auditing', 'U.S. EPA Compliance', 'B.S. Computer Science'],
  },
  {
    years: 'September 2014 – September 2016',
    role: 'Technical Services Chemist & Product Development Intern',
    functionalTitle: 'Laboratory Software & Computer Vision Automation',
    summary:
      'Developed standalone desktop and computer-vision software to automate laboratory image analysis and R&D workflows.',
    bullets: [
      'Built standalone Python (Tkinter) desktop applications and Java (ImageJ) computer-vision scripts to automate sample area/oil-level analysis and data entry, returning hundreds of hours per month to the R&D team.',
    ],
    highlights: ['Python (Tkinter)', 'Java (ImageJ)', 'Computer Vision', 'R&D Automation'],
  },
];

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <main className="min-h-screen w-full">
      {/* =====================================================================
          SECTION 1: DIRECT, CAPABILITY-FOCUSED INTRODUCTION & SNAPSHOT
      ===================================================================== */}
      <section
        aria-label="Introduction"
        className="w-full border-b border-stone-200/90 pt-10 sm:pt-16 pb-14 sm:pb-20"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Clear, Grounded Overview of Experience & Abilities */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200/75 text-zinc-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Memphis, TN &bull; Senior Embedded Systems, IoT &amp; Full-Stack Engineer</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 leading-[1.15]">
                  Alex Bernal
                  <span className="block text-zinc-600 font-bold text-xl sm:text-2xl mt-2 leading-snug">
                    Embedded Linux, Industrial IoT/OT Control Systems &amp; Full-Stack Software Engineering
                  </span>
                </h1>

                <div className="space-y-4 text-base text-zinc-700 leading-relaxed pt-1">
                  <p>
                    I am a software and systems engineer with{' '}
                    <strong className="text-zinc-900 font-semibold">7+ years of experience</strong>{' '}
                    designing and shipping production software that connects physical hardware to
                    the cloud, backed by{' '}
                    <strong className="text-zinc-900 font-semibold">12 years</strong> of total
                    engineering, automation, and R&amp;D tenure.
                  </p>
                  <p>
                    My work sits at the intersection of{' '}
                    <strong className="text-zinc-900 font-semibold">
                      headless Linux edge systems, closed-loop sensor-to-actuator control,
                      industrial field networking, and full-stack web applications
                    </strong>
                    —writing native C/C++ and Python daemons, integrating multi-vendor PLCs and
                    sensors over Modbus, OPC UA, and MQTT, configuring cellular and LoRaWAN
                    gateways, and building web-based configuration platforms deployed across{' '}
                    <strong className="text-zinc-900 font-semibold">
                      20+ countries on 6 continents
                    </strong>
                    .
                  </p>
                </div>
              </div>

              {/* Primary Action Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-sm">
                <Link
                  href="/resume"
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-sm transition inline-flex items-center gap-2"
                >
                  <span>View Printable Resume</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
                <a
                  href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/Alexander_Bernal_Resume.docx`}
                  download="Alexander_Bernal_Resume.docx"
                  className="card-editorial px-4 py-2.5 rounded-xl text-zinc-800 border border-stone-300 font-semibold hover:border-zinc-400"
                >
                  Download .DOCX &darr;
                </a>
                <a
                  href="mailto:me@alexanderbernal.dev"
                  className="card-editorial px-4 py-2.5 rounded-xl text-zinc-700 border border-stone-200 font-medium hover:border-blue-400 hover:text-blue-700"
                >
                  me@alexanderbernal.dev
                </a>
                <a
                  href="https://www.linkedin.com/in/bernaale/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-editorial px-4 py-2.5 rounded-xl text-zinc-700 border border-stone-200 font-medium hover:border-blue-400 hover:text-blue-700"
                >
                  LinkedIn ↗
                </a>
              </div>
            </div>

            {/* Right Column: "At a Glance" Summary Card */}
            <div className="lg:col-span-5">
              <div className="card-editorial rounded-2xl border border-stone-200/90 p-6 sm:p-7 space-y-5 bg-white">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3.5">
                  <div>
                    <h2 className="text-base font-bold text-zinc-900">Technical Profile</h2>
                    <p className="text-xs text-zinc-500">
                      Key areas of experience &amp; specialization
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-stone-100 text-zinc-700 font-mono text-xs font-semibold border border-stone-200">
                    7+ Yrs SWE/IoT &bull; 12 Yrs Total
                  </span>
                </div>

                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Target Domains
                    </dt>
                    <dd className="text-zinc-800 font-medium mt-0.5 leading-snug">
                      Embedded Linux &amp; IoT Fleets &bull; Industrial Control Systems (ICS/OT) &bull; Full-Stack &amp; Cloud Platforms
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Languages &amp; Frameworks
                    </dt>
                    <dd className="text-zinc-800 font-medium mt-0.5 leading-snug">
                      Python, C, C++, TypeScript, JavaScript, Bash, SQL, React, Next.js
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Protocols, Hardware &amp; Cloud
                    </dt>
                    <dd className="text-zinc-800 font-medium mt-0.5 leading-snug">
                      Modbus (TCP/RTU), OPC UA, MQTT, 4–20mA Analog &amp; Digital I/O, PLCs, Cellular/LoRaWAN Gateways, Azure IoT, Docker
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Education
                    </dt>
                    <dd className="text-zinc-800 mt-0.5 space-y-1 leading-snug">
                      <div>
                        <strong className="font-semibold text-zinc-900">
                          B.S., Computer Science
                        </strong>{' '}
                        &mdash; Oregon State University
                      </div>
                      <div>
                        <strong className="font-semibold text-zinc-900">
                          B.S., Chemistry &amp; B.S., Biology
                        </strong>{' '}
                        &mdash; University of Memphis{' '}
                        <span className="text-xs text-zinc-500">(NSF Research)</span>
                      </div>
                    </dd>
                  </div>
                </dl>

                <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-zinc-500">
                  <span>Memphis, TN</span>
                  <Link
                    href="/#experience"
                    className="font-semibold text-blue-700 hover:text-blue-900 transition"
                  >
                    Jump to experience &darr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 2: CORE TECHNICAL CAPABILITIES (WHAT RECRUITERS SCAN FOR)
      ===================================================================== */}
      <section
        aria-label="Core Technical Capabilities"
        className="w-full border-b border-stone-200/90 py-14 sm:py-20 bg-white"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Core Competencies
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                Areas of Technical Specialization
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                End-to-end engineering across Linux edge devices, industrial control networks, and
                cloud/web applications.
              </p>
            </div>
            <Link
              href="/resume"
              className="text-sm font-semibold text-blue-700 hover:text-blue-900 transition shrink-0"
            >
              View full resume &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CORE_CAPABILITIES.map((pillar) => (
              <div
                key={pillar.title}
                className="card-editorial rounded-2xl border border-stone-200/90 p-6 flex flex-col justify-between space-y-5 bg-warm-paper"
              >
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-blue-700">{pillar.subtitle}</div>
                  <h3 className="text-lg font-bold text-zinc-900 leading-snug">{pillar.title}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">{pillar.description}</p>
                </div>

                <div className="pt-4 border-t border-stone-200/80 flex flex-wrap gap-1.5">
                  {pillar.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white text-zinc-700 border border-stone-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 3: PROFESSIONAL EXPERIENCE & PROGRESSION
      ===================================================================== */}
      <section
        id="experience"
        aria-label="Professional Experience"
        className="w-full scroll-mt-16 border-b border-stone-200/90 py-14 sm:py-20"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-3xl space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Buckman &bull; Memphis, TN (2014 &ndash; Present)
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                Professional Experience &amp; Role Progression
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                12 years of progressive engineering roles across R&amp;D software automation, data
                engineering, Embedded Linux / IoT field systems, and global control architecture.
              </p>
            </div>
            <Link
              href="/resume"
              className="text-sm font-semibold text-blue-700 hover:text-blue-900 transition shrink-0"
            >
              Open printable version &rarr;
            </Link>
          </div>

          <div className="space-y-5">
            {EXPERIENCE_TIMELINE.map((item) => (
              <div
                key={item.role}
                className="card-editorial rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-7 space-y-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                      {item.role}{' '}
                      <span className="text-zinc-500 font-normal text-sm">
                        ({item.functionalTitle})
                      </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">{item.summary}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 font-mono text-xs text-zinc-700 font-semibold shrink-0">
                    {item.years}
                  </span>
                </div>

                <ul className="list-disc pl-5 space-y-1.5 text-sm text-zinc-700 leading-relaxed">
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {item.highlights.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-stone-100/90 text-zinc-700 border border-stone-200/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 4: INDEPENDENT HOBBY PROJECTS & INTERACTIVE SANDBOX
      ===================================================================== */}
      <section
        id="sandbox"
        aria-label="Personal Hobby Projects and Interactive Simulations"
        className="w-full scroll-mt-16 border-b border-stone-200/90 py-14 sm:py-20 bg-white"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-3xl space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Independent Personal Projects &bull; Unrelated to My Employer
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                Personal Sandbox &amp; Interactive Demos
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                Outside of work, I build interactive simulations and web apps to explore control
                theory, 3D kinematics math, and state synchronization. All demos below run at 60 FPS
                directly in your browser:
              </p>
            </div>

            <Link
              href="/demos"
              className="text-sm font-semibold px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-2xs transition shrink-0 self-start sm:self-auto"
            >
              Open Full Interactive Sandbox &rarr;
            </Link>
          </div>

          {/* Spotlight: Family Grocery Sync App */}
          <div className="card-editorial rounded-2xl border border-stone-200/90 bg-warm-paper p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <span>Full-Stack Web App &bull; Offline-First Cloud Sync</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900">
                Offline-First Family Grocery Sync App
              </h3>
              <p className="text-sm text-zinc-700 leading-relaxed">
                A collaborative household grocery web app designed to handle spotty cell reception in
                store aisles—using collision-resistant pairing codes, atomic Firestore
                subcollections, and optimistic local storage reconciliation so concurrent edits never
                overwrite each other.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                href="/posts/serverless-grocery-sync-architecture"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-zinc-900 border border-stone-300 text-sm font-semibold transition shadow-2xs"
              >
                <span>Read Architecture Notes</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* 4 Live 60 FPS Browser Simulations */}
          <DemoMiniPreviewGrid />
        </div>
      </section>

      {/* =====================================================================
          SECTION 5: TECHNICAL ARTICLES & PERSONAL NOTES
      ===================================================================== */}
      <section
        id="writing"
        aria-label="Personal Writing and Engineering Notes"
        className="w-full scroll-mt-16 py-14 sm:py-20"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Personal Notebook
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                Technical Writing &amp; Project Notes
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                Independent articles covering closed-loop PID control, 3D kinematics math, protocol
                state machines, and modern web development with tools like Google Antigravity.
              </p>
            </div>

            <Link
              href="/blog"
              className="text-sm font-semibold text-blue-700 hover:text-blue-900 transition shrink-0"
            >
              Browse all {allPostsData.length} articles &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {allPostsData.slice(0, 4).map((post) => (
              <article
                key={post.slug}
                className="card-editorial group relative rounded-2xl border border-stone-200/90 bg-white p-6 flex flex-col justify-between space-y-4 hover:border-blue-400"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-zinc-500 font-mono">
                    <span>{post.date}</span>
                    <span>{post.readingTimeMinutes} min read</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 group-hover:text-blue-700 transition leading-snug">
                    <Link href={`/posts/${post.slug}`} className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed line-clamp-2">
                    {post.description}
                  </p>
                </div>

                <div className="text-xs font-semibold text-blue-700 pt-2 border-t border-stone-100 inline-flex items-center gap-1">
                  Read article &rarr;
                </div>
              </article>
            ))}
          </div>

          {/* Closing Contact Callout */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mt-6">
            <div className="space-y-1.5 max-w-xl">
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900">
                Get in Touch
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Available for discussions regarding Embedded Linux, IoT/OT Systems, Control &amp;
                Automation, and Full-Stack Software Engineering roles.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="mailto:me@alexanderbernal.dev"
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold transition"
              >
                Email Alex &rarr;
              </a>
              <Link
                href="/resume"
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-zinc-900 border border-stone-200 text-sm font-semibold transition"
              >
                View Resume
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
