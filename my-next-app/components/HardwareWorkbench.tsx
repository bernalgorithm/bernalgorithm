'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiliconBreakthroughGame } from '@/components/SiliconBreakthroughGame';
import { PcbBirdGame } from '@/components/PcbBirdGame';

type ActiveModule = 'breakthrough' | 'pcbbird';

export function HardwareWorkbench() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('breakthrough');

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 shadow-2xl overflow-hidden">
      {/* Workbench Module Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 sm:px-6 py-4 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <span className="font-mono text-xs font-bold tracking-widest uppercase text-slate-300">
            INTERACTIVE HARDWARE WORKBENCH // 60FPS CANVAS ISR
          </span>
        </div>

        {/* Module Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Hardware Arcade Modules">
          <button
            role="tab"
            aria-selected={activeModule === 'breakthrough'}
            onClick={() => setActiveModule('breakthrough')}
            className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
              activeModule === 'breakthrough'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/50 shadow-sm'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span className="text-emerald-400">01</span>
            <span>SILICON BREAKTHROUGH</span>
            <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              BREAKOUT
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeModule === 'pcbbird'}
            onClick={() => setActiveModule('pcbbird')}
            className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
              activeModule === 'pcbbird'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/50 shadow-sm'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span className="text-cyan-400">02</span>
            <span>PCB BIRD RUNNER</span>
            <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
              SNAKE DRC
            </span>
          </button>
        </div>
      </div>

      {/* Active Telemetry Context Strip */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-950 border-b border-slate-900 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
        {activeModule === 'breakthrough' ? (
          <>
            <div>
              <span className="text-emerald-400 font-semibold">MODULE 01:</span> Boundary-scan JTAG Breakout — reflect signal pulses to desolder SMD passives &amp; 3-HP security fuses.
            </div>
            <Link
              href="/posts/silicon-breakthrough"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 font-semibold shrink-0"
            >
              Read Architecture Note &rarr;
            </Link>
          </>
        ) : (
          <>
            <div>
              <span className="text-cyan-400 font-semibold">MODULE 02:</span> FR4 Trace Runner — pilot an avian logic probe across copper traces while avoiding soldered IC packages.
            </div>
            <Link
              href="/posts/pcb-bird-runner"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-semibold shrink-0"
            >
              Read Architecture Note &rarr;
            </Link>
          </>
        )}
      </div>

      {/* Active Game Viewport (Only mounts active canvas to isolate keyboard listeners & 60fps loop) */}
      <div className="p-3 sm:p-5 bg-slate-950">
        {activeModule === 'breakthrough' ? <SiliconBreakthroughGame /> : <PcbBirdGame />}
      </div>
    </div>
  );
}
