# Development Log
This is a living log of my progress making my personal website.


## [2026-05-30] - Implementation of Markdown Blog Pipeline
- **Problem**: Needed to render Markdown files from `content/` as HTML in the browser.
- **Decision**: Used `gray-matter` for parsing and `next-mdx-remote` for compilation.
- **Hurdle**: Encountered "Invalid hook call" due to trying to run a Client Component (`MDXRemote`) inside an async Server Component.
- **Resolution**: Created an `MDXWrapper` client component and implemented dynamic imports to skip SSR for interactive elements.
- **Takeaway**: Next.js App Router strictly enforces the boundary between Server and Client components. Hooks are strictly reserved for the client side.

## [2026-10-09] - RSC Migration, Static Export & Dynamic Routing
- **Problem**: Production builds (`next build`) failed under Turbopack/webpack due to ESM packaging issues with client-side dynamic imports of `next-mdx-remote`. Furthermore, all markdown content was inlined on the home page and static export was not yet configured for GitHub Pages.
- **Decision**:
  - Migrated to `next-mdx-remote/rsc`, rendering markdown natively in React Server Components without client wrappers or dynamic imports.
  - Enabled `output: 'export'` and `images: { unoptimized: true }` in `next.config.ts` for static hosting.
  - Implemented dynamic route `app/posts/[slug]/page.tsx` backed by `generateStaticParams()` to pre-render individual article HTML pages during build.
- **Takeaway**: With App Router, RSCs streamline markdown rendering at build time, eliminating client-side bundle weight while guaranteeing clean static HTML output suitable for static hosts like GitHub Pages.

## [2026-10-13] - Silicon Breakthrough & Lab Notebook UI/UX Overhaul
- **Problem**: Wanted a second flagship interactive embedded-themed game alongside PCB Bird Runner that demonstrates deterministic 60 FPS 2D physics, multi-stage hardware progression, and zero-asset procedural Web Audio synthesis, while elevating the overall portfolio UI/UX into a cohesive Embedded & Web Engineering Lab Notebook without running two simultaneous 60 FPS canvas loops on the landing page.
- **Decision**:
  - Built `SiliconBreakthroughGame.tsx`, a hardware-themed *Breakout* / *Arkanoid* game where an oscilloscope trigger paddle reflects signal pulses to desolder SMD passives, SOIC transceivers, and 3-HP security fuses across 3 stages.
  - Separated high-frequency 60 FPS kinematics (`useRef` state loop inside `requestAnimationFrame`) from low-frequency React UI telemetry (`useState`)—mirroring the embedded firmware pattern of separating fast timer ISRs from background main-loop display updates.
  - Created `HardwareWorkbench.tsx` to provide a tabbed module switcher between **Silicon Breakthrough** and **PCB Bird Runner**, mounting only the active canvas so keyboard listeners (`Space`, arrows) and `requestAnimationFrame` loops remain isolated.
  - Overhauled `app/layout.tsx`, `app/page.tsx`, `app/posts/[slug]/page.tsx`, and `app/globals.css` with a dark PCB/blueprint grid aesthetic, sticky telemetry navbar, Core Engineering Domain Matrix (Firmware ↔ Hardware ↔ Web), and structured Lab Notebook dispatch cards.
  - Authored `content/serverless-grocery-sync-architecture.md` to document the multi-tenant Firebase Firestore synchronization, collision-resistant pairing codes, and subcollection isolation built in `groceryList`.
- **Takeaway**: Treating the HTML5 Canvas loop like a deterministic hardware ISR prevents React re-render overhead, and isolating active simulations behind a workbench multiplexer keeps client CPU/GPU utilization minimal while showcasing full-stack UI/UX polish.

## [2026-10-13] - Recruiter-Optimized Resume & Portfolio Integration
- **Problem**: The standalone `.docx` resume combined 7+ years of progressive engineering roles at Buckman into a single bullet block, omitted industrial signaling protocols (`OPC UA`, `analog current loops`, `discrete Digital I/O`), lacked visibility into modern AI-augmented engineering workflows (`Claude Code`, `Google Antigravity`, `Gemini`), and was not integrated into the Next.js portfolio.
- **Decision**:
  - Restructured the resume around senior cyber-physical (IIoT/Robotics) systems architecture, closed-loop sensor-to-actuator control, multi-protocol telemetry (`OPC UA`, `Modbus TCP/RTU`, `analog current loops`, `discrete Digital I/O`, `MQTT`), and first-class agentic AI engineering (`Claude Code`, `Antigravity`, `Gemini`, `CLAUDE.md` / `AGENTS.md` context guardrails).
  - Unbundled *Digital Innovation Engineer (2022–Present)* from *Associate Digital Innovation Engineer (2019–2022)* to highlight promotion and architectural ownership, while trimming low-signal introductory certificates.
  - Programmatically updated the OpenXML `.docx` document (`Alexander_Bernal_Resume_Styled.docx` and `public/Alexander_Bernal_Resume.docx`) to preserve native Word styling while keeping `RESUME.md` in version control.
  - Built a dedicated `/resume` route (`app/resume/page.tsx`) with print-to-PDF support and aligned the homepage competency matrix (`app/page.tsx`) with real-world industrial and agentic engineering skills.
- **Takeaway**: Maintaining a single source of truth across version-controlled Markdown, downloadable `.docx`, and static-exported Next.js routes ensures recruiters and hiring managers see a unified, high-signal narrative across ATS parsers and the live web portfolio.

## [2026-10-15] - Interactive 60Hz PID Control Lab, Stack Topology Explorer & Portfolio Polish
- **Problem**: Wanted to demonstrate real closed-loop control theory (rather than a mock hardware simulacrum) with interactive user perturbations, tunable $K_p, K_i, K_d$ parameters, and an Autotune/Reset capability, while aligning the Lab Notebook, Resume print stylesheet, and homepage UX with senior IIoT and Embedded Systems roles.
- **Decision**:
  - Engineered `PidControlLab.tsx`, a 60 FPS discrete-time closed-loop PID controller coupled to a 2nd-order physical fluid dosing reactor and multi-channel Digital Storage Oscilloscope (DSO). Implemented conditional integral anti-windup clamping, derivative-on-measurement EMA filtering, direct canvas setpoint dragging, physical load surge/spike injection, regime presets (*Underdamped Ringing*, *P-Only Load Droop*), and one-click *Autotune* & *Reset Stable* controls.
  - Integrated `PidControlLab` as Module 01 in `HardwareWorkbench.tsx` and authored `content/closed-loop-pid-control-lab.md` and `content/self-healing-fieldbus-state-machines.md`, while upgrading `content/hello-world.md` into a full System Manifesto.
  - Built `SystemTopologyExplorer.tsx` (interactive 4-layer Sensor $\rightarrow$ Fieldbus $\rightarrow$ Linux Edge $\rightarrow$ Cloud inspector), `LabNotebookList.tsx` (client-side tag filtering + reading time badges), and `CopyCodeBlock.tsx` (one-click code copy in MDX).
  - Hardened print-to-PDF contrast utilities across `app/layout.tsx` and `app/resume/page.tsx` and added quantifiable Hero Telemetry Metrics (`20+ Countries`, `~50% Footprint`, `0 Disruption`, `12+ Years`).
- **Takeaway**: Pairing genuine mathematical simulations (discrete-time PID + second-order physics) with production post-mortems gives technical interviewers immediate, interactive proof of both embedded control fundamentals and modern React/TypeScript execution.

