'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

const CANVAS_W = 760;
const CANVAS_H = 560;

type PowerUpType = 'MULTIBALL' | 'WIDE_BUS' | 'REFLOW_LASER' | 'ZENER_CLAMP' | 'OVERVOLT';

interface Brick {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  label: string;
  sublabel: string;
  category: 'fuse' | 'ic' | 'dma' | 'resistor' | 'capacitor';
  color: string;
  borderColor: string;
  points: number;
  hitFlash: number;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  stuck: boolean;
  offsetX: number;
  overvolt: boolean;
  trail: { x: number; y: number }[];
}

interface PowerUp {
  x: number;
  y: number;
  vy: number;
  type: PowerUpType;
  label: string;
  color: string;
}

interface LaserBolt {
  x: number;
  y: number;
  vy: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface FloatingTag {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

class BreakthroughAudio {
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

  playPaddleHit(normOffset: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    const baseFreq = 260 + Math.abs(normOffset) * 120;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, now + 0.07);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playBrickDamage(hpRemaining: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    const freq = hpRemaining === 2 ? 420 : 560;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.85, now + 0.05);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  playBrickDestroy(combo: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    const base = Math.min(980, 380 + combo * 45);
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * 1.5, now + 0.11);
    gain.gain.setValueAtTime(0.13, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playPowerUp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n, now + idx * 0.045);
      gain.gain.setValueAtTime(0.12, now + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.09);
    });
  }

  playLaser() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.09);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.095);
  }

  playLifeLost() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.linearRampToValueAtTime(75, now + 0.35);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  }
}

const audio = new BreakthroughAudio();

const STAGE_NAMES = [
  'STAGE 1: FR4 PROTOTYPE BREAKOUT',
  'STAGE 2: HIGH-DENSITY BGA INTERPOSER',
  'STAGE 3: BARE SILICON DIE DECAP',
];

function buildStageBricks(stage: number): Brick[] {
  const bricks: Brick[] = [];
  const cols = 8;
  const rows = 5 + Math.min(2, stage - 1);
  const padX = 36;
  const startY = 64;
  const gapX = 10;
  const gapY = 10;
  const totalW = CANVAS_W - padX * 2;
  const brickW = Math.floor((totalW - gapX * (cols - 1)) / cols);
  const brickH = 28;

  const fuseLabels = ['RDP_LVL2', 'LOCK_BIT', 'SEC_BOOT', 'JTAG_FUSE', 'OTP_0x1F', 'AES_KEY0', 'WRP_REG', 'BROM_LCK'];
  const icLabels = ['STM32F4', 'MAX232E', '74HC595', 'W25Q64JV', 'INA219B', 'ADS1115', 'MCP2515', 'TJA1050'];
  const dmaLabels = ['DMA1_CH0', 'SPI_FIFO', 'I2C_TXRX', 'UART_ISR', 'CAN_MBOX', 'ADC_SAR', 'PWM_TIM1', 'CRC_UNIT'];
  const resLabels = ['4.7kΩ', '10kΩ', '330Ω', '100Ω', '1.0kΩ', '2.2kΩ', '47kΩ', '0Ω_JMP'];
  const capLabels = ['100nF', '10µF', '22pF', '4.7µF', '1.0µF', '470nF', '10nF', '2.2µF'];

  let idCounter = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Stage-specific layout patterns
      if (stage === 2 && r === 2 && (c === 3 || c === 4)) continue;
      if (stage === 3 && (r + c) % 7 === 0 && r > 1) continue;

      const x = padX + c * (brickW + gapX);
      const y = startY + r * (brickH + gapY);

      let category: Brick['category'] = 'capacitor';
      let hp = 1;
      let label = capLabels[c % capLabels.length];
      let sublabel = 'MLCC 0805';
      let color = '#a855f7';
      let borderColor = '#d8b4fe';
      let points = 100;

      if (r === 0) {
        category = 'fuse';
        hp = 3;
        label = fuseLabels[c % fuseLabels.length];
        sublabel = 'SECURITY FUSE';
        color = '#f59e0b';
        borderColor = '#fde68a';
        points = 350;
      } else if (r === 1) {
        category = 'ic';
        hp = 2;
        label = icLabels[c % icLabels.length];
        sublabel = 'SOIC-8 IC';
        color = '#ef4444';
        borderColor = '#fca5a5';
        points = 250;
      } else if (r === 2) {
        category = 'dma';
        hp = stage >= 2 ? 2 : 1;
        label = dmaLabels[c % dmaLabels.length];
        sublabel = 'BUS NODE';
        color = '#06b6d4';
        borderColor = '#67e8f9';
        points = 180;
      } else if (r === 3) {
        category = 'resistor';
        hp = 1;
        label = resLabels[c % resLabels.length];
        sublabel = 'SMD 0603';
        color = '#10b981';
        borderColor = '#6ee7b7';
        points = 130;
      } else {
        category = 'capacitor';
        hp = 1;
        label = capLabels[(c + r) % capLabels.length];
        sublabel = 'DECOUPLE';
        color = '#8b5cf6';
        borderColor = '#c4b5fd';
        points = 100;
      }

      bricks.push({
        id: idCounter++,
        x,
        y,
        w: brickW,
        h: brickH,
        hp,
        maxHp: hp,
        label,
        sublabel,
        category,
        color,
        borderColor,
        points,
        hitFlash: 0,
      });
    }
  }

  return bricks;
}

