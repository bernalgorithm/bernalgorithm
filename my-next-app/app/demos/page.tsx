import type { Metadata } from 'next';
import Link from 'next/link';
import { HardwareWorkbench } from '@/components/HardwareWorkbench';

export const metadata: Metadata = {
  title: 'Interactive Technical Demos | Alexander Bernal',
  description:
    'Live 60 FPS browser simulations built in TypeScript and HTML5 Canvas: 4-DOF 3D Spatial Robotic Arm Inverse Kinematics Lab, Closed-Loop PID Control Simulator, Silicon Breakthrough, and Silicon Viral Worm.',
};

const DEMO_OVERVIEW = [
  {
    id: 'Simulator 1',
    title: '4-DOF 3D Spatial Robotic Arm Inverse Kinematics Lab',
    type: 'Hobby Math Exploration • 3D IK',
    description:
      'Built out of personal interest in robotics mathematics: a 60Hz 4-DOF 3D spatial manipulator solved via Damped Least Squares (Levenberg-Marquardt) Jacobian inverse kinematics and 2nd-order servo compliance.',
    postHref: '/posts/robotic-arm-inverse-kinematics',
    postLabel: 'Read 3D Jacobian IK & Trajectory Math Article',
  },
  {
    id: 'Simulator 2',
    title: 'Closed-Loop PID Control Simulator',
    type: 'Control Theory • 60Hz DSO',
    description:
      'An independent educational simulator modeling a 60Hz discrete-time Proportional-Integral-Derivative (PID) loop regulating a 2nd-order thermal/flow plant. Adjust Kp, Ki, and Kd gains, drag the setpoint, or trigger Autotune.',
    postHref: '/posts/closed-loop-pid-control-lab',
    postLabel: 'Read PID Math & Anti-Windup Article',
  },
  {
    id: 'Simulator 3',
    title: 'Silicon Breakthrough',
    type: '60 FPS Physics & Web Audio',
    description:
      'A boundary-scan hardware take on Breakout. Separates high-frequency 60Hz collision kinematics (mutable refs) from low-frequency React HUD state—mirroring bare-metal timer ISR architecture.',
    postHref: '/posts/silicon-breakthrough',
    postLabel: 'Read ISR Render Loop Note',
  },
  {
    id: 'Simulator 4',
    title: 'Silicon Viral Worm',
    type: 'Canvas 2D State Machine',
    description:
      'Pilot a polymorphic digital viral worm across a 4-layer FR4 circuit board—injecting zero-day patches into hardware bugs while evading soldered QFP/DIP IC packages.',
    postHref: '/posts/pcb-bird-runner',
    postLabel: 'Read Canvas Architecture Note',
  },
];

export default function DemosPage() {
  return (
    <main className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
      {/* Dark Hardware Instrument Header (Section 02 Identity) */}
      <header className="rounded-3xl bg-slate-900 text-white border border-slate-800 p-6 sm:p-9 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 font-mono uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Section 02 // Interactive 60 FPS Simulator Lab
          </span>
          <Link href="/" className="text-slate-300 hover:text-sky-300 transition">
            &larr; Back to Overview
          </Link>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Interactive Hobby Simulators &amp; Demos
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
          Independent, self-contained 60 FPS browser simulations built for fun in{' '}
          <strong className="text-sky-300 font-semibold">TypeScript, React, and HTML5 Canvas</strong>{' '}
          to explore personal interests in 3D inverse kinematics math, discrete-time PID control theory,
          and arcade state machines. All simulations are personal hobby projects unrelated to my employer.
        </p>
      </header>

      {/* Active Interactive Workbench */}
      <section aria-label="Interactive Simulator Workbench" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900">
            Live Simulator Workbench
          </h2>
          <span className="text-xs text-slate-500">
            Select a tab below to switch between active simulations
          </span>
        </div>

        <HardwareWorkbench />
      </section>

      {/* Plain-English Guide to What Each Demo Proves */}
      <section className="space-y-5 pt-6 border-t border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            What These Simulators Demonstrate
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Each interactive module is paired with a technical article explaining the underlying mathematics and software architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {DEMO_OVERVIEW.map((demo) => (
            <div
              key={demo.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-600 font-bold">{demo.id}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                    {demo.type}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{demo.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {demo.description}
                </p>
              </div>

              <Link
                href={demo.postHref}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition pt-3 border-t border-slate-100 inline-flex items-center gap-1"
              >
                {demo.postLabel} &rarr;
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
