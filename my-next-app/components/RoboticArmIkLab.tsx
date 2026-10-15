'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

const CANVAS_W = 920;
const CANVAS_H = 440;
const WORKSPACE_W = 550;
const TELEMETRY_X = 565;
const TELEMETRY_W = CANVAS_W - TELEMETRY_X - 14;
const TELEMETRY_Y = 26;
const TELEMETRY_H = CANVAS_H - 52;
const HISTORY_LEN = 240;

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export type TrajectoryMode = 'manual' | 'helix3d' | 'pickplace3d' | 'figure8_3d';
export type PostureMode = 'elbow-up' | 'elbow-down' | 'natural';

interface TelemetrySample {
  theta1Deg: number; // Base Yaw
  theta2Deg: number; // Shoulder Pitch
  theta3Deg: number; // Elbow Pitch
  theta4Deg: number; // Wrist Pitch
  errMm: number;
  manipulability: number;
}

interface TrailPoint3D {
  x: number;
  y: number;
  z: number;
  alpha: number;
}

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface ProjectedPoint {
  sx: number;
  sy: number;
  depth: number;
  scale: number;
}

const BASE_HEIGHT = 28; // Pedestal height above floor (mm)
const DEFAULT_L1 = 115;
const DEFAULT_L2 = 95;
const DEFAULT_L3 = 65;
const DEFAULT_DAMPING = 14.0;
const DEFAULT_STIFFNESS = 18.0; // Servo responsiveness (rad/s gain)

const PICK_PLACE_WAYPOINTS_3D: Vec3[] = [
  { x: 155, y: 24, z: 95 },   // Front-Right Pick Bin (Low)
  { x: 145, y: 145, z: 40 },  // Lift Clearance
  { x: 45, y: 165, z: -90 },  // Sweep Across Depth
  { x: -115, y: 30, z: -110 }, // Back-Left Place Fixture (Low)
  { x: -100, y: 150, z: -30 }, // Retract Up
  { x: 90, y: 155, z: 85 },   // Return Transit
];

// Minimum-jerk 5th-order polynomial s(tau) = 10*tau^3 - 15*tau^4 + 6*tau^5
function quinticEase(tau: number): number {
  const t = Math.max(0, Math.min(1, tau));
  return t * t * t * (10 + t * (-15 + 6 * t));
}

