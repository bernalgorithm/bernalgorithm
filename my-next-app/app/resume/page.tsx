import type { Metadata } from 'next';
import Link from 'next/link';
import { PrintResumeButton } from '@/components/PrintResumeButton';

export const metadata: Metadata = {
  title:
    'Resume | Alexander Bernal — Senior Embedded Linux, Industrial IoT (IIoT) & Full-Stack Software Engineer',
  description:
    'Resume of Alexander Bernal: Senior Embedded Linux, Industrial IoT (IIoT), ICS/OT Control Systems, and Full-Stack Software Engineer.',
};

const SKILL_GROUPS = [
  {
    category: 'Languages & Web Frameworks',
    skills:
      'C, C++ (Modern STL, OOP, Memory Management), Python, TypeScript, JavaScript (ES6+), Bash / Shell Scripting, SQL, React, Next.js, HTML5 Canvas, Tailwind CSS',
  },
  {
    category: 'Embedded Linux, Edge & IoT Infrastructure',
    skills:
      'Embedded Linux (Multi-Distro, Headless Single-Board Computers / SBCs), systemd Background Daemons, POSIX Sockets & Serial I/O, Remote Over-the-Air (OTA) OS & Fleet Upgrades, Azure IoT Hub, Docker, Edge-to-Cloud Telemetry',
  },
  {
    category: 'Industrial Control Systems (ICS/OT) & Hardware Protocols',
    skills:
      'Automated Closed-Loop PID Control, Modbus (TCP/IP & RS-485 RTU), OPC UA, MQTT, 4–20mA Analog Current Loops & Discrete Digital I/O, SCADA / PLC Integration, Multi-Vendor Sensors, Variable-Rate Pumps & Actuators, Finite State Machines (FSMs)',
  },
  {
    category: 'Field Networking, Segmentation & Connectivity',
    skills:
      'Industrial Cellular & LoRaWAN Gateways (Cradlepoint, Teltonika, MultiTech, Milesight), Embedded Modems & Wi-Fi, IT/OT Network Segmentation, TCP/IP, LAN/WAN Subnet Routing, DHCP, NAT / Port Forwarding, SSH & Secure Remote Diagnostics',
  },
  {
    category: 'Cloud, Full-Stack & Engineering Workflow',
    skills:
      'Rule-Based Configuration & Decision Engines, Firebase / Firestore, REST APIs, GitHub Actions (CI/CD), Azure DevOps, Git, Automated Verification & Protocol Simulation, AI-Augmented Engineering (Claude Code, Google Antigravity, GitHub Copilot, Gemini)',
  },
];

