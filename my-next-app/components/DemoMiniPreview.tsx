'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

export type SimulatorId = 'roboticarm' | 'pidlab' | 'breakthrough' | 'pcbbird';

interface DemoCardConfig {
  id: SimulatorId;
  numberLabel: string;
  title: string;
  subtitle: string;
  badge: string;
  accentColor: string;
  description: string;
  demoHref: string;
  noteHref: string;
  noteLabel: string;
}

const DEMO_CARDS: DemoCardConfig[] = [
  {
    id: 'roboticarm',
    numberLabel: 'SIM 01',
    title: '4-DOF 3D Robotic Arm IK Lab',
    subtitle: 'Mouse Plane (X, Z) • Scroll Height (Y)',
    badge: '3D Robotics • Jacobian DLS',
    accentColor: 'from-orange-500/20 to-blue-500/20 border-orange-400/40',
    description:
      'Industrial 4-DOF 3D manipulator solved at 60Hz via Damped Least Squares inverse kinematics and 2nd-order servo compliance.',
    demoHref: '/demos?sim=roboticarm',
    noteHref: '/posts/robotic-arm-inverse-kinematics',
    noteLabel: '3D IK Math Article',
  },
  {
    id: 'pidlab',
    numberLabel: 'SIM 02',
    title: 'Closed-Loop PID Control Lab',
    subtitle: 'Interactive 60Hz DSO • Load Surges',
    badge: 'Control Theory • Anti-Windup',
    accentColor: 'from-emerald-500/20 to-cyan-500/20 border-emerald-400/40',
    description:
      'Discrete-time PID controller regulating a 2nd-order thermal/flow plant with live Kp/Ki/Kd tuning and Ziegler-Nichols autotune.',
    demoHref: '/demos?sim=pidlab',
    noteHref: '/posts/closed-loop-pid-control-lab',
    noteLabel: 'PID Control Article',
  },
  {
    id: 'breakthrough',
    numberLabel: 'SIM 03',
    title: 'Silicon Breakthrough',
    subtitle: 'Boundary-Scan Physics • Web Audio',
    badge: '60 FPS ISR Loop',
    accentColor: 'from-sky-500/20 to-indigo-500/20 border-sky-400/40',
    description:
      'High-speed boundary-scan breakout separating 60Hz collision kinematics from React HUD state—mirroring bare-metal timer ISRs.',
    demoHref: '/demos?sim=breakthrough',
    noteHref: '/posts/silicon-breakthrough',
    noteLabel: 'ISR Loop Note',
  },
  {
    id: 'pcbbird',
    numberLabel: 'SIM 04',
    title: 'Silicon Viral Worm',
    subtitle: 'Zero-Day Injector • FR4 Trace Grid',
    badge: 'State Machine • Canvas 2D',
    accentColor: 'from-purple-500/20 to-emerald-500/20 border-purple-400/40',
    description:
      'Pilot a polymorphic digital viral worm across 4-layer copper traces to patch hardware bugs and trigger rootkit stealth cloaks.',
    demoHref: '/demos?sim=pcbbird',
    noteHref: '/posts/pcb-bird-runner',
    noteLabel: 'State Machine Note',
  },
];

