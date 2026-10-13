---
title: 'PCB Bird Runner: A Circuit-Board Snake Adventure'
date: '2026-10-09'
description: 'An interactive canvas arcade game: navigate an elongated avian debugger across the green solder mask, eat hardware bugs, and avoid live soldered IC chips.'
tags: ['Game Dev', 'Canvas', 'Interactive', 'Hardware', 'React']
---

Welcome to **PCB Bird Runner**, an interactive experiment blending classic snake mechanics with hardware debugging!

## Play Now

<PcbBirdGame />

---

## Technical Concept & Mechanics

Instead of a traditional garden snake, you pilot an elongated avian debugger across an active 4-layer FR4 circuit board.

### Rules of Engagement
1. **Green Solder Mask Substrate**: Safe walking terrain. Follow the copper traces and open mask areas.
2. **Soldered ICs & Components**: Instant short circuit! Avoid colliding with:
   - **STM32-H7 MCU**: 64-pin Quad Flat Package with perimeter solder legs.
   - **NE555 Timer & SPI Flash**: Dual Inline Packages (DIP) with metallic pins.
   - **Ceramic SMD Capacitors & Regulators**: High-voltage solder blocks.
   - **Gold Test Vias**: Exposed conductive pads.
3. **Hardware Bugs**: Glowing glitch bugs crawling across the board. Every bug consumed elongates the bird's neck and boosts clock frequency (game speed).

---

## Built with Modern Web Tech
* **HTML5 Canvas 2D**: Custom pixel rendering for PCB silkscreen, copper routing traces, and chip bevels.
* **Dynamic Avian Kinematics**: Segmented plumage rendering with directional beak, googly eyes, and feather crests.
* **Web Audio API**: 8-bit synthetic sound generation directly in code without requiring external audio asset downloads.
* **React Server Component Integration**: Directly embedded into Markdown through `next-mdx-remote/rsc`.
