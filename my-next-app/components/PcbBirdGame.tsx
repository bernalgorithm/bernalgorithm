'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

// Grid Dimensions
const COLS = 28;
const ROWS = 22;
const CELL_SIZE = 26; // 728 x 572 logical canvas

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Point {
  x: number;
  y: number;
}

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sublabel: string;
  type: 'mcu' | 'dip' | 'smd' | 'via' | 'inductor';
  hotPin?: { x: number; y: number };
}

interface Bug {
  x: number;
  y: number;
  type: 'logic' | 'jitter' | 'leak';
  points: number;
  color: string;
  glow: string;
  animOffset: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  vy: number;
}

interface TraceParticle {
  traceIdx: number;
  t: number; // 0 to 1 along path
  speed: number;
  color: string;
}

// Rich PCB Obstacle Map with realistic electrical components
const STATIC_OBSTACLES: Obstacle[] = [
  // MCU: STM32H743 High-Performance Cortex-M7
  { x: 12, y: 9, w: 4, h: 4, label: 'STM32-H7', sublabel: '480MHz M7', type: 'mcu' },
  // DIP-8: 555 Precision Timer
  { x: 3, y: 3, w: 4, h: 2, label: 'NE555P', sublabel: 'TIMER', type: 'dip' },
  // DIP-16: SPI Flash Memory
  { x: 20, y: 3, w: 5, h: 2, label: 'W25Q128', sublabel: 'SPI FLASH', type: 'dip' },
  // Switching Power Inductor
  { x: 4, y: 15, w: 3, h: 3, label: '10uH', sublabel: 'CHOKE', type: 'inductor' },
  // 3.3V Low-Dropout Linear Regulator
  { x: 21, y: 14, w: 3, h: 2, label: 'AMS1117', sublabel: '3.3V LDO', type: 'smd' },
  // Precision 16MHz Crystal Oscillator
  { x: 9, y: 4, w: 2, h: 1, label: '16MHz', sublabel: 'XTAL', type: 'smd' },
  // Bulk Decoupling Capacitor
  { x: 13, y: 2, w: 2, h: 2, label: '470uF', sublabel: 'LOW-ESR', type: 'via' },
  // Ground Stitching Via Pad
  { x: 13, y: 17, w: 2, h: 2, label: 'GND PAD', sublabel: 'SHIELD', type: 'via' },
];

// PCB Traces for routing visual delight
const PCB_TRACES: Point[][] = [
  [{ x: 110, y: 60 }, { x: 110, y: 140 }, { x: 200, y: 230 }, { x: 310, y: 230 }],
  [{ x: 400, y: 60 }, { x: 500, y: 60 }, { x: 550, y: 110 }, { x: 550, y: 190 }],
  [{ x: 60, y: 440 }, { x: 150, y: 440 }, { x: 230, y: 360 }, { x: 310, y: 360 }],
  [{ x: 420, y: 380 }, { x: 470, y: 430 }, { x: 620, y: 430 }],
  [{ x: 600, y: 250 }, { x: 670, y: 320 }, { x: 670, y: 480 }],
  [{ x: 200, y: 80 }, { x: 270, y: 80 }, { x: 310, y: 120 }],
  [{ x: 380, y: 480 }, { x: 380, y: 530 }, { x: 250, y: 530 }],
];

function isCellObstacle(x: number, y: number): boolean {
  for (const obs of STATIC_OBSTACLES) {
    if (x >= obs.x && x < obs.x + obs.w && y >= obs.y && y < obs.y + obs.h) {
      return true;
    }
  }
  return false;
}

// Web Audio API Synthesizer (Zero asset download, instant retro chiptune audio)
class SoundSynth {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playChirp(pitch = 1.0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(440 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(1100 * pitch, now + 0.12);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playZap() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // White noise blast for spark
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + 0.25);
  }

  playPowerUp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0.15, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.15);
    });
  }

  playTurn() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }
}

const synth = new SoundSynth();

