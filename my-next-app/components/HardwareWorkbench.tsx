'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RoboticArmIkLab } from '@/components/RoboticArmIkLab';
import { PidControlLab } from '@/components/PidControlLab';
import { SiliconBreakthroughGame } from '@/components/SiliconBreakthroughGame';
import { PcbBirdGame } from '@/components/PcbBirdGame';

type ActiveModule = 'roboticarm' | 'pidlab' | 'breakthrough' | 'pcbbird';

export function HardwareWorkbench() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('roboticarm');

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const sim = params.get('sim');
      if (sim === 'roboticarm' || sim === 'pidlab' || sim === 'breakthrough' || sim === 'pcbbird') {
        setActiveModule(sim);
      }
    };
    queueMicrotask(syncFromUrl);
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Clean Light Module Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span>Interactive Engineering Simulators</span>
        </div>

        {/* Segmented Control Switcher */}
        <div
          className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-200/75 border border-slate-200"
          role="tablist"
          aria-label="Interactive Engineering Modules"
        >
          <button
            role="tab"
            aria-selected={activeModule === 'roboticarm'}
            onClick={() => setActiveModule('roboticarm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeModule === 'roboticarm'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 border border-transparent'
            }`}
          >
            1. 3D Robotic Arm IK (4-DOF)
          </button>

          <button
            role="tab"
            aria-selected={activeModule === 'pidlab'}
            onClick={() => setActiveModule('pidlab')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeModule === 'pidlab'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 border border-transparent'
            }`}
          >
            2. Closed-Loop PID Lab
          </button>

          <button
            role="tab"
            aria-selected={activeModule === 'breakthrough'}
            onClick={() => setActiveModule('breakthrough')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeModule === 'breakthrough'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 border border-transparent'
            }`}
          >
            3. Silicon Breakthrough
          </button>

          <button
            role="tab"
            aria-selected={activeModule === 'pcbbird'}
            onClick={() => setActiveModule('pcbbird')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeModule === 'pcbbird'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 border border-transparent'
            }`}
          >
            4. Silicon Viral Worm
          </button>
        </div>
      </div>

      {/* Context Description Banner */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        {activeModule === 'roboticarm' && (
          <>
            <span>
              <strong>4-DOF 3D Spatial Manipulator &amp; Damped Least Squares IK:</strong> Move your mouse over the canvas to position the arm across the horizontal <strong>(X, Z) plane</strong>, spin the <strong>Mouse Scroll Wheel</strong> to control <strong>Up/Down Height (Y)</strong>, or Shift+Drag to orbit the camera.
            </span>
            <Link
              href="/posts/robotic-arm-inverse-kinematics"
              className="text-blue-600 hover:text-blue-800 font-semibold transition shrink-0"
            >
              Read Companion Engineering Article &rarr;
            </Link>
          </>
        )}
        {activeModule === 'pidlab' && (
          <>
            <span>
              <strong>Discrete-Time Closed-Loop PID Simulator:</strong> Drag the oscilloscope setpoint line, adjust Kp/Ki/Kd gains, inject 30% load surges, or click Autotune.
            </span>
            <Link
              href="/posts/closed-loop-pid-control-lab"
              className="text-blue-600 hover:text-blue-800 font-semibold transition shrink-0"
            >
              Read Companion Engineering Article &rarr;
            </Link>
          </>
        )}
        {activeModule === 'breakthrough' && (
          <>
            <span>
              <strong>Boundary-Scan Breakout:</strong> Reflect signal pulses to clear SMD passives and security fuses on a 60 FPS canvas.
            </span>
            <Link
              href="/posts/silicon-breakthrough"
              className="text-blue-600 hover:text-blue-800 font-semibold transition shrink-0"
            >
              Read Architecture Note &rarr;
            </Link>
          </>
        )}
        {activeModule === 'pcbbird' && (
          <>
            <span>
              <strong>Silicon Viral Worm (Zero-Day Injector):</strong> Pilot a polymorphic digital worm across 4-layer FR4 copper traces to patch vulnerability bugs while evading soldered IC packages.
            </span>
            <Link
              href="/posts/pcb-bird-runner"
              className="text-blue-600 hover:text-blue-800 font-semibold transition shrink-0"
            >
              Read Architecture Note &rarr;
            </Link>
          </>
        )}
      </div>

      {/* Active Simulator Viewport */}
      <div className="p-4 sm:p-6 bg-white">
        {activeModule === 'roboticarm' && <RoboticArmIkLab />}
        {activeModule === 'pidlab' && <PidControlLab />}
        {activeModule === 'breakthrough' && <SiliconBreakthroughGame />}
        {activeModule === 'pcbbird' && <PcbBirdGame />}
      </div>
    </div>
  );
}
