---
title: '3D Robotic Arm Inverse Kinematics: 4-DOF Jacobian DLS & Servo Compliance'
date: '2026-10-15'
description: 'Designing a real-time 4-DOF 3D spatial robotic manipulator in TypeScript: 3x4 analytical Jacobian derivation, Damped Least Squares (Levenberg-Marquardt) singularity handling, scroll-wheel Z-depth manipulation, and 2nd-order servo compliance.'
tags: ['Robotics', 'Inverse Kinematics', 'Control Theory', 'TypeScript', 'Interactive']
---

In robotics and mechatronics, translating a desired 3D Cartesian target `(x_d, y_d, z_d)` into smooth, coordinated motor commands across a rotating turntable base and multiple pitch joints `(θ1, θ2, θ3, θ4)` requires solving the **Inverse Kinematics (IK)** problem in real time while modeling physical rotor inertia, joint compliance, and kinematic singularities.

Below is an interactive **4-DOF 3D Spatial Robotic Manipulator** running at 60 Hz:
- **Left-Click + Drag** inside the 3D workspace to move the target across `(X, Y)`.
- **Spin the Mouse Scroll Wheel** while hovering over the workspace to push or pull the target along the **3rd axis (`Z-Depth`)** and watch the turntable base (`θ1`) and floor shadow swivel in 3D.
- **Shift + Drag** (or right-click drag) to orbit the 3D perspective camera around the workbench.

## Interactive 4-DOF 3D Spatial Manipulator

<RoboticArmIkLab />

---

## 1. 3D Forward Kinematics & The 3×4 Analytical Jacobian

Our manipulator combines a rotating **Base Turntable Yaw (`θ1`)** in the horizontal `(X, Z)` floor plane with three revolute **Pitch Joints (`θ2`, `θ3`, `θ4`)** of link lengths `L1`, `L2`, `L3`. Let the cumulative pitch angles in the arm's vertical radial plane be `a1 = θ2`, `a2 = θ2 + θ3`, and `a3 = θ2 + θ3 + θ4`:

```text
r(q) = L1 * cos(a1) + L2 * cos(a2) + L3 * cos(a3)
x(q) = r(q) * cos(θ1)
y(q) = h0 + L1 * sin(a1) + L2 * sin(a2) + L3 * sin(a3)
z(q) = r(q) * sin(θ1)
```

Differentiating `(x, y, z)` with respect to all four joints `q = [θ1, θ2, θ3, θ4]^T` yields the `3 × 4` **Analytical 3D Geometric Jacobian** `J(q)`:

```ts
const dr3 = -L3 * Math.sin(a3);
const dy3 =  L3 * Math.cos(a3);
const dr2 = -L2 * Math.sin(a2) + dr3;
const dy2 =  L2 * Math.cos(a2) + dy3;
const dr1 = -L1 * Math.sin(a1) + dr2;
const dy1 =  L1 * Math.cos(a1) + dy2;

const J = [
  [-r3 * Math.sin(theta1), dr1 * Math.cos(theta1), dr2 * Math.cos(theta1), dr3 * Math.cos(theta1)],
  [0,                      dy1,                    dy2,                    dy3                   ],
  [ r3 * Math.cos(theta1), dr1 * Math.sin(theta1), dr2 * Math.sin(theta1), dr3 * Math.sin(theta1)],
];
```

---

## 2. Singularity-Robust Damped Least Squares (Levenberg-Marquardt IK)

When the user drags or scrolls the 3D target outside the arm's maximum spherical reach (`L1 + L2 + L3`), the links stretch collinearly and the `3 × 3` matrix `J * J^T` loses rank (`det(J * J^T) → 0`). Using an undamped pseudoinverse causes commanded joint velocities to spike toward infinity.

Instead, we regularize the `3 × 3` inversion with a Tikhonov damping factor `λ`:

```text
J^# = J^T * ( J * J^T + λ² * I_3 )^-1
```

---

## 3. Eliminating Stiffness: Second-Order Servo Compliance & Null-Space Posture

Purely geometric IK solvers update joint angles instantaneously (`θ += Δθ`), which makes simulated arms feel stiff and robotic. Real collaborative robots (cobots) and industrial servo drives exhibit rotor inertia, velocity feedforward, and tunable PD compliance.

In `RoboticArmIkLab.tsx`, we eliminate kinematic stiffness through three layers:
1. **Second-Order Command Filter**: Raw mouse `(X, Y)` drags and scroll-wheel `Z` steps pass through a critically damped 2nd-order filter (`ω_n = 26 rad/s, ζ = 1.0`), producing continuous target velocities `v_d` for velocity feedforward.
2. **Null-Space Posture Projection**: Because `4 joints > 3 Cartesian coordinates`, the arm has a 1D null space `(I_4 - J^# * J)` that continuously biases the arm toward **Elbow-Up**, **Elbow-Down**, or **Natural Arc** postures without disturbing the 3D end-effector tip.
3. **Adjustable Servo Compliance**: Joint angular velocities `ω` track the DLS reference through a tunable 2nd-order actuator bandwidth model—allowing you to slide between a **Soft Compliant Cobot** feel and a **Crisp Industrial Servo** response.