function wrapAngle(rad: number): number {
  let a = rad;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function RoboticArmIkLab() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // React UI state for controls
  const [l1, setL1] = useState<number>(DEFAULT_L1);
  const [l2, setL2] = useState<number>(DEFAULT_L2);
  const [l3, setL3] = useState<number>(DEFAULT_L3);
  const [damping, setDamping] = useState<number>(DEFAULT_DAMPING);
  const [stiffness, setStiffness] = useState<number>(DEFAULT_STIFFNESS);
  const [targetY, setTargetY] = useState<number>(95);
  const [cameraYawDeg, setCameraYawDeg] = useState<number>(32);
  const [trajectoryMode, setTrajectoryMode] = useState<TrajectoryMode>('manual');
  const [postureMode, setPostureMode] = useState<PostureMode>('elbow-up');

  const [hud, setHud] = useState({
    theta1Deg: 22.0,
    theta2Deg: 52.0,
    theta3Deg: -48.0,
    theta4Deg: -24.0,
    targetX: 135,
    targetY: 95,
    targetZ: 55,
    eeX: 135,
    eeY: 95,
    eeZ: 55,
    errMm: 0.0,
    manipulability: 0.85,
    status: 'CONVERGED (3D LOCK)',
    statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  });

  // High-frequency 60Hz 3D simulation state
  const simRef = useRef<{
    // 4-DOF Joint Angles (rad): theta1 = Base Yaw, theta2 = Shoulder, theta3 = Elbow, theta4 = Wrist
    theta1: number;
    theta2: number;
    theta3: number;
    theta4: number;
    // Joint Angular Velocities (rad/s) for smooth 2nd-order servo inertia
    omega1: number;
    omega2: number;
    omega3: number;
    omega4: number;
    // Link lengths (mm)
    l1: number;
    l2: number;
    l3: number;
    damping: number;
    stiffness: number;
    // Raw user target vs smoothed command target (mm)
    rawTargetX: number;
    rawTargetY: number;
    rawTargetZ: number;
    targetX: number;
    targetY: number;
    targetZ: number;
    targetVx: number;
    targetVy: number;
    targetVz: number;
    // Camera orbit
    cameraYaw: number;
    cameraPitch: number;
    trajectoryMode: TrajectoryMode;
    postureMode: PostureMode;
    simTime: number;
    draggingTarget: boolean;
    orbitingCamera: boolean;
    lastPointerX: number;
    lastPointerY: number;
    wheelPulse: number;
    trail: TrailPoint3D[];
    history: TelemetrySample[];
  }>({
    theta1: 22 * DEG_TO_RAD,
    theta2: 55 * DEG_TO_RAD,
    theta3: -52 * DEG_TO_RAD,
    theta4: -25 * DEG_TO_RAD,
    omega1: 0,
    omega2: 0,
    omega3: 0,
    omega4: 0,
    l1: DEFAULT_L1,
    l2: DEFAULT_L2,
    l3: DEFAULT_L3,
    damping: DEFAULT_DAMPING,
    stiffness: DEFAULT_STIFFNESS,
    rawTargetX: 135,
    rawTargetY: 95,
    rawTargetZ: 55,
    targetX: 135,
    targetY: 95,
    targetZ: 55,
    targetVx: 0,
    targetVy: 0,
    targetVz: 0,
    cameraYaw: 32 * DEG_TO_RAD,
    cameraPitch: 30 * DEG_TO_RAD,
    trajectoryMode: 'manual',
    postureMode: 'elbow-up',
    simTime: 0,
    draggingTarget: false,
    orbitingCamera: false,
    lastPointerX: 0,
    lastPointerY: 0,
    wheelPulse: 0,
    trail: [],
    history: Array.from({ length: HISTORY_LEN }, () => ({
      theta1Deg: 22,
      theta2Deg: 55,
      theta3Deg: -52,
      theta4Deg: -25,
      errMm: 0,
      manipulability: 0.85,
    })),
  });

  // 3D Forward Kinematics for 4-DOF Manipulator (Base Turntable Yaw + 3 Pitch Links)
  const computeFk3D = useCallback(
    (t1: number, t2: number, t3: number, t4: number, l1Val: number, l2Val: number, l3Val: number) => {
      const a1 = t2;
      const a2 = t2 + t3;
      const a3 = t2 + t3 + t4;

      const r1 = l1Val * Math.cos(a1);
      const y1 = BASE_HEIGHT + l1Val * Math.sin(a1);

      const r2 = r1 + l2Val * Math.cos(a2);
      const y2 = y1 + l2Val * Math.sin(a2);

      const r3 = r2 + l3Val * Math.cos(a3);
      const y3 = y2 + l3Val * Math.sin(a3);

      const c1 = Math.cos(t1);
      const s1 = Math.sin(t1);

      return {
        p0: { x: 0, y: BASE_HEIGHT, z: 0 },
        p1: { x: r1 * c1, y: y1, z: r1 * s1 },
        p2: { x: r2 * c1, y: y2, z: r2 * s1 },
        p3: { x: r3 * c1, y: y3, z: r3 * s1 },
        r3,
        a1,
        a2,
        a3,
      };
    },
    []
  );

  // Project 3D world coordinates (x, y, z) in mm to 2D canvas screen coordinates
  const project3D = useCallback((pt: Vec3, camYaw: number, camPitch: number): ProjectedPoint => {
    const centerX = WORKSPACE_W * 0.5;
    const centerY = CANVAS_H * 0.66;

    // Rotate around vertical Y axis by camYaw
    const cosY = Math.cos(camYaw);
    const sinY = Math.sin(camYaw);
    const rx = pt.x * cosY + pt.z * sinY;
    const rz = -pt.x * sinY + pt.z * cosY;

    // Tilt by camPitch around X axis
    const cosP = Math.cos(camPitch);
    const sinP = Math.sin(camPitch);
    const ry = pt.y * cosP - rz * sinP;
    const depth = pt.y * sinP + rz * cosP;

    // Perspective foreshortening
    const fov = 720;
    const persp = fov / Math.max(260, fov - depth * 0.85);

    return {
      sx: centerX + rx * persp * 0.92,
      sy: centerY - ry * persp * 0.92,
      depth,
      scale: persp,
    };
  }, []);

  // Unproject 2D mouse position (sx, sy) onto the horizontal (X, Z) plane at current elevation Y
  const unprojectScreenToXZ = useCallback(
    (sx: number, sy: number, currentY: number, camYaw: number, camPitch: number) => {
      const centerX = WORKSPACE_W * 0.5;
      const centerY = CANVAS_H * 0.66;
      const cosY = Math.cos(camYaw);
      const sinY = Math.sin(camYaw);
      const cosP = Math.cos(camPitch);
      const sinP = Math.max(0.35, Math.sin(camPitch));

      let persp = 1.0;
      let rx = 0;
      let rz = 0;

      for (let i = 0; i < 4; i++) {
        rx = (sx - centerX) / (0.92 * persp);
        const ry = (centerY - sy) / (0.92 * persp);
        rz = (currentY * cosP - ry) / sinP;
        const depth = currentY * sinP + rz * cosP;
        persp = 720 / Math.max(260, 720 - depth * 0.85);
      }

      let wx = rx * cosY - rz * sinY;
      let wz = rx * sinY + rz * cosY;

      // Clamp to reachable horizontal annulus outside the central base pedestal (28mm <= R <= 225mm)
      const horizR = Math.hypot(wx, wz);
      if (horizR > 225) {
        wx *= 225 / horizR;
        wz *= 225 / horizR;
      } else if (horizR < 28) {
        if (horizR > 1e-3) {
          wx *= 28 / horizR;
          wz *= 28 / horizR;
        } else {
          wx = 28;
          wz = 0;
        }
      }

      return { x: wx, z: wz };
    },
    []
  );

  // Handlers for UI controls
  const handleL1Change = (val: number) => {
    simRef.current.l1 = val;
    setL1(val);
  };

  const handleL2Change = (val: number) => {
    simRef.current.l2 = val;
    setL2(val);
  };

  const handleL3Change = (val: number) => {
    simRef.current.l3 = val;
    setL3(val);
  };

  const handleDampingChange = (val: number) => {
    simRef.current.damping = val;
    setDamping(val);
  };

  const handleStiffnessChange = (val: number) => {
    simRef.current.stiffness = val;
    setStiffness(val);
  };

  const handleTargetYChange = (val: number) => {
    const s = simRef.current;
    s.rawTargetY = clamp(val, 18, 240);
    if (s.trajectoryMode !== 'manual') {
      s.trajectoryMode = 'manual';
      setTrajectoryMode('manual');
    }
    setTargetY(Math.round(s.rawTargetY));
  };

  const handleCameraYawChange = (deg: number) => {
    simRef.current.cameraYaw = deg * DEG_TO_RAD;
    setCameraYawDeg(deg);
  };

  const handleTrajectoryModeChange = (mode: TrajectoryMode) => {
    simRef.current.trajectoryMode = mode;
    simRef.current.simTime = 0;
    setTrajectoryMode(mode);
  };

  const handlePostureChange = (mode: PostureMode) => {
    simRef.current.postureMode = mode;
    setPostureMode(mode);
  };

  const handleResetHome = () => {
    const s = simRef.current;
    s.l1 = DEFAULT_L1;
    s.l2 = DEFAULT_L2;
    s.l3 = DEFAULT_L3;
    s.damping = DEFAULT_DAMPING;
    s.stiffness = DEFAULT_STIFFNESS;
    s.trajectoryMode = 'manual';
    s.postureMode = 'elbow-up';
    s.rawTargetX = 135;
    s.rawTargetY = 95;
    s.rawTargetZ = 55;
    s.targetX = 135;
    s.targetY = 95;
    s.targetZ = 55;
    s.theta1 = Math.atan2(55, 135);
    s.theta2 = 55 * DEG_TO_RAD;
    s.theta3 = -52 * DEG_TO_RAD;
    s.theta4 = -25 * DEG_TO_RAD;
    s.omega1 = 0;
    s.omega2 = 0;
    s.omega3 = 0;
    s.omega4 = 0;
    s.cameraYaw = 32 * DEG_TO_RAD;
    s.cameraPitch = 30 * DEG_TO_RAD;
    setL1(DEFAULT_L1);
    setL2(DEFAULT_L2);
    setL3(DEFAULT_L3);
    setDamping(DEFAULT_DAMPING);
    setStiffness(DEFAULT_STIFFNESS);
    setTargetY(95);
    setCameraYawDeg(32);
    setTrajectoryMode('manual');
    setPostureMode('elbow-up');
  };

  // Pointer interaction on the 3D workspace:
  // Moving the mouse positions the target on the horizontal (X, Z) plane;
  // Shift+Drag or Right-Click orbits the 3D camera.
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    if (px <= WORKSPACE_W) {
      const s = simRef.current;
      s.lastPointerX = px;
      s.lastPointerY = py;

      if (e.shiftKey || e.button === 2) {
        s.orbitingCamera = true;
        e.currentTarget.setPointerCapture(e.pointerId);
      } else {
        s.draggingTarget = true;
        if (s.trajectoryMode !== 'manual') {
          s.trajectoryMode = 'manual';
          setTrajectoryMode('manual');
        }
        const worldXZ = unprojectScreenToXZ(px, py, s.rawTargetY, s.cameraYaw, s.cameraPitch);
        s.rawTargetX = worldXZ.x;
        s.rawTargetZ = worldXZ.z;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = simRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    if (s.orbitingCamera) {
      const dx = px - s.lastPointerX;
      const dy = py - s.lastPointerY;
      s.cameraYaw = clamp(s.cameraYaw - dx * 0.007, -1.2, 1.35);
      s.cameraPitch = clamp(s.cameraPitch + dy * 0.005, 0.22, 0.85);
      setCameraYawDeg(Math.round(s.cameraYaw * RAD_TO_DEG));
      s.lastPointerX = px;
      s.lastPointerY = py;
      return;
    }

    // Moving the mouse over the 3D workspace directly controls horizontal plane position (X, Z)
    if (px <= WORKSPACE_W && (s.trajectoryMode === 'manual' || s.draggingTarget)) {
      const clampedPx = clamp(px, 20, WORKSPACE_W - 24);
      const clampedPy = clamp(py, 20, CANVAS_H - 20);
      const worldXZ = unprojectScreenToXZ(
        clampedPx,
        clampedPy,
        s.rawTargetY,
        s.cameraYaw,
        s.cameraPitch
      );
      s.rawTargetX = worldXZ.x;
      s.rawTargetZ = worldXZ.z;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    simRef.current.draggingTarget = false;
    simRef.current.orbitingCamera = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if not captured
    }
  };

  // Attach non-passive wheel listener so the scroll wheel controls vertical Up/Down position (Y-Height)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      const px = (e.clientX - rect.left) * scaleX;

      if (px <= WORKSPACE_W) {
        e.preventDefault();
        const s = simRef.current;
        if (s.trajectoryMode !== 'manual') {
          s.trajectoryMode = 'manual';
          setTrajectoryMode('manual');
        }
        // Scroll Up (deltaY < 0) raises Y height; Scroll Down (deltaY > 0) lowers Y height
        const stepY = clamp(e.deltaY * -0.22, -22, 22);
        s.rawTargetY = clamp(s.rawTargetY + stepY, 18, 240);
        s.wheelPulse = 1.0;
        setTargetY(Math.round(s.rawTargetY));
      }
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  // Main 60Hz 3D Kinematics, Second-Order Dynamics & Render Loop
  useEffect(() => {
    let rafId: number;
    let frameCount = 0;
    const dt = 1 / 60;

    const stepKinematicsAndDynamics = () => {
      const s = simRef.current;
      s.simTime += dt;
      if (s.wheelPulse > 0) {
        s.wheelPulse = Math.max(0, s.wheelPulse - dt * 2.5);
      }

      // 1. Update 3D Trajectory Generator if active
      if (s.trajectoryMode === 'helix3d') {
        const w = 1.35;
        s.rawTargetX = 125 + 45 * Math.cos(s.simTime * w);
        s.rawTargetY = 105 + 55 * Math.sin(s.simTime * w * 0.75);
        s.rawTargetZ = 95 * Math.sin(s.simTime * w);
      } else if (s.trajectoryMode === 'figure8_3d') {
        const w = 1.25;
        s.rawTargetX = 115 + 65 * Math.sin(s.simTime * w);
        s.rawTargetY = 110 + 55 * Math.sin(s.simTime * w * 2) * 0.65;
        s.rawTargetZ = 105 * Math.cos(s.simTime * w);
      } else if (s.trajectoryMode === 'pickplace3d') {
        const segDuration = 1.45;
        const totalSegs = PICK_PLACE_WAYPOINTS_3D.length;
        const cycleTime = s.simTime % (segDuration * totalSegs);
        const segIdx = Math.floor(cycleTime / segDuration);
        const tau = (cycleTime - segIdx * segDuration) / segDuration;
        const ease = quinticEase(tau);

        const w0 = PICK_PLACE_WAYPOINTS_3D[segIdx];
        const w1 = PICK_PLACE_WAYPOINTS_3D[(segIdx + 1) % totalSegs];
        s.rawTargetX = w0.x + (w1.x - w0.x) * ease;
        s.rawTargetY = w0.y + (w1.y - w0.y) * ease;
        s.rawTargetZ = w0.z + (w1.z - w0.z) * ease;
      }

      // Enforce floor plane safety on rawTargetY (never below Y = 18mm)
      s.rawTargetY = clamp(s.rawTargetY, 18, 245);

      // 2. Smooth user target with a fast 2nd-order critically-damped command filter
      const cmdWn = 26.0;
      const cmdZeta = 1.0;
      const ax = cmdWn * cmdWn * (s.rawTargetX - s.targetX) - 2 * cmdZeta * cmdWn * s.targetVx;
      const ay = cmdWn * cmdWn * (s.rawTargetY - s.targetY) - 2 * cmdZeta * cmdWn * s.targetVy;
      const az = cmdWn * cmdWn * (s.rawTargetZ - s.targetZ) - 2 * cmdZeta * cmdWn * s.targetVz;

      s.targetVx += ax * dt;
      s.targetVy += ay * dt;
      s.targetVz += az * dt;

      s.targetX += s.targetVx * dt;
      s.targetY = Math.max(16, s.targetY + s.targetVy * dt);
      s.targetZ += s.targetVz * dt;

      // 3. Cylindrical Decomposition:
      // Decouple Base Turntable Azimuth (theta1) from the Coplanar Vertical Reach-Elevation (r, y).
      // This guarantees r_target is ALWAYS positive (>= 26mm) so the arm NEVER flips backward
      // through its central axis (r < 0) or locks up below the horizontal plane!
      const targetAzimuth = Math.atan2(s.targetZ, s.targetX);
      const rawHorizR = Math.hypot(s.targetX, s.targetZ);
      const rTarget = Math.max(26, rawHorizR);
      const yTarget = clamp(s.targetY, 18, 245);

      // Radial & vertical target velocities for feedforward
      const rDotTarget =
        rawHorizR > 1e-3 ? (s.targetX * s.targetVx + s.targetZ * s.targetVz) / rawHorizR : 0;
      const yDotTarget = s.targetVy;

      // 4. Analytical Global Posture Solver in the (r, y) Vertical Plane (Zero Local Minima!)
      // Computes exact collision-free reference angles (theta2*, theta3*, theta4*) above the floor
      const maxTotalReach = (s.l1 + s.l2 + s.l3) * 0.992;
      let rGoal = rTarget;
      let dyGoal = yTarget - BASE_HEIGHT;
      const distFromShoulder = Math.hypot(rGoal, dyGoal);
      if (distFromShoulder > maxTotalReach && distFromShoulder > 1e-3) {
        const scale = maxTotalReach / distFromShoulder;
        rGoal *= scale;
        dyGoal *= scale;
      }

      // Natural tool pitch angle aiming toward target elevation
      const elevAngle = Math.atan2(dyGoal, rGoal);
      const desiredToolPitch = clamp(
        elevAngle * 0.55 + (s.postureMode === 'elbow-up' ? -0.18 : s.postureMode === 'elbow-down' ? 0.12 : -0.05),
        -55 * DEG_TO_RAD,
        75 * DEG_TO_RAD
      );

      // Desired wrist center (rWrist, dyWrist) relative to shoulder
      let rWrist = Math.max(18, rGoal - s.l3 * Math.cos(desiredToolPitch));
      let dyWrist = Math.max(14 - BASE_HEIGHT, dyGoal - s.l3 * Math.sin(desiredToolPitch));
      const wristDist = Math.hypot(rWrist, dyWrist);
      const max2Link = (s.l1 + s.l2) * 0.992;
      const min2Link = Math.abs(s.l1 - s.l2) + 8;
      if (wristDist > max2Link && wristDist > 1e-3) {
        rWrist *= max2Link / wristDist;
        dyWrist *= max2Link / wristDist;
      } else if (wristDist < min2Link && wristDist > 1e-3) {
        rWrist *= min2Link / wristDist;
        dyWrist *= min2Link / wristDist;
      }

      // 2-Link Law of Cosines for Shoulder (theta2*) & Elbow (theta3*)
      const cosT3 = clamp(
        (rWrist * rWrist + dyWrist * dyWrist - s.l1 * s.l1 - s.l2 * s.l2) / (2 * s.l1 * s.l2),
        -0.985,
        0.985
      );
      const absT3 = Math.acos(cosT3);

      // Candidate elbow-up vs elbow-down solutions
      const t3Up = -absT3;
      const t2Up =
        Math.atan2(dyWrist, rWrist) -
        Math.atan2(s.l2 * Math.sin(t3Up), s.l1 + s.l2 * Math.cos(t3Up));

      const t3Down = absT3;
      const t2Down =
        Math.atan2(dyWrist, rWrist) -
        Math.atan2(s.l2 * Math.sin(t3Down), s.l1 + s.l2 * Math.cos(t3Down));

      // Check elbow height above the Y = 0 floor for the elbow-down branch
      const elbowYDown = BASE_HEIGHT + s.l1 * Math.sin(t2Down);
      const useElbowDown = s.postureMode === 'elbow-down' && elbowYDown >= 14;

      const theta2Star = clamp(
        useElbowDown ? t2Down : t2Up,
        -6 * DEG_TO_RAD,
        130 * DEG_TO_RAD
      );
      const theta3Star = clamp(
        useElbowDown ? t3Down : t3Up,
        -135 * DEG_TO_RAD,
        125 * DEG_TO_RAD
      );
      const theta4Star = clamp(
        desiredToolPitch - (theta2Star + theta3Star),
        -115 * DEG_TO_RAD,
        115 * DEG_TO_RAD
      );

      // 5. Evaluate Current Coplanar Forward Kinematics & 2x3 Radial-Vertical Jacobian J_ry
      const fk = computeFk3D(s.theta1, s.theta2, s.theta3, s.theta4, s.l1, s.l2, s.l3);

      const dr3 = -s.l3 * Math.sin(fk.a3);
      const dy3 = s.l3 * Math.cos(fk.a3);

      const dr2 = -s.l2 * Math.sin(fk.a2) + dr3;
      const dy2 = s.l2 * Math.cos(fk.a2) + dy3;

      const dr1 = -s.l1 * Math.sin(fk.a1) + dr2;
      const dy1 = s.l1 * Math.cos(fk.a1) + dy2;

      // 2x3 Planar Jacobian mapping [d(theta2), d(theta3), d(theta4)]^T -> [dr, dy]^T
      const j00 = dr1, j01 = dr2, j02 = dr3;
      const j10 = dy1, j11 = dy2, j12 = dy3;

      // Compute J_ry * J_ry^T (2x2 symmetric matrix)
      const jjt00 = j00 * j00 + j01 * j01 + j02 * j02;
      const jjt01 = j00 * j10 + j01 * j11 + j02 * j12;
      const jjt11 = j10 * j10 + j11 * j11 + j12 * j12;

      const rawDet2D = Math.max(0, jjt00 * jjt11 - jjt01 * jjt01);
      const normManip = Math.min(1.0, Math.sqrt(rawDet2D) / (s.l1 * s.l2 * 1.15));

      // 6. Damped Least Squares (DLS) Inverse: (J_ry * J_ry^T + lambda^2 * I_2)^-1
      const lamSq = s.damping * s.damping;
      const d00 = jjt00 + lamSq;
      const d11 = jjt11 + lamSq;
      const detDamped = d00 * d11 - jjt01 * jjt01;

      if (detDamped > 1e-6) {
        const invDet = 1 / detDamped;
        const inv00 = d11 * invDet;
        const inv01 = -jjt01 * invDet;
        const inv11 = d00 * invDet;

        // J_ry^# = J_ry^T * invDamped (3x2 matrix)
        const pinv00 = j00 * inv00 + j10 * inv01;
        const pinv01 = j00 * inv01 + j10 * inv11;
        const pinv10 = j01 * inv00 + j11 * inv01;
        const pinv11 = j01 * inv01 + j11 * inv11;
        const pinv20 = j02 * inv00 + j12 * inv01;
        const pinv21 = j02 * inv01 + j12 * inv11;

        // Task-space radial & vertical error in the arm's vertical plane
        const er = rTarget - fk.r3;
        const ey = yTarget - fk.p3.y;

        const kpTask = s.stiffness;
        const vrCmd = kpTask * er + rDotTarget * 0.85;
        const vyCmd = kpTask * ey + yDotTarget * 0.85;

        // Primary DLS Joint Velocity: dq_dls = J_ry^# * [vrCmd, vyCmd]^T
        const dqDls2 = pinv00 * vrCmd + pinv01 * vyCmd;
        const dqDls3 = pinv10 * vrCmd + pinv11 * vyCmd;
        const dqDls4 = pinv20 * vrCmd + pinv21 * vyCmd;

        // 7. Hybrid Null-Space + Global Analytical Posture Convergence
        // Prevents any possibility of local minima or folded-under deadlock!
        const kpPosture = 7.5 + s.stiffness * 0.25;
        const qPosture2 = kpPosture * wrapAngle(theta2Star - s.theta2);
        const qPosture3 = kpPosture * wrapAngle(theta3Star - s.theta3);
        const qPosture4 = kpPosture * wrapAngle(theta4Star - s.theta4);

        // J_ry * qPosture
        const jqR = j00 * qPosture2 + j01 * qPosture3 + j02 * qPosture4;
        const jqY = j10 * qPosture2 + j11 * qPosture3 + j12 * qPosture4;

        // Null-space projection (I - J^# * J) * qPosture + direct global posture stabilization
        const null2 = qPosture2 - (pinv00 * jqR + pinv01 * jqY);
        const null3 = qPosture3 - (pinv10 * jqR + pinv11 * jqY);
        const null4 = qPosture4 - (pinv20 * jqR + pinv21 * jqY);

        // Turntable Yaw rate tracking targetAzimuth via shortest angular path
        const yawErr = wrapAngle(targetAzimuth - s.theta1);
        const dqYaw = (s.stiffness * 1.15) * yawErr;

        const dqTotal = [
          dqYaw,
          dqDls2 * 0.65 + qPosture2 * 0.55 + null2 * 0.45,
          dqDls3 * 0.65 + qPosture3 * 0.55 + null3 * 0.45,
          dqDls4 * 0.65 + qPosture4 * 0.55 + null4 * 0.45,
        ];

        // 8. Second-Order Servo Actuator Dynamics
        const servoBandwidth = 15.0 + s.stiffness * 0.65;
        const maxOmega = 9.0; // rad/s

        const targetOmegas = dqTotal.map((v) => clamp(v, -maxOmega, maxOmega));
        s.omega1 += (targetOmegas[0] - s.omega1) * Math.min(1, servoBandwidth * dt);
        s.omega2 += (targetOmegas[1] - s.omega2) * Math.min(1, servoBandwidth * dt);
        s.omega3 += (targetOmegas[2] - s.omega3) * Math.min(1, servoBandwidth * dt);
        s.omega4 += (targetOmegas[3] - s.omega4) * Math.min(1, servoBandwidth * dt);

        // Integrate joint angles with safe above-floor operating envelope
        s.theta1 = wrapAngle(s.theta1 + s.omega1 * dt);
        s.theta2 = clamp(s.theta2 + s.omega2 * dt, -6 * DEG_TO_RAD, 130 * DEG_TO_RAD);
        s.theta3 = clamp(s.theta3 + s.omega3 * dt, -135 * DEG_TO_RAD, 125 * DEG_TO_RAD);
        s.theta4 = clamp(s.theta4 + s.omega4 * dt, -115 * DEG_TO_RAD, 115 * DEG_TO_RAD);

        // Hard floor-plane and anti-fold safety barrier:
        // Guarantee forearm (a2) and wrist (a3) never fold past vertical (-75 deg) or dip below floor (Y = 8mm)
        const a2Now = s.theta2 + s.theta3;
        if (a2Now < -72 * DEG_TO_RAD) {
          s.theta3 = -72 * DEG_TO_RAD - s.theta2;
          s.omega3 = Math.max(0, s.omega3);
        } else if (a2Now > 145 * DEG_TO_RAD) {
          s.theta3 = 145 * DEG_TO_RAD - s.theta2;
          s.omega3 = Math.min(0, s.omega3);
        }

        const fkCheck = computeFk3D(s.theta1, s.theta2, s.theta3, s.theta4, s.l1, s.l2, s.l3);
        if (fkCheck.p2.y < 10) {
          s.theta3 = Math.min(125 * DEG_TO_RAD, s.theta3 + 2.5 * dt);
          s.theta2 = Math.min(130 * DEG_TO_RAD, s.theta2 + 2.0 * dt);
        }
        if (fkCheck.p3.y < 10) {
          s.theta4 = Math.min(115 * DEG_TO_RAD, s.theta4 + 3.0 * dt);
        }
      }

      // 9. Record 3D End-Effector Trail & Telemetry History
      const fkAfter = computeFk3D(s.theta1, s.theta2, s.theta3, s.theta4, s.l1, s.l2, s.l3);
      if (frameCount % 2 === 0) {
        s.trail.push({
          x: fkAfter.p3.x,
          y: fkAfter.p3.y,
          z: fkAfter.p3.z,
          alpha: 1.0,
        });
        if (s.trail.length > 64) s.trail.shift();
      }
      for (let i = 0; i < s.trail.length; i++) {
        s.trail[i].alpha = (i + 1) / s.trail.length;
      }

      const finalErr = Math.hypot(
        s.targetX - fkAfter.p3.x,
        s.targetY - fkAfter.p3.y,
        s.targetZ - fkAfter.p3.z
      );

      s.history.push({
        theta1Deg: s.theta1 * RAD_TO_DEG,
        theta2Deg: s.theta2 * RAD_TO_DEG,
        theta3Deg: s.theta3 * RAD_TO_DEG,
        theta4Deg: s.theta4 * RAD_TO_DEG,
        errMm: finalErr,
        manipulability: normManip,
      });
      if (s.history.length > HISTORY_LEN) {
        s.history.shift();
      }

      // Update React HUD at 10Hz
      if (frameCount % 6 === 0) {
        const maxReach = s.l1 + s.l2 + s.l3;
        const targetDistFromShoulder = Math.hypot(
          s.targetX,
          s.targetY - BASE_HEIGHT,
          s.targetZ
        );

        let status = 'CONVERGED (3D LOCK)';
        let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

        if (targetDistFromShoulder > maxReach + 3) {
          status = 'SINGULARITY CLAMP (MAX REACH)';
          statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
        } else if (finalErr > 5.0) {
          status = 'SLEWING IN 3D SPACE';
          statusColor = 'text-blue-700 bg-blue-50 border-blue-200';
        }

        setHud({
          theta1Deg: s.theta1 * RAD_TO_DEG,
          theta2Deg: s.theta2 * RAD_TO_DEG,
          theta3Deg: s.theta3 * RAD_TO_DEG,
          theta4Deg: s.theta4 * RAD_TO_DEG,
          targetX: Math.round(s.rawTargetX),
          targetY: Math.round(s.rawTargetY),
          targetZ: Math.round(s.rawTargetZ),
          eeX: Math.round(fkAfter.p3.x),
          eeY: Math.round(fkAfter.p3.y),
          eeZ: Math.round(fkAfter.p3.z),
          errMm: finalErr,
          manipulability: normManip,
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

      // Dark high-contrast instrument canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      const camYaw = s.cameraYaw;
      const camPitch = s.cameraPitch;

      // =====================================================================
      // 1. 3D PERSPECTIVE WORKBENCH FLOOR GRID (Y = 0)
      // =====================================================================
      const gridRange = 220;
      const gridStep = 44;

      ctx.lineWidth = 1;
      for (let g = -gridRange; g <= gridRange; g += gridStep) {
        // Lines along X at fixed Z
        const pStartX = project3D({ x: -gridRange, y: 0, z: g }, camYaw, camPitch);
        const pEndX = project3D({ x: gridRange, y: 0, z: g }, camYaw, camPitch);
        ctx.strokeStyle = g === 0 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(148, 163, 184, 0.12)';
        ctx.beginPath();
        ctx.moveTo(pStartX.sx, pStartX.sy);
        ctx.lineTo(pEndX.sx, pEndX.sy);
        ctx.stroke();

        // Lines along Z (Depth) at fixed X
        const pStartZ = project3D({ x: g, y: 0, z: -gridRange }, camYaw, camPitch);
        const pEndZ = project3D({ x: g, y: 0, z: gridRange }, camYaw, camPitch);
        ctx.strokeStyle = g === 0 ? 'rgba(168, 85, 247, 0.4)' : 'rgba(148, 163, 184, 0.12)';
        ctx.beginPath();
        ctx.moveTo(pStartZ.sx, pStartZ.sy);
        ctx.lineTo(pEndZ.sx, pEndZ.sy);
        ctx.stroke();
      }

      // Draw outer reachable hemisphere footprint ring on the floor (Y = 0)
      const maxReach = s.l1 + s.l2 + s.l3;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      for (let deg = 0; deg <= 360; deg += 5) {
        const rad = deg * DEG_TO_RAD;
        const pt = project3D(
          { x: maxReach * Math.cos(rad), y: 0, z: maxReach * Math.sin(rad) },
          camYaw,
          camPitch
        );
        if (deg === 0) ctx.moveTo(pt.sx, pt.sy);
        else ctx.lineTo(pt.sx, pt.sy);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Label 3D Axes on Floor
      const xAxisTip = project3D({ x: 235, y: 0, z: 0 }, camYaw, camPitch);
      const zAxisTip = project3D({ x: 0, y: 0, z: 235 }, camYaw, camPitch);
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('+X (Plane)', xAxisTip.sx + 4, xAxisTip.sy + 3);
      ctx.fillStyle = '#c084fc';
      ctx.fillText('+Z (Plane)', zAxisTip.sx + 4, zAxisTip.sy + 3);

      // Subtle studio radial spotlight on the workbench floor
      const baseFloor = project3D({ x: 0, y: 0, z: 0 }, camYaw, camPitch);
      const floorGlow = ctx.createRadialGradient(
        baseFloor.sx,
        baseFloor.sy,
        10,
        baseFloor.sx,
        baseFloor.sy,
        240
      );
      floorGlow.addColorStop(0, 'rgba(30, 58, 138, 0.22)');
      floorGlow.addColorStop(0.55, 'rgba(15, 23, 42, 0.08)');
      floorGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = floorGlow;
      ctx.fillRect(0, 0, WORKSPACE_W, CANVAS_H);

      // Compute 3D Arm Joint Positions
      const fk = computeFk3D(s.theta1, s.theta2, s.theta3, s.theta4, s.l1, s.l2, s.l3);

      // =====================================================================
      // 2. MULTI-LAYER VOLUMETRIC GROUND SHADOW PROJECTION (Y = 0)
      // =====================================================================
      const s0 = baseFloor;
      const s1 = project3D({ x: fk.p1.x, y: 0, z: fk.p1.z }, camYaw, camPitch);
      const s2 = project3D({ x: fk.p2.x, y: 0, z: fk.p2.z }, camYaw, camPitch);
      const s3 = project3D({ x: fk.p3.x, y: 0, z: fk.p3.z }, camYaw, camPitch);

      // Outer soft penumbra shadow
      ctx.strokeStyle = 'rgba(2, 6, 23, 0.38)';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 24;
      ctx.beginPath();
      ctx.moveTo(s0.sx, s0.sy);
      ctx.lineTo(s1.sx, s1.sy);
      ctx.lineTo(s2.sx, s2.sy);
      ctx.lineTo(s3.sx, s3.sy);
      ctx.stroke();

      // Inner dark umbra core shadow
      ctx.strokeStyle = 'rgba(2, 6, 23, 0.72)';
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(s0.sx, s0.sy);
      ctx.lineTo(s1.sx, s1.sy);
      ctx.lineTo(s2.sx, s2.sy);
      ctx.lineTo(s3.sx, s3.sy);
      ctx.stroke();

      // Drop-line from End-Effector to its floor shadow
      const p3Screen = project3D(fk.p3, camYaw, camPitch);
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(p3Screen.sx, p3Screen.sy);
      ctx.lineTo(s3.sx, s3.sy);
      ctx.stroke();
      ctx.setLineDash([]);

      // =====================================================================
      // 3. 3D TARGET PILLAR & FLOOR FOOTPRINT RING
      // =====================================================================
      const target3D = { x: s.rawTargetX, y: s.rawTargetY, z: s.rawTargetZ };
      const targetFloor = project3D({ x: target3D.x, y: 0, z: target3D.z }, camYaw, camPitch);
      const targetScreen = project3D(target3D, camYaw, camPitch);

      // Floor ring under 3D target
      ctx.strokeStyle = s.wheelPulse > 0 ? '#c084fc' : 'rgba(251, 191, 36, 0.55)';
      ctx.lineWidth = s.wheelPulse > 0 ? 2.2 : 1.5;
      ctx.beginPath();
      ctx.ellipse(
        targetFloor.sx,
        targetFloor.sy,
        10 * targetFloor.scale,
        5 * targetFloor.scale,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      // Vertical laser pillar from floor (Y=0) to 3D Target (X, Y, Z)
      ctx.strokeStyle = s.wheelPulse > 0 ? 'rgba(192, 132, 252, 0.7)' : 'rgba(251, 191, 36, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(targetFloor.sx, targetFloor.sy);
      ctx.lineTo(targetScreen.sx, targetScreen.sy);
      ctx.stroke();
      ctx.setLineDash([]);

      // =====================================================================
      // 4. 3D END-EFFECTOR TRAJECTORY RIBBON
      // =====================================================================
      if (s.trail.length > 1) {
        for (let i = 1; i < s.trail.length; i++) {
          const prev = project3D(s.trail[i - 1], camYaw, camPitch);
          const curr = project3D(s.trail[i], camYaw, camPitch);
          ctx.strokeStyle = `rgba(56, 189, 248, ${s.trail[i].alpha * 0.65})`;
          ctx.lineWidth = 2.5 * curr.scale;
          ctx.beginPath();
          ctx.moveTo(prev.sx, prev.sy);
          ctx.lineTo(curr.sx, curr.sy);
          ctx.stroke();
        }
      }

      // =====================================================================
      // 5. PHOTOREALISTIC 3D INDUSTRIAL TURNTABLE PEDESTAL & J1 TURRET
      // =====================================================================
      const p0Screen = project3D(fk.p0, camYaw, camPitch);
      const p1Screen = project3D(fk.p1, camYaw, camPitch);
      const p2Screen = project3D(fk.p2, camYaw, camPitch);

      const cosYaw = Math.cos(s.theta1);
      const sinYaw = Math.sin(s.theta1);

      // Helper to draw a 3D horizontal disc at height y with radius r
      const traceDisc3D = (yVal: number, radius: number) => {
        ctx.beginPath();
        for (let deg = 0; deg <= 360; deg += 12) {
          const rad = deg * DEG_TO_RAD;
          const pt = project3D(
            { x: radius * Math.cos(rad), y: yVal, z: radius * Math.sin(rad) },
            camYaw,
            camPitch
          );
          if (deg === 0) ctx.moveTo(pt.sx, pt.sy);
          else ctx.lineTo(pt.sx, pt.sy);
        }
        ctx.closePath();
      };

      // 5a. Heavy Cast-Iron Base Flange on Workbench Floor (y = 0..5mm)
      traceDisc3D(0, 38);
      const basePlateGrad = ctx.createLinearGradient(
        baseFloor.sx - 38,
        baseFloor.sy - 12,
        baseFloor.sx + 38,
        baseFloor.sy + 12
      );
      basePlateGrad.addColorStop(0, '#0f172a');
      basePlateGrad.addColorStop(0.35, '#334155');
      basePlateGrad.addColorStop(0.7, '#1e293b');
      basePlateGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = basePlateGrad;
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Upper beveled lip of floor flange (y = 4mm)
      traceDisc3D(4, 34);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 8 Machined M10 Hex Anchor Bolts around the base flange perimeter
      for (let b = 0; b < 8; b++) {
        const bAngle = b * (Math.PI / 4);
        const boltPt = project3D(
          { x: 30 * Math.cos(bAngle), y: 4.5, z: 30 * Math.sin(bAngle) },
          camYaw,
          camPitch
        );
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(boltPt.sx, boltPt.sy, 2.1 * boltPt.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(boltPt.sx, boltPt.sy, 0.9 * boltPt.scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5b. Rotating J1 Turret Cylinder Body (y = 5mm .. 22mm, radius = 24mm)
      const turretBotL = project3D({ x: -24 * Math.cos(camYaw), y: 5, z: -24 * Math.sin(camYaw) }, camYaw, camPitch);
      const turretBotR = project3D({ x: 24 * Math.cos(camYaw), y: 5, z: 24 * Math.sin(camYaw) }, camYaw, camPitch);
      const turretTopL = project3D({ x: -22 * Math.cos(camYaw), y: 22, z: -22 * Math.sin(camYaw) }, camYaw, camPitch);
      const turretTopR = project3D({ x: 22 * Math.cos(camYaw), y: 22, z: 22 * Math.sin(camYaw) }, camYaw, camPitch);

      const turretGrad = ctx.createLinearGradient(turretBotL.sx, 0, turretBotR.sx, 0);
      turretGrad.addColorStop(0, '#0f172a');
      turretGrad.addColorStop(0.28, '#475569');
      turretGrad.addColorStop(0.48, '#94a3b8');
      turretGrad.addColorStop(0.75, '#334155');
      turretGrad.addColorStop(1, '#090d16');

      ctx.fillStyle = turretGrad;
      ctx.beginPath();
      ctx.moveTo(turretBotL.sx, turretBotL.sy);
      ctx.lineTo(turretTopL.sx, turretTopL.sy);
      ctx.lineTo(turretTopR.sx, turretTopR.sy);
      ctx.lineTo(turretBotR.sx, turretBotR.sy);
      ctx.closePath();
      ctx.fill();

      // Glowing Cyan/Emerald Industrial Status Ring at J1 Slewing Bearing (y = 6mm)
      traceDisc3D(6, 25);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Turret Top Cap (y = 22mm)
      traceDisc3D(22, 22);
      ctx.fillStyle = '#334155';
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Turntable Yaw Heading Indicator Line on Turret
      const yawRim = project3D(
        { x: 24 * cosYaw, y: 22, z: 24 * sinYaw },
        camYaw,
        camPitch
      );
      const turretCenter = project3D({ x: 0, y: 22, z: 0 }, camYaw, camPitch);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(turretCenter.sx, turretCenter.sy);
      ctx.lineTo(yawRim.sx, yawRim.sy);
      ctx.stroke();

      // Twin Machined Yoke Cheeks supporting J2 Shoulder Pivot (from y = 20 to y = 30)
      const yokeSpread = 10;
      const perpYawX = -sinYaw;
      const perpYawZ = cosYaw;
      [-1, 1].forEach((side) => {
        const yBase = project3D(
          { x: side * yokeSpread * perpYawX, y: 18, z: side * yokeSpread * perpYawZ },
          camYaw,
          camPitch
        );
        const yPivot = project3D(
          { x: side * yokeSpread * perpYawX, y: BASE_HEIGHT, z: side * yokeSpread * perpYawZ },
          camYaw,
          camPitch
        );
        ctx.strokeStyle = side === 1 ? '#64748b' : '#334155';
        ctx.lineWidth = 11 * p0Screen.scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(yBase.sx, yBase.sy);
        ctx.lineTo(yPivot.sx, yPivot.sy);
        ctx.stroke();
      });

      // =====================================================================
      // 6. PHOTOREALISTIC CNC-MACHINED ARM CASTINGS, HYDRAULIC CYLINDER & HARNESS
      // =====================================================================
      // Helper: Draw a tapered 3D machined metallic robot arm casting with normal shading,
      // recessed CNC weight-relief pockets, and industrial accent striping
      const drawMachinedLink = (
        from: ProjectedPoint,
        to: ProjectedPoint,
        rStart: number,
        rEnd: number,
        metalScheme: 'industrial-orange' | 'anodized-titanium' | 'carbon-slate',
        pocketCount: number
      ) => {
        const dx = to.sx - from.sx;
        const dy = to.sy - from.sy;
        const len = Math.hypot(dx, dy);
        if (len < 2) return;

        const ux = dx / len;
        const uy = dy / len;
        // Normal vector pointing toward upper-left light source
        const nx = -uy;
        const ny = ux;

        const wStart = rStart * from.scale;
        const wEnd = rEnd * to.scale;
        const maxW = Math.max(wStart, wEnd);

        // 1. Outer Drop Shadow / Ambient Occlusion under link body
        ctx.save();
        ctx.strokeStyle = 'rgba(2, 6, 23, 0.55)';
        ctx.lineWidth = (rStart + rEnd) * 0.55 * ((from.scale + to.scale) * 0.5) + 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(from.sx + 1.5, from.sy + 2.5);
        ctx.lineTo(to.sx + 1.5, to.sy + 2.5);
        ctx.stroke();
        ctx.restore();

        // 2. Tapered Structural Casting Hull Path (Tangent-bridged capsule)
        const midX = (from.sx + to.sx) * 0.5;
        const midY = (from.sy + to.sy) * 0.5;
        const bodyGrad = ctx.createLinearGradient(
          midX + nx * maxW,
          midY + ny * maxW,
          midX - nx * maxW,
          midY - ny * maxW
        );

        if (metalScheme === 'industrial-orange') {
          // KUKA / ABB Industrial Robotics Anodized Amber-Orange + Brushed Alloy
          bodyGrad.addColorStop(0.0, '#7c2d12');
          bodyGrad.addColorStop(0.18, '#ea580c');
          bodyGrad.addColorStop(0.38, '#fdba74'); // Specular metallic ridge
          bodyGrad.addColorStop(0.55, '#f97316');
          bodyGrad.addColorStop(0.82, '#9a3412');
          bodyGrad.addColorStop(1.0, '#431407');
        } else if (metalScheme === 'anodized-titanium') {
          // Brushed Aerospace Titanium / Satin Silver-Blue
          bodyGrad.addColorStop(0.0, '#1e293b');
          bodyGrad.addColorStop(0.2, '#64748b');
          bodyGrad.addColorStop(0.4, '#f1f5f9'); // Bright machined aluminum highlight
          bodyGrad.addColorStop(0.6, '#94a3b8');
          bodyGrad.addColorStop(0.85, '#334155');
          bodyGrad.addColorStop(1.0, '#0f172a');
        } else {
          // Satin Carbon-Graphite Wrist Housing
          bodyGrad.addColorStop(0.0, '#090d16');
          bodyGrad.addColorStop(0.25, '#334155');
          bodyGrad.addColorStop(0.45, '#94a3b8');
          bodyGrad.addColorStop(0.7, '#1e293b');
          bodyGrad.addColorStop(1.0, '#020617');
        }

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(from.sx + nx * wStart, from.sy + ny * wStart);
        ctx.lineTo(to.sx + nx * wEnd, to.sy + ny * wEnd);
        ctx.arc(to.sx, to.sy, wEnd, Math.atan2(ny, nx), Math.atan2(-ny, -nx), false);
        ctx.lineTo(from.sx - nx * wStart, from.sy - ny * wStart);
        ctx.arc(from.sx, from.sy, wStart, Math.atan2(-ny, -nx), Math.atan2(ny, nx), false);
        ctx.closePath();
        ctx.fill();

        // Subtle metallic rim contour
        ctx.strokeStyle =
          metalScheme === 'industrial-orange'
            ? 'rgba(253, 186, 116, 0.45)'
            : 'rgba(226, 232, 240, 0.45)';
        ctx.lineWidth = 1.1;
        ctx.stroke();

        // 3. Recessed CNC Weight-Relief Pockets / Carbon-Fiber Inlays along the beam
        if (pocketCount > 0 && len > 38) {
          const startFrac = 0.22;
          const endFrac = 0.78;
          const totalSpan = endFrac - startFrac;
          const gapFrac = 0.045;
          const pocketSpan = (totalSpan - gapFrac * (pocketCount - 1)) / pocketCount;

          for (let p = 0; p < pocketCount; p++) {
            const f0 = startFrac + p * (pocketSpan + gapFrac);
            const f1 = f0 + pocketSpan;
            const fMid = (f0 + f1) * 0.5;
            const localW = (wStart * (1 - fMid) + wEnd * fMid) * 0.44;

            const px0 = from.sx + dx * f0;
            const py0 = from.sy + dy * f0;
            const px1 = from.sx + dx * f1;
            const py1 = from.sy + dy * f1;

            // Dark milled cavity
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = localW * 1.35;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(px0, py0);
            ctx.lineTo(px1, py1);
            ctx.stroke();

            // Lower bevel rim catch-light inside the CNC pocket
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.38)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px0 - nx * localW * 0.6, py0 - ny * localW * 0.6);
            ctx.lineTo(px1 - nx * localW * 0.6, py1 - ny * localW * 0.6);
            ctx.stroke();
          }
        }

        // 4. High-gloss specular ridge line along upper edge of casting
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
        ctx.lineWidth = 1.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(
          from.sx + ux * wStart * 0.6 + nx * wStart * 0.48,
          from.sy + uy * wStart * 0.6 + ny * wStart * 0.48
        );
        ctx.lineTo(
          to.sx - ux * wEnd * 0.6 + nx * wEnd * 0.48,
          to.sy - uy * wEnd * 0.6 + ny * wEnd * 0.48
        );
        ctx.stroke();
      };

      // Helper: Draw a 3D Harmonic-Drive Servo Actuator Drum at a joint
      const drawServoActuator3D = (
        pt: ProjectedPoint,
        radius: number,
        jointAngleRad: number,
        accentRingColor: string
      ) => {
        const r = radius * pt.scale;

        // Outer drop shadow
        ctx.fillStyle = 'rgba(2, 6, 23, 0.7)';
        ctx.beginPath();
        ctx.arc(pt.sx + 1.5, pt.sy + 2.2, r + 2, 0, Math.PI * 2);
        ctx.fill();

        // Outer anodized servo motor housing ring
        const housingGrad = ctx.createLinearGradient(
          pt.sx - r,
          pt.sy - r,
          pt.sx + r,
          pt.sy + r
        );
        housingGrad.addColorStop(0, '#475569');
        housingGrad.addColorStop(0.5, '#1e293b');
        housingGrad.addColorStop(1, '#090d16');
        ctx.fillStyle = housingGrad;
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Glowing optical encoder / torque sensor status ring
        ctx.strokeStyle = accentRingColor;
        ctx.lineWidth = 1.8 * pt.scale;
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, r * 0.76, 0, Math.PI * 2);
        ctx.stroke();

        // Inner brushed aluminum harmonic-drive wave generator cap
        const capGrad = ctx.createRadialGradient(
          pt.sx - r * 0.2,
          pt.sy - r * 0.2,
          r * 0.05,
          pt.sx,
          pt.sy,
          r * 0.62
        );
        capGrad.addColorStop(0, '#f8fafc');
        capGrad.addColorStop(0.55, '#94a3b8');
        capGrad.addColorStop(1, '#334155');
        ctx.fillStyle = capGrad;
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, r * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // 6 Rotating radial M4 socket-head cap bolts that spin with jointAngleRad
        const boltOrbit = r * 0.42;
        for (let b = 0; b < 6; b++) {
          const a = jointAngleRad + b * (Math.PI / 3);
          const bx = pt.sx + boltOrbit * Math.cos(a);
          const by = pt.sy + boltOrbit * Math.sin(a);
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(bx, by, Math.max(1.0, 1.35 * pt.scale), 0, Math.PI * 2);
          ctx.fill();
        }

        // Center hollow-shaft through-bore
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, r * 0.18, 0, Math.PI * 2);
        ctx.fill();
      };

      // 6a. External Braided Umbilical Cable Harness (Dress Pack) looping along the arm
      const drawCableConduit = (
        pA: ProjectedPoint,
        pB: ProjectedPoint,
        sagX: number,
        sagY: number,
        thickness: number
      ) => {
        const ctrlX = (pA.sx + pB.sx) * 0.5 + sagX;
        const ctrlY = (pA.sy + pB.sy) * 0.5 + sagY;

        // Outer corrugated black nylon conduit shadow
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = (thickness + 2.2) * ((pA.scale + pB.scale) * 0.5);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pA.sx, pA.sy);
        ctx.quadraticCurveTo(ctrlX, ctrlY, pB.sx, pB.sy);
        ctx.stroke();

        // Braided dark-slate sleeve
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = thickness * ((pA.scale + pB.scale) * 0.5);
        ctx.beginPath();
        ctx.moveTo(pA.sx, pA.sy);
        ctx.quadraticCurveTo(ctrlX, ctrlY, pB.sx, pB.sy);
        ctx.stroke();

        // Ribbed corrugation specular highlights along the cable
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.setLineDash([2, 3]);
        ctx.lineWidth = (thickness * 0.45) * ((pA.scale + pB.scale) * 0.5);
        ctx.beginPath();
        ctx.moveTo(pA.sx, pA.sy);
        ctx.quadraticCurveTo(ctrlX, ctrlY, pB.sx, pB.sy);
        ctx.stroke();
        ctx.setLineDash([]);
      };

      // Draw rear dress-pack cable loop from J1 turret to J2/J3 elbow
      drawCableConduit(p0Screen, p1Screen, -18 * p0Screen.scale, -14 * p0Screen.scale, 4.2);

      // 6b. Link 1 (Main Shoulder Boom): Heavy Industrial Orange-Amber Casting with 3 CNC Truss Pockets
      drawMachinedLink(p0Screen, p1Screen, 13.5, 10.5, 'industrial-orange', 3);

      // 6c. Hydraulic / Pneumatic Pitch Counterbalance Cylinder on Link 1
      const cylBase3D: Vec3 = {
        x: 14 * cosYaw,
        y: BASE_HEIGHT - 6,
        z: 14 * sinYaw,
      };
      const cylAttachRatio = 0.52;
      const cylRodTip3D: Vec3 = {
        x: fk.p1.x * cylAttachRatio + 6 * cosYaw,
        y: BASE_HEIGHT + (fk.p1.y - BASE_HEIGHT) * cylAttachRatio - 5,
        z: fk.p1.z * cylAttachRatio + 6 * sinYaw,
      };
      const cylBasePt = project3D(cylBase3D, camYaw, camPitch);
      const cylTipPt = project3D(cylRodTip3D, camYaw, camPitch);
      const cylMidX = cylBasePt.sx + (cylTipPt.sx - cylBasePt.sx) * 0.58;
      const cylMidY = cylBasePt.sy + (cylTipPt.sy - cylBasePt.sy) * 0.58;

      // Chrome hydraulic piston rod (full span)
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3.2 * p0Screen.scale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cylBasePt.sx, cylBasePt.sy);
      ctx.lineTo(cylTipPt.sx, cylTipPt.sy);
      ctx.stroke();

      // Dark anodized hydraulic cylinder barrel (lower 58% span)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 6.8 * p0Screen.scale;
      ctx.beginPath();
      ctx.moveTo(cylBasePt.sx, cylBasePt.sy);
      ctx.lineTo(cylMidX, cylMidY);
      ctx.stroke();

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.0 * p0Screen.scale;
      ctx.beginPath();
      ctx.moveTo(cylBasePt.sx, cylBasePt.sy);
      ctx.lineTo(cylMidX, cylMidY);
      ctx.stroke();

      // 6d. Forearm Dress-Pack Umbilical Loop (J2 Elbow to J3 Wrist)
      drawCableConduit(p1Screen, p2Screen, 10 * p1Screen.scale, -16 * p1Screen.scale, 3.4);

      // 6e. Link 2 (Forearm Boom): Brushed Aerospace Titanium Casting with 2 CNC Pockets
      drawMachinedLink(p1Screen, p2Screen, 10.5, 8.0, 'anodized-titanium', 2);

      // 6f. Link 3 (Wrist Actuator Module): Satin Carbon-Graphite Tapered Housing
      drawMachinedLink(p2Screen, p3Screen, 7.8, 5.8, 'carbon-slate', 1);

      // =====================================================================
      // 6g. PRECISION PARALLEL PNEUMATIC GRIPPER (END-OF-ARM TOOLING)
      // =====================================================================
      const dirR = Math.cos(fk.a3);
      const dirY = Math.sin(fk.a3);
      const perpR = -Math.sin(fk.a3);
      const perpY = Math.cos(fk.a3);

      // Anodized Gripper Actuator Block at p3
      const railSpan = 9.5;
      const bodyDepth = 6.5;
      const gTopL = project3D(
        {
          x: fk.p3.x + railSpan * perpR * cosYaw,
          y: fk.p3.y + railSpan * perpY,
          z: fk.p3.z + railSpan * perpR * sinYaw,
        },
        camYaw,
        camPitch
      );
      const gBotL = project3D(
        {
          x: fk.p3.x - railSpan * perpR * cosYaw,
          y: fk.p3.y - railSpan * perpY,
          z: fk.p3.z - railSpan * perpR * sinYaw,
        },
        camYaw,
        camPitch
      );
      const gTopR = project3D(
        {
          x: fk.p3.x + (bodyDepth * dirR + railSpan * perpR) * cosYaw,
          y: fk.p3.y + bodyDepth * dirY + railSpan * perpY,
          z: fk.p3.z + (bodyDepth * dirR + railSpan * perpR) * sinYaw,
        },
        camYaw,
        camPitch
      );
      const gBotR = project3D(
        {
          x: fk.p3.x + (bodyDepth * dirR - railSpan * perpR) * cosYaw,
          y: fk.p3.y + bodyDepth * dirY - railSpan * perpY,
          z: fk.p3.z + (bodyDepth * dirR - railSpan * perpR) * sinYaw,
        },
        camYaw,
        camPitch
      );

      // Draw parallel guide rail bar
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 6.5 * p3Screen.scale;
      ctx.lineCap = 'butt';
      ctx.beginPath();
      ctx.moveTo(gTopL.sx, gTopL.sy);
      ctx.lineTo(gBotL.sx, gBotL.sy);
      ctx.stroke();

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.2 * p3Screen.scale;
      ctx.beginPath();
      ctx.moveTo(gTopL.sx, gTopL.sy);
      ctx.lineTo(gBotL.sx, gBotL.sy);
      ctx.stroke();

      // Parallel Servo Jaws (slight dynamic breathing grip aperture near target)
      const distToTarget = Math.hypot(
        s.targetX - fk.p3.x,
        s.targetY - fk.p3.y,
        s.targetZ - fk.p3.z
      );
      const jawSpread = clamp(4.2 + Math.min(3.5, distToTarget * 0.08), 4.2, 7.5);
      const jawLen = 17;

      const jawUpperBase: Vec3 = {
        x: fk.p3.x + (bodyDepth * dirR + jawSpread * perpR) * cosYaw,
        y: fk.p3.y + bodyDepth * dirY + jawSpread * perpY,
        z: fk.p3.z + (bodyDepth * dirR + jawSpread * perpR) * sinYaw,
      };
      const jawLowerBase: Vec3 = {
        x: fk.p3.x + (bodyDepth * dirR - jawSpread * perpR) * cosYaw,
        y: fk.p3.y + bodyDepth * dirY - jawSpread * perpY,
        z: fk.p3.z + (bodyDepth * dirR - jawSpread * perpR) * sinYaw,
      };
      const jawUpperTip: Vec3 = {
        x: fk.p3.x + (jawLen * dirR + jawSpread * 0.78 * perpR) * cosYaw,
        y: fk.p3.y + jawLen * dirY + jawSpread * 0.78 * perpY,
        z: fk.p3.z + (jawLen * dirR + jawSpread * 0.78 * perpR) * sinYaw,
      };
      const jawLowerTip: Vec3 = {
        x: fk.p3.x + (jawLen * dirR - jawSpread * 0.78 * perpR) * cosYaw,
        y: fk.p3.y + jawLen * dirY - jawSpread * 0.78 * perpY,
        z: fk.p3.z + (jawLen * dirR - jawSpread * 0.78 * perpR) * sinYaw,
      };

      const juB = project3D(jawUpperBase, camYaw, camPitch);
      const juT = project3D(jawUpperTip, camYaw, camPitch);
      const jlB = project3D(jawLowerBase, camYaw, camPitch);
      const jlT = project3D(jawLowerTip, camYaw, camPitch);

      // Outer metallic finger linkages
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3.2 * p3Screen.scale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(gTopR.sx, gTopR.sy);
      ctx.lineTo(juB.sx, juB.sy);
      ctx.lineTo(juT.sx, juT.sy);
      ctx.moveTo(gBotR.sx, gBotR.sy);
      ctx.lineTo(jlB.sx, jlB.sy);
      ctx.lineTo(jlT.sx, jlT.sy);
      ctx.stroke();

      // Inner high-friction orange elastomer grip pads at finger tips
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.0 * p3Screen.scale;
      ctx.beginPath();
      ctx.moveTo((juB.sx + juT.sx) * 0.5, (juB.sy + juT.sy) * 0.5);
      ctx.lineTo(juT.sx, juT.sy);
      ctx.moveTo((jlB.sx + jlT.sx) * 0.5, (jlB.sy + jlT.sy) * 0.5);
      ctx.lineTo(jlT.sx, jlT.sy);
      ctx.stroke();

      // 6h. Render 3D Harmonic-Drive Servo Actuator Drums at J2, J3, J4
      drawServoActuator3D(p0Screen, 12.5, s.theta2, '#f97316'); // J2 Shoulder Servo
      drawServoActuator3D(p1Screen, 10.0, s.theta2 + s.theta3, '#38bdf8'); // J3 Elbow Servo
      drawServoActuator3D(p2Screen, 8.0, fk.a3, '#2dd4bf'); // J4 Wrist Servo
      drawServoActuator3D(p3Screen, 5.8, fk.a3, '#34d399'); // Tool Changer Flange

      // =====================================================================
      // 7. 3D INTERACTIVE TARGET SPHERE & CROSSHAIR
      // =====================================================================
      const tRadius = (9 + s.wheelPulse * 4) * targetScreen.scale;
      ctx.strokeStyle = s.wheelPulse > 0 ? '#c084fc' : '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(targetScreen.sx, targetScreen.sy, tRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = s.wheelPulse > 0 ? '#c084fc' : '#fbbf24';
      ctx.beginPath();
      ctx.arc(targetScreen.sx, targetScreen.sy, 3.5 * targetScreen.scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = s.wheelPulse > 0 ? '#e9d5ff' : '#fde68a';
      ctx.fillText(
        `TARGET (${Math.round(s.rawTargetX)}, ${Math.round(s.rawTargetY)}, Z:${Math.round(s.rawTargetZ)})`,
        targetScreen.sx + 13,
        targetScreen.sy - 8
      );

      // =====================================================================
      // 8. VISUAL Y-HEIGHT SCROLL BAR GAUGE ON WORKSPACE RIGHT EDGE
      // =====================================================================
      const yBarX = WORKSPACE_W - 26;
      const yBarTop = 58;
      const yBarH = CANVAS_H - 105;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = s.wheelPulse > 0 ? '#c084fc' : '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(yBarX - 8, yBarTop, 16, yBarH, 8);
      ctx.fill();
      ctx.stroke();

      // Y-Height thumb position (18..240mm)
      const yNorm = (s.rawTargetY - 18) / (240 - 18);
      const yThumbY = yBarTop + yBarH * (1 - clamp(yNorm, 0, 1));
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(yBarX, yThumbY, 5.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#c084fc';
      ctx.textAlign = 'center';
      ctx.fillText('Y-HEIGHT', yBarX - 4, yBarTop - 14);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('(Scroll)', yBarX - 4, yBarTop - 4);
      ctx.textAlign = 'left';

      // Workspace Top Legend
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('3D SPATIAL MANIPULATOR (4-DOF)', 16, 22);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Move Mouse: Plane (X, Z) • Scroll Wheel: Up/Down Height (Y) • Shift+Drag: Orbit', 16, 38);

      // =====================================================================
      // 9. RIGHT PANE: REAL-TIME JOINT & MANIPULABILITY TELEMETRY SCOPE
      // =====================================================================
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(TELEMETRY_X, TELEMETRY_Y, TELEMETRY_W, TELEMETRY_H, 8);
      ctx.fill();
      ctx.stroke();

      const midY = TELEMETRY_Y + TELEMETRY_H * 0.56;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(TELEMETRY_X, midY);
      ctx.lineTo(TELEMETRY_X + TELEMETRY_W, midY);
      ctx.stroke();

      // Top Chart: 4 Joint Angles (theta1 Base Yaw, theta2 Shoulder, theta3 Elbow, theta4 Wrist)
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('3D JOINT ANGLESTRATEGY (θ1 YAW, θ2..θ4 PITCH)', TELEMETRY_X + 10, TELEMETRY_Y + 16);

      const topChartY = TELEMETRY_Y + 26;
      const topChartH = midY - topChartY - 10;
      const zeroAngleY = topChartY + topChartH * 0.5;

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.beginPath();
      ctx.moveTo(TELEMETRY_X + 6, zeroAngleY);
      ctx.lineTo(TELEMETRY_X + TELEMETRY_W - 6, zeroAngleY);
      ctx.stroke();

      const plotTrace = (
        getter: (d: TelemetrySample) => number,
        minVal: number,
        maxVal: number,
        color: string,
        chartTop: number,
        chartHeight: number
      ) => {
        if (s.history.length < 2) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        for (let i = 0; i < s.history.length; i++) {
          const x = TELEMETRY_X + 8 + (i / (HISTORY_LEN - 1)) * (TELEMETRY_W - 16);
          const v = getter(s.history[i]);
          const norm = clamp((v - minVal) / (maxVal - minVal), 0, 1);
          const y = chartTop + chartHeight * (1 - norm);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      plotTrace((d) => d.theta1Deg, -180, 180, '#c084fc', topChartY, topChartH); // Yaw
      plotTrace((d) => d.theta2Deg, -180, 180, '#60a5fa', topChartY, topChartH); // Shoulder
      plotTrace((d) => d.theta3Deg, -180, 180, '#38bdf8', topChartY, topChartH); // Elbow
      plotTrace((d) => d.theta4Deg, -180, 180, '#34d399', topChartY, topChartH); // Wrist

      // Legend for top chart
      ctx.font = '10px monospace';
      ctx.fillStyle = '#c084fc';
      ctx.fillText('θ1 Yaw', TELEMETRY_X + 10, midY - 6);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText('θ2 Shld', TELEMETRY_X + 70, midY - 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('θ3 Elbw', TELEMETRY_X + 135, midY - 6);
      ctx.fillStyle = '#34d399';
      ctx.fillText('θ4 Wrst', TELEMETRY_X + 200, midY - 6);

      // Bottom Chart: Manipulability & 3D Tracking Error
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('MANIPULABILITY w(θ) & 3D ERROR ||e||', TELEMETRY_X + 10, midY + 16);

      const botChartY = midY + 24;
      const botChartH = TELEMETRY_Y + TELEMETRY_H - botChartY - 20;

      plotTrace((d) => d.manipulability, 0, 1.05, '#a855f7', botChartY, botChartH);
      plotTrace((d) => d.errMm, 0, 120, '#fbbf24', botChartY, botChartH);

      ctx.font = '10px monospace';
      ctx.fillStyle = '#a855f7';
      ctx.fillText('Manipulability (0..1)', TELEMETRY_X + 10, TELEMETRY_Y + TELEMETRY_H - 6);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('3D Error ||e|| (mm)', TELEMETRY_X + 165, TELEMETRY_Y + TELEMETRY_H - 6);
    };

    const loop = () => {
      frameCount++;
      stepKinematicsAndDynamics();
      drawCanvas();
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [computeFk3D, project3D]);

  return (
    <div className="space-y-4">
      {/* Clean Light-Mode Status & Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className={`px-2.5 py-0.5 rounded-full border font-semibold ${hud.statusColor}`}>
            {hud.status}
          </span>
          <span className="text-slate-400 hidden sm:inline">&bull;</span>
          <span className="text-slate-700 font-medium">
            4-DOF 3D Damped Least Squares IK + 2nd-Order Servo Dynamics
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3.5 font-mono text-slate-700">
          <span>
            <span className="text-slate-400">3D Target:</span>{' '}
            <strong className="text-amber-600">
              (X:{hud.targetX}, Y:{hud.targetY}, Z:{hud.targetZ})
            </strong>
          </span>
          <span>
            <span className="text-slate-400">Yaw θ1:</span>{' '}
            <strong className="text-purple-700">{hud.theta1Deg.toFixed(0)}&deg;</strong>
          </span>
          <span>
            <span className="text-slate-400">Error:</span>{' '}
            <strong className="text-emerald-700">{hud.errMm.toFixed(1)}mm</strong>
          </span>
          <span>
            <span className="text-slate-400">Manipulability:</span>{' '}
            <strong className="text-blue-700">{hud.manipulability.toFixed(2)}</strong>
          </span>
        </div>
      </div>

      {/* Interactive 60 FPS 3D Canvas */}
      <div
        className="relative rounded-xl border border-slate-300 bg-slate-900 shadow-sm overflow-hidden"
        onContextMenu={(e) => e.preventDefault()}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-auto block cursor-crosshair touch-none"
        />
      </div>

      {/* Parameter & Trajectory Control Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 Columns: Vertical Elevation (Scroll Wheel), Servo Compliance & Link Geometry */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-900 text-sm">
              Vertical Height (Scroll Wheel) &amp; Servo Dynamics
            </span>
            <span className="font-mono text-slate-500">
              Mouse: Plane (X, Z) &bull; Scroll: Height (Y)
            </span>
          </div>

          {/* Y-Axis Elevation Slider (Synchronized with Mouse Scroll Wheel!) */}
          <div className="space-y-1 rounded-lg bg-purple-50/70 border border-purple-200/80 p-2.5">
            <div className="flex justify-between">
              <label htmlFor="ik-yheight" className="text-purple-950 font-semibold">
                Up / Down Axis: Target Height <span className="text-purple-700 font-mono">Y</span>{' '}
                <span className="text-purple-700 font-normal">
                  (Mouse Scroll Wheel over canvas or slider)
                </span>
              </label>
              <span className="font-mono font-bold text-purple-800">{targetY} mm</span>
            </div>
            <input
              id="ik-yheight"
              type="range"
              min={18}
              max={240}
              step={2}
              value={targetY}
              onChange={(e) => handleTargetYChange(parseFloat(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>

          {/* Servo Stiffness / Compliance Slider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between">
                <label htmlFor="ik-stiffness" className="text-slate-700 font-medium">
                  Servo Compliance / Speed
                </label>
                <span className="font-mono font-semibold text-slate-900">
                  {stiffness < 12 ? 'Soft Cobot' : stiffness > 22 ? 'Crisp Servo' : 'Balanced'} ({stiffness.toFixed(0)})
                </span>
              </div>
              <input
                id="ik-stiffness"
                type="range"
                min={6}
                max={28}
                step={1}
                value={stiffness}
                onChange={(e) => handleStiffnessChange(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Damping Factor Lambda */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <label htmlFor="ik-lambda" className="text-slate-700 font-medium">
                  Singularity Damping (&lambda;)
                </label>
                <span className="font-mono font-semibold text-blue-700">{damping.toFixed(1)}</span>
              </div>
              <input
                id="ik-lambda"
                type="range"
                min={2}
                max={40}
                step={0.5}
                value={damping}
                onChange={(e) => handleDampingChange(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Link Lengths Row + 3D Camera Orbit */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between">
                <label htmlFor="ik-l1" className="text-slate-700 font-medium">
                  Link 1
                </label>
                <span className="font-mono text-slate-900">{l1}mm</span>
              </div>
              <input
                id="ik-l1"
                type="range"
                min={65}
                max={145}
                step={1}
                value={l1}
                onChange={(e) => handleL1Change(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label htmlFor="ik-l2" className="text-slate-700 font-medium">
                  Link 2
                </label>
                <span className="font-mono text-slate-900">{l2}mm</span>
              </div>
              <input
                id="ik-l2"
                type="range"
                min={55}
                max={130}
                step={1}
                value={l2}
                onChange={(e) => handleL2Change(parseFloat(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label htmlFor="ik-l3" className="text-slate-700 font-medium">
                  Link 3
                </label>
                <span className="font-mono text-slate-900">{l3}mm</span>
              </div>
              <input
                id="ik-l3"
                type="range"
                min={35}
                max={95}
                step={1}
                value={l3}
                onChange={(e) => handleL3Change(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label htmlFor="ik-cam" className="text-slate-700 font-medium">
                  3D Camera
                </label>
                <span className="font-mono text-slate-900">{cameraYawDeg}&deg;</span>
              </div>
              <input
                id="ik-cam"
                type="range"
                min={-65}
                max={75}
                step={1}
                value={cameraYawDeg}
                onChange={(e) => handleCameraYawChange(parseFloat(e.target.value))}
                className="w-full accent-slate-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right 5 Columns: 3D Trajectory Generators & Null-Space Posture */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between space-y-3 text-xs">
          <div className="space-y-3">
            <div className="font-semibold text-slate-900 text-sm border-b border-slate-200 pb-2">
              3D Trajectory Generator &amp; Posture
            </div>

            {/* Trajectory Mode Buttons */}
            <div className="space-y-1.5">
              <div className="text-slate-600 font-medium">3D Motion Planner Mode:</div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleTrajectoryModeChange('manual')}
                  className={`px-2.5 py-2 rounded-lg border font-medium transition cursor-pointer ${
                    trajectoryMode === 'manual'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Manual (Mouse Plane + Scroll Y)
                </button>
                <button
                  type="button"
                  onClick={() => handleTrajectoryModeChange('helix3d')}
                  className={`px-2.5 py-2 rounded-lg border font-medium transition cursor-pointer ${
                    trajectoryMode === 'helix3d'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  3D Helix Corkscrew
                </button>
                <button
                  type="button"
                  onClick={() => handleTrajectoryModeChange('pickplace3d')}
                  className={`px-2.5 py-2 rounded-lg border font-medium transition cursor-pointer ${
                    trajectoryMode === 'pickplace3d'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  3D Pick &amp; Place
                </button>
                <button
                  type="button"
                  onClick={() => handleTrajectoryModeChange('figure8_3d')}
                  className={`px-2.5 py-2 rounded-lg border font-medium transition cursor-pointer ${
                    trajectoryMode === 'figure8_3d'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  3D Figure-8 Path
                </button>
              </div>
            </div>

            {/* Redundant Null-Space Posture Selector */}
            <div className="space-y-1.5 pt-1">
              <div className="text-slate-600 font-medium">
                Null-Space Posture (Redundant DOF):
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePostureChange('elbow-up')}
                  className={`px-2.5 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                    postureMode === 'elbow-up'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Elbow-Up
                </button>
                <button
                  type="button"
                  onClick={() => handlePostureChange('elbow-down')}
                  className={`px-2.5 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                    postureMode === 'elbow-down'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Elbow-Down
                </button>
                <button
                  type="button"
                  onClick={() => handlePostureChange('natural')}
                  className={`px-2.5 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                    postureMode === 'natural'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Natural Arc
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetHome}
            className="w-full px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold transition cursor-pointer"
          >
            Reset Arm to Default 3D Pose
          </button>
        </div>
      </div>
    </div>
  );
}
