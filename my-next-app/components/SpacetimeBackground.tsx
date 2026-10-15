'use client';

import React, { useEffect, useRef } from 'react';

export type SpacetimeVariant = 'starlight' | 'cosmos' | 'solar';

interface SpacetimeBackgroundProps {
  variant?: SpacetimeVariant;
  className?: string;
}

interface BackgroundStar {
  xRatio: number;
  yRatio: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  colorIndex: number;
  isSparkle: boolean;
  depth: number;
}

interface NebulaCloud {
  xRatio: number;
  yRatio: number;
  radiusRatio: number;
  color: string;
}

/**
 * Interactive 60 FPS Space-Time Background.
 * Renders the section's actual background (dotted star-matrix, deep-field stars,
 * subtle continuous space-time coordinate mesh, and ambient cosmic nebulae) as a
 * single unified surface. Moving the mouse does NOT draw a separate cursor animation;
 * instead, the mouse acts as an invisible supermassive body that directly bends and
 * warps the background itself around the cursor.
 */
export function SpacetimeBackground({
  variant = 'starlight',
  className = '',
}: SpacetimeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Smoothed mouse gravity-well state in local canvas coordinates
    const mouse = {
      targetX: -9999,
      targetY: -9999,
      x: -9999,
      y: -9999,
      vx: 0,
      vy: 0,
      clientX: -9999,
      clientY: -9999,
      hasPointer: false,
      active: false,
      strength: 0,
    };

    // Deterministic background stars scattered between the dotted grid nodes
    const STAR_COUNT = 130;
    const deepStars: BackgroundStar[] = Array.from({ length: STAR_COUNT }, (_, i) => {
      const seed1 = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      const seed2 = Math.sin(i * 93.9898 + 12.456) * 23421.6312;
      const seed3 = Math.sin(i * 45.164 + 39.123) * 19283.4411;
      const rx = seed1 - Math.floor(seed1);
      const ry = seed2 - Math.floor(seed2);
      const rz = seed3 - Math.floor(seed3);

      return {
        xRatio: rx,
        yRatio: ry,
        radius: 0.8 + rz * 1.55,
        baseAlpha: 0.3 + (1 - rz) * 0.55,
        twinkleSpeed: 0.7 + rz * 1.9,
        twinklePhase: i * 1.7,
        colorIndex: i % 4,
        isSparkle: i % 9 === 0,
        depth: 0.75 + rz * 0.45,
      };
    });

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(canvas);

    const syncLocalMouse = () => {
      if (!mouse.hasPointer) return;
      const rect = canvas.getBoundingClientRect();
      const localX = mouse.clientX - rect.left;
      const localY = mouse.clientY - rect.top;

      const margin = 240;
      if (
        localX >= -margin &&
        localX <= rect.width + margin &&
        localY >= -margin &&
        localY <= rect.height + margin
      ) {
        if (!mouse.active) {
          mouse.x = localX;
          mouse.y = localY;
        }
        mouse.targetX = localX;
        mouse.targetY = localY;
        mouse.active = true;
      } else {
        mouse.active = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.clientX = e.clientX;
      mouse.clientY = e.clientY;
      mouse.hasPointer = true;
      syncLocalMouse();
    };

    const handleScroll = () => {
      syncLocalMouse();
    };

    const handleMouseLeaveWindow = () => {
      mouse.active = false;
      mouse.hasPointer = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeaveWindow);

    // Space-Time Curvature Parameters:
    // Every background coordinate (x0, y0) is smoothly displaced by the cursor's gravity well.
    const DOT_SPACING = 24; // Matches the 24px dotted background
    const LINE_SAMPLE_STEP = 8; // Fine subdivision so curved lines bend smoothly
    const SIGMA = 135; // Radius of spacetime curvature around the cursor (px)
    const TWO_SIGMA_SQ = 2 * SIGMA * SIGMA;
    const MAX_CUTOFF = 360;
    const MAX_CUTOFF_SQ = MAX_CUTOFF * MAX_CUTOFF;
    const ALPHA_PULL = 0.64; // Peak inward spacetime bending (< 1 so space never folds/tears)

    const warpPoint = (
      x0: number,
      y0: number,
      depthFactor: number,
      out: { x: number; y: number }
    ) => {
      if (mouse.strength < 0.004) {
        out.x = x0;
        out.y = y0;
        return;
      }

      const dx = x0 - mouse.x;
      const dy = y0 - mouse.y;
      const distSq = dx * dx + dy * dy;

      if (distSq >= MAX_CUTOFF_SQ) {
        out.x = x0;
        out.y = y0;
        return;
      }

      const gauss = Math.exp(-distSq / TWO_SIGMA_SQ) * mouse.strength;
      const pull = ALPHA_PULL * depthFactor * gauss;

      // Subtle Lense-Thirring frame-dragging swirl when moving the cursor
      const swirl = 0.0016 * gauss;
      const frameDragX = -dy * (mouse.vx * swirl);
      const frameDragY = dx * (mouse.vy * swirl);

      out.x = x0 - dx * pull + frameDragX;
      out.y = y0 - dy * pull + frameDragY;
    };

    const tempPt = { x: 0, y: 0 };

    const getPalette = () => {
      if (variant === 'cosmos') {
        return {
          gridStroke: 'rgba(56, 189, 248, 0.11)',
          dotFill: 'rgba(148, 163, 184, 0.42)',
          nebulae: [
            { xRatio: 0.25, yRatio: 0.2, radiusRatio: 0.45, color: 'rgba(14, 165, 233, 0.12)' },
            { xRatio: 0.78, yRatio: 0.7, radiusRatio: 0.42, color: 'rgba(99, 102, 241, 0.10)' },
          ] as NebulaCloud[],
          starColors: [
            [224, 242, 254], // ice white
            [125, 211, 252], // cyan star
            [165, 180, 252], // indigo star
            [253, 230, 138], // solar gold
          ],
        };
      }
      if (variant === 'solar') {
        return {
          gridStroke: 'rgba(180, 83, 9, 0.085)',
          dotFill: 'rgba(180, 83, 9, 0.28)',
          nebulae: [
            { xRatio: 0.3, yRatio: 0.25, radiusRatio: 0.45, color: 'rgba(217, 119, 6, 0.07)' },
            { xRatio: 0.75, yRatio: 0.75, radiusRatio: 0.4, color: 'rgba(245, 158, 11, 0.06)' },
          ] as NebulaCloud[],
          starColors: [
            [180, 83, 9],    // amber star
            [146, 64, 14],   // bronze star
            [37, 99, 235],   // astral blue accent
            [100, 116, 139], // slate star
          ],
        };
      }
      // Default: 'starlight' (Band 01 About Me — Star-Chart Dotted Backdrop)
      return {
        gridStroke: 'rgba(100, 116, 139, 0.10)',
        dotFill: 'rgba(100, 116, 139, 0.48)',
        nebulae: [
          { xRatio: 0.22, yRatio: 0.18, radiusRatio: 0.45, color: 'rgba(59, 130, 246, 0.07)' },
          { xRatio: 0.8, yRatio: 0.65, radiusRatio: 0.42, color: 'rgba(99, 102, 241, 0.06)' },
        ] as NebulaCloud[],
        starColors: [
          [37, 99, 235],   // celestial blue
          [79, 70, 229],   // cosmic indigo
          [14, 116, 144],  // deep cyan
          [71, 85, 105],   // slate star
        ],
      };
    };

    const palette = getPalette();

    const render = (timeMs: number) => {
      const t = timeMs * 0.001;

      if (mouse.active) {
        const prevX = mouse.x;
        const prevY = mouse.y;
        mouse.x += (mouse.targetX - mouse.x) * 0.2;
        mouse.y += (mouse.targetY - mouse.y) * 0.2;
        mouse.vx = mouse.x - prevX;
        mouse.vy = mouse.y - prevY;
        mouse.strength += (1 - mouse.strength) * 0.14;
      } else {
        mouse.vx *= 0.9;
        mouse.vy *= 0.9;
        mouse.strength += (0 - mouse.strength) * 0.06;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Background Nebula Clouds (their centers also warp with spacetime)
      const maxDim = Math.max(width, height);
      for (let i = 0; i < palette.nebulae.length; i++) {
        const neb = palette.nebulae[i];
        warpPoint(neb.xRatio * width, neb.yRatio * height, 0.6, tempPt);
        const r = neb.radiusRatio * maxDim;
        const grad = ctx.createRadialGradient(tempPt.x, tempPt.y, 0, tempPt.x, tempPt.y, r);
        grad.addColorStop(0, neb.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(tempPt.x, tempPt.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      const cols = Math.ceil(width / DOT_SPACING) + 1;
      const rows = Math.ceil(height / DOT_SPACING) + 1;

      // 2. Draw Unified Continuous Background Space-Time Fabric Lines (Uniform across whole background)
      ctx.lineWidth = 1;
      ctx.strokeStyle = palette.gridStroke;
      ctx.beginPath();

      // Horizontal lines sampled finely so curvature is completely smooth
      for (let r = 0; r <= rows; r++) {
        const y0 = r * DOT_SPACING;
        let first = true;
        for (let x0 = 0; x0 <= width + LINE_SAMPLE_STEP; x0 += LINE_SAMPLE_STEP) {
          const cx = Math.min(x0, width);
          warpPoint(cx, y0, 1.0, tempPt);
          if (first) {
            ctx.moveTo(tempPt.x, tempPt.y);
            first = false;
          } else {
            ctx.lineTo(tempPt.x, tempPt.y);
          }
        }
      }

      // Vertical lines sampled finely so curvature is completely smooth
      for (let c = 0; c <= cols; c++) {
        const x0 = c * DOT_SPACING;
        let first = true;
        for (let y0 = 0; y0 <= height + LINE_SAMPLE_STEP; y0 += LINE_SAMPLE_STEP) {
          const cy = Math.min(y0, height);
          warpPoint(x0, cy, 1.0, tempPt);
          if (first) {
            ctx.moveTo(tempPt.x, tempPt.y);
            first = false;
          } else {
            ctx.lineTo(tempPt.x, tempPt.y);
          }
        }
      }
      ctx.stroke();

      // 3. Draw the Uniform Background Dotted Star-Grid (Every dot is part of the same background and bends in place)
      ctx.fillStyle = palette.dotFill;
      ctx.beginPath();
      for (let r = 0; r <= rows; r++) {
        const y0 = r * DOT_SPACING;
        for (let c = 0; c <= cols; c++) {
          const x0 = c * DOT_SPACING;
          warpPoint(x0, y0, 1.0, tempPt);
          ctx.moveTo(tempPt.x + 1.25, tempPt.y);
          ctx.arc(tempPt.x, tempPt.y, 1.25, 0, Math.PI * 2);
        }
      }
      ctx.fill();

      // 4. Draw Deep-Field Twinkling Stars (Part of the background, bending smoothly with the grid)
      for (let i = 0; i < deepStars.length; i++) {
        const star = deepStars[i];
        const x0 = star.xRatio * width;
        const y0 = star.yRatio * height;
        warpPoint(x0, y0, star.depth, tempPt);

        const twinkle =
          0.7 + 0.3 * Math.sin(t * star.twinkleSpeed + star.twinklePhase);
        const alpha = star.baseAlpha * twinkle;
        const [cr, cg, cb] = palette.starColors[star.colorIndex];

        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(tempPt.x, tempPt.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        if (star.isSparkle) {
          const spikeLen = star.radius * 2.8;
          ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.6})`;
          ctx.lineWidth = 0.85;
          ctx.beginPath();
          ctx.moveTo(tempPt.x - spikeLen, tempPt.y);
          ctx.lineTo(tempPt.x + spikeLen, tempPt.y);
          ctx.moveTo(tempPt.x, tempPt.y - spikeLen);
          ctx.lineTo(tempPt.x, tempPt.y + spikeLen);
          ctx.stroke();
        }
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 w-full h-full z-0 ${className}`}
    />
  );
}
