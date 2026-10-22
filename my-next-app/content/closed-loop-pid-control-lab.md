---
title: 'Interactive PID Control Lab: Closed-Loop Dynamics, Windup & Damping'
date: '2026-10-15'
description: 'An interactive 60Hz discrete-time PID controller and digital storage oscilloscope: tune Kp, Ki, and Kd gains in real time, inject physical load surges, observe steady-state droop, and trigger critical-damping Autotune.'
tags: ['Control Theory', 'PID', 'Closed-Loop', 'Embedded', 'Interactive']
---

In automated control systems—whether regulating temperature, maintaining vessel pressure, or driving variable-rate actuators—a **Proportional-Integral-Derivative (PID)** loop is the foundational workhorse of closed-loop feedback control.

Below is an independent, educational **60 Hz Discrete-Time PID Control Simulator** I built as a hobby project, coupled to a simulated second-order fluid tank with head-pressure drain, actuator slew lag, and saturation boundaries.

## Interactive Closed-Loop Workbench

<PidControlLab />

---

## 1. Discrete-Time PID Formulation in Embedded Firmware

Unlike continuous-time textbook Laplace transforms, firmware running inside a deterministic timer interrupt computes actuator effort `u[k]` at fixed sampling intervals `dt`:

```text
e[k] = r[k] - y[k]
u[k] = clamp( Kp * e[k]  +  Ki * Σ(e[j] * dt)  +  Kd * (e[k] - e[k-1]) / dt,  0%,  100% )
```

Each of the three terms addresses a distinct temporal domain of error `e[k] = r[k] - y[k]`:

1. **Proportional (`Kp · e[k]`) — Present Error**:
   - Provides immediate restoring stiffness proportional to current deviation from setpoint.
   - **Tradeoff**: Cranking `Kp` alone speeds up initial rise time, but physical plant inertia causes the process variable `y(t)` to overshoot the setpoint and oscillate (try clicking the **Underdamped (Ring)** preset above).
2. **Integral (`Ki · Σ(e[k] · dt)`) — Past Accumulated Error**:
   - Because physical reactors experience continuous outflow/load drain, a purely proportional controller stalls below setpoint where `Kp · e_ss = u_load`.
   - Click the **P-Only (Load Droop)** preset above (`Ki = 0`) to observe this persistent **steady-state droop** on the oscilloscope, then restore `Ki` to watch the integrator drive residual error to zero.
3. **Derivative (`Kd · Δe / dt`) — Future Trajectory Braking**:
   - Introduces phase lead that acts as viscous electronic damping. As `y(t)` rapidly approaches the setpoint, the negative rate of error change subtracts drive effort *before* crossing the target, suppressing overshoot.

---

## 2. Production Hardening: Anti-Windup & Derivative Filtering

Implementing a naive textbook PID equation on real physical hardware fails in two classic ways:

### Conditional Integral Clamping (Anti-Windup)
Physical actuators (valves, peristaltic pumps, PWM H-bridges) saturate at `[0%, 100%]`. During a large setpoint step, if the actuator is already pinned at `100%` while the integrator keeps accumulating positive error, the integral register "winds up" to a massive value—forcing the actuator to stay pinned long after passing the setpoint.

In `PidControlLab.tsx`, we enforce **conditional integration clamping**—freezing the accumulator whenever the tentative output saturates in the same direction as the active error:

```ts
const tentativeU = pTerm + s.integral + dTerm;
const saturatedHigh = tentativeU >= 100 && error > 0;
const saturatedLow = tentativeU <= 0 && error < 0;

if (!saturatedHigh && !saturatedLow && s.ki > 0) {
  s.integral = Math.max(-60, Math.min(110, s.integral + s.ki * error * dt * 1.35));
}
```

### Derivative-on-Measurement & Low-Pass Filtering
When a user abruptly steps the Setpoint `r[k]`, the instantaneous derivative of error `(e[k] - e[k-1]) / dt` spikes towards infinity ("derivative kick"), slamming the actuator into saturation for a single sample. Furthermore, high-frequency ADC noise is amplified by `1 / dt`.

To eliminate derivative kick while preserving phase-lead damping, we weight the negative rate of change of the **measured Process Variable** `-(y[k] - y[k-1]) / dt` passed through a first-order exponential moving average (EMA) filter:

```ts
const dErrorRate = (error - s.prevError) / dt;
const dPvRate = -(s.pv - s.prevPv) / dt;
const rawD = s.kd * (0.3 * dErrorRate + 0.7 * dPvRate);
s.filteredD = s.filteredD * 0.72 + rawD * 0.28;
```

---

## 3. Recommended Experiments on the Scope

* **Drag the Oscilloscope Setpoint**: Click and drag vertically directly inside the top oscilloscope trace to command arbitrary setpoint trajectories and watch the CH3 PWM effort respond in real time.
* **Disturbance Rejection**: Click **↓ Drain Surge (-30%)** or **↑ Inflow Spike (+30%)** while the loop is locked to see how quickly the controller rejects transient load shocks.
* **Ring to Lock**: Select **Underdamped (Ring)** to induce severe harmonic oscillation, then click **✨ Autotune PID** to apply critically damped gains (`Kp = 2.60`, `Ki = 1.45`, `Kd = 1.35`) and watch the derivative brake arrest the oscillation immediately.