export function SiliconBreakthroughGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bernalgorithm_breakthrough_hi');
      const parsed = saved ? parseInt(saved, 10) : 0;
      return !isNaN(parsed) ? parsed : 0;
    }
    return 0;
  });
  const [lives, setLives] = useState(3);
  const [stage, setStage] = useState(1);
  const [combo, setCombo] = useState(1);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'PAUSED' | 'STAGE_CLEAR' | 'GAMEOVER' | 'VICTORY'>('START');
  const [soundOn, setSoundOn] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>('JTAG PROBE READY — CLICK OR PRESS SPACE TO INJECT PULSE');

  // Mutable simulation state inside refs for 60fps loop
  const paddleRef = useRef({
    x: CANVAS_W / 2 - 58,
    y: CANVAS_H - 38,
    w: 116,
    baseW: 116,
    h: 16,
    vx: 0,
    wideTimer: 0,
    laserTimer: 0,
    laserCooldown: 0,
    zenerClamp: false,
  });

  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const bricksRef = useRef<Brick[]>([]);
  const ballsRef = useRef<Ball[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const lasersRef = useRef<LaserBolt[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const tagsRef = useRef<FloatingTag[]>([]);
  const scoreRef = useRef(0);
  const highScoreRef = useRef(highScore);
  const livesRef = useRef(3);
  const stageRef = useRef(1);
  const comboRef = useRef(1);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  const spawnParticles = useCallback((x: number, y: number, color: string, count = 14) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 4.2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2 + Math.random() * 2.5,
        life: 1,
        maxLife: 18 + Math.floor(Math.random() * 16),
      });
    }
  }, []);

  const spawnTag = useCallback((x: number, y: number, text: string, color: string) => {
    tagsRef.current.push({ x, y, text, color, life: 36 });
  }, []);

  const resetBallOnPaddle = useCallback(() => {
    const p = paddleRef.current;
    ballsRef.current = [
      {
        x: p.x + p.w / 2,
        y: p.y - 9,
        vx: 4.2 * (Math.random() > 0.5 ? 1 : -1),
        vy: -5.4,
        radius: 7,
        stuck: true,
        offsetX: 0,
        overvolt: false,
        trail: [],
      },
    ];
  }, []);

  const initGame = useCallback(
    (targetStage = 1, keepScore = false) => {
      if (!keepScore) {
        scoreRef.current = 0;
        setScore(0);
        livesRef.current = 3;
        setLives(3);
      }
      stageRef.current = targetStage;
      setStage(targetStage);
      comboRef.current = 1;
      setCombo(1);

      paddleRef.current = {
        x: CANVAS_W / 2 - 58,
        y: CANVAS_H - 38,
        w: 116,
        baseW: 116,
        h: 16,
        vx: 0,
        wideTimer: 0,
        laserTimer: 0,
        laserCooldown: 0,
        zenerClamp: false,
      };

      bricksRef.current = buildStageBricks(targetStage);
      powerUpsRef.current = [];
      lasersRef.current = [];
      particlesRef.current = [];
      tagsRef.current = [];
      resetBallOnPaddle();
      setActiveStatus(`${STAGE_NAMES[targetStage - 1]} — PRESS SPACE OR CLICK TO LAUNCH SIGNAL`);
      setGameState('PLAYING');
    },
    [resetBallOnPaddle]
  );

  const launchOrFire = useCallback(() => {
    if (gameStateRef.current !== 'PLAYING') return;
    let launchedAny = false;
    ballsRef.current.forEach((b) => {
      if (b.stuck) {
        b.stuck = false;
        const speed = 6.4 + (stageRef.current - 1) * 0.45;
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.45;
        b.vx = Math.cos(angle) * speed;
        b.vy = Math.sin(angle) * speed;
        launchedAny = true;
      }
    });
    if (launchedAny) {
      audio.playPaddleHit(0);
      setActiveStatus('SIGNAL PULSE ACTIVE — BREAK THROUGH THE SILICON BARRIERS');
      return;
    }

    // Fire reflow lasers if active
    const p = paddleRef.current;
    if (p.laserTimer > 0 && p.laserCooldown <= 0) {
      lasersRef.current.push(
        { x: p.x + 12, y: p.y - 4, vy: -9.5 },
        { x: p.x + p.w - 12, y: p.y - 4, vy: -9.5 }
      );
      p.laserCooldown = 14;
      audio.playLaser();
    }
  }, []);

  // Keyboard & Mouse controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
      } else if (e.key === ' ') {
        e.preventDefault();
        if (gameStateRef.current === 'START' || gameStateRef.current === 'GAMEOVER' || gameStateRef.current === 'VICTORY') {
          initGame(1, false);
        } else if (gameStateRef.current === 'STAGE_CLEAR') {
          initGame(stageRef.current + 1, true);
        } else if (gameStateRef.current === 'PLAYING') {
          launchOrFire();
        }
      } else if (e.key === 'p' || e.key === 'P') {
        if (gameStateRef.current === 'PLAYING') setGameState('PAUSED');
        else if (gameStateRef.current === 'PAUSED') setGameState('PLAYING');
      } else if (e.key === 'm' || e.key === 'M') {
        setSoundOn((prev) => {
          audio.enabled = !prev;
          return !prev;
        });
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [initGame, launchOrFire]);

  // Main 60FPS simulation & render loop
  useEffect(() => {
    let animId: number;
    let tick = 0;

    const maybeDropPowerUp = (brick: Brick) => {
      if (Math.random() > 0.26) return;
      const pool: { type: PowerUpType; label: string; color: string }[] = [
        { type: 'MULTIBALL', label: '+PLL HARMONIC', color: '#38bdf8' },
        { type: 'WIDE_BUS', label: '32-BIT BUS', color: '#34d399' },
        { type: 'REFLOW_LASER', label: 'REFLOW LASER', color: '#f43f5e' },
        { type: 'ZENER_CLAMP', label: 'ZENER CLAMP', color: '#facc15' },
        { type: 'OVERVOLT', label: 'OVERVOLT 12V', color: '#fb923c' },
      ];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      powerUpsRef.current.push({
        x: brick.x + brick.w / 2,
        y: brick.y + brick.h / 2,
        vy: 2.3,
        ...pick,
      });
    };

    const applyPowerUp = (pu: PowerUp) => {
      const p = paddleRef.current;
      audio.playPowerUp();
      spawnTag(pu.x, pu.y, pu.label, pu.color);
      setActiveStatus(`INTERRUPT VECTOR TRIGGERED: ${pu.label}`);

      if (pu.type === 'WIDE_BUS') {
        p.w = 172;
        p.wideTimer = 600;
        if (p.x + p.w > CANVAS_W - 12) p.x = CANVAS_W - 12 - p.w;
      } else if (pu.type === 'REFLOW_LASER') {
        p.laserTimer = 540;
      } else if (pu.type === 'ZENER_CLAMP') {
        p.zenerClamp = true;
      } else if (pu.type === 'OVERVOLT') {
        ballsRef.current.forEach((b) => {
          b.overvolt = true;
        });
      } else if (pu.type === 'MULTIBALL') {
        const source = ballsRef.current[0];
        if (source) {
          source.stuck = false;
          ballsRef.current.push(
            {
              x: source.x,
              y: source.y,
              vx: -Math.abs(source.vx) - 1.2,
              vy: -Math.abs(source.vy),
              radius: 7,
              stuck: false,
              offsetX: 0,
              overvolt: source.overvolt,
              trail: [],
            },
            {
              x: source.x,
              y: source.y,
              vx: Math.abs(source.vx) + 1.2,
              vy: -Math.abs(source.vy),
              radius: 7,
              stuck: false,
              offsetX: 0,
              overvolt: source.overvolt,
              trail: [],
            }
          );
        }
      }
    };

    const damageBrick = (brick: Brick, overvoltHit: boolean) => {
      const dmg = overvoltHit ? brick.hp : 1;
      brick.hp -= dmg;
      brick.hitFlash = 8;

      if (brick.hp <= 0) {
        const gained = brick.points * comboRef.current;
        scoreRef.current += gained;
        setScore(scoreRef.current);
        if (scoreRef.current > highScoreRef.current) {
          highScoreRef.current = scoreRef.current;
          setHighScore(scoreRef.current);
          if (typeof window !== 'undefined') {
            localStorage.setItem('bernalgorithm_breakthrough_hi', String(scoreRef.current));
          }
        }
        audio.playBrickDestroy(comboRef.current);
        comboRef.current = Math.min(8, comboRef.current + 1);
        setCombo(comboRef.current);
        spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color, 18);
        spawnTag(brick.x + brick.w / 2, brick.y, `+${gained}`, brick.borderColor);
        maybeDropPowerUp(brick);
      } else {
        audio.playBrickDamage(brick.hp);
        spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, '#fde047', 7);
      }
    };

    const stepSimulation = () => {
      if (gameStateRef.current !== 'PLAYING') return;
      const p = paddleRef.current;

      // Paddle movement
      const moveSpeed = 8.4;
      if (keysRef.current.left) {
        p.x = Math.max(12, p.x - moveSpeed);
      }
      if (keysRef.current.right) {
        p.x = Math.min(CANVAS_W - 12 - p.w, p.x + moveSpeed);
      }

      // Timers
      if (p.wideTimer > 0) {
        p.wideTimer--;
        if (p.wideTimer === 0) {
          p.w = p.baseW;
        }
      }
      if (p.laserTimer > 0) {
        p.laserTimer--;
      }
      if (p.laserCooldown > 0) {
        p.laserCooldown--;
      }

      // Auto-fire reflow lasers periodically when active
      if (p.laserTimer > 0 && p.laserCooldown === 0 && tick % 24 === 0) {
        lasersRef.current.push(
          { x: p.x + 10, y: p.y - 4, vy: -9.5 },
          { x: p.x + p.w - 10, y: p.y - 4, vy: -9.5 }
        );
        p.laserCooldown = 18;
        audio.playLaser();
      }

      // Update lasers
      for (let i = lasersRef.current.length - 1; i >= 0; i--) {
        const l = lasersRef.current[i];
        l.y += l.vy;
        let hit = false;
        for (let j = bricksRef.current.length - 1; j >= 0; j--) {
          const b = bricksRef.current[j];
          if (l.x >= b.x && l.x <= b.x + b.w && l.y >= b.y && l.y <= b.y + b.h) {
            damageBrick(b, false);
            if (b.hp <= 0) {
              bricksRef.current.splice(j, 1);
            }
            hit = true;
            break;
          }
        }
        if (hit || l.y < 0) {
          lasersRef.current.splice(i, 1);
        }
      }

      // Update balls
      for (let i = ballsRef.current.length - 1; i >= 0; i--) {
        const b = ballsRef.current[i];
        if (b.stuck) {
          b.x = p.x + p.w / 2 + b.offsetX;
          b.y = p.y - b.radius - 2;
          continue;
        }

        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 9) b.trail.shift();

        b.x += b.vx;
        b.y += b.vy;

        // Wall reflections
        if (b.x - b.radius <= 10) {
          b.x = 10 + b.radius;
          b.vx = Math.abs(b.vx);
        } else if (b.x + b.radius >= CANVAS_W - 10) {
          b.x = CANVAS_W - 10 - b.radius;
          b.vx = -Math.abs(b.vx);
        }
        if (b.y - b.radius <= 44) {
          b.y = 44 + b.radius;
          b.vy = Math.abs(b.vy);
        }

        // Zener Clamp save
        if (p.zenerClamp && b.vy > 0 && b.y + b.radius >= CANVAS_H - 14) {
          b.y = CANVAS_H - 14 - b.radius;
          b.vy = -Math.abs(b.vy);
          p.zenerClamp = false;
          audio.playPaddleHit(0);
          spawnParticles(b.x, CANVAS_H - 14, '#facc15', 20);
          spawnTag(b.x, CANVAS_H - 28, 'ZENER CLAMP SAVED!', '#facc15');
        }

        // Paddle collision
        if (
          b.vy > 0 &&
          b.y + b.radius >= p.y &&
          b.y - b.radius <= p.y + p.h &&
          b.x >= p.x - 4 &&
          b.x <= p.x + p.w + 4
        ) {
          const hitOffset = (b.x - (p.x + p.w / 2)) / (p.w / 2); // -1 to 1
          const clamped = Math.max(-0.92, Math.min(0.92, hitOffset));
          const speed = Math.min(9.6, Math.hypot(b.vx, b.vy) * 1.015);
          const bounceAngle = clamped * (Math.PI * 0.36);
          b.vx = Math.sin(bounceAngle) * speed;
          b.vy = -Math.cos(bounceAngle) * speed;
          b.y = p.y - b.radius - 1;
          comboRef.current = 1;
          setCombo(1);
          audio.playPaddleHit(clamped);
          spawnParticles(b.x, p.y, '#38bdf8', 6);
        }

        // Brick collisions
        for (let j = bricksRef.current.length - 1; j >= 0; j--) {
          const br = bricksRef.current[j];
          const closestX = Math.max(br.x, Math.min(b.x, br.x + br.w));
          const closestY = Math.max(br.y, Math.min(b.y, br.y + br.h));
          const dx = b.x - closestX;
          const dy = b.y - closestY;

          if (dx * dx + dy * dy <= b.radius * b.radius) {
            const wasSingleHp = br.hp === 1;
            damageBrick(br, b.overvolt);
            if (br.hp <= 0) {
              bricksRef.current.splice(j, 1);
            }

            // Overvolt slices straight through 1-HP components without bouncing
            if (!(b.overvolt && wasSingleHp)) {
              if (Math.abs(dx) > Math.abs(dy)) {
                b.vx = -b.vx;
              } else {
                b.vy = -b.vy;
              }
            }
            break;
          }
        }

        // Bottom drain
        if (b.y - b.radius > CANVAS_H) {
          ballsRef.current.splice(i, 1);
        }
      }

      // Check if all balls lost
      if (ballsRef.current.length === 0) {
        audio.playLifeLost();
        livesRef.current -= 1;
        setLives(livesRef.current);
        comboRef.current = 1;
        setCombo(1);

        if (livesRef.current <= 0) {
          setActiveStatus('WATCHDOG FAULT: SIGNAL LOST — SYSTEM HALTED');
          setGameState('GAMEOVER');
        } else {
          setActiveStatus(`SIGNAL DROPPED (${livesRef.current} PROBES REMAINING) — PRESS SPACE TO RE-INJECT`);
          resetBallOnPaddle();
        }
      }

      // Update power-ups
      for (let i = powerUpsRef.current.length - 1; i >= 0; i--) {
        const pu = powerUpsRef.current[i];
        pu.y += pu.vy;
        if (
          pu.y + 10 >= p.y &&
          pu.y - 10 <= p.y + p.h &&
          pu.x >= p.x - 12 &&
          pu.x <= p.x + p.w + 12
        ) {
          applyPowerUp(pu);
          powerUpsRef.current.splice(i, 1);
          continue;
        }
        if (pu.y > CANVAS_H + 20) {
          powerUpsRef.current.splice(i, 1);
        }
      }

      // Stage Clear check
      if (bricksRef.current.length === 0) {
        if (stageRef.current < 3) {
          audio.playPowerUp();
          setActiveStatus(`STAGE ${stageRef.current} CLEARED! READY FOR NEXT SILICON LAYER`);
          setGameState('STAGE_CLEAR');
        } else {
          audio.playPowerUp();
          setActiveStatus('SILICON BREAKTHROUGH COMPLETE — FULL REGISTER DECAP ACHIEVED!');
          setGameState('VICTORY');
        }
      }
    };

    const drawCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dark Solder Mask / Silicon Wafer Background
      ctx.fillStyle = '#071410';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Subtle PCB Grid & Copper Routing Traces
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 20; x < CANVAS_W; x += 28) {
        ctx.beginPath();
        ctx.moveTo(x, 44);
        ctx.lineTo(x, CANVAS_H);
        ctx.stroke();
      }
      for (let y = 44; y < CANVAS_H; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_W, y);
        ctx.stroke();
      }

      // Decorative diagonal PCB traces
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.14)';
      ctx.lineWidth = 2;
      const tracePaths = [
        [
          [40, 520],
          [110, 450],
          [110, 320],
        ],
        [
          [720, 520],
          [650, 450],
          [650, 300],
        ],
        [
          [380, 540],
          [380, 420],
          [440, 360],
        ],
      ];
      tracePaths.forEach((path) => {
        ctx.beginPath();
        path.forEach(([px, py], idx) => {
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      });

      // Top HUD Bus Bar inside Canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, CANVAS_W, 42);
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, 42);
      ctx.lineTo(CANVAS_W, 42);
      ctx.stroke();

      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#34d399';
      ctx.fillText(STAGE_NAMES[stageRef.current - 1] || STAGE_NAMES[0], 16, 25);

      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`CLK MULT: x${comboRef.current}`, 370, 25);

      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`COMPONENTS LEFT: ${bricksRef.current.length}`, 585, 25);

      // Draw Bricks as IC packages, SMD resistors, and security fuses
      bricksRef.current.forEach((b) => {
        if (b.hitFlash > 0) b.hitFlash--;

        // Solder pads on left & right edges
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(b.x - 2, b.y + 5, 4, b.h - 10);
        ctx.fillRect(b.x + b.w - 2, b.y + 5, 4, b.h - 10);

        // Component body
        ctx.fillStyle = b.hitFlash > 0 ? '#ffffff' : b.color;
        ctx.strokeStyle = b.borderColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 5);
        ctx.fill();
        ctx.stroke();

        // Multi-HP armor pips
        if (b.maxHp > 1) {
          for (let hIdx = 0; hIdx < b.maxHp; hIdx++) {
            ctx.fillStyle = hIdx < b.hp ? '#fef08a' : 'rgba(15,23,42,0.6)';
            ctx.fillRect(b.x + 6 + hIdx * 8, b.y + 4, 5, 3);
          }
        }

        // Silkscreen label
        ctx.fillStyle = '#090d16';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(b.label, b.x + b.w / 2, b.y + 18);
        ctx.textAlign = 'left';
      });

      const p = paddleRef.current;

      // Zener Clamp Barrier along bottom rail
      if (p.zenerClamp) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(12, CANVAS_H - 12);
        ctx.lineTo(CANVAS_W - 12, CANVAS_H - 12);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw JTAG / Oscilloscope Paddle
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = p.laserTimer > 0 ? '#f43f5e' : '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.w, p.h, 6);
      ctx.fill();
      ctx.stroke();

      // Live sine/square oscilloscope waveform inside the paddle
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let wx = 6; wx < p.w - 6; wx += 3) {
        const wy = p.y + p.h / 2 + Math.sin((wx + tick * 4) * 0.18) * 4;
        if (wx === 6) ctx.moveTo(p.x + wx, wy);
        else ctx.lineTo(p.x + wx, wy);
      }
      ctx.stroke();

      // Reflow laser turrets on paddle corners
      if (p.laserTimer > 0) {
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(p.x + 6, p.y - 5, 6, 5);
        ctx.fillRect(p.x + p.w - 12, p.y - 5, 6, 5);
      }

      // Draw Lasers
      ctx.fillStyle = '#fb7185';
      lasersRef.current.forEach((l) => {
        ctx.fillRect(l.x - 1.5, l.y - 10, 3, 12);
      });

      // Draw Balls (Signal Pulses)
      ballsRef.current.forEach((b) => {
        b.trail.forEach((t, idx) => {
          const alpha = ((idx + 1) / b.trail.length) * 0.35;
          ctx.fillStyle = b.overvolt
            ? `rgba(251, 146, 60, ${alpha})`
            : `rgba(56, 189, 248, ${alpha})`;
          ctx.beginPath();
          ctx.arc(t.x, t.y, b.radius * 0.75, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = b.overvolt ? '#fb923c' : '#e0f2fe';
        ctx.strokeStyle = b.overvolt ? '#fef08a' : '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Draw Power-Up Chips
      powerUpsRef.current.forEach((pu) => {
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = pu.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(pu.x - 42, pu.y - 10, 84, 20, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = pu.color;
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(pu.label, pu.x, pu.y + 3);
        ctx.textAlign = 'left';
      });

      // Update & Draw Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.12;
        pt.life++;
        if (pt.life >= pt.maxLife) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        const alpha = 1 - pt.life / pt.maxLife;
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
        ctx.globalAlpha = 1;
      }

      // Floating Telemetry Tags
      for (let i = tagsRef.current.length - 1; i >= 0; i--) {
        const tg = tagsRef.current[i];
        tg.y -= 0.8;
        tg.life--;
        if (tg.life <= 0) {
          tagsRef.current.splice(i, 1);
          continue;
        }
        ctx.fillStyle = tg.color;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(tg.text, tg.x, tg.y);
        ctx.textAlign = 'left';
      }
    };

    const loop = () => {
      tick++;
      stepSimulation();
      drawCanvas();
      animId = requestAnimationFrame(loop);
    };

    bricksRef.current = buildStageBricks(1);
    resetBallOnPaddle();
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [resetBallOnPaddle, spawnParticles, spawnTag]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameStateRef.current !== 'PLAYING') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const p = paddleRef.current;
    p.x = Math.max(12, Math.min(CANVAS_W - 12 - p.w, mouseX - p.w / 2));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameStateRef.current !== 'PLAYING' || e.touches.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const touchX = (e.touches[0].clientX - rect.left) * scaleX;
    const p = paddleRef.current;
    p.x = Math.max(12, Math.min(CANVAS_W - 12 - p.w, touchX - p.w / 2));
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 rounded-2xl border border-emerald-500/30 shadow-2xl p-4 sm:p-6 font-mono">
      {/* Top Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-lg font-black tracking-wider text-emerald-400">
              SILICON BREAKTHROUGH // JTAG DECAP
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{activeStatus}</p>
        </div>

        <div className="flex items-center gap-4 text-xs bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800">
          <div>
            <span className="text-slate-400 block text-[10px]">SCORE</span>
            <span className="text-cyan-400 font-bold text-base">{score}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px]">HIGH SCORE</span>
            <span className="text-amber-400 font-bold text-base">{highScore}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px]">STAGE</span>
            <span className="text-emerald-400 font-bold text-base">{stage}/3</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px]">PROBES</span>
            <span className="text-rose-400 font-bold text-base">
              {'⚡'.repeat(Math.max(0, lives))}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Canvas Viewport */}
      <div className="relative w-full overflow-hidden rounded-xl border border-slate-800 bg-black">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onTouchStart={launchOrFire}
          onClick={launchOrFire}
          className="w-full h-auto block cursor-crosshair select-none touch-none"
        />

        {/* Overlay Modals */}
        {gameState !== 'PLAYING' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            {gameState === 'START' && (
              <div className="max-w-md space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  BOUNDARY-SCAN HARDWARE ARCADE
                </div>
                <h4 className="text-3xl font-black text-white tracking-tight">
                  SILICON BREAKTHROUGH
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sweep your oscilloscope trigger paddle to bounce high-frequency signal pulses across
                  the PCB. Desolder SMD passives, shatter SOIC transceivers, and crack the 3-HP
                  security fuses at the top rail!
                </p>
                <div className="grid grid-cols-2 gap-2 text-left text-[11px] bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-slate-300">
                  <div><span className="text-sky-400 font-bold">+PLL:</span> Harmonic Multi-Ball</div>
                  <div><span className="text-emerald-400 font-bold">32-BIT:</span> Wide Probe Bus</div>
                  <div><span className="text-rose-400 font-bold">LASER:</span> Hot-Air Reflow Beams</div>
                  <div><span className="text-amber-400 font-bold">ZENER:</span> Bottom Rail Shield</div>
                </div>
                <button
                  onClick={() => initGame(1, false)}
                  className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl tracking-wider transition shadow-lg cursor-pointer text-sm"
                >
                  INJECT SIGNAL PULSE (Space)
                </button>
              </div>
            )}

            {gameState === 'PAUSED' && (
              <div className="space-y-4">
                <h4 className="text-2xl font-black text-amber-400">CLOCK HALTED (BREAKPOINT)</h4>
                <button
                  onClick={() => setGameState('PLAYING')}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs cursor-pointer"
                >
                  RESUME EXECUTION
                </button>
              </div>
            )}

            {gameState === 'STAGE_CLEAR' && (
              <div className="space-y-4 max-w-md">
                <h4 className="text-2xl font-black text-emerald-400">
                  LAYER {stage} DESOLDERED!
                </h4>
                <p className="text-xs text-slate-300">
                  Proceeding to the next hardware abstraction layer with increased clock frequency.
                </p>
                <button
                  onClick={() => initGame(stage + 1, true)}
                  className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm cursor-pointer"
                >
                  ADVANCE TO STAGE {stage + 1} (Space)
                </button>
              </div>
            )}

            {(gameState === 'GAMEOVER' || gameState === 'VICTORY') && (
              <div className="space-y-4 max-w-md">
                <h4
                  className={`text-3xl font-black ${
                    gameState === 'VICTORY' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {gameState === 'VICTORY'
                    ? 'ROOT ACCESS: SILICON DECAPPED!'
                    : 'BUS FAULT: SIGNAL LOST'}
                </h4>
                <p className="text-xs text-slate-300">
                  Final Telemetry Score: <span className="text-cyan-400 font-bold">{score}</span> &bull; Peak Multiplier: <span className="text-amber-400 font-bold">x{combo}</span>
                </p>
                <button
                  onClick={() => initGame(1, false)}
                  className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm cursor-pointer"
                >
                  REBOOT JTAG PROBE (Space)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls Footer */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          <span className="text-emerald-400 font-bold">Controls:</span> Mouse / Arrow Keys / A-D to Move &bull;{' '}
          <span className="text-emerald-400 font-bold">Click / Space:</span> Launch &amp; Fire Lasers &bull;{' '}
          <span className="text-emerald-400 font-bold">P:</span> Pause
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSoundOn((s) => {
                audio.enabled = !s;
                return !s;
              });
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 hover:border-cyan-500/40 cursor-pointer"
          >
            {soundOn ? '🔊 Synth Audio ON (M)' : '🔇 Audio Muted (M)'}
          </button>
        </div>
      </div>
    </div>
  );
}