function MiniCanvasRenderer({ simId }: { simId: SimulatorId }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    let t = 0;
    const W = 320;
    const H = 165;

    // Helper for 3D isometric perspective projection inside the mini-canvas
    const proj3D = (x: number, y: number, z: number, camYaw: number, camPitch: number, cyOffset = 0.68) => {
      const cosY = Math.cos(camYaw);
      const sinY = Math.sin(camYaw);
      const rx = x * cosY + z * sinY;
      const rz = -x * sinY + z * cosY;

      const cosP = Math.cos(camPitch);
      const sinP = Math.sin(camPitch);
      const ry = y * cosP - rz * sinP;
      const depth = y * sinP + rz * cosP;

      const fov = 360;
      const scale = fov / Math.max(140, fov - depth * 0.85);
      return {
        sx: W * 0.5 + rx * scale,
        sy: H * cyOffset - ry * scale,
        scale,
      };
    };

    const renderFrame = () => {
      t += 1 / 60;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, W, H);

      if (simId === 'roboticarm') {
        // =====================================================================
        // MINI-3D PREVIEW 1: ORBITING 4-DOF INDUSTRIAL ROBOTIC ARM
        // =====================================================================
        const camYaw = 0.45 + 0.28 * Math.sin(t * 0.55);
        const camPitch = 0.48;

        // 3D Floor Grid
        ctx.lineWidth = 1;
        for (let g = -90; g <= 90; g += 30) {
          const p1 = proj3D(-90, 0, g, camYaw, camPitch, 0.76);
          const p2 = proj3D(90, 0, g, camYaw, camPitch, 0.76);
          ctx.strokeStyle = g === 0 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(148, 163, 184, 0.12)';
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.stroke();

          const p3 = proj3D(g, 0, -90, camYaw, camPitch, 0.76);
          const p4 = proj3D(g, 0, 90, camYaw, camPitch, 0.76);
          ctx.strokeStyle = g === 0 ? 'rgba(192, 132, 252, 0.35)' : 'rgba(148, 163, 184, 0.12)';
          ctx.beginPath();
          ctx.moveTo(p3.sx, p3.sy);
          ctx.lineTo(p4.sx, p4.sy);
          ctx.stroke();
        }

        // Animated 3D arm angles
        const yaw = 0.65 * Math.sin(t * 1.4);
        const a1 = 0.95 + 0.25 * Math.sin(t * 1.4);
        const a2 = a1 - 0.85 + 0.3 * Math.cos(t * 1.4);
        const a3 = a2 - 0.45;

        const l1 = 44;
        const l2 = 38;
        const l3 = 24;
        const baseH = 14;

        const r1 = l1 * Math.cos(a1);
        const y1 = baseH + l1 * Math.sin(a1);
        const r2 = r1 + l2 * Math.cos(a2);
        const y2 = y1 + l2 * Math.sin(a2);
        const r3 = r2 + l3 * Math.cos(a3);
        const y3 = y2 + l3 * Math.sin(a3);

        const cY = Math.cos(yaw);
        const sY = Math.sin(yaw);

        const pBaseFloor = proj3D(0, 0, 0, camYaw, camPitch, 0.76);
        const p0 = proj3D(0, baseH, 0, camYaw, camPitch, 0.76);
        const p1 = proj3D(r1 * cY, y1, r1 * sY, camYaw, camPitch, 0.76);
        const p2 = proj3D(r2 * cY, y2, r2 * sY, camYaw, camPitch, 0.76);
        const p3 = proj3D(r3 * cY, y3, r3 * sY, camYaw, camPitch, 0.76);

        // Floor shadow
        const sh1 = proj3D(r1 * cY, 0, r1 * sY, camYaw, camPitch, 0.76);
        const sh2 = proj3D(r2 * cY, 0, r2 * sY, camYaw, camPitch, 0.76);
        const sh3 = proj3D(r3 * cY, 0, r3 * sY, camYaw, camPitch, 0.76);
        ctx.strokeStyle = 'rgba(2, 6, 23, 0.65)';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pBaseFloor.sx, pBaseFloor.sy);
        ctx.lineTo(sh1.sx, sh1.sy);
        ctx.lineTo(sh2.sx, sh2.sy);
        ctx.lineTo(sh3.sx, sh3.sy);
        ctx.stroke();

        // 3D Target Pillar
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(sh3.sx, sh3.sy);
        ctx.lineTo(p3.sx, p3.sy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Base Pedestal
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(pBaseFloor.sx, pBaseFloor.sy, 16, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 11;
        ctx.beginPath();
        ctx.moveTo(pBaseFloor.sx, pBaseFloor.sy);
        ctx.lineTo(p0.sx, p0.sy);
        ctx.stroke();

        // Industrial Orange Shoulder Boom + Titanium Forearm + Carbon Wrist
        const drawMiniBoom = (
          from: { sx: number; sy: number; scale: number },
          to: { sx: number; sy: number; scale: number },
          width: number,
          outerCol: string,
          innerCol: string
        ) => {
          ctx.lineCap = 'round';
          ctx.strokeStyle = outerCol;
          ctx.lineWidth = width * ((from.scale + to.scale) * 0.5);
          ctx.beginPath();
          ctx.moveTo(from.sx, from.sy);
          ctx.lineTo(to.sx, to.sy);
          ctx.stroke();

          ctx.strokeStyle = innerCol;
          ctx.lineWidth = width * 0.42 * ((from.scale + to.scale) * 0.5);
          ctx.beginPath();
          ctx.moveTo(from.sx, from.sy);
          ctx.lineTo(to.sx, to.sy);
          ctx.stroke();
        };

        drawMiniBoom(p0, p1, 10.5, '#ea580c', '#fdba74');
        drawMiniBoom(p1, p2, 8.2, '#475569', '#e2e8f0');
        drawMiniBoom(p2, p3, 6.0, '#1e293b', '#94a3b8');

        // Servo Joint Drums
        [
          { pt: p0, r: 6.2, col: '#f97316' },
          { pt: p1, r: 5.2, col: '#38bdf8' },
          { pt: p2, r: 4.4, col: '#2dd4bf' },
          { pt: p3, r: 3.8, col: '#fbbf24' },
        ].forEach((j) => {
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = j.col;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(j.pt.sx, j.pt.sy, j.r * j.pt.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });

        // Target sphere pulse
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p3.sx, p3.sy, 7 + 2 * Math.sin(t * 5), 0, Math.PI * 2);
        ctx.stroke();
      } else if (simId === 'pidlab') {
        // =====================================================================
        // MINI-3D PREVIEW 2: 3D-TILTED DIGITAL STORAGE OSCILLOSCOPE (PID LAB)
        // =====================================================================
        const camYaw = -0.22 + 0.12 * Math.sin(t * 0.6);
        const camPitch = 0.35;

        // 3D Oscilloscope Grid Plane
        for (let gx = -120; gx <= 120; gx += 30) {
          const pA = proj3D(gx, -45, 0, camYaw, camPitch, 0.52);
          const pB = proj3D(gx, 45, 0, camYaw, camPitch, 0.52);
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pA.sx, pA.sy);
          ctx.lineTo(pB.sx, pB.sy);
          ctx.stroke();
        }
        for (let gy = -45; gy <= 45; gy += 22.5) {
          const pA = proj3D(-120, gy, 0, camYaw, camPitch, 0.52);
          const pB = proj3D(120, gy, 0, camYaw, camPitch, 0.52);
          ctx.strokeStyle = gy === 0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(148, 163, 184, 0.12)';
          ctx.beginPath();
          ctx.moveTo(pA.sx, pA.sy);
          ctx.lineTo(pB.sx, pB.sy);
          ctx.stroke();
        }

        // Setpoint SP(t) Step Wave (Green) in 3D depth z = -12
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        const cycle = (t * 0.65) % 1;
        for (let i = 0; i <= 60; i++) {
          const u = i / 60;
          const x = -115 + u * 230;
          const phase = (u + cycle) % 1;
          const spY = phase < 0.5 ? 24 : -18;
          const pt = proj3D(x, spY, -12, camYaw, camPitch, 0.52);
          if (i === 0) ctx.moveTo(pt.sx, pt.sy);
          else ctx.lineTo(pt.sx, pt.sy);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Process Variable PV(t) Underdamped Step Response (Cyan) in 3D foreground z = +8
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        for (let i = 0; i <= 80; i++) {
          const u = i / 80;
          const x = -115 + u * 230;
          const phase = (u + cycle) % 1;
          const localT = (phase < 0.5 ? phase : phase - 0.5) * 14;
          const env = Math.exp(-localT * 0.55) * Math.cos(localT * 2.4);
          const pvY = phase < 0.5 ? 24 - 42 * env : -18 + 42 * env;
          const pt = proj3D(x, pvY, 8, camYaw, camPitch, 0.52);
          if (i === 0) ctx.moveTo(pt.sx, pt.sy);
          else ctx.lineTo(pt.sx, pt.sy);
        }
        ctx.stroke();
      } else if (simId === 'breakthrough') {
        // =====================================================================
        // MINI-3D PREVIEW 3: 3D-TILTED SILICON BREAKTHROUGH ARENA
        // =====================================================================
        const camYaw = 0.25 * Math.sin(t * 0.7);
        const camPitch = 0.52;

        // 3D Arena Floor Perimeter
        const c1 = proj3D(-105, 0, -65, camYaw, camPitch, 0.55);
        const c2 = proj3D(105, 0, -65, camYaw, camPitch, 0.55);
        const c3 = proj3D(105, 0, 65, camYaw, camPitch, 0.55);
        const c4 = proj3D(-105, 0, 65, camYaw, camPitch, 0.55);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(c1.sx, c1.sy);
        ctx.lineTo(c2.sx, c2.sy);
        ctx.lineTo(c3.sx, c3.sy);
        ctx.lineTo(c4.sx, c4.sy);
        ctx.closePath();
        ctx.stroke();

        // 3D Elevated SMD IC Bricks
        const colors = ['#f59e0b', '#38bdf8', '#a855f7'];
        for (let row = 0; row < 3; row++) {
          for (let col = -2; col <= 2; col++) {
            const bx = col * 36;
            const bz = -42 + row * 18;
            const pL = proj3D(bx - 13, 8, bz, camYaw, camPitch, 0.55);
            const pR = proj3D(bx + 13, 8, bz, camYaw, camPitch, 0.55);
            ctx.strokeStyle = colors[row];
            ctx.lineWidth = 6 * pL.scale;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(pL.sx, pL.sy);
            ctx.lineTo(pR.sx, pR.sy);
            ctx.stroke();
          }
        }

        // Animated Paddle & Bouncing Signal Pulse in 3D
        const paddleX = 55 * Math.sin(t * 2.1);
        const padL = proj3D(paddleX - 24, 6, 52, camYaw, camPitch, 0.55);
        const padR = proj3D(paddleX + 24, 6, 52, camYaw, camPitch, 0.55);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 7 * padL.scale;
        ctx.beginPath();
        ctx.moveTo(padL.sx, padL.sy);
        ctx.lineTo(padR.sx, padR.sy);
        ctx.stroke();

        const ballBounce = Math.abs(Math.sin(t * 3.2));
        const ballX = paddleX * (1 - ballBounce * 0.4);
        const ballZ = 46 - ballBounce * 72;
        const ballY = 8 + Math.sin(ballBounce * Math.PI) * 18;
        const bPt = proj3D(ballX, ballY, ballZ, camYaw, camPitch, 0.55);

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(bPt.sx, bPt.sy, 5 * bPt.scale, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // =====================================================================
        // MINI-3D PREVIEW 4: 3D-PERSPECTIVE SILICON VIRAL WORM ON FR4 PCB
        // =====================================================================
        const camYaw = -0.32 + 0.18 * Math.sin(t * 0.6);
        const camPitch = 0.55;

        // 3D FR4 Copper Trace Grid
        for (let g = -90; g <= 90; g += 30) {
          const p1 = proj3D(-95, 0, g, camYaw, camPitch, 0.56);
          const p2 = proj3D(95, 0, g, camYaw, camPitch, 0.56);
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.22)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.stroke();

          const p3 = proj3D(g, 0, -60, camYaw, camPitch, 0.56);
          const p4 = proj3D(g, 0, 60, camYaw, camPitch, 0.56);
          ctx.beginPath();
          ctx.moveTo(p3.sx, p3.sy);
          ctx.lineTo(p4.sx, p4.sy);
          ctx.stroke();
        }

        // Polymorphic Viral Worm Slithering in 3D
        const numSegs = 9;
        for (let i = numSegs - 1; i >= 0; i--) {
          const phase = t * 3.4 - i * 0.38;
          const wx = -65 + ((phase * 22) % 130);
          const wz = 24 * Math.sin(phase);
          const wy = 6 + (i === 0 ? 3 : 0);
          const pt = proj3D(wx, wy, wz, camYaw, camPitch, 0.56);

          ctx.fillStyle = i === 0 ? '#34d399' : i % 2 === 0 ? '#0ea5e9' : '#8b5cf6';
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(pt.sx, pt.sy, (i === 0 ? 7.2 : 5.4 - i * 0.25) * pt.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Pulsing Crimson Zero-Day Bug Target
        const bugPt = proj3D(55, 8, 15 * Math.sin(t * 2), camYaw, camPitch, 0.56);
        ctx.fillStyle = '#f43f5e';
        ctx.strokeStyle = '#fda4af';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(bugPt.sx, bugPt.sy, (5.5 + 1.5 * Math.sin(t * 6)) * bugPt.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, [simId]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={165}
      className="w-full h-36 sm:h-40 object-cover block bg-slate-950"
    />
  );
}

export function DemoMiniPreviewGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {DEMO_CARDS.map((card) => (
        <div
          key={card.id}
          className="group relative rounded-2xl border border-slate-700/80 bg-slate-800/70 hover:bg-slate-800 hover:border-blue-400/70 transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-lg"
        >
          {/* Clickable Live 60 FPS Mini-3D Preview Viewport */}
          <div>
            <Link
              href={card.demoHref}
              className="block relative overflow-hidden border-b border-slate-700/80 focus:outline-none"
              aria-label={`Launch ${card.title}`}
            >
              <MiniCanvasRenderer simId={card.id} />

              {/* Top Overlay Pill Badges */}
              <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-900/90 text-sky-300 border border-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {card.numberLabel} &bull; LIVE 3D
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-900/85 text-slate-200 border border-slate-700">
                  {card.badge}
                </span>
              </div>

              {/* Hover Interactive Launch Callout */}
              <div className="absolute bottom-2.5 right-3 pointer-events-none">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-blue-600/95 group-hover:bg-blue-500 text-white shadow-md transition">
                  Click Preview to Launch &rarr;
                </span>
              </div>
            </Link>

            {/* Simulator Description Body */}
            <div className="p-5 space-y-2">
              <div className="text-xs font-mono text-sky-300/90">{card.subtitle}</div>
              <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition">
                <Link href={card.demoHref}>{card.title}</Link>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {card.description}
              </p>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="px-5 py-3 bg-slate-900/60 border-t border-slate-700/70 flex items-center justify-between text-xs font-semibold">
            <Link
              href={card.demoHref}
              className="text-sky-400 hover:text-sky-300 transition inline-flex items-center gap-1"
            >
              Open Full Simulator &rarr;
            </Link>
            <Link
              href={card.noteHref}
              className="text-slate-400 hover:text-white transition"
            >
              Read {card.noteLabel}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