const EXPERIENCE = [
  {
    title: 'Senior Embedded Systems, IoT & Full-Stack Engineer',
    hrTitle: 'Digital Innovation Engineer — Buckman',
    period: 'March 2022 – Present',
    bullets: [
      {
        lead: 'Global Edge-to-Cloud, ICS/OT & Control Architecture',
        text: 'Lead end-to-end software architecture, headless Embedded Linux development, and industrial network integration for automated closed-loop control systems across critical water treatment, chemical, and process manufacturing facilities—guiding hardware-integrated products from initial prototype to commercial deployment across 20+ countries on 6 continents.',
      },
      {
        lead: 'Self-Healing OT Protocol State Machines',
        text: 'Eliminated manual on-site resets and nuisance alarm cascades caused by 20–40 minute third-party hardware watchdog freezes—engineering deterministic Modbus TCP/RTU, OPC UA, and MQTT finite state machines (FSMs) with bounded last-known-good telemetry quarantine, exponential backoff probing, and read-back verified register reconciliation for bumpless recovery.',
      },
      {
        lead: 'Native C/C++ Edge Modernization (~50% Footprint Reduction)',
        text: 'Cut edge device RAM and flash storage utilization by ~50% by re-architecting heavy Docker container runtimes into lightweight native C/C++ systemd daemons—extending hardware longevity on resource-constrained Linux SBCs and porting core services to support zero-touch remote Over-the-Air (OTA) Embedded Linux OS upgrades across live global fleets.',
      },
      {
        lead: 'Full-Stack Commercial Configuration & Sizing Platform',
        text: 'Architected a web-based configuration and recommendation platform (TypeScript, React) that codifies complex hydraulic, sensor, and chemical sizing rules from senior domain specialists into an automated step-by-step workflow—standardizing commercial system proposals worldwide and eliminating manual specification errors.',
      },
      {
        lead: 'Automated Verification & AI-Augmented Delivery',
        text: 'Established structured, spec-driven engineering workflows combining automated test verification, protocol fault-handling validation, and architectural guardrails with agentic AI tooling to accelerate C/C++, Python, and TypeScript feature delivery, fieldbus debugging, and cross-platform refactoring without regressions.',
      },
    ],
  },
  {
    title: 'Embedded Linux & IoT Software Engineer',
    hrTitle: 'Associate Digital Innovation Engineer — Buckman',
    period: 'June 2019 – March 2022',
    bullets: [
      {
        lead: 'Hardware-to-Cloud Telemetry & Closed-Loop Integration',
        text: 'Developed production Python, C++, and Bash background daemons on headless Linux edge devices to interface multi-vendor sensors, variable-rate dosing pumps/actuators, and PLCs (OPC UA, Modbus TCP/RS-485, LoRaWAN, 4–20mA Analog & Digital I/O), streaming real-time operational telemetry to Azure IoT Hub over MQTT.',
      },
      {
        lead: 'IT/OT Field Network Segmentation & Automated Provisioning',
        text: 'Architected segmented local and cellular/LoRaWAN field networks across industrial routers (Cradlepoint, Teltonika, MultiTech, Milesight) and headless Linux appliances—configuring LAN/WAN subnet routing, DHCP, NAT/port forwarding, and automated provisioning scripts to cut field commissioning time and enable secure SSH remote diagnostics.',
      },
    ],
  },
  {
    title: 'Data & Compliance Automation Engineer',
    hrTitle: 'Regulatory Specialist — Buckman',
    period: 'September 2016 – May 2019',
    bullets: [
      {
        lead: 'Federal U.S. EPA Data Pipeline Automation',
        text: 'Designed and deployed an automated Python and XML ETL validation pipeline to aggregate, verify, and generate federal U.S. Environmental Protection Agency (EPA) chemical production reports—saving hundreds of engineering hours annually and eliminating manual spreadsheet errors.',
      },
      {
        lead: 'Automated Regulatory Document Auditing',
        text: 'Built custom Python document-parsing and semantic-diffing tools to audit registered product labels against federal regulatory standards, removing manual review bottlenecks while reducing compliance risk.',
      },
    ],
  },
  {
    title: 'R&D Lab Automation Developer & Chemist',
    hrTitle: 'Technical Services Chemist & Intern — Buckman',
    period: 'September 2014 – September 2016',
    bullets: [
      {
        lead: 'Computer Vision & Lab Desktop Automation',
        text: 'Self-initiated and built standalone Python (Tkinter) desktop applications and Java (ImageJ) computer-vision pipelines to automate quantitative sample image analysis and data entry—returning hundreds of R&D hours per month and sparking transition into full-time software engineering.',
      },
    ],
  },
];

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-neutral-200/80 py-8 sm:py-12 px-3 sm:px-6 print:bg-white print:p-0">
      <main className="max-w-[850px] mx-auto space-y-5">
        {/* Top Action Bar above the paper sheet (hidden when printing) */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            href="/"
            className="text-sm font-semibold text-neutral-700 hover:text-black transition inline-flex items-center gap-1.5"
          >
            &larr; Back to Portfolio
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <PrintResumeButton />
            <a
              href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/Alexander_Bernal_Resume.docx`}
              download="Alexander_Bernal_Senior_Software_Engineer.docx"
              className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 text-sm font-semibold transition shadow-2xs"
            >
              Download .DOCX &darr;
            </a>
          </div>
        </div>

        {/* Traditional Physical Sheet of Paper with Black Ink */}
        <article className="bg-white text-black border border-neutral-300 shadow-[0_12px_40px_rgba(0,0,0,0.14)] px-7 sm:px-14 py-10 sm:py-14 space-y-5 print:border-none print:shadow-none print:p-0">
          {/* Traditional Centered Black-Ink Resume Header */}
          <header className="border-b-2 border-black pb-3.5 text-center space-y-1 break-inside-avoid">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black uppercase">
              Alexander Bernal
            </h1>
            <p className="text-sm sm:text-base font-semibold text-neutral-900">
              Senior Embedded Linux, Industrial IoT (IIoT) &amp; Full-Stack Software Engineer
            </p>
            <div className="text-xs sm:text-[13px] text-neutral-900 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 pt-0.5">
              <span>Memphis, TN (Open to Remote)</span>
              <span>&bull;</span>
              <span>901-220-1510</span>
              <span>&bull;</span>
              <a
                href="mailto:me@alexanderbernal.dev"
                className="underline decoration-neutral-500 hover:text-black"
              >
                me@alexanderbernal.dev
              </a>
            </div>
            <div className="text-xs sm:text-[13px] text-neutral-900 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
              <a
                href="https://www.linkedin.com/in/bernaale/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-neutral-500 hover:text-black"
              >
                linkedin.com/in/bernaale
              </a>
              <span>&bull;</span>
              <a
                href="https://github.com/bernalgorithm"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-neutral-500 hover:text-black"
              >
                github.com/bernalgorithm
              </a>
              <span>&bull;</span>
              <a
                href="https://bernalgorithm.github.io/bernalgorithm"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-neutral-500 hover:text-black"
              >
                bernalgorithm.github.io/bernalgorithm
              </a>
            </div>
          </header>

          {/* Professional Summary */}
          <section className="space-y-1.5 break-inside-avoid">
            <h2 className="text-xs sm:text-sm font-bold tracking-wider text-black uppercase border-b border-black pb-1 break-after-avoid">
              Professional Summary
            </h2>
            <p className="text-xs sm:text-[13.5px] text-neutral-950 leading-relaxed text-left">
              <strong>
                Senior Embedded Systems, Industrial IoT (IIoT) &amp; Full-Stack Software Engineer
              </strong>{' '}
              with <strong>7+ years</strong> of production software engineering experience
              connecting physical hardware to the cloud—backed by <strong>12 years</strong> of
              progressive engineering, R&amp;D, and industrial automation tenure (
              <strong>3 internal promotions</strong>). Proven technical lead owning end-to-end
              architecture for headless <strong>Embedded Linux</strong> edge devices,{' '}
              <strong>Operational Technology (OT) / Industrial Control Systems (ICS)</strong>,
              segmented cellular/LoRaWAN field networks, and <strong>TypeScript/React</strong> web
              platforms deployed across <strong>20+ countries on 6 continents</strong>. Specializes
              in <strong>C, C++, Python, and TypeScript</strong> systems engineered for demanding
              real-world environments—building deterministic, self-healing communication state
              machines and low-footprint native daemons that keep mission-critical equipment running
              autonomously over unstable networks.
            </p>
          </section>

          {/* Technical Skills — Traditional Inline Black-Ink List */}
          <section className="space-y-1.5 break-inside-avoid">
            <h2 className="text-xs sm:text-sm font-bold tracking-wider text-black uppercase border-b border-black pb-1 break-after-avoid">
              Technical Skills
            </h2>
            <ul className="space-y-1 text-xs sm:text-[13.5px] text-neutral-950 leading-snug pt-0.5">
              {SKILL_GROUPS.map((group) => (
                <li key={group.category}>
                  <strong className="font-bold text-black">{group.category}:</strong>{' '}
                  <span>{group.skills}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Professional Experience */}
          <section className="space-y-3.5">
            <div className="space-y-1 break-after-avoid">
              <h2 className="text-xs sm:text-sm font-bold tracking-wider text-black uppercase border-b border-black pb-1">
                Professional Experience
              </h2>
              <div className="flex flex-wrap items-baseline justify-between gap-2 pt-0.5 border-b border-neutral-300 pb-1">
                <div className="text-xs sm:text-[13.5px] font-bold text-black">
                  BUCKMAN &mdash;{' '}
                  <span className="font-semibold">
                    Memphis, TN | 12-Year Progressive Tenure (3 Internal Promotions)
                  </span>
                </div>
                <span className="text-xs sm:text-[13px] font-bold text-neutral-900">
                  September 2014 – Present
                </span>
              </div>
            </div>

            <div className="space-y-3.5">
              {EXPERIENCE.map((role) => (
                <div key={role.title} className="space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 break-after-avoid">
                    <h3 className="text-sm sm:text-[14.5px] font-bold text-black">
                      {role.title}{' '}
                      <span className="font-normal italic text-neutral-800 text-xs sm:text-[13px]">
                        ({role.hrTitle})
                      </span>
                    </h3>
                    <span className="text-xs sm:text-[13px] font-semibold text-neutral-900 shrink-0">
                      {role.period}
                    </span>
                  </div>

                  <ul className="list-disc pl-5 space-y-1 text-xs sm:text-[13.5px] text-neutral-950 leading-relaxed">
                    {role.bullets.map((b) => (
                      <li key={b.lead} className="break-inside-avoid">
                        <strong className="font-bold text-black">{b.lead}:</strong> {b.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Engineering Projects */}
          <section className="space-y-2 break-inside-avoid">
            <h2 className="text-xs sm:text-sm font-bold tracking-wider text-black uppercase border-b border-black pb-1 break-after-avoid">
              Engineering Projects
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-[13.5px] text-neutral-950 leading-relaxed pt-0.5">
              <li className="break-inside-avoid">
                <strong className="font-bold text-black">
                  Interactive Control Systems &amp; Simulation Lab (
                  <a
                    href="https://bernalgorithm.github.io/bernalgorithm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-neutral-500 hover:text-black"
                  >
                    bernalgorithm.github.io/bernalgorithm
                  </a>
                  ):
                </strong>{' '}
                <Link
                  href="/demos"
                  className="underline decoration-neutral-500 hover:text-black font-semibold print:hidden"
                >
                  [Live Demos]
                </Link>{' '}
                Engineered an independent <strong>Next.js / TypeScript</strong> simulation workbench
                featuring real-time 60 Hz browser simulations—including a discrete-time{' '}
                <strong>
                  Closed-Loop PID Process Control &amp; Digital Storage Oscilloscope Simulator
                </strong>{' '}
                (conditional integral anti-windup, EMA derivative filtering, load-surge injection){' '}
                <Link
                  href="/posts/closed-loop-pid-control-lab"
                  className="underline decoration-neutral-500 hover:text-black print:hidden"
                >
                  [Article]
                </Link>{' '}
                and an independent mathematical exploration of{' '}
                <strong>3D 4-DOF Inverse Kinematics (Jacobian Damped Least Squares)</strong>{' '}
                <Link
                  href="/posts/robotic-arm-inverse-kinematics"
                  className="underline decoration-neutral-500 hover:text-black print:hidden"
                >
                  [Article]
                </Link>
                —plus architecture articles on self-healing fieldbus state reconciliation{' '}
                <Link
                  href="/posts/self-healing-fieldbus-state-machines"
                  className="underline decoration-neutral-500 hover:text-black print:hidden"
                >
                  [Article]
                </Link>
                .
              </li>
              <li className="break-inside-avoid">
                <strong className="font-bold text-black">
                  Offline-First Collaborative Cloud Sync Application:
                </strong>{' '}
                Architected a multi-tenant <strong>TypeScript, React, and Firebase/Firestore</strong>{' '}
                Progressive Web App engineered for intermittent cellular connectivity—implementing
                collision-resistant pairing codes, isolated Firestore subcollections, and optimistic
                local-storage state reconciliation so concurrent client edits never clobber state{' '}
                <Link
                  href="/posts/serverless-grocery-sync-architecture"
                  className="underline decoration-neutral-500 hover:text-black print:hidden"
                >
                  [Article]
                </Link>
                .
              </li>
            </ul>
          </section>

          {/* Education */}
          <section className="space-y-2.5 break-inside-avoid">
            <h2 className="text-xs sm:text-sm font-bold tracking-wider text-black uppercase border-b border-black pb-1 break-after-avoid">
              Education
            </h2>
            <div className="space-y-2.5 text-xs sm:text-[13.5px] text-neutral-950 pt-0.5">
              <div className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <strong className="font-bold text-black">Oregon State University</strong>{' '}
                    &mdash; <span className="font-semibold">B.S., Computer Science</span>
                  </div>
                  <span className="font-semibold text-neutral-900">2017 – 2019</span>
                </div>
                <p className="text-neutral-900 leading-relaxed mt-0.5">
                  Completed degree while working full-time; served as a{' '}
                  <strong>University Computer Science Tutor &amp; Grader</strong>, mentoring
                  undergraduates in <strong>C++</strong> object-oriented programming, data
                  structures, memory management, and debugging.
                </p>
              </div>

              <div className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <strong className="font-bold text-black">University of Memphis</strong> &mdash;{' '}
                    <span className="font-semibold">
                      B.S., Chemistry (ACS Certified) &amp; B.S., Biology
                    </span>
                  </div>
                  <span className="font-semibold text-neutral-900">2008 – 2014</span>
                </div>
                <p className="text-neutral-900 leading-relaxed mt-0.5">
                  <strong>NSF High-Performance Computing (HPC) Research:</strong> Awarded federal{' '}
                  <strong>National Science Foundation (NSF)</strong> research funding to model and
                  analyze molecular energy profiles on <strong>Linux supercomputing clusters</strong>
                  .
                </p>
              </div>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
