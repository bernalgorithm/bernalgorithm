'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

const CANVAS_W = 760;
const CANVAS_H = 440;
const PLANT_PANE_W = 245;
const SCOPE_X = PLANT_PANE_W + 15;
const SCOPE_W = CANVAS_W - SCOPE_X - 16;
const SCOPE_Y = 38;
const SCOPE_H = 265;
const PWM_Y = SCOPE_Y + SCOPE_H + 26;
const PWM_H = 88;
const HISTORY_LEN = 380;

// Critically damped optimal defaults for this 2nd-order plant
const OPTIMAL_KP = 2.6;
const OPTIMAL_KI = 1.45;
const OPTIMAL_KD = 1.35;
const DEFAULT_SETPOINT = 65;

interface ScopeSample {
  sp: number;
  pv: number;
  u: number;
  pTerm: number;
  iTerm: number;
  dTerm: number;
  eventTag?: string;
  eventColor?: string;
}

interface FluidParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  hue: 'emerald' | 'cyan' | 'amber';
}

class PidLabAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playAutotuneChime() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const freqs = [440, 554.37, 659.25, 880];
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.055);
      gain.gain.setValueAtTime(0.06, now + idx * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.055);
      osc.stop(now + idx * 0.055 + 0.19);
    });
  }

  playDisturbancePulse(positive: boolean) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(positive ? 180 : 280, now);
    osc.frequency.exponentialRampToValueAtTime(positive ? 340 : 110, now + 0.14);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  playStepTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.045);
  }
}

