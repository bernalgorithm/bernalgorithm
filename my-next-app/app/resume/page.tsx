import type { Metadata } from 'next';
import Link from 'next/link';
import { PrintResumeButton } from '@/components/PrintResumeButton';

export const metadata: Metadata = {
  title: 'Resume | Alexander Bernal — Cyber-Physical Systems, IoT, Robotics & Full-Stack Engineer',
  description:
    'Resume of Alexander Bernal: Senior Cyber-Physical Systems, Embedded Linux, IoT, Robotics/Closed-Loop Control, and AI-Augmented Full-Stack Software Engineer.',
};

const SKILL_GROUPS = [
  {
    category: 'Systems Architecture & Languages',
    skills:
      'Cyber-Physical & Distributed Systems, Python, C, C++, Bash, TypeScript, JavaScript, SQL',
  },
  {
    category: 'Linux Fleets, Networking & Edge Infrastructure',
    skills:
      'Embedded Linux (Ubuntu / User-Space Daemons), Out-of-Band Cellular & LoRa Gateways (Cradlepoint, Teltonika, MultiTech, Milesight), DHCP, NAT / Port Forwarding & Subnet Routing, LoRa / LoRaWAN, Azure IoT, Docker, Remote OTA Fleet Upgrades',
  },
  {
    category: 'Robotics Kinematics, Closed-Loop Control & Telemetry',
    skills:
      'Jacobian Inverse Kinematics & Trajectory Planning, Closed-Loop Actuator / PID Control, Self-Healing Protocol State Machines, OPC UA, Modbus (TCP/IP & RTU — BMS/Cooling/Industrial), MQTT, 4–20mA Analog & Digital I/O, PLCs & Hardware Interlocks',
  },
  {
    category: 'Full-Stack, Cloud & Agentic AI Engineering',
    skills:
      'React, Next.js & TypeScript, Rule-Based Decision Engines, Offline-First Cloud Sync (Firebase), Claude Code & Google Antigravity (agy), GitHub Copilot & Gemini, Context Architecture (CLAUDE.md / AGENTS.md), GitHub Actions (CI/CD)',
  },
];

