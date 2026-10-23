import type { Metadata } from 'next';
import Link from 'next/link';
import { HardwareWorkbench } from '@/components/HardwareWorkbench';

export const metadata: Metadata = {
  title: 'Interactive Hobby Sandbox | Alex Bernal',
  description:
    'Independent 60 FPS browser simulations built for fun in TypeScript and HTML5 Canvas: Closed-Loop PID Control Simulator, 3D 4-DOF Inverse Kinematics Sandbox, Silicon Breakthrough, and Silicon Viral Worm.',
};

const DEMO_OVERVIEW = [
  {
    id: 'Hobby Project 01',
    title: 'Closed-Loop PID Control Simulator',
    type: 'Control Theory • 60Hz DSO',
    description:
      'In my day job, I work around automated control loops. I built this interactive 60Hz discrete-time PID simulator and digital oscilloscope so anyone can adjust Kp, Ki, and Kd gains, drag the setpoint, inject load surges, or trigger Autotune to visually feel how feedback control works.',
    postHref: '/posts/closed-loop-pid-control-lab',
    postLabel: 'Read PID Math & Anti-Windup Notes',
  },
  {
    id: 'Hobby Project 02',
    title: '3D 4-DOF Inverse Kinematics Sandbox',
    type: 'Math Exploration • 3D IK',
    description:
      'I don’t work in robotics professionally, but I’ve always been fascinated by how multi-jointed arms coordinate motion in 3D space. I built this 60Hz 4-DOF spatial manipulator from scratch on weekends to teach myself Damped Least Squares (Levenberg-Marquardt) Jacobian inverse kinematics.',
    postHref: '/posts/robotic-arm-inverse-kinematics',
    postLabel: 'Read 3D Jacobian IK Notes',
  },
  {
    id: 'Hobby Project 03',
    title: 'Silicon Breakthrough',
    type: '60 FPS Physics & Web Audio',
    description:
      'A circuit-board take on Breakout that separates high-frequency 60Hz collision kinematics (mutable refs) from low-frequency React UI state—mirroring the way embedded firmware separates fast timer interrupts from background display updates.',
    postHref: '/posts/silicon-breakthrough',
    postLabel: 'Read Render-Loop Notes',
  },
  {
    id: 'Hobby Project 04',
    title: 'Silicon Viral Worm',
    type: 'Canvas 2D State Machine',
    description:
      'A playful HTML5 Canvas arcade experiment with procedural Web Audio sound synthesis—navigate across 4-layer FR4 copper traces to patch hardware bugs while avoiding soldered IC packages.',
    postHref: '/posts/pcb-bird-runner',
    postLabel: 'Read Canvas Design Notes',
  },
];

export default function DemosPage() {
  return (
    <main className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
      {/* Warm, Personal Sandbox Header */}
      <header className="rounded-2xl bg-white border border-stone-200/90 p-6 sm:p-9 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            Independent Hobby Sandbox &bull; Unrelated to My Employer
          </span>
          <Link href="/" className="text-zinc-600 hover:text-zinc-900 transition">
            &larr; Back to Home
          </Link>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
          What I Build for Fun: Interactive Browser Sandbox
        </h1>

        <p className="text-base text-zinc-700 max-w-3xl leading-relaxed">
          Outside of work, I love learning by building interactive simulations from scratch in{' '}
          <strong className="text-zinc-900 font-semibold">TypeScript, React, and HTML5 Canvas</strong>.
          Every project below is an independent weekend exploration—from making PID control loops
          visual to teaching myself 3D inverse kinematics math.
        </p>
      </header>

      {/* Active Interactive Workbench */}
      <section aria-label="Interactive Simulator Workbench" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-zinc-900">
            Live 60 FPS Sandbox
          </h2>
          <span className="text-xs text-zinc-500">
            Click a tab below to switch between active simulations
          </span>
        </div>

        <HardwareWorkbench />
      </section>

      {/* Plain-English Guide to Why I Built Each Project */}
      <section className="space-y-5 pt-6 border-t border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">
            The Story Behind Each Hobby Project
          </h2>
          <p className="text-sm text-zinc-600 mt-1">
            Each interactive sandbox is paired with a personal note explaining why I built it and how the math works.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {DEMO_OVERVIEW.map((demo) => (
            <div
              key={demo.id}
              className="card-editorial rounded-2xl border border-stone-200/90 bg-white p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-700 font-bold">{demo.id}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-zinc-700 font-medium border border-stone-200">
                    {demo.type}
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-900">{demo.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {demo.description}
                </p>
              </div>

              <Link
                href={demo.postHref}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 transition pt-3 border-t border-stone-100 inline-flex items-center gap-1"
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