export function PidControlLab() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<PidLabAudio>(new PidLabAudio());

  // React UI state for sliders & HUD telemetry
  const [kp, setKp] = useState<number>(OPTIMAL_KP);
  const [ki, setKi] = useState<number>(OPTIMAL_KI);
  const [kd, setKd] = useState<number>(OPTIMAL_KD);
  const [setpoint, setSetpoint] = useState<number>(DEFAULT_SETPOINT);
  const [autoStepWave, setAutoStepWave] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activePresetName, setActivePresetName] = useState<string>('CRITICALLY DAMPED (OPTIMAL)');

  const [hudMetrics, setHudMetrics] = useState({
    pv: DEFAULT_SETPOINT,
    error: 0,
    output: 32.5,
    pTerm: 0,
    iTerm: 32.5,
    dTerm: 0,
    overshoot: 0,
    status: 'LOCKED (±0.5%)',
    statusColor: 'text-emerald-700 border-emerald-200 bg-emerald-50',
  });

  // High-frequency 60Hz simulation state stored in mutable ref (ISR pattern)
  const simRef = useRef<{
    kp: number;
    ki: number;
    kd: number;
    sp: number;
    pv: number;
    velocity: number;
    actuator: number;
    integral: number;
    prevPv: number;
    prevError: number;
    filteredD: number;
    disturbanceVel: number;
    baseLoad: number;
    impellerAngle: number;
    wavePhase: number;
    autoStep: boolean;
    stepTimer: number;
    peakPvSinceStep: number;
    stepStartPv: number;
    stepTargetSp: number;
    pendingEventTag: string | undefined;
    pendingEventColor: string | undefined;
    autotuneFlash: number;
    draggingSp: boolean;
    history: ScopeSample[];
    particles: FluidParticle[];
  }>({
    kp: OPTIMAL_KP,
    ki: OPTIMAL_KI,
    kd: OPTIMAL_KD,
    sp: DEFAULT_SETPOINT,
    pv: DEFAULT_SETPOINT,
    velocity: 0,
    actuator: 32.5,
    integral: 32.5,
    prevPv: DEFAULT_SETPOINT,
    prevError: 0,
    filteredD: 0,
    disturbanceVel: 0,
    baseLoad: 22.0, // Constant process outflow/drain requiring integral action
    impellerAngle: 0,
    wavePhase: 0,
    autoStep: false,
    stepTimer: 0,
    peakPvSinceStep: DEFAULT_SETPOINT,
    stepStartPv: DEFAULT_SETPOINT,
    stepTargetSp: DEFAULT_SETPOINT,
    pendingEventTag: undefined,
    pendingEventColor: undefined,
    autotuneFlash: 0,
    draggingSp: false,
    history: Array.from({ length: HISTORY_LEN }, () => ({
      sp: DEFAULT_SETPOINT,
      pv: DEFAULT_SETPOINT,
      u: 32.5,
      pTerm: 0,
      iTerm: 32.5,
      dTerm: 0,
    })),
    particles: [],
  });

  // Sync React controls to mutable simulation refs
  const updateSetpoint = useCallback((nextSp: number, tag?: string) => {
    const clamped = Math.max(10, Math.min(90, Math.round(nextSp * 10) / 10));
    const s = simRef.current;
    if (Math.abs(clamped - s.sp) > 1.5) {
      s.stepStartPv = s.pv;
      s.stepTargetSp = clamped;
      s.peakPvSinceStep = s.pv;
      if (tag) {
        s.pendingEventTag = tag;
        s.pendingEventColor = '#fbbf24';
      }
    }
    s.sp = clamped;
    setSetpoint(clamped);
  }, []);

  const handleKpChange = (val: number) => {
    simRef.current.kp = val;
    setKp(val);
    setActivePresetName('MANUAL TUNING');
  };

  const handleKiChange = (val: number) => {
    simRef.current.ki = val;
    if (val === 0) {
      simRef.current.integral = 0;
    }
    setKi(val);
    setActivePresetName('MANUAL TUNING');
  };

  const handleKdChange = (val: number) => {
    simRef.current.kd = val;
    setKd(val);
    setActivePresetName('MANUAL TUNING');
  };

  const handleAutotune = () => {
    const s = simRef.current;
    s.kp = OPTIMAL_KP;
    s.ki = OPTIMAL_KI;
    s.kd = OPTIMAL_KD;
    // Pre-bias integral close to steady-state load to accelerate lock without windup spike
    const steadyStateU = s.baseLoad + s.sp * 0.16;
    s.integral = steadyStateU * 0.85 + s.integral * 0.15;
    s.autotuneFlash = 1.0;
    s.pendingEventTag = 'AUTOTUNE (Z-N)';
    s.pendingEventColor = '#34d399';
    setKp(OPTIMAL_KP);
    setKi(OPTIMAL_KI);
    setKd(OPTIMAL_KD);
    setActivePresetName('CRITICALLY DAMPED (OPTIMAL)');
    audioRef.current.playAutotuneChime();
  };

  const handleResetStable = () => {
    const s = simRef.current;
    s.kp = OPTIMAL_KP;
    s.ki = OPTIMAL_KI;
    s.kd = OPTIMAL_KD;
    s.sp = DEFAULT_SETPOINT;
    s.pv = DEFAULT_SETPOINT;
    s.velocity = 0;
    const eqU = s.baseLoad + DEFAULT_SETPOINT * 0.16;
    s.actuator = eqU;
    s.integral = eqU;
    s.prevPv = DEFAULT_SETPOINT;
    s.prevError = 0;
    s.filteredD = 0;
    s.disturbanceVel = 0;
    s.autoStep = false;
    s.peakPvSinceStep = DEFAULT_SETPOINT;
    s.stepStartPv = DEFAULT_SETPOINT;
    s.stepTargetSp = DEFAULT_SETPOINT;
    s.pendingEventTag = 'SYSTEM RESET';
    s.pendingEventColor = '#38bdf8';
    setKp(OPTIMAL_KP);
    setKi(OPTIMAL_KI);
    setKd(OPTIMAL_KD);
    setSetpoint(DEFAULT_SETPOINT);
    setAutoStepWave(false);
    setActivePresetName('CRITICALLY DAMPED (OPTIMAL)');
    audioRef.current.playStepTick();
  };

  const applyPreset = (
    name: string,
    nextKp: number,
    nextKi: number,
    nextKd: number,
    triggerStep: boolean = true
  ) => {
    const s = simRef.current;
    s.kp = nextKp;
    s.ki = nextKi;
    s.kd = nextKd;
    if (nextKi === 0) {
      s.integral = 0;
    }
    s.pendingEventTag = name;
    s.pendingEventColor = '#a78bfa';
    setKp(nextKp);
    setKi(nextKi);
    setKd(nextKd);
    setActivePresetName(name);
    if (triggerStep) {
      const nextTarget = s.sp > 55 ? 35 : 75;
      updateSetpoint(nextTarget);
    }
    audioRef.current.playStepTick();
  };

  const injectDisturbance = (deltaVel: number, label: string) => {
    const s = simRef.current;
    s.disturbanceVel += deltaVel;
    s.pendingEventTag = label;
    s.pendingEventColor = deltaVel > 0 ? '#f59e0b' : '#f43f5e';
    audioRef.current.playDisturbancePulse(deltaVel > 0);
  };

  const toggleAutoStep = () => {
    const next = !autoStepWave;
    simRef.current.autoStep = next;
    simRef.current.stepTimer = 0;
    if (next) {
      const target = simRef.current.sp > 55 ? 35 : 75;
      updateSetpoint(target, 'STEP GEN ON');
    }
    setAutoStepWave(next);
    audioRef.current.playStepTick();
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    audioRef.current.enabled = next;
    setSoundEnabled(next);
  };

  // Pointer interaction on Canvas to drag Setpoint directly
  const mapCanvasYToSp = (clientY: number): number | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleY = CANVAS_H / rect.height;
    const y = (clientY - rect.top) * scaleY;
    if (y < SCOPE_Y - 12 || y > SCOPE_Y + SCOPE_H + 12) return null;
    const norm = 1 - (y - SCOPE_Y) / SCOPE_H;
    return Math.max(10, Math.min(90, norm * 100));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const nextSp = mapCanvasYToSp(e.clientY);
    if (nextSp !== null) {
      simRef.current.draggingSp = true;
      updateSetpoint(nextSp, `SP -> ${Math.round(nextSp)}%`);
      audioRef.current.playStepTick();
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!simRef.current.draggingSp) return;
    const nextSp = mapCanvasYToSp(e.clientY);
    if (nextSp !== null) {
      updateSetpoint(nextSp);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (simRef.current.draggingSp) {
      simRef.current.draggingSp = false;
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // Main 60 FPS Simulation & Oscilloscope Render Loop
  useEffect(() => {
    let rafId: number;
    let frameCount = 0;
    const dt = 1 / 60;

    const stepSimulation = () => {
      const s = simRef.current;
      frameCount++;

      // Optional Square-Wave Setpoint Generator (toggles every 3.8 seconds)
      if (s.autoStep) {
        s.stepTimer += dt;
        if (s.stepTimer >= 3.8) {
          s.stepTimer = 0;
          const nextTarget = s.sp > 55 ? 30 : 75;
          s.stepStartPv = s.pv;
          s.stepTargetSp = nextTarget;
          s.peakPvSinceStep = s.pv;
          s.sp = nextTarget;
          s.pendingEventTag = `STEP ${nextTarget}%`;
          s.pendingEventColor = '#fbbf24';
          setSetpoint(nextTarget);
        }
      }

      // 1. Compute Discrete-Time PID Terms
      const error = s.sp - s.pv;
      const pTerm = s.kp * error;

      // Filtered Derivative (combines error rate and PV rate to damp overshoot smoothly)
      const dErrorRate = (error - s.prevError) / dt;
      const dPvRate = -(s.pv - s.prevPv) / dt;
      const rawD = s.kd * (0.3 * dErrorRate + 0.7 * dPvRate);
      s.filteredD = s.filteredD * 0.72 + rawD * 0.28;
      const dTerm = s.filteredD;

      // Conditional Anti-Windup Integration
      const tentativeU = pTerm + s.integral + dTerm;
      const saturatedHigh = tentativeU >= 100 && error > 0;
      const saturatedLow = tentativeU <= 0 && error < 0;
      if (!saturatedHigh && !saturatedLow && s.ki > 0) {
        s.integral = Math.max(-60, Math.min(110, s.integral + s.ki * error * dt * 1.35));
      }
      const iTerm = s.ki > 0 ? s.integral : 0;

      // Total Clamped Control Effort u(t) in [0, 100]%
      const u = Math.max(0, Math.min(100, pTerm + iTerm + dTerm));

      s.prevError = error;
      s.prevPv = s.pv;

      // 2. Second-Order Physical Plant Dynamics (Actuator lag + Fluid inertia + Outflow load)
      // Actuator first-order lag
      s.actuator += (u - s.actuator) * 0.18;

      // Outflow increases slightly with tank head pressure (self-regulating industrial process)
      const headDrain = s.baseLoad + s.pv * 0.16;
      const netForce = (s.actuator - headDrain) * 2.35 + s.disturbanceVel;

      // Natural mechanical damping of the plant is intentionally light (0.85) so PID tuning dominates!
      const acceleration = netForce - s.velocity * 0.85;
      s.velocity += acceleration * dt;
      s.pv += s.velocity * dt;

      // Decay external impulse disturbance
      s.disturbanceVel *= 0.92;
      if (Math.abs(s.disturbanceVel) < 0.05) s.disturbanceVel = 0;

      // Hard physical vessel limits
      if (s.pv < 0) {
        s.pv = 0;
        s.velocity = Math.max(0, s.velocity);
      } else if (s.pv > 100) {
        s.pv = 100;
        s.velocity = Math.min(0, s.velocity);
      }

      // Track peak overshoot after a setpoint step
      const stepDelta = s.stepTargetSp - s.stepStartPv;
      if (stepDelta > 2 && s.pv > s.peakPvSinceStep) {
        s.peakPvSinceStep = s.pv;
      } else if (stepDelta < -2 && s.pv < s.peakPvSinceStep) {
        s.peakPvSinceStep = s.pv;
      }

      // Update visual animations
      s.impellerAngle = (s.impellerAngle + (0.02 + (s.actuator / 100) * 0.28)) % (Math.PI * 2);
      s.wavePhase = (s.wavePhase + 0.09) % (Math.PI * 2);
      if (s.autotuneFlash > 0) {
        s.autotuneFlash = Math.max(0, s.autotuneFlash - 0.025);
      }

      // Spawn dosing fluid particles proportional to actuator PWM
      if (Math.random() < (s.actuator / 100) * 0.85 && s.particles.length < 48) {
        s.particles.push({
          x: 68 + (Math.random() - 0.5) * 18,
          y: SCOPE_Y + 20,
          vx: (Math.random() - 0.5) * 16 + 8,
          vy: 45 + (s.actuator / 100) * 75,
          radius: 1.8 + Math.random() * 2,
          alpha: 0.9,
          hue: s.actuator > 80 ? 'amber' : Math.random() > 0.4 ? 'emerald' : 'cyan',
        });
      }

      const liquidTopY = SCOPE_Y + SCOPE_H * (1 - s.pv / 100);
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        if (pt.y >= liquidTopY) {
          // Swirl inside fluid
          pt.vy *= 0.82;
          pt.vx += Math.sin(s.wavePhase + i) * 2.2;
          pt.alpha -= 0.032;
        }
        if (pt.alpha <= 0.04 || pt.y > SCOPE_Y + SCOPE_H - 6 || pt.x < 34 || pt.x > 195) {
          s.particles.splice(i, 1);
        }
      }

      // Record sample in oscilloscope circular buffer (every frame)
      s.history.push({
        sp: s.sp,
        pv: s.pv,
        u,
        pTerm,
        iTerm,
        dTerm,
        eventTag: s.pendingEventTag,
        eventColor: s.pendingEventColor,
      });
      s.pendingEventTag = undefined;
      s.pendingEventColor = undefined;
      if (s.history.length > HISTORY_LEN) {
        s.history.shift();
      }

      // Update React HUD every 6 frames (~10Hz) to keep React reconciliation overhead zero
      if (frameCount % 6 === 0) {
        let overshootPct = 0;
        if (Math.abs(stepDelta) > 4) {
          if (stepDelta > 0 && s.peakPvSinceStep > s.stepTargetSp) {
            overshootPct = ((s.peakPvSinceStep - s.stepTargetSp) / Math.abs(stepDelta)) * 100;
          } else if (stepDelta < 0 && s.peakPvSinceStep < s.stepTargetSp) {
            overshootPct = ((s.stepTargetSp - s.peakPvSinceStep) / Math.abs(stepDelta)) * 100;
          }
        }

        let status = 'CONVERGING';
        let statusColor = 'text-blue-700 border-blue-200 bg-blue-50';
        const absErr = Math.abs(error);
        const absVel = Math.abs(s.velocity);

        if (u <= 0.5 || u >= 99.5) {
          status = 'ACTUATOR SATURATED';
          statusColor = 'text-amber-700 border-amber-200 bg-amber-50';
        } else if (absErr <= 0.6 && absVel < 1.2) {
          status = 'LOCKED (±0.5%)';
          statusColor = 'text-emerald-700 border-emerald-200 bg-emerald-50';
        } else if (s.ki === 0 && absVel < 1.0 && absErr > 1.5) {
          status = 'STEADY-STATE DROOP';
          statusColor = 'text-rose-700 border-rose-200 bg-rose-50';
        } else if (overshootPct > 12 && absVel > 4) {
          status = 'UNDERDAMPED RINGING';
          statusColor = 'text-amber-700 border-amber-200 bg-amber-50';
        }

        setHudMetrics({
          pv: s.pv,
          error,
          output: u,
          pTerm,
          iTerm,
          dTerm,
          overshoot: Math.min(99.9, Math.max(0, overshootPct)),
          status,
          statusColor,
        });
      }
    };

    const drawCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const s = simRef.current;

      // Background PCB / DSO Chassis
      ctx.fillStyle = '#050a10';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Subtle global blueprint grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < CANVAS_W; gx += 24) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, CANVAS_H);
        ctx.stroke();
      }
      for (let gy = 0; gy < CANVAS_H; gy += 24) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(CANVAS_W, gy);
        ctx.stroke();
      }

      // =======================================================================
      // LEFT PANE: PHYSICAL DOSING REACTOR & ACTUATOR PLANT
      // =======================================================================
      ctx.fillStyle = '#09111c';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(12, 12, PLANT_PANE_W - 12, CANVAS_H - 24, 10);
      ctx.fill();
      ctx.stroke();

      // Header label
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('PLANT // FLOW & THERMAL LOOP', 24, 28);

      // Reactor Tank Coordinates
      const tankX = 32;
      const tankY = SCOPE_Y;
      const tankW = 165;
      const tankH = SCOPE_H;

      // Tank glass background
      ctx.fillStyle = '#04080e';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(tankX, tankY, tankW, tankH, 8);
      ctx.fill();
      ctx.stroke();

      // Graduation ticks on reactor vessel (0% - 100%)
      ctx.font = '9px monospace';
      ctx.fillStyle = '#64748b';
      for (let pct = 20; pct <= 80; pct += 20) {
        const ty = tankY + tankH * (1 - pct / 100);
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tankX + tankW - 12, ty);
        ctx.lineTo(tankX + tankW, ty);
        ctx.stroke();
        ctx.fillText(`${pct}%`, tankX + tankW + 4, ty + 3);
      }

      // Dosing Inlet Stream (from top valve into fluid)
      const liquidY = tankY + tankH * (1 - s.pv / 100);
      if (s.actuator > 1) {
        const streamWidth = 1.5 + (s.actuator / 100) * 6;
        const streamGrad = ctx.createLinearGradient(0, tankY, 0, liquidY);
        streamGrad.addColorStop(0, 'rgba(34, 211, 238, 0.85)');
        streamGrad.addColorStop(1, 'rgba(16, 185, 129, 0.35)');
        ctx.fillStyle = streamGrad;
        ctx.fillRect(68 - streamWidth / 2, tankY + 2, streamWidth, Math.max(0, liquidY - tankY));
      }

      // Fluid body with dynamic wave surface
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(tankX + 2, tankY + 2, tankW - 4, tankH - 4, 6);
      ctx.clip();

      const waveAmp = Math.min(7, 1.2 + Math.abs(s.velocity) * 0.14 + Math.abs(s.disturbanceVel) * 0.1);
      ctx.beginPath();
      ctx.moveTo(tankX, tankY + tankH);
      for (let x = tankX; x <= tankX + tankW; x += 6) {
        const relX = (x - tankX) / tankW;
        const wy =
          liquidY +
          Math.sin(relX * Math.PI * 3 + s.wavePhase) * waveAmp +
          Math.cos(relX * Math.PI * 5 - s.wavePhase * 1.3) * (waveAmp * 0.4);
        ctx.lineTo(x, wy);
      }
      ctx.lineTo(tankX + tankW, tankY + tankH);
      ctx.closePath();

      const fluidGrad = ctx.createLinearGradient(0, liquidY, 0, tankY + tankH);
      fluidGrad.addColorStop(0, 'rgba(16, 185, 129, 0.55)');
      fluidGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.35)');
      fluidGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
      ctx.fillStyle = fluidGrad;
      ctx.fill();

      // Glowing meniscus crest
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Render mixing particles inside tank
      for (const pt of s.particles) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        if (pt.hue === 'amber') {
          ctx.fillStyle = `rgba(251, 191, 36, ${pt.alpha})`;
        } else if (pt.hue === 'cyan') {
          ctx.fillStyle = `rgba(34, 211, 238, ${pt.alpha})`;
        } else {
          ctx.fillStyle = `rgba(52, 211, 153, ${pt.alpha})`;
        }
        ctx.fill();
      }
      ctx.restore();

      // Setpoint Laser Target Reticle across the Reactor Vessel
      const spY = tankY + tankH * (1 - s.sp / 100);
      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(tankX - 6, spY);
      ctx.lineTo(tankX + tankW + 6, spY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draggable SP Tag on Tank
      ctx.fillStyle = '#451a03';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tankX + 6, spY - 9, 58, 18, 4);
      ctx.fill();
      ctx.stroke();
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#fde68a';
      ctx.fillText(`SP ${Math.round(s.sp)}%`, tankX + 11, spY + 3);
      ctx.restore();

      // Spinning Pump Impeller Widget + P/I/D Component Bars in Lower Left Pane
      const pumpCx = 52;
      const pumpCy = PWM_Y + 42;
      const pumpR = 22;

      ctx.fillStyle = '#04080e';
      ctx.strokeStyle = s.actuator > 95 ? '#f59e0b' : '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pumpCx, pumpCy, pumpR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Impeller blades
      ctx.save();
      ctx.translate(pumpCx, pumpCy);
      ctx.rotate(s.impellerAngle);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.2;
      for (let b = 0; b < 4; b++) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(pumpR - 5, 0);
        ctx.stroke();
      }
      ctx.restore();

      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('PWM DRIVE', 26, PWM_Y + 10);
      ctx.fillStyle = '#22d3ee';
      ctx.fillText(`${s.actuator.toFixed(0)}%`, 38, pumpCy + 34);

      // P / I / D Live Effort Bars next to Pump
      const latest = s.history[s.history.length - 1];
      const barBaseX = 92;
      const barW = 128;
      const terms = [
        { label: 'P', val: latest.pTerm, color: '#34d399' },
        { label: 'I', val: latest.iTerm, color: '#38bdf8' },
        { label: 'D', val: latest.dTerm, color: '#c084fc' },
      ];

      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('PID EFFORT VECTORS', barBaseX, PWM_Y + 10);

      terms.forEach((t, idx) => {
        const by = PWM_Y + 22 + idx * 21;
        ctx.fillStyle = '#04080e';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.fillRect(barBaseX + 14, by, barW - 14, 13);
        ctx.strokeRect(barBaseX + 14, by, barW - 14, 13);

        // Center zero tick
        const zeroX = barBaseX + 14 + (barW - 14) / 2;
        ctx.strokeStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(zeroX, by);
        ctx.lineTo(zeroX, by + 13);
        ctx.stroke();

        // Value bar
        const norm = Math.max(-1, Math.min(1, t.val / 80));
        const fillW = norm * ((barW - 14) / 2);
        ctx.fillStyle = t.color;
        if (fillW >= 0) {
          ctx.fillRect(zeroX, by + 2, fillW, 9);
        } else {
          ctx.fillRect(zeroX + fillW, by + 2, -fillW, 9);
        }

        ctx.fillStyle = t.color;
        ctx.fillText(t.label, barBaseX, by + 10);
      });

      // =======================================================================
      // RIGHT PANE: MULTI-CHANNEL DIGITAL STORAGE OSCILLOSCOPE (DSO)
      // =======================================================================
      // Top Scope Frame (SP vs PV)
      ctx.fillStyle = '#04080e';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(SCOPE_X, SCOPE_Y, SCOPE_W, SCOPE_H, 8);
      ctx.fill();
      ctx.stroke();

      // DSO Header Strip
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('CH1: SETPOINT r(t)', SCOPE_X + 6, 26);
      ctx.fillStyle = '#34d399';
      ctx.fillText('CH2: PROCESS VAR y(t)', SCOPE_X + 142, 26);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('CH3: ACTUATOR u(t)', SCOPE_X + 305, 26);
      ctx.fillStyle = '#64748b';
      ctx.fillText('[CLICK/DRAG SCOPE TO SET SP]', SCOPE_X + SCOPE_W - 172, 26);

      // DSO Sub-grid lines (25%, 50%, 75%)
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.65)';
      ctx.lineWidth = 1;
      for (const pct of [25, 50, 75]) {
        const gy = SCOPE_Y + SCOPE_H * (1 - pct / 100);
        ctx.beginPath();
        ctx.moveTo(SCOPE_X, gy);
        ctx.lineTo(SCOPE_X + SCOPE_W, gy);
        ctx.stroke();
      }

      // Shaded Error Envelope between SP r(t) and PV y(t)
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(SCOPE_X + 1, SCOPE_Y + 1, SCOPE_W - 2, SCOPE_H - 2, 7);
      ctx.clip();

      const len = s.history.length;
      if (len > 1) {
        ctx.beginPath();
        for (let i = 0; i < len; i++) {
          const x = SCOPE_X + (i / (HISTORY_LEN - 1)) * SCOPE_W;
          const ySp = SCOPE_Y + SCOPE_H * (1 - s.history[i].sp / 100);
          if (i === 0) ctx.moveTo(x, ySp);
          else ctx.lineTo(x, ySp);
        }
        for (let i = len - 1; i >= 0; i--) {
          const x = SCOPE_X + (i / (HISTORY_LEN - 1)) * SCOPE_W;
          const yPv = SCOPE_Y + SCOPE_H * (1 - s.history[i].pv / 100);
          ctx.lineTo(x, yPv);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(16, 185, 129, 0.09)';
        ctx.fill();

        // CH1: Setpoint r(t) Trace (Amber Dashed)
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        for (let i = 0; i < len; i++) {
          const x = SCOPE_X + (i / (HISTORY_LEN - 1)) * SCOPE_W;
          const y = SCOPE_Y + SCOPE_H * (1 - s.history[i].sp / 100);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // CH2: Process Variable y(t) Trace (Glowing Emerald Phosphor)
        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let i = 0; i < len; i++) {
          const x = SCOPE_X + (i / (HISTORY_LEN - 1)) * SCOPE_W;
          const y = SCOPE_Y + SCOPE_H * (1 - s.history[i].pv / 100);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();

        // Leading Phosphor Head Dot
        const lastX = SCOPE_X + ((len - 1) / (HISTORY_LEN - 1)) * SCOPE_W;
        const lastY = SCOPE_Y + SCOPE_H * (1 - s.pv / 100);
        ctx.fillStyle = '#6ee7b7';
        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Event Callout Flags scrolling along the timeline
        for (let i = 0; i < len; i++) {
          const item = s.history[i];
          if (item.eventTag) {
            const ex = SCOPE_X + (i / (HISTORY_LEN - 1)) * SCOPE_W;
            ctx.strokeStyle = item.eventColor || '#38bdf8';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 3]);
            ctx.beginPath();
            ctx.moveTo(ex, SCOPE_Y);
            ctx.lineTo(ex, SCOPE_Y + SCOPE_H);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.font = 'bold 9px monospace';
            const tagW = ctx.measureText(item.eventTag).width + 8;
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = item.eventColor || '#38bdf8';
            ctx.fillRect(ex - tagW / 2, SCOPE_Y + 6, tagW, 14);
            ctx.strokeRect(ex - tagW / 2, SCOPE_Y + 6, tagW, 14);
            ctx.fillStyle = item.eventColor || '#38bdf8';
            ctx.fillText(item.eventTag, ex - tagW / 2 + 4, SCOPE_Y + 16);
          }
        }
      }

      // Autotune visual sweep overlay
      if (s.autotuneFlash > 0) {
        ctx.fillStyle = `rgba(16, 185, 129, ${s.autotuneFlash * 0.14})`;
        ctx.fillRect(SCOPE_X, SCOPE_Y, SCOPE_W, SCOPE_H);
      }
      ctx.restore();

      // =======================================================================
      // BOTTOM RIGHT: CH3 ACTUATOR CONTROL EFFORT u(t) TRACE
      // =======================================================================
      ctx.fillStyle = '#04080e';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(SCOPE_X, PWM_Y, SCOPE_W, PWM_H, 8);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText('CH3 // ACTUATOR CONTROL EFFORT u(t) = clamp(Kp·e + Ki·∫e·dt + Kd·de/dt, 0, 100%)', SCOPE_X + 8, PWM_Y - 6);

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(SCOPE_X + 1, PWM_Y + 1, SCOPE_W - 2, PWM_H - 2, 7);
      ctx.clip();

      if (len > 1) {
        // Cyan area fill under u(t)
        ctx.beginPath();
        ctx.moveTo(SCOPE_X, PWM_Y + PWM_H);
        for (let i = 0; i < len; i++) {
          const x = SCOPE_X + (i / (HISTORY_LEN - 1)) * SCOPE_W;
          const y = PWM_Y + PWM_H * (1 - s.history[i].u / 100);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(SCOPE_X + ((len - 1) / (HISTORY_LEN - 1)) * SCOPE_W, PWM_Y + PWM_H);
        ctx.closePath();
        ctx.fillStyle = 'rgba(34, 211, 238, 0.12)';
        ctx.fill();

        // Cyan stroke for u(t)
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let i = 0; i < len; i++) {
          const x = SCOPE_X + (i / (HISTORY_LEN - 1)) * SCOPE_W;
          const y = PWM_Y + PWM_H * (1 - s.history[i].u / 100);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    };

    const loop = () => {
      stepSimulation();
      drawCanvas();
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="space-y-4">
      {/* Top Telemetry Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className={`px-2.5 py-0.5 rounded-full border font-semibold ${hudMetrics.statusColor}`}>
            {hudMetrics.status}
          </span>
          <span className="text-slate-400 hidden sm:inline">&bull;</span>
          <span className="text-slate-700 font-medium">{activePresetName}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3.5 font-mono">
          <span>
            <span className="text-slate-500">SP:</span>{' '}
            <span className="text-amber-700 font-semibold">{setpoint.toFixed(1)}%</span>
          </span>
          <span>
            <span className="text-slate-500">PV:</span>{' '}
            <span className="text-emerald-700 font-semibold">{hudMetrics.pv.toFixed(1)}%</span>
          </span>
          <span>
            <span className="text-slate-500">ERR:</span>{' '}
            <span className={Math.abs(hudMetrics.error) < 1 ? 'text-slate-700 font-semibold' : 'text-rose-600 font-semibold'}>
              {hudMetrics.error >= 0 ? `+${hudMetrics.error.toFixed(1)}` : hudMetrics.error.toFixed(1)}%
            </span>
          </span>
          <span>
            <span className="text-slate-500">OVERSHOOT:</span>{' '}
            <span className="text-slate-900 font-semibold">{hudMetrics.overshoot.toFixed(1)}%</span>
          </span>
          <button
            type="button"
            onClick={toggleSound}
            className="px-2.5 py-0.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-sans font-medium cursor-pointer"
          >
            {soundEnabled ? 'Audio: On' : 'Audio: Off'}
          </button>
        </div>
      </div>

      {/* Interactive 60 FPS Split-Screen Reactor + DSO Canvas */}
      <div className="relative rounded-xl border border-slate-300 bg-[#050a10] shadow-xs overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-auto block cursor-ns-resize touch-none"
        />
      </div>

      {/* Interactive PID Gain Sliders & Disturbance / Autotune Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 Cols: PID Gain & Setpoint Sliders */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-900 font-semibold text-sm">
              PID Controller Gains &amp; Setpoint
            </span>
            <span className="font-mono text-slate-500">dt = 16.6ms (60Hz)</span>
          </div>

          {/* Setpoint Slider */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label htmlFor="pid-sp" className="text-slate-700 font-medium">
                Setpoint <span className="text-amber-700 font-semibold">r(t)</span>{' '}
                <span className="text-slate-500 font-normal hidden sm:inline">&mdash; slider or drag scope</span>
              </label>
              <span className="font-mono text-amber-700 font-semibold">{setpoint.toFixed(1)}%</span>
            </div>
            <input
              id="pid-sp"
              type="range"
              min={10}
              max={90}
              step={1}
              value={setpoint}
              onChange={(e) => updateSetpoint(parseFloat(e.target.value), `SP ${e.target.value}%`)}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Kp Slider */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label htmlFor="pid-kp" className="text-slate-700 font-medium">
                <span className="text-emerald-700 font-bold">Kp</span> Proportional Gain{' '}
                <span className="text-slate-500 font-normal hidden sm:inline">&mdash; rise stiffness</span>
              </label>
              <span className="font-mono text-slate-900 font-semibold">
                {kp.toFixed(2)}{' '}
                <span className="text-slate-500 font-normal">
                  ({hudMetrics.pTerm >= 0 ? '+' : ''}
                  {hudMetrics.pTerm.toFixed(0)}%)
                </span>
              </span>
            </div>
            <input
              id="pid-kp"
              type="range"
              min={0}
              max={8}
              step={0.05}
              value={kp}
              onChange={(e) => handleKpChange(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Ki Slider */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label htmlFor="pid-ki" className="text-slate-700 font-medium">
                <span className="text-blue-700 font-bold">Ki</span> Integral Gain{' '}
                <span className="text-slate-500 font-normal hidden sm:inline">&mdash; eliminates load droop</span>
              </label>
              <span className="font-mono text-slate-900 font-semibold">
                {ki.toFixed(2)}{' '}
                <span className="text-slate-500 font-normal">
                  ({hudMetrics.iTerm >= 0 ? '+' : ''}
                  {hudMetrics.iTerm.toFixed(0)}%)
                </span>
              </span>
            </div>
            <input
              id="pid-ki"
              type="range"
              min={0}
              max={4.5}
              step={0.05}
              value={ki}
              onChange={(e) => handleKiChange(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Kd Slider */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label htmlFor="pid-kd" className="text-slate-700 font-medium">
                <span className="text-purple-700 font-bold">Kd</span> Derivative Gain{' '}
                <span className="text-slate-500 font-normal hidden sm:inline">&mdash; overshoot damping</span>
              </label>
              <span className="font-mono text-slate-900 font-semibold">
                {kd.toFixed(2)}{' '}
                <span className="text-slate-500 font-normal">
                  ({hudMetrics.dTerm >= 0 ? '+' : ''}
                  {hudMetrics.dTerm.toFixed(0)}%)
                </span>
              </span>
            </div>
            <input
              id="pid-kd"
              type="range"
              min={0}
              max={3.5}
              step={0.05}
              value={kd}
              onChange={(e) => handleKdChange(parseFloat(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Right 5 Cols: Autotune, Reset, Disturbance Injection & Presets */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between space-y-3 text-xs">
          <div className="space-y-3">
            <div className="text-slate-900 font-semibold text-sm border-b border-slate-200 pb-2">
              Tuning &amp; Load Disturbances
            </div>

            {/* Primary Autotune & Reset Row */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAutotune}
                className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition cursor-pointer"
              >
                Autotune PID
              </button>
              <button
                type="button"
                onClick={handleResetStable}
                className="px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-medium transition cursor-pointer"
              >
                Reset Loop
              </button>
            </div>

            {/* Physical Disturbance Injection Row */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => injectDisturbance(-135, 'DRAIN SURGE -30%')}
                className="px-2.5 py-2 rounded-lg bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 font-medium transition cursor-pointer"
              >
                &darr; Drain Surge (-30%)
              </button>
              <button
                type="button"
                onClick={() => injectDisturbance(135, 'PRESSURE SPIKE +30%')}
                className="px-2.5 py-2 rounded-lg bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-300 hover:border-amber-300 font-medium transition cursor-pointer"
              >
                &uarr; Inflow Spike (+30%)
              </button>
            </div>

            {/* Response Regime Presets */}
            <div className="space-y-1.5 pt-1">
              <div className="text-slate-600 font-medium">
                Regime Presets:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('UNDERDAMPED (RINGING)', 7.2, 3.2, 0.08)}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium transition cursor-pointer"
                >
                  Underdamped (Ring)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('P-ONLY (LOAD DROOP)', 1.9, 0.0, 0.45)}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium transition cursor-pointer"
                >
                  P-Only (Load Droop)
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleAutoStep}
            className={`w-full px-3 py-2 rounded-lg border font-medium transition cursor-pointer ${
              autoStepWave
                ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {autoStepWave
              ? 'Stop Square-Wave Step Test (Active)'
              : 'Run Square-Wave Step Test (30% ↔ 75%)'}
          </button>
        </div>
      </div>
    </div>
  );
}