export function PcbBirdGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // React State for HUD & Menus
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pcb_bird_highscore_v2');
        return saved ? parseInt(saved, 10) || 0 : 0;
      } catch {
        return 0;
      }
    }
    return 0;
  });
  const [combo, setCombo] = useState<number>(1);
  const [shieldTime, setShieldTime] = useState<number>(0);
  const [clockMhz, setClockMhz] = useState<number>(120);
  const [bugsFixed, setBugsFixed] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [deathReport, setDeathReport] = useState<{ title: string; desc: string }>({
    title: '',
    desc: '',
  });

  // Game Core References (High performance 60FPS loop)
  const birdRef = useRef<Point[]>([
    { x: 9, y: 11 },
    { x: 8, y: 11 },
    { x: 7, y: 11 },
    { x: 6, y: 11 },
    { x: 5, y: 11 },
  ]);
  const prevBirdRef = useRef<Point[]>([
    { x: 9, y: 11 },
    { x: 8, y: 11 },
    { x: 7, y: 11 },
    { x: 6, y: 11 },
    { x: 5, y: 11 },
  ]);

  const dirRef = useRef<Direction>('RIGHT');
  const nextDirRef = useRef<Direction>('RIGHT');
  const bugsRef = useRef<Bug[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const floatTextsRef = useRef<FloatingText[]>([]);
  const traceParticlesRef = useRef<TraceParticle[]>([]);
  const shieldRef = useRef<number>(0);
  const comboRef = useRef<number>(1);
  const lastEatTimeRef = useRef<number>(0);

  // Time tracking for smooth visual interpolation
  const lastTickTimeRef = useRef<number>(0);
  const tickDurationRef = useRef<number>(130);

  // Spawn a bug on a legal, unoccupied green cell
  const spawnBug = useCallback((forceType?: 'logic' | 'jitter' | 'leak') => {
    const emptyCells: Point[] = [];
    for (let x = 1; x < COLS - 1; x++) {
      for (let y = 1; y < ROWS - 1; y++) {
        if (!isCellObstacle(x, y)) {
          const onBird = birdRef.current.some((b) => b.x === x && b.y === y);
          const hasBug = bugsRef.current.some((bg) => bg.x === x && bg.y === y);
          if (!onBird && !hasBug) {
            emptyCells.push({ x, y });
          }
        }
      }
    }

    if (emptyCells.length === 0) return;
    const chosen = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    let type: 'logic' | 'jitter' | 'leak' = 'logic';
    if (forceType) {
      type = forceType;
    } else {
      const roll = Math.random();
      if (roll < 0.15) type = 'leak'; // 15% Shield / Capacitive bug
      else if (roll < 0.35) type = 'jitter'; // 20% Fast Jitter Moth
      else type = 'logic'; // 65% Normal Bug
    }

    const bugInfo: Record<'logic' | 'jitter' | 'leak', { points: number; color: string; glow: string }> = {
      logic: { points: 100, color: '#f43f5e', glow: '#fb7185' },
      jitter: { points: 250, color: '#f59e0b', glow: '#fcd34d' },
      leak: { points: 400, color: '#06b6d4', glow: '#67e8f9' },
    };

    bugsRef.current.push({
      x: chosen.x,
      y: chosen.y,
      type,
      points: bugInfo[type].points,
      color: bugInfo[type].color,
      glow: bugInfo[type].glow,
      animOffset: Math.random() * 100,
    });
  }, []);

  // Initialize decorative electron trace particles
  useEffect(() => {
    const particles: TraceParticle[] = [];
    for (let i = 0; i < 16; i++) {
      particles.push({
        traceIdx: Math.floor(Math.random() * PCB_TRACES.length),
        t: Math.random(),
        speed: 0.003 + Math.random() * 0.004,
        color: i % 2 === 0 ? '#38bdf8' : '#34d399',
      });
    }
    traceParticlesRef.current = particles;
  }, []);

  const addFloatingText = (x: number, y: number, text: string, color = '#38bdf8') => {
    floatTextsRef.current.push({
      x: x * CELL_SIZE + CELL_SIZE / 2,
      y: y * CELL_SIZE,
      text,
      color,
      life: 1.0,
      vy: -1.2,
    });
  };

  const triggerSparks = (x: number, y: number, color = '#fbbf24', count = 30) => {
    const list: Spark[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      list.push({
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 3 + 1.5,
        life: 1.0,
      });
    }
    sparksRef.current.push(...list);
  };

  const handleFault = useCallback((title: string, desc: string) => {
    setGameOver(true);
    setDeathReport({ title, desc });
    synth.playZap();
    const head = birdRef.current[0];
    if (head) {
      triggerSparks(head.x, head.y, '#f43f5e', 45);
    }
  }, []);

  const resetGame = useCallback(() => {
    const startPos = [
      { x: 9, y: 11 },
      { x: 8, y: 11 },
      { x: 7, y: 11 },
      { x: 6, y: 11 },
      { x: 5, y: 11 },
    ];
    birdRef.current = [...startPos];
    prevBirdRef.current = [...startPos];
    dirRef.current = 'RIGHT';
    nextDirRef.current = 'RIGHT';
    bugsRef.current = [];
    sparksRef.current = [];
    floatTextsRef.current = [];
    shieldRef.current = 0;
    comboRef.current = 1;

    setScore(0);
    setCombo(1);
    setShieldTime(0);
    setBugsFixed(0);
    setClockMhz(120);
    setGameOver(false);
    setIsPaused(false);
    setGameStarted(true);
    lastTickTimeRef.current = performance.now();
    tickDurationRef.current = 130;

    spawnBug('logic');
    spawnBug('jitter');
    synth.playPowerUp();
  }, [spawnBug]);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.key === 'Spacebar') {
        if (!gameStarted || gameOver) {
          resetGame();
        } else {
          setIsPaused((p) => !p);
        }
        return;
      }

      if (key === 'm') {
        setSoundOn((s) => {
          synth.enabled = !s;
          return !s;
        });
        return;
      }

      const curr = dirRef.current;
      if ((key === 'arrowup' || key === 'w') && curr !== 'DOWN') {
        if (nextDirRef.current !== 'UP') synth.playTurn();
        nextDirRef.current = 'UP';
      } else if ((key === 'arrowdown' || key === 's') && curr !== 'UP') {
        if (nextDirRef.current !== 'DOWN') synth.playTurn();
        nextDirRef.current = 'DOWN';
      } else if ((key === 'arrowleft' || key === 'a') && curr !== 'RIGHT') {
        if (nextDirRef.current !== 'LEFT') synth.playTurn();
        nextDirRef.current = 'LEFT';
      } else if ((key === 'arrowright' || key === 'd') && curr !== 'LEFT') {
        if (nextDirRef.current !== 'RIGHT') synth.playTurn();
        nextDirRef.current = 'RIGHT';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver, resetGame]);

  // Main Logical Game Tick (Game clock)
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;

    let timeoutId: NodeJS.Timeout;

    const gameTick = () => {
      const now = performance.now();
      lastTickTimeRef.current = now;

      // Handle Shield Countdown
      if (shieldRef.current > 0) {
        shieldRef.current -= 1;
        setShieldTime(shieldRef.current);
      }

      // Handle Combo decay
      if (now - lastEatTimeRef.current > 4000 && comboRef.current > 1) {
        comboRef.current = 1;
        setCombo(1);
      }

      const head = birdRef.current[0];
      const nextDir = nextDirRef.current;
      dirRef.current = nextDir;

      let nx = head.x;
      let ny = head.y;
      if (nextDir === 'UP') ny -= 1;
      if (nextDir === 'DOWN') ny += 1;
      if (nextDir === 'LEFT') nx -= 1;
      if (nextDir === 'RIGHT') nx += 1;

      // Wall Collision (Edge of PCB)
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
        handleFault('SUBSTRATE OVERRUN', 'The elongated bird severed trace continuity beyond the PCB edge!');
        return;
      }

      // Soldered IC Collision (Unless Shielded!)
      const hitObstacle = isCellObstacle(nx, ny);
      if (hitObstacle) {
        if (shieldRef.current > 0) {
          // Shield active: Phase through chip!
          triggerSparks(nx, ny, '#38bdf8', 6);
          addFloatingText(nx, ny, 'PHASED OVER IC', '#38bdf8');
        } else {
          handleFault(
            'DIELECTRIC BREAKDOWN',
            'Fatal short-circuit with live soldered IC pins! High-voltage surge vaporized the avian debugger.'
          );
          return;
        }
      }

      // Self Collision
      if (birdRef.current.some((seg) => seg.x === nx && seg.y === ny)) {
        handleFault('PARASITIC FEEDBACK LOOP', 'The bird coiled into its own neck traces, causing catastrophic signal loopback.');
        return;
      }

      // Advance positions
      prevBirdRef.current = birdRef.current.map((pt) => ({ ...pt }));
      const newBird = [{ x: nx, y: ny }, ...birdRef.current];

      // Check Bug Consumption
      const bugIndex = bugsRef.current.findIndex((bg) => bg.x === nx && bg.y === ny);
      if (bugIndex !== -1) {
        const eaten = bugsRef.current[bugIndex];
        bugsRef.current.splice(bugIndex, 1);

        // Combo scaling
        const eatGap = now - lastEatTimeRef.current;
        lastEatTimeRef.current = now;
        let newCombo = comboRef.current;
        if (eatGap < 2200) {
          newCombo = Math.min(4, newCombo + 1);
        } else {
          newCombo = 1;
        }
        comboRef.current = newCombo;
        setCombo(newCombo);

        const earned = eaten.points * newCombo;
        triggerSparks(nx, ny, eaten.glow, 20);
        addFloatingText(nx, ny, `+${earned}${newCombo > 1 ? ` (x${newCombo})` : ''}`, eaten.glow);
        synth.playChirp(1 + newCombo * 0.2);

        // Power-up effect for Memory Leak bug
        if (eaten.type === 'leak') {
          shieldRef.current = 30; // ~4 seconds of phase shield
          setShieldTime(30);
          addFloatingText(nx, ny - 1, 'GROUND SHIELD ACTIVE!', '#22d3ee');
          synth.playPowerUp();
        }

        setBugsFixed((b) => b + 1);
        setScore((prev) => {
          const next = prev + earned;
          if (next > highScore) {
            setHighScore(next);
            try {
              localStorage.setItem('pcb_bird_highscore_v2', next.toString());
            } catch {
              // ignore
            }
          }
          return next;
        });

        // Boost clock speed as score rises
        setClockMhz(Math.min(600, 120 + Math.floor(newBird.length * 8)));

        // Spawn next bugs (maintain 2-3 bugs on board)
        spawnBug();
        if (bugsRef.current.length < 2) {
          spawnBug();
        }
      } else {
        newBird.pop();
      }

      birdRef.current = newBird;

      // Speed formula (faster as bird grows)
      const currentSpeed = Math.max(70, 130 - Math.floor(newBird.length / 2) * 4);
      tickDurationRef.current = currentSpeed;
      timeoutId = setTimeout(gameTick, currentSpeed);
    };

    timeoutId = setTimeout(gameTick, tickDurationRef.current);
    return () => clearTimeout(timeoutId);
  }, [gameStarted, gameOver, isPaused, highScore, handleFault, spawnBug]);

  // 60FPS High-Definition Canvas Render Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const now = performance.now();
      const tickProgress = Math.min(1.0, (now - lastTickTimeRef.current) / tickDurationRef.current);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ==========================================
      // 1. PCB FR4 SUBSTRATE & GROUND PLANE TEXTURE
      // ==========================================
      ctx.fillStyle = '#062d16'; // Classic deep dark FR4 solder mask
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Copper Pour / Ground Hatching
      ctx.strokeStyle = '#083a1d';
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvas.width; x += CELL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += CELL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Copper Ground Stitched Vias (Perimeter & Field)
      ctx.fillStyle = '#b49439';
      ctx.strokeStyle = '#062d16';
      for (let x = 8; x < canvas.width; x += 36) {
        ctx.beginPath();
        ctx.arc(x, 6, 2.5, 0, Math.PI * 2);
        ctx.arc(x, canvas.height - 6, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // ==========================================
      // 2. COPPER ROUTING TRACES & ELECTRON STREAMS
      // ==========================================
      ctx.strokeStyle = '#12542a';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const trace of PCB_TRACES) {
        ctx.beginPath();
        ctx.moveTo(trace[0].x, trace[0].y);
        for (let i = 1; i < trace.length; i++) {
          ctx.lineTo(trace[i].x, trace[i].y);
        }
        ctx.stroke();

        // Gold plated via endpoints
        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        ctx.arc(trace[0].x, trace[0].y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(trace[trace.length - 1].x, trace[trace.length - 1].y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dynamic Electron Pulses flowing along traces
      for (const p of traceParticlesRef.current) {
        p.t += p.speed;
        if (p.t > 1) p.t = 0;

        const trace = PCB_TRACES[p.traceIdx];
        if (trace && trace.length >= 2) {
          const totalSegments = trace.length - 1;
          const currentSeg = Math.min(totalSegments - 1, Math.floor(p.t * totalSegments));
          const subT = (p.t * totalSegments) - currentSeg;
          const p1 = trace[currentSeg];
          const p2 = trace[currentSeg + 1];
          const px = p1.x + (p2.x - p1.x) * subT;
          const py = p1.y + (p2.y - p1.y) * subT;

          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // ==========================================
      // 3. SILKSCREEN MARKINGS & SOLDER COMPONENTS
      // ==========================================
      // Silkscreen metadata & logo
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('REV D2 // CORTEX-M7 ARCHITECTURE // AGY-BOARD', 16, 20);

      // Blinking SMD Heartbeat LED
      const blink = Math.sin(now / 150) > 0;
      ctx.fillStyle = blink ? '#38bdf8' : '#0369a1';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = blink ? 8 : 0;
      ctx.fillRect(canvas.width - 44, 12, 6, 4);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px monospace';
      ctx.fillText('HB_ACT', canvas.width - 80, 16);

      // Render IC Components & Obstacles
      for (const obs of STATIC_OBSTACLES) {
        const px = obs.x * CELL_SIZE;
        const py = obs.y * CELL_SIZE;
        const pw = obs.w * CELL_SIZE;
        const ph = obs.h * CELL_SIZE;

        if (obs.type === 'mcu') {
          // Microcontroller Quad Flat Package
          // Perimeter Silver Solder Pins
          ctx.fillStyle = '#e2e8f0';
          const pinCountX = obs.w * 3;
          const pinStepX = pw / pinCountX;
          for (let i = 0; i < pinCountX; i++) {
            ctx.fillRect(px + i * pinStepX + 1.5, py - 5, pinStepX - 3, 5);
            ctx.fillRect(px + i * pinStepX + 1.5, py + ph, pinStepX - 3, 5);
          }
          const pinCountY = obs.h * 3;
          const pinStepY = ph / pinCountY;
          for (let j = 0; j < pinCountY; j++) {
            ctx.fillRect(px - 5, py + j * pinStepY + 1.5, 5, pinStepY - 3);
            ctx.fillRect(px + pw, py + j * pinStepY + 1.5, 5, pinStepY - 3);
          }

          // Molded Black Plastic Epoxy Body
          ctx.fillStyle = '#111827';
          ctx.fillRect(px, py, pw, ph);

          // Chamfered Edge
          ctx.strokeStyle = '#374151';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);

          // Pin 1 Index Dot
          ctx.fillStyle = '#6b7280';
          ctx.beginPath();
          ctx.arc(px + 9, py + 9, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Laser Etched Silkscreen
          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(obs.label, px + pw / 2, py + ph / 2 - 4);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '8px monospace';
          ctx.fillText(obs.sublabel, px + pw / 2, py + ph / 2 + 8);
        } else if (obs.type === 'dip') {
          // Dual Inline Package
          ctx.fillStyle = '#cbd5e1';
          for (let j = 0; j < obs.h * 2; j++) {
            const pinY = py + j * (ph / (obs.h * 2)) + 3;
            ctx.fillRect(px - 6, pinY, 6, 6);
            ctx.fillRect(px + pw, pinY, 6, 6);
          }

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px, py, pw, ph);
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, pw, ph);

          // Top Index Notch
          ctx.fillStyle = '#062d16';
          ctx.beginPath();
          ctx.arc(px + pw / 2, py, 6, 0, Math.PI);
          ctx.fill();

          ctx.fillStyle = '#f1f5f9';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(obs.label, px + pw / 2, py + ph / 2);
        } else if (obs.type === 'inductor') {
          // High-current Toroidal / Shielded Choke
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.arc(px + pw / 2, py + ph / 2, pw / 2 - 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#d97706'; // Copper winding coil
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(px + pw / 2, py + ph / 2, pw / 3, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(obs.label, px + pw / 2, py + ph / 2 + 3);
        } else if (obs.type === 'smd') {
          // Ceramic SMD Package
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(px - 3, py + 2, 4, ph - 4);
          ctx.fillRect(px + pw - 1, py + 2, 4, ph - 4);

          ctx.fillStyle = '#7c2d12';
          ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2);

          ctx.fillStyle = '#fde68a';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(obs.label, px + pw / 2, py + ph / 2 + 3);
        } else if (obs.type === 'via') {
          // Gold Ground Pad / Capacitor Terminal
          ctx.fillStyle = '#d4af37';
          ctx.beginPath();
          ctx.arc(px + pw / 2, py + ph / 2, pw / 2 - 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#062d16';
          ctx.beginPath();
          ctx.arc(px + pw / 2, py + ph / 2, pw / 3.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(obs.label, px + pw / 2, py + ph + 8);
        }
      }

      // ==========================================
      // 4. ANIMATED HARDWARE BUGS (FOOD ITEMS)
      // ==========================================
      for (const bug of bugsRef.current) {
        const bx = bug.x * CELL_SIZE + CELL_SIZE / 2;
        const by = bug.y * CELL_SIZE + CELL_SIZE / 2;
        const t = (now / 100) + bug.animOffset;
        const legWiggle = Math.sin(t) * 2.5;

        // Bug Glow Aura
        ctx.shadowColor = bug.glow;
        ctx.shadowBlur = 10;

        // Bug Legs (6 articulated limbs)
        ctx.strokeStyle = bug.color;
        ctx.lineWidth = 1.5;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(bx - 3, by + i * 4);
          ctx.lineTo(bx - 9, by + i * 4 + legWiggle * (i || 1));
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(bx + 3, by + i * 4);
          ctx.lineTo(bx + 9, by + i * 4 - legWiggle * (i || 1));
          ctx.stroke();
        }

        // Bug Carapace
        ctx.fillStyle = bug.color;
        ctx.beginPath();
        ctx.ellipse(bx, by, 6.5, 7.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Antennae
        ctx.beginPath();
        ctx.moveTo(bx - 2, by - 6);
        ctx.lineTo(bx - 7, by - 12 + Math.cos(t) * 1.5);
        ctx.moveTo(bx + 2, by - 6);
        ctx.lineTo(bx + 7, by - 12 - Math.cos(t) * 1.5);
        ctx.stroke();

        // Bug Glitch Core (Pulsing bright eye)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bx, by - 1, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
      }

      // ==========================================
      // 5. THE ELONGATED BIRD (KINEMATICS & PLUMAGE)
      // ==========================================
      const bird = birdRef.current;
      const prevBird = prevBirdRef.current;

      if (bird.length > 0) {
        // Compute interpolated visual points for 60FPS fluid gliding
        const visualPoints: Point[] = [];
        for (let i = 0; i < bird.length; i++) {
          const curr = bird[i];
          const prev = prevBird[i] || curr;
          const vx = prev.x * CELL_SIZE + (curr.x - prev.x) * CELL_SIZE * tickProgress + CELL_SIZE / 2;
          const vy = prev.y * CELL_SIZE + (curr.y - prev.y) * CELL_SIZE * tickProgress + CELL_SIZE / 2;

          // Undulating spine wave (subtle serpentine sway)
          const wavePhase = (now / 150) - i * 0.45;
          const waveAmp = Math.min(2.5, i * 0.2);
          const swayX = Math.cos(wavePhase) * waveAmp;
          const swayY = Math.sin(wavePhase) * waveAmp;

          visualPoints.push({ x: vx + swayX, y: vy + swayY });
        }

        // Draw Ground Shield Barrier (if active)
        if (shieldRef.current > 0) {
          ctx.strokeStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 14;
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let i = 0; i < visualPoints.length; i++) {
            const pt = visualPoints[i];
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Draw Feathery Body Segments (from tail to head)
        for (let i = visualPoints.length - 1; i >= 1; i--) {
          const pt = visualPoints[i];
          const radius = Math.max(7, (CELL_SIZE / 2) - 1.5);

          // Iridescent plumage gradient (Kingfisher / Cyber Hummingbird palette)
          const ratio = i / visualPoints.length;
          const r = Math.floor(14 + ratio * 55);
          const g = Math.floor(165 - ratio * 45);
          const b = Math.floor(233 - ratio * 70);

          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Outer Plumage Ring
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Winglet Nubs on first 4 segments
          if (i <= 4) {
            const wingFlap = Math.sin((now / 80) + i) * 3;
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.ellipse(pt.x - 10, pt.y, 4, 2 + Math.abs(wingFlap), 0, 0, Math.PI * 2);
            ctx.ellipse(pt.x + 10, pt.y, 4, 2 + Math.abs(wingFlap), 0, 0, Math.PI * 2);
            ctx.fill();
          }

          // Tail Feather Fan on very last segment
          if (i === visualPoints.length - 1) {
            ctx.fillStyle = '#fbbf24'; // Golden Tail Feathers
            for (let a = -0.5; a <= 0.5; a += 0.5) {
              ctx.beginPath();
              ctx.ellipse(pt.x - Math.sin(a) * 8, pt.y + 10, 3, 7, a, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Draw The Bird's Head (Segment 0)
        const headPt = visualPoints[0];
        const hRad = CELL_SIZE / 2;
        const dir = dirRef.current;

        // Head Base
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(headPt.x, headPt.y, hRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#7dd3fc';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Bird Crest / Crown Feathers
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(headPt.x, headPt.y - hRad + 2, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Dynamic Beak pointing in movement direction
        let bTipX = headPt.x;
        let bTipY = headPt.y;
        let b1x = headPt.x, b1y = headPt.y, b2x = headPt.x, b2y = headPt.y;

        // Is bird close to a bug? Open beak in anticipation!
        const nearestBug = bugsRef.current.find(
          (bg) => Math.hypot(bg.x - bird[0].x, bg.y - bird[0].y) <= 2.5
        );
        const beakGap = nearestBug ? 7 : 4;

        if (dir === 'RIGHT') {
          bTipX = headPt.x + hRad + 11;
          bTipY = headPt.y;
          b1x = headPt.x + hRad - 2; b1y = headPt.y - beakGap;
          b2x = headPt.x + hRad - 2; b2y = headPt.y + beakGap;
        } else if (dir === 'LEFT') {
          bTipX = headPt.x - hRad - 11;
          bTipY = headPt.y;
          b1x = headPt.x - hRad + 2; b1y = headPt.y - beakGap;
          b2x = headPt.x - hRad + 2; b2y = headPt.y + beakGap;
        } else if (dir === 'UP') {
          bTipX = headPt.x;
          bTipY = headPt.y - hRad - 11;
          b1x = headPt.x - beakGap; b1y = headPt.y - hRad + 2;
          b2x = headPt.x + beakGap; b2y = headPt.y - hRad + 2;
        } else if (dir === 'DOWN') {
          bTipX = headPt.x;
          bTipY = headPt.y + hRad + 11;
          b1x = headPt.x - beakGap; b1y = headPt.y + hRad - 2;
          b2x = headPt.x + beakGap; b2y = headPt.y + hRad - 2;
        }

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(b1x, b1y);
        ctx.lineTo(bTipX, bTipY);
        ctx.lineTo(b2x, b2y);
        ctx.closePath();
        ctx.fill();

        // Quirky Googly Eyes with Pupil tracking movement
        let eyeX = headPt.x;
        let eyeY = headPt.y - 2;
        if (dir === 'RIGHT') eyeX += 3;
        if (dir === 'LEFT') eyeX -= 3;
        if (dir === 'UP') eyeY -= 3;
        if (dir === 'DOWN') eyeY += 3;

        // Sclera (White)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Pupil tracking forward
        ctx.fillStyle = '#0f172a';
        let pupilX = eyeX;
        let pupilY = eyeY;
        if (dir === 'RIGHT') pupilX += 1.8;
        if (dir === 'LEFT') pupilX -= 1.8;
        if (dir === 'UP') pupilY -= 1.8;
        if (dir === 'DOWN') pupilY += 1.8;

        ctx.beginPath();
        ctx.arc(pupilX, pupilY, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // ==========================================
      // 6. PARTICLES: SPARKS & FLOATING COMBOS
      // ==========================================
      for (const sp of sparksRef.current) {
        ctx.fillStyle = sp.color;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, Math.max(1, sp.size * sp.life), 0, Math.PI * 2);
        ctx.fill();
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life -= 0.035;
      }
      sparksRef.current = sparksRef.current.filter((s) => s.life > 0);
      ctx.shadowBlur = 0;

      // Floating Score Numbers
      for (const ft of floatTextsRef.current) {
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.fillText(ft.text, ft.x, ft.y);
        ft.y += ft.vy;
        ft.life -= 0.025;
      }
      floatTextsRef.current = floatTextsRef.current.filter((f) => f.life > 0);
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="flex flex-col items-center my-8 p-6 bg-slate-950 border-2 border-emerald-500 rounded-3xl shadow-2xl text-slate-100 max-w-4xl mx-auto font-mono">
      {/* Upper Cockpit HUD */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">🐦⚡</span>
            <h3 className="text-2xl font-black tracking-wider text-emerald-400">
              PCB BIRD // HARDWARE DEBUGGER
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            FR4 Multilayer Substrate &bull; Target: STM32H743ZI &bull; Hot IC Avoidance
          </p>
        </div>

        {/* Realtime Metrics */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">CLOCK FREQ</span>
            <span className="font-bold text-amber-400 text-sm">{clockMhz} MHz</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px]">TRACE MULT</span>
            <span className={`font-bold text-sm ${combo > 1 ? 'text-rose-400 animate-bounce' : 'text-slate-300'}`}>
              x{combo}.0
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px]">BUGS FIXED</span>
            <span className="font-bold text-emerald-400 text-sm">{bugsFixed}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px]">SCORE</span>
            <span className="font-extrabold text-cyan-400 text-base">{score}</span>
          </div>
        </div>
      </div>

      {/* Ground Shield Status Indicator */}
      {shieldTime > 0 && (
        <div className="w-full mb-3 px-4 py-2 bg-cyan-950/80 border border-cyan-500 rounded-lg flex items-center justify-between text-xs animate-pulse text-cyan-300">
          <span className="font-bold">⚡ GROUND PLANE SHIELD ACTIVE — PASSING SAFELY OVER ICS!</span>
          <span className="font-mono font-black">{Math.ceil(shieldTime / 7)}s</span>
        </div>
      )}

      {/* High-Definition Canvas Canvas */}
      <div className="relative border-4 border-emerald-900/80 rounded-2xl overflow-hidden bg-black shadow-2xl">
        <canvas
          ref={canvasRef}
          width={COLS * CELL_SIZE}
          height={ROWS * CELL_SIZE}
          className="block max-w-full h-auto cursor-pointer"
          onClick={() => {
            if (!gameStarted || gameOver) resetGame();
          }}
        />

        {/* Start / System Fault / Pause Overlay */}
        {(!gameStarted || gameOver || isPaused) && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            {gameOver ? (
              <div className="space-y-4 max-w-lg">
                <div className="text-5xl animate-bounce">💥⚡</div>
                <h4 className="text-3xl font-black text-rose-500 tracking-widest uppercase">
                  {deathReport.title || 'SYSTEM HALT'}
                </h4>
                <p className="text-xs text-rose-200 bg-rose-950/60 p-3 rounded-lg border border-rose-800/80 leading-relaxed">
                  {deathReport.desc}
                </p>

                <div className="grid grid-cols-2 gap-3 py-2 text-xs bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-400">Total Score:</span>{' '}
                    <span className="font-bold text-cyan-400 text-base">{score}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">High Score:</span>{' '}
                    <span className="font-bold text-amber-400 text-base">{highScore}</span>
                  </div>
                </div>

                <button
                  onClick={resetGame}
                  className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl tracking-wider transition shadow-lg hover:shadow-emerald-500/30 cursor-pointer text-sm"
                >
                  REBOOT CORE (Spacebar)
                </button>
              </div>
            ) : isPaused ? (
              <div className="space-y-3">
                <h4 className="text-3xl font-black text-amber-400 tracking-wider">EXECUTION HALTED</h4>
                <p className="text-xs text-slate-400">Press Spacebar to resume execution cycle</p>
                <button
                  onClick={() => setIsPaused(false)}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                >
                  RESUME CYCLE
                </button>
              </div>
            ) : (
              <div className="space-y-5 max-w-md">
                <div className="text-6xl animate-pulse">🐦</div>
                <h4 className="text-3xl font-black text-emerald-400 tracking-wider">
                  PCB BIRD RUNNER
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You are an elongated avian debugger exploring a live 4-layer FR4 PCB. Slither across the green solder mask to devour software glitches and clock moths!
                </p>
                <div className="text-left text-[11px] bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1.5 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-bold">🔴 Logic Bug:</span> +100 Pts
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">🟡 Clock Jitter Moth:</span> +250 Pts (Speed boost)
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">🔵 Memory Leak Bug:</span> +400 Pts & Ground Shield (Walk over chips!)
                  </div>
                </div>
                <button
                  onClick={resetGame}
                  className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl tracking-wider transition shadow-lg hover:shadow-emerald-500/30 cursor-pointer text-base"
                >
                  POWER UP (Spacebar)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control Console & Audio Toggle */}
      <div className="w-full mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="space-y-1">
          <p><span className="text-emerald-400 font-bold">Steer:</span> Arrow Keys or WASD &bull; <span className="text-emerald-400 font-bold">Pause:</span> Spacebar</p>
          <p>
            <span className="text-slate-500">Audio:</span>{' '}
            <button
              onClick={() => {
                setSoundOn((s) => {
                  synth.enabled = !s;
                  return !s;
                });
              }}
              className="text-cyan-400 underline hover:text-cyan-300 ml-1"
            >
              {soundOn ? 'Synth Audio ON (Press M)' : 'Audio Muted (Press M)'}
            </button>
          </p>
        </div>

        {/* Mobile / Casual D-Pad */}
        <div className="grid grid-cols-3 gap-1.5 w-36">
          <div />
          <button
            onClick={() => {
              if (dirRef.current !== 'DOWN') {
                nextDirRef.current = 'UP';
                synth.playTurn();
              }
            }}
            className="p-3 bg-slate-900 hover:bg-slate-800 active:bg-emerald-600 rounded-lg text-center border border-slate-800 shadow"
          >
            ▲
          </button>
          <div />
          <button
            onClick={() => {
              if (dirRef.current !== 'RIGHT') {
                nextDirRef.current = 'LEFT';
                synth.playTurn();
              }
            }}
            className="p-3 bg-slate-900 hover:bg-slate-800 active:bg-emerald-600 rounded-lg text-center border border-slate-800 shadow"
          >
            ◀
          </button>
          <button
            onClick={() => {
              if (dirRef.current !== 'UP') {
                nextDirRef.current = 'DOWN';
                synth.playTurn();
              }
            }}
            className="p-3 bg-slate-900 hover:bg-slate-800 active:bg-emerald-600 rounded-lg text-center border border-slate-800 shadow"
          >
            ▼
          </button>
          <button
            onClick={() => {
              if (dirRef.current !== 'LEFT') {
                nextDirRef.current = 'RIGHT';
                synth.playTurn();
              }
            }}
            className="p-3 bg-slate-900 hover:bg-slate-800 active:bg-emerald-600 rounded-lg text-center border border-slate-800 shadow"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
