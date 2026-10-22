import type { Metadata } from 'next';
import Link from 'next/link';
import { PrintResumeButton } from '@/components/PrintResumeButton';

export const metadata: Metadata = {
  title: 'Resume | Alexander Bernal — Senior Embedded Systems, IoT & Full-Stack Software Engineer',
  description:
    'Resume of Alexander Bernal: Senior Embedded Systems, IoT/OT, Linux, and Full-Stack Software Engineer.',
};

const SKILL_GROUPS = [
  {
    category: 'Languages & Frameworks',
    skills: 'Python, C, C++, TypeScript, JavaScript, Bash, SQL, React, Next.js, Tailwind CSS',
  },
  {
    category: 'Embedded Linux, IoT & Edge Infrastructure',
    skills:
      'Embedded Linux (Ubuntu, background services/daemons), Azure IoT, Docker, Remote Over-the-Air (OTA) Fleet Upgrades, Headless Single-Board Computers (SBCs)',
  },
  {
    category: 'Field Networking, Segmentation & Connectivity',
    skills:
      'Cellular & LoRaWAN Gateways (Cradlepoint, Teltonika, MultiTech, Milesight), Embedded Modems & Wi-Fi, TCP/IP, Subnet Routing & Network Segmentation, DHCP, NAT / Port Forwarding',
  },
  {
    category: 'Industrial Control Systems (ICS/OT) & Hardware Protocols',
    skills:
      'Automated Closed-Loop Control (PID), Modbus (TCP/IP & RTU), OPC UA, MQTT, 4–20mA Analog & Digital I/O, PLCs, Multi-Vendor Sensor & Pump/Actuator Integration',
  },
  {
    category: 'Cloud, Full-Stack & Engineering Workflow',
    skills:
      'Rule-Based Configuration & Decision Engines, Firebase / Firestore, GitHub Actions (CI/CD), Azure DevOps, Git, AI-Augmented Development (Claude Code, Google Antigravity, GitHub Copilot, Gemini)',
  },
];

