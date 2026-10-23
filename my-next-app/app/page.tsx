import Link from 'next/link';
import { DemoMiniPreviewGrid } from '@/components/DemoMiniPreview';
import { getSortedPostsData } from '@/lib/posts';

const CAREER_CHAPTERS = [
  {
    years: '2014 – 2016',
    chapter: 'Chapter 1 • The Spark at the Lab Bench',
    role: 'Technical Services Chemist & Product Development Intern',
    story:
      'I started my career in the R&D lab in Memphis. After watching colleagues spend hundreds of hours every month manually measuring oil-level samples and keying results into spreadsheets, I taught myself Python (Tkinter) and Java (ImageJ) computer vision to automate the analysis. Seeing software give my teammates their time back hooked me for good.',
    highlights: ['Python (Tkinter)', 'Java (ImageJ)', 'Computer Vision', 'Lab Automation'],
  },
  {
    years: '2016 – 2019',
    chapter: 'Chapter 2 • Automating Compliance & Night-School CS',
    role: 'Regulatory Specialist (Automation) & Oregon State B.S. CS',
    story:
      'While working full-time building Python and XML pipelines to automate federal U.S. EPA production reporting and audit registered product labels, I went back to school at night at Oregon State University to earn my second B.S. in Computer Science—and spent my spare hours tutoring fellow CS students in C++.',
    highlights: ['B.S. Computer Science', 'C++ Tutoring', 'U.S. EPA Data Pipelines', 'Python & XML'],
  },
  {
    years: '2019 – 2022',
    chapter: 'Chapter 3 • Stepping Into Embedded Linux & Field IoT',
    role: 'Associate Digital Innovation Engineer',
    story:
      'With my CS degree in hand, I moved into embedded and field IoT engineering—writing production Python, C++, and Bash services on headless Linux devices to connect industrial sensors, variable-rate pumps, and PLCs to Azure IoT over segmented cellular and LoRaWAN field networks.',
    highlights: ['Embedded Linux', 'Modbus & OPC UA', 'MQTT & Azure IoT', 'Cellular & LoRaWAN'],
  },
  {
    years: '2022 – Present',
    chapter: 'Chapter 4 • Leading Global Control & Full-Stack Architecture',
    role: 'Digital Innovation Engineer (Senior Embedded, IoT & Full-Stack)',
    story:
      'Today, I lead end-to-end software architecture for automated control systems across water treatment, chemical, and manufacturing facilities in 20+ countries. My focus spans self-healing field protocols, lightweight C/C++ edge services (~50% lower memory footprint), full-stack web configuration platforms, and AI-augmented development.',
    highlights: [
      '20+ Countries (6 Continents)',
      'Self-Healing State Machines',
      'C/C++, Python & TypeScript',
      'React / Next.js & Agentic AI',
    ],
  },
];