const EXPERIENCE = [
  {
    title: 'Digital Innovation Engineer',
    period: 'March 2022 – Present',
    bullets: [
      {
        lead: 'Global Cyber-Physical & Closed-Loop Architecture',
        text: 'Lead the end-to-end systems architecture, Embedded Linux software design, and network integration for automated cyber-physical control systems—orchestrating real-time closed-loop sensor-to-actuator regulation from concept through global commercial deployment across 20+ countries spanning 6 continents.',
      },
      {
        lead: 'Self-Healing Telemetry & Hardware Fault Tolerance',
        text: 'Engineered fault-tolerant Modbus (TCP/IP & RTU), OPC UA, and MQTT communication state machines with automated session recovery and volatile register reconciliation to mask unannounced 20–40 minute hardware resets on third-party controllers—guaranteeing continuous closed-loop operation with zero customer-visible downtime.',
      },
      {
        lead: 'Enterprise SME Knowledge Digitization',
        text: 'Architected a guided technical configuration and decision-support platform that codifies Subject Matter Expert (SME) domain heuristics into a deterministic recommendation engine—automating complex system and hardware selection across global commercial operations.',
      },
      {
        lead: 'AI-Augmented Systems Engineering',
        text: 'Pioneered AI-assisted and agentic development workflows (GitHub Copilot, Claude Code, Google Antigravity, declarative CLAUDE.md / AGENTS.md context guardrails, and automated diagnostic tooling) to translate system architecture into verified C/C++, Python, and TypeScript implementations while accelerating protocol debugging and cross-OS refactoring.',
      },
      {
        lead: 'Linux Fleet Modernization & Runtime Optimization',
        text: 'Ported and compiled core C/C++ edge software to support remote in-field Embedded Linux LTS distribution upgrades, while replacing heavy containerized edge runtimes with lightweight native cloud SDK daemons (cutting deployment memory/flash footprint by ~50%).',
      },
    ],
  },
  {
    title: 'Associate Digital Innovation Engineer',
    period: 'June 2019 – March 2022',
    bullets: [
      {
        lead: 'Multi-Protocol Sensor & Actuator Integration',
        text: 'Developed production edge software and Python/Bash/C++ daemons to integrate multi-vendor sensors, variable-rate actuators/pumps, and PLCs across OPC UA, Modbus (TCP/IP & RTU), LoRa, and analog/digital I/O networks, routing real-time telemetry to Azure IoT via MQTT.',
      },
      {
        lead: 'Edge Networking, Out-of-Band Cellular & LoRa Backhaul',
        text: 'Designed and configured multi-device field networks across dedicated cellular and LoRa gateways (Cradlepoint, Teltonika, MultiTech, Milesight) as well as onboard embedded cellular modems and Wi-Fi interfaces on headless Linux SBCs—configuring DHCP servers, NAT / port-forwarding rules, and automated Linux provisioning scripts to streamline global hardware bring-up and remote diagnostics.',
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
        text: 'Self-initiated and deployed standalone Python (Tkinter) desktop applications and Java (ImageJ) computer-vision scripts to automate sample area/oil-level analysis and data entry, returning hundreds of laboratory hours per month to the R&D team.',
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
              Senior Cyber-Physical Systems, Embedded Linux, IoT &amp; Full-Stack Engineer
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
              Senior Cyber-Physical Systems, Embedded Linux, and IoT Engineer with 7+ years of
              experience architecting fault-tolerant edge software, distributed Linux fleets,
              closed-loop sensor-to-actuator control systems, and full-stack digitization
              platforms deployed across <strong>20+ countries spanning 6 continents</strong> (12
              years total R&amp;D, automation, and software tenure). Proven track record bridging
              physical hardware—sensors, variable-rate actuators, and facility/industrial
              fieldbuses (Modbus, OPC UA, MQTT)—with cloud infrastructure and modern web
              platforms, directly applicable to{' '}
              <strong>
                connected IoT ecosystems, robotics &amp; autonomous systems, and mission-critical
                data center / facility automation
              </strong>
              . Leverages AI-augmented workflows (
              <strong>Claude Code, Google Antigravity, GitHub Copilot, Gemini</strong>) with
              strict architectural guardrails to deliver production systems across C/C++, Python,
              Bash, and TypeScript.
            </p>
          </section>

          {/* Technical Skills — Traditional Inline Black-Ink List */}
          <section className="space-y-1.5">
            <h2 className="text-xs sm:text-sm font-bold tracking-wider text-black uppercase border-b border-black pb-1">
              Technical Skills &amp; Protocols
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
                Buckman &mdash; Memphis, TN (2014 – Present)
              </span>
            </div>

            <div className="space-y-4">
              {EXPERIENCE.map((role) => (
                <div key={role.title} className="space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm sm:text-[15px] font-bold text-black">
                      {role.title}
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

          {/* Selected Engineering Projects */}
          <section className="space-y-2">
            <h2 className="text-xs sm:text-sm font-bold tracking-wider text-black uppercase border-b border-black pb-1">
              Selected Engineering Simulators &amp; Architecture Case Studies
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-[13.5px] text-neutral-950 leading-relaxed pt-0.5">
              <li>
                <strong className="font-bold text-black">
                  4-DOF 3D Robotic Arm Inverse Kinematics &amp; Trajectory Planner:
                </strong>{' '}
                Engineered a 60Hz 4-DOF 3D spatial manipulator simulator solved via Damped Least
                Squares (Levenberg-Marquardt) Jacobian inverse kinematics, 2nd-order servo
                compliance dynamics, and quintic minimum-jerk trajectory generation.{' '}
                <Link
                  href="/posts/robotic-arm-inverse-kinematics"
                  className="underline decoration-neutral-500 hover:text-black print:hidden"
                >
                  [Read Case Study]
                </Link>
              </li>
              <li>
                <strong className="font-bold text-black">
                  Closed-Loop PID Control Lab &amp; Digital Storage Oscilloscope:
                </strong>{' '}
                Engineered a real-time 60 FPS discrete-time PID control simulator regulating a
                2nd-order thermal/flow plant with conditional anti-windup clamping, derivative
                filtering, and critical-damping Autotune.{' '}
                <Link
                  href="/posts/closed-loop-pid-control-lab"
                  className="underline decoration-neutral-500 hover:text-black print:hidden"
                >
                  [Read Case Study]
                </Link>
              </li>
              <li>
                <strong className="font-bold text-black">
                  Self-Healing Fieldbus State Machines &amp; Offline-First Cloud Sync:
                </strong>{' '}
                Documented production patterns for masking 20–40 minute hardware resets via
                bounded Last-Known-Good quarantine and volatile register reconciliation, alongside
                collision-resistant multi-tenant cloud state synchronization.{' '}
                <Link
                  href="/posts/self-healing-fieldbus-state-machines"
                  className="underline decoration-neutral-500 hover:text-black print:hidden"
                >
                  [Read Case Study]
                </Link>
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
                  Served as a university tutor and grader for Computer Science coursework, guiding
                  students through object-oriented programming implementations and debugging in C++.
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
                  Awarded National Science Foundation (NSF) computational chemistry funding;
                  utilized Linux supercomputing clusters to model energetic profiles of
                  metallo-organic molecules.
                </p>
              </div>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
