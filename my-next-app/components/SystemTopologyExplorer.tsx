'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface TopologyLayer {
  id: string;
  code: string;
  name: string;
  tagline: string;
  protocols: string[];
  summary: string;
  engineeringDetails: string[];
  relatedPost?: {
    title: string;
    href: string;
  };
}

const TOPOLOGY_LAYERS: TopologyLayer[] = [
  {
    id: 'layer-io',
    code: 'Layer 1 • Robotics & Physical Actuation',
    name: 'Kinematics, Sensors & Closed-Loop Control',
    tagline: 'Inverse Kinematics • PID Control • 4–20mA & Digital I/O',
    protocols: [
      'Jacobian Inverse Kinematics (DLS)',
      'Closed-Loop PID Control',
      '4–20mA Analog Current Loops',
      'Discrete Digital I/O',
      'Variable-Frequency Actuators',
      'PLCs & Hardware Interlocks',
    ],
    summary:
      'Governing physical actuators, multi-axis kinematic chains, and industrial sensors in real time—ensuring smooth trajectory tracking, singularity-safe motion, and closed-loop stability across robotics, thermal/fluid regulation, and automated facilities.',
    engineeringDetails: [
      'Singularity-robust Damped Least Squares (DLS) Jacobian inverse kinematics and minimum-jerk trajectory planning.',
      'Discrete-time closed-loop PID regulation with conditional anti-windup clamping and derivative filtering.',
      'Hardware safety interlock verification proven across 20+ countries spanning 6 continents.',
    ],
    relatedPost: {
      title: '3-DOF Robotic Arm Inverse Kinematics Lab',
      href: '/posts/robotic-arm-inverse-kinematics',
    },
  },
  {
    id: 'layer-fieldbus',
    code: 'Layer 2 • Fault-Tolerant Fieldbus',
    name: 'Self-Healing Fieldbus & Facility Telemetry',
    tagline: 'Modbus TCP/RTU • OPC UA • BMS/Data Center & IIoT Protocols',
    protocols: [
      'Modbus TCP/IP',
      'Modbus RTU (RS-485)',
      'OPC UA',
      'LoRa / LoRaWAN',
      'Self-Healing State Machines',
    ],
    summary:
      'Deterministic communication state machines that isolate upper-layer control and telemetry from hardware resets, bus contention, and brownfield controller quirks—using the same protocols that power data center BMS/cooling, robotics buses, and industrial plants.',
    engineeringDetails: [
      'Masks unannounced 20–40 minute third-party controller watchdog resets with zero customer-visible disruption.',
      'Holds bounded Last-Known-Good (LKG) state while probing offline nodes with jittered exponential backoff.',
      'Performs automatic volatile RAM register reconciliation and read-back verification before bumpless transfer.',
    ],
    relatedPost: {
      title: 'Self-Healing Fieldbus State Machines',
      href: '/posts/self-healing-fieldbus-state-machines',
    },
  },
  {
    id: 'layer-edge',
    code: 'Layer 3 • Linux Fleet & Networking',
    name: 'Embedded Linux Daemons & Out-of-Band Networking',
    tagline: 'Headless Ubuntu Fleet • Native C++/Python Daemons • Routing',
    protocols: [
      'Embedded Linux (Ubuntu LTS)',
      'C / C++ & Python Daemons',
      'DHCP, NAT & Subnet Routing',
      'Cradlepoint / Teltonika / MultiTech / Milesight',
      'Remote OTA Fleet Upgrades',
    ],
    summary:
      'Headless Linux edge nodes and multi-hop network topologies engineered for low-footprint execution, out-of-band management, and zero-touch remote provisioning.',
    engineeringDetails: [
      'Replaced heavy containerized runtimes with lightweight native C/C++ and Python daemons, cutting memory and flash footprint by ~50%.',
      'Ported and cross-compiled core C/C++ software to execute safe, remote in-field Linux LTS distribution upgrades.',
      'Configured DHCP servers, NAT / port-forwarding rules, and cellular/LoRa backhaul routing for remote diagnostics.',
    ],
  },
  {
    id: 'layer-cloud',
    code: 'Layer 4 • Cloud, Web & Agentic AI',
    name: 'Cloud Telemetry, Full-Stack Platforms & Agentic AI',
    tagline: 'Azure IoT • TypeScript/React • Decision Engines • Agentic AI',
    protocols: [
      'Azure IoT Hub (MQTT)',
      'React, Next.js & TypeScript',
      'Rule-Based Decision Engines',
      'Offline-First Cloud Sync',
      'Claude Code & Antigravity (AGENTS.md)',
    ],
    summary:
      'Bridging edge telemetry into cloud infrastructure, deterministic configuration platforms, responsive web applications, and AI-augmented engineering pipelines.',
    engineeringDetails: [
      'Architected deterministic rule-based recommendation engines that codify domain heuristics into automated software workflows.',
      'Pioneered declarative context architecture (CLAUDE.md, AGENTS.md) with Claude Code, Google Antigravity, and Gemini across C/C++, Python, and TypeScript.',
      'Engineered offline-first multi-tenant web synchronization using subcollection isolation and collision-resistant pairing.',
    ],
    relatedPost: {
      title: 'Offline-First Multi-Tenant Sync',
      href: '/posts/serverless-grocery-sync-architecture',
    },
  },
];

export function SystemTopologyExplorer() {
  const [activeId, setActiveId] = useState<string>(TOPOLOGY_LAYERS[0].id);
  const activeLayer =
    TOPOLOGY_LAYERS.find((l) => l.id === activeId) || TOPOLOGY_LAYERS[0];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* 4-Stage Pipeline Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-b border-slate-200 bg-slate-50/70">
        {TOPOLOGY_LAYERS.map((layer) => {
          const isSelected = layer.id === activeId;
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => setActiveId(layer.id)}
              className={`text-left p-4 transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                isSelected
                  ? 'bg-white border-b-2 border-b-blue-600 shadow-2xs'
                  : 'hover:bg-slate-100/80'
              }`}
            >
              <div className="text-xs font-semibold text-blue-600">
                {layer.code}
              </div>
              <div className="text-sm font-bold text-slate-900 leading-snug">
                {layer.name}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {layer.tagline}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Layer Detail Pane */}
      <div className="p-5 sm:p-6 space-y-4 bg-white">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-lg font-bold text-slate-900">
            {activeLayer.name}
          </h3>
          {activeLayer.relatedPost && (
            <Link
              href={activeLayer.relatedPost.href}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
            >
              Read Case Study: {activeLayer.relatedPost.title} &rarr;
            </Link>
          )}
        </div>

        <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
          {activeLayer.summary}
        </p>

        <ul className="space-y-2 text-sm text-slate-600">
          {activeLayer.engineeringDetails.map((detail) => (
            <li key={detail} className="flex gap-2.5">
              <span className="text-blue-600 font-bold select-none">&bull;</span>
              <span>{detail}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          {activeLayer.protocols.map((proto) => (
            <span
              key={proto}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
            >
              {proto}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
