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
- **Problem**: The standalone `.docx` resume combined 7+ years of progressive engineering roles at Buckman into a single bullet block, omitted industrial signaling protocols (`OPC UA`, `4–20mA current loops`), lacked visibility into modern AI-augmented engineering workflows (`Claude Code`, `Google Antigravity`, `Gemini`), and was not integrated into the Next.js portfolio.
- **Decision**:
  - Restructured the resume around senior cyber-physical (IIoT/Robotics) systems architecture, closed-loop sensor-to-actuator control, multi-protocol telemetry (`OPC UA`, `Modbus TCP/RTU`, `4–20mA`, `MQTT`), and first-class agentic AI engineering (`Claude Code`, `Antigravity`, `Gemini`, `CLAUDE.md` / `AGENTS.md` context guardrails).
  - Unbundled *Digital Innovation Engineer (2022–Present)* from *Associate Digital Innovation Engineer (2019–2022)* to highlight promotion and architectural ownership, while trimming low-signal introductory certificates.
  - Programmatically updated the OpenXML `.docx` document (`Alexander_Bernal_Resume_Styled.docx` and `public/Alexander_Bernal_Resume.docx`) to preserve native Word styling while keeping `RESUME.md` in version control.
  - Built a dedicated `/resume` route (`app/resume/page.tsx`) with print-to-PDF support and aligned the homepage competency matrix (`app/page.tsx`) with real-world industrial and agentic engineering skills.
- **Takeaway**: Maintaining a single source of truth across version-controlled Markdown, downloadable `.docx`, and static-exported Next.js routes ensures recruiters and hiring managers see a unified, high-signal narrative across ATS parsers and the live web portfolio.