const ENGINEERING_PILLARS = [
  {
    title: 'Software Built for Imperfect Hardware',
    subtitle: 'Embedded Linux • ICS/OT • Field Networking',
    description:
      'In the real world, cellular links drop, serial lines pick up electrical noise, and third-party controllers reboot for 20–40 minutes without warning. I design Linux background services and protocol state machines that expect hardware to misbehave—quarantining bad reads and automatically restoring state upon reboot.',
    skills: [
      'Embedded Linux (Multi-Distro)',
      'C / C++ & Python',
      'Modbus (TCP/IP & RTU)',
      'OPC UA & MQTT',
      '4–20mA Analog & Digital I/O',
      'Cellular & LoRaWAN Gateways',
      'Subnet Routing, DHCP & NAT',
    ],
  },
  {
    title: 'Turning Complex Rules Into Simple Web Tools',
    subtitle: 'Full-Stack Web • Decision Engines • Cloud Sync',
    description:
      'Great engineering software should make life easier for the people using it. Whether I am translating senior specialists’ sizing rules into a step-by-step global configuration platform or building an offline-first web app, I care deeply about clean interfaces and reliable data synchronization.',
    skills: [
      'TypeScript & JavaScript',
      'React & Next.js',
      'Rule-Based Decision Engines',
      'Firebase / Firestore',
      'Offline-First State Sync',
      'SQL & Data Pipelines',
      'Tailwind CSS',
    ],
  },
  {
    title: 'Pragmatic, AI-Augmented Engineering',
    subtitle: 'Fleet Modernization • CI/CD • Agentic Workflows',
    description:
      'I pair traditional systems discipline—like replacing heavy Docker containers with native C/C++ daemons to cut edge memory usage by ~50%—with modern AI-assisted workflows and strict automated verification to ship reliable software across C/C++, Python, and TypeScript.',
    skills: [
      'Claude Code & Google Antigravity',
      'GitHub Copilot & Gemini',
      'Remote OTA Linux Upgrades',
      'Docker & Azure IoT',
      'GitHub Actions (CI/CD)',
      'Azure DevOps & Git',
    ],
  },
];

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <main className="min-h-screen w-full">
      {/* =====================================================================
          SECTION 1: WARM FIRST-PERSON INTRODUCTION & AT-A-GLANCE SNAPSHOT
      ===================================================================== */}
      <section
        aria-label="Introduction"
        className="w-full border-b border-stone-200/90 pt-10 sm:pt-16 pb-14 sm:pb-20"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Authentic First-Person Voice */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200/75 text-zinc-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Memphis, TN &bull; Senior Embedded Systems, IoT &amp; Full-Stack Engineer</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 leading-[1.15]">
                  Hi, I&apos;m Alex Bernal.
                  <span className="block text-zinc-600 font-bold text-2xl sm:text-3xl mt-2 leading-snug">
                    I build software that connects physical hardware to the cloud&mdash;and stays running when the real world gets messy.
                  </span>
                </h1>

                <div className="space-y-4 text-base text-zinc-700 leading-relaxed pt-1">
                  <p>
                    I took an unconventional path into software engineering. I started my career at
                    the chemistry lab bench, where I watched my teammates lose hundreds of hours to
                    repetitive manual sample measurements and spreadsheet bottlenecks. I taught
                    myself Python and computer vision to automate that busywork away—and fell so
                    completely in love with building software that I went back to school at{' '}
                    <strong className="text-zinc-900 font-semibold">
                      Oregon State University at night while working full-time
                    </strong>{' '}
                    to earn a second B.S. in Computer Science.
                  </p>
                  <p>
                    Over the past 12 years at Buckman (and three promotions along the way), I&apos;ve
                    grown from building standalone lab tools to leading global software architecture
                    for Linux-based edge devices, industrial control systems (ICS/OT), and full-stack
                    web platforms deployed across{' '}
                    <strong className="text-zinc-900 font-semibold">
                      20+ countries on 6 continents
                    </strong>
                    .
                  </p>
                </div>
              </div>

              {/* Primary Warm Action Row */}
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

            {/* Right Column: Warm "At a Glance" Summary Card */}
            <div className="lg:col-span-5">
              <div className="card-editorial rounded-2xl border border-stone-200/90 p-6 sm:p-7 space-y-5 bg-white">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3.5">
                  <div>
                    <h2 className="text-base font-bold text-zinc-900">At a Glance</h2>
                    <p className="text-xs text-zinc-500">
                      Quick summary for recruiters &amp; hiring teams
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-stone-100 text-zinc-700 font-mono text-xs font-semibold border border-stone-200">
                    12 Yrs Tenure
                  </span>
                </div>

                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Current Focus
                    </dt>
                    <dd className="text-zinc-800 font-medium mt-0.5 leading-snug">
                      Senior Embedded Linux, IoT/OT Control Systems &amp; Full-Stack Architecture
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Real-World Scale
                    </dt>
                    <dd className="text-zinc-800 font-medium mt-0.5 leading-snug">
                      Automated sensor-to-actuator control &amp; edge fleets deployed in{' '}
                      <strong className="text-zinc-900">20+ countries across 6 continents</strong>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Core Languages &amp; Stack
                    </dt>
                    <dd className="text-zinc-800 font-medium mt-0.5 leading-snug">
                      Python, C, C++, TypeScript, Bash, SQL, React / Next.js, Embedded Linux
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
                        &mdash; Oregon State University{' '}
                        <span className="text-xs text-zinc-500">(earned while working full-time)</span>
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
                  <span>Based in Memphis, TN</span>
                  <Link
                    href="/#story"
                    className="font-semibold text-blue-700 hover:text-blue-900 transition"
                  >
                    Read my career story &darr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 2: MY CAREER STORY (FROM LAB BENCH TO GLOBAL EDGE SYSTEMS)
      ===================================================================== */}
      <section
        id="story"
        aria-label="Career Journey"
        className="w-full scroll-mt-16 border-b border-stone-200/90 py-14 sm:py-20 bg-white"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="max-w-3xl space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              How I Got Here &bull; 2014 &ndash; Present
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
              From the Chemistry Lab Bench to Global Edge Systems
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              When someone sees 12 years at one company on a resume, there is a story behind it:
              every time I automated a bottleneck or learned a new discipline, I was trusted with a
              larger engineering problem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CAREER_CHAPTERS.map((item) => (
              <div
                key={item.years}
                className="rounded-2xl border border-stone-200/90 bg-warm-paper p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-blue-700">{item.chapter}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white border border-stone-200 font-mono text-zinc-600 font-semibold">
                      {item.years}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 leading-snug">
                    {item.role}
                  </h3>
                  <p className="text-sm text-zinc-700 leading-relaxed">{item.story}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-stone-200/80">
                  {item.highlights.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-white text-zinc-700 border border-stone-200"
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
          SECTION 3: HOW I APPROACH ENGINEERING & TECHNICAL DEPTH
      ===================================================================== */}
      <section
        aria-label="How I Approach Engineering"
        className="w-full border-b border-stone-200/90 py-14 sm:py-20"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                What I Bring to a Team
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                How I Approach Engineering
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                Bridging physical sensors and industrial networks with clean, maintainable web and
                cloud software.
              </p>
            </div>
            <Link
              href="/resume"
              className="text-sm font-semibold text-blue-700 hover:text-blue-900 transition shrink-0"
            >
              See full technical resume &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ENGINEERING_PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="card-editorial rounded-2xl border border-stone-200/90 p-6 flex flex-col justify-between space-y-5 bg-white"
              >
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-blue-700">{pillar.subtitle}</div>
                  <h3 className="text-lg font-bold text-zinc-900 leading-snug">{pillar.title}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">{pillar.description}</p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-1.5">
                  {pillar.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100/80 text-zinc-700 border border-stone-200/80"
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
          SECTION 4: WHAT I BUILD FOR FUN (INDEPENDENT HOBBY SANDBOX)
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
                Independent Hobby Projects &bull; Unrelated to My Employer
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                What I Build for Fun on Weekends
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                Outside of work, I love learning by building interactive things from scratch. Whether
                it&apos;s solving a household problem for my family or teaching myself 3D math in an
                HTML5 Canvas, here are a few personal projects you can try right in your browser:
              </p>
            </div>

            <Link
              href="/demos"
              className="text-sm font-semibold px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-2xs transition shrink-0 self-start sm:self-auto"
            >
              Open Full Interactive Sandbox &rarr;
            </Link>
          </div>

          {/* Relatable Human Project Spotlight: Family Grocery Sync App */}
          <div className="card-editorial rounded-2xl border border-stone-200/90 bg-warm-paper p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <span>Household Web App &bull; Offline-First Cloud Sync</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900">
                Why I Built an Offline-First Family Grocery App
              </h3>
              <p className="text-sm text-zinc-700 leading-relaxed">
                Anyone who has shopped with a partner in a grocery store with spotty cell service
                knows the frustration of checking off items that get lost or overwritten. I built a
                shared family grocery web app using collision-resistant room codes, atomic Firestore
                subcollections, and offline-first local storage—applying distributed-systems
                resilience to everyday life.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                href="/posts/serverless-grocery-sync-architecture"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-zinc-900 border border-stone-300 text-sm font-semibold transition shadow-2xs"
              >
                <span>Read How It Works</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* 4 Live 60 FPS Browser Simulations with "Why I Built It" Captions */}
          <DemoMiniPreviewGrid />
        </div>
      </section>

      {/* =====================================================================
          SECTION 5: PERSONAL WRITING & NOTES
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
                Recent Writing &amp; Hobby Notes
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                Independent articles exploring control theory, 3D kinematics math, state machines,
                and modern web development with tools like Google Antigravity.
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

          {/* Warm Closing Contact Callout */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mt-6">
            <div className="space-y-1.5 max-w-xl">
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900">
                Let&apos;s Connect
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Whether you&apos;re hiring for an Embedded Linux, IoT/OT, or Full-Stack role—or just
                want to chat about control systems and software architecture—I&apos;d love to hear
                from you.
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