const EXPERIENCE = [
  {
    title: 'Digital Innovation Engineer',
    subtitle: 'Senior Embedded Systems, IoT & Full-Stack Engineer',
    period: 'March 2022 – Present',
    bullets: [
      {
        lead: 'Global IoT, ICS/OT & Automated Control Architecture',
        text: 'Lead end-to-end software architecture, Embedded Linux development, and network integration for automated industrial control systems across critical water treatment, chemical, and process manufacturing facilities—taking products from initial prototype to commercial deployment across 20+ countries on 6 continents.',
      },
      {
        lead: 'Self-Healing Device Reliability & Operational Continuity',
        text: 'Eliminated customer-visible downtime from third-party hardware freezes (which previously caused 20–40 minute outages) by engineering fault-tolerant communication state machines (Modbus TCP/RTU, OPC UA, MQTT) that automatically detect dropouts, quarantine bad sensor reads, and restore live device state upon reboot to ensure continuous operational resilience.',
      },
      {
        lead: 'Lightweight Edge Modernization (~50% Resource Reduction)',
        text: 'Cut edge device memory and storage usage by ~50% by replacing heavy Docker container runtimes with lightweight native C/C++ cloud services, and ported core software to support remote Embedded Linux OS upgrades across live field fleets without requiring on-site technician visits.',
      },
      {
        lead: 'Global Product Configuration Platform',
        text: 'Architected a web-based configuration and recommendation platform that translates complex engineering sizing rules from senior specialists into an automated, step-by-step tool—standardizing commercial system proposals worldwide and reducing manual configuration errors.',
      },
      {
        lead: 'AI-Accelerated Software Delivery',
        text: 'Established structured AI-assisted and agentic engineering workflows (Claude Code, Google Antigravity, GitHub Copilot, Gemini) paired with automated test verification and architectural guardrails to accelerate C/C++, Python, and TypeScript feature delivery, protocol debugging, and cross-platform refactoring.',
      },
    ],
  },
  {
    title: 'Associate Digital Innovation Engineer',
    subtitle: 'Embedded Linux & IoT Software Engineer',
    period: 'June 2019 – March 2022',
    bullets: [
      {
        lead: 'Secure Hardware-to-Cloud Telemetry Integration',
        text: 'Developed production Python, C++, and Bash background services on Linux edge devices to connect multi-vendor sensors, variable-rate pumps/actuators, and PLCs (OPC UA, Modbus, LoRa, Analog/Digital I/O), streaming real-time operational telemetry to Azure IoT via MQTT.',
      },
      {
        lead: 'Field Network Segmentation & Automated Provisioning',
        text: 'Designed segmented local and cellular/LoRa field networks across industrial routers (Cradlepoint, Teltonika, MultiTech, Milesight) and headless Linux devices—configuring subnet routing, DHCP, NAT/port forwarding, and automated provisioning scripts to cut hardware setup time and enable secure remote diagnostics in industrial facilities.',
      },
    ],
  },
  {
    title: 'Regulatory Specialist',
    subtitle: 'Automation & Data Engineering',
    period: 'September 2016 – May 2019',
    bullets: [
      {
        lead: 'Federal U.S. EPA Reporting Automation',
        text: 'Designed and deployed an automated Python and XML data pipeline to aggregate, validate, and generate federal U.S. Environmental Protection Agency (EPA) production reports—saving hundreds of engineering hours annually and eliminating manual spreadsheet errors.',
      },
      {
        lead: 'Automated Regulatory Compliance Auditing',
        text: 'Built custom Python document-parsing and diffing tools to audit registered product labels against federal regulatory standards, removing manual review bottlenecks while reducing compliance risk.',
      },
    ],
  },
  {
    title: 'Technical Services Chemist & Product Development Intern',
    period: 'September 2014 – September 2016',
    bullets: [
      {
        lead: 'Lab Software & Computer Vision Automation',
        text: 'Self-initiated and built standalone Python (Tkinter) desktop apps and Java (ImageJ) computer-vision scripts to automate image-based sample analysis and data entry—returning hundreds of hours per month to the R&D team and sparking transition into full-time software engineering.',
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
              download="Alexander_Bernal_Resume.docx"
              className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 text-sm font-semibold transition shadow-2xs"
            >
              Download .DOCX &darr;
            </a>
          </div>
        </div>

        {/* Traditional Physical Sheet of Paper with Black Ink */}
        <article className="bg-white text-black border border-neutral-300 shadow-[0_12px_40px_rgba(0,0,0,0.14)] px-7 sm:px-14 py-10 sm:py-14 space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Traditional Centered Black-Ink Resume Header */}
          <header className="border-b-2 border-black pb-4 text-center space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black uppercase">
              Alexander Bernal
            </h1>
            <p className="text-sm sm:text-base font-semibold text-neutral-900">
              Senior Embedded Systems, IoT &amp; Full-Stack Software Engineer
            </p>
            <div className="text-xs sm:text-sm text-neutral-900 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 pt-0.5">
              <span>Memphis, TN</span>
              <span>&bull;</span>
              <span>901-220-1510</span>
              <span>&bull;</span>
              <a
                href="mailto:me@alexanderbernal.dev"
                className="underline decoration-neutral-500 hover:text-black"
              >
                me@alexanderbernal.dev
              </a>
              <span>&bull;</span>
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
            </div>
          </header>

          {/* Professional Summary */}
          <section className="space-y-1.5">
            <h2 className="text-xs sm:text-sm font-bold tracking-wider text-black uppercase border-b border-black pb-1">
              Professional Summary
            </h2>
            <p className="text-xs sm:text-[13.5px] text-neutral-950 leading-relaxed text-justify">
              <strong>Senior Embedded Systems, IoT &amp; Full-Stack Software Engineer</strong> with{' '}
              <strong>7+ years</strong> of experience designing and shipping production software
              that connects physical hardware to the cloud—backed by <strong>12 years</strong> of
              total engineering, automation, and R&amp;D tenure. Proven track record leading
              end-to-end architecture for Linux-based edge devices,{' '}
              <strong>Operational Technology (OT) / automated control systems</strong>, and
              full-stack web platforms deployed across{' '}
              <strong>20+ countries on 6 continents</strong>. Known for building self-healing,
              resilient software that keeps mission-critical field equipment running reliably over
              unstable networks, and for combining <strong>C/C++, Python, and TypeScript</strong>{' '}
              with modern AI-assisted development workflows (
              <strong>Claude Code, Google Antigravity, GitHub Copilot, Gemini</strong>) to deliver
              high-reliability systems fast.
            </p>
          </section>

          {/* Technical Skills — Traditional Inline Black-Ink List */}
          <section className="space-y-1.5">
            <h2 className="text-xs sm:text-sm font-bold tracking-wider text-black uppercase border-b border-black pb-1">
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
          <section className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-black pb-1">
              <h2 className="text-xs sm:text-sm font-bold tracking-wider text-black uppercase">
                Professional Experience
              </h2>
              <span className="text-xs sm:text-[13px] font-bold text-black">
                Buckman &mdash; Memphis, TN (2014 – Present | 3 Promotions)
              </span>
            </div>

            <div className="space-y-4">
              {EXPERIENCE.map((role) => (
                <div key={role.title} className="space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm sm:text-[15px] font-bold text-black">
                      {role.title}
                      {role.subtitle && (
                        <span className="font-normal italic text-neutral-800 text-xs sm:text-[13.5px]">
                          {' '}
                          ({role.subtitle})
                        </span>
                      )}
                    </h3>
                    <span className="text-xs sm:text-[13px] font-semibold italic text-neutral-900">
                      {role.period}
                    </span>
                  </div>

                  <ul className="list-disc pl-5 space-y-1 text-xs sm:text-[13.5px] text-neutral-950 leading-relaxed">
                    {role.bullets.map((b) => (
                      <li key={b.lead}>
                        <strong className="font-bold text-black">{b.lead}:</strong> {b.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Selected Software & Engineering Projects */}
          <section className="space-y-2">
            <h2 className="text-xs sm:text-sm font-bold tracking-wider text-black uppercase border-b border-black pb-1">
              Selected Software &amp; Engineering Projects
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-[13.5px] text-neutral-950 leading-relaxed pt-0.5">
              <li>
                <strong className="font-bold text-black">
                  Personal Engineering Sandbox &amp; Hobby Simulators (
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
                Built an independent <strong>Next.js / TypeScript</strong> portfolio and hobby lab
                featuring real-time 60 FPS browser simulations—including a{' '}
                <strong>Closed-Loop PID Process Control Simulator</strong>{' '}
                <Link
                  href="/posts/closed-loop-pid-control-lab"
                  className="underline decoration-neutral-500 hover:text-black print:hidden"
                >
                  [Article]
                </Link>{' '}
                and a personal math exploration of <strong>3D 4-DOF Inverse Kinematics</strong>{' '}
                <Link
                  href="/posts/robotic-arm-inverse-kinematics"
                  className="underline decoration-neutral-500 hover:text-black print:hidden"
                >
                  [Article]
                </Link>
                —plus independent write-ups on state-machine design{' '}
                <Link
                  href="/posts/self-healing-fieldbus-state-machines"
                  className="underline decoration-neutral-500 hover:text-black print:hidden"
                >
                  [Article]
                </Link>{' '}
                and offline-first cloud sync.
              </li>
            </ul>
          </section>

          {/* Education */}
          <section className="space-y-2.5">
            <h2 className="text-xs sm:text-sm font-bold tracking-wider text-black uppercase border-b border-black pb-1">
              Education
            </h2>
            <div className="space-y-2.5 text-xs sm:text-[13.5px] text-neutral-950 pt-0.5">
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <strong className="font-bold text-black">Oregon State University</strong>{' '}
                    &mdash; <span className="font-semibold">B.S., Computer Science</span>
                  </div>
                  <span className="font-semibold italic text-neutral-900">2017 – 2019</span>
                </div>
                <p className="text-neutral-900 leading-relaxed mt-0.5">
                  Completed degree while working full-time; served as a{' '}
                  <strong>University Computer Science Tutor &amp; Grader</strong>, mentoring
                  students in <strong>C++</strong> object-oriented programming, data structures,
                  and debugging.
                </p>
              </div>

              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <strong className="font-bold text-black">University of Memphis</strong>{' '}
                    &mdash;{' '}
                    <span className="font-semibold">
                      B.S., Chemistry (ACS Certified) &amp; B.S., Biology
                    </span>
                  </div>
                  <span className="font-semibold italic text-neutral-900">2008 – 2014</span>
                </div>
                <p className="text-neutral-900 leading-relaxed mt-0.5">
                  <strong>NSF Computational Research:</strong> Awarded federal{' '}
                  <strong>National Science Foundation (NSF)</strong> research funding to model and
                  analyze molecular energy profiles on high-performance{' '}
                  <strong>Linux supercomputing clusters</strong>.
                </p>
              </div>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
