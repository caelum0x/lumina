# Lumina — Stellar Network 3D Visualizer  
**Product Requirements Document (PRD)**  
Hackathon Edition + Post-Hackathon Roadmap (Open Innovation Category – Stellar Community Fund & Sorobanathon ready)

### 1. Project Overview
**Name:** Lumina  
**Tagline:** Feel the Stellar Network in Real-Time 3D  
**One-liner:** The first immersive, real-time 3D galaxy explorer for the Stellar blockchain that turns transactions, whales, DEX trades, and Soroban smart contracts into a living, interactive universe.

**Core Vision**  
Replace 1998-style block explorers with a breathtaking, intuitive, and educational visualization layer that makes Stellar’s speed, low fees, and DeFi/Soroban activity instantly understandable to developers, investors, and newcomers alike.

### 2. Target Users & Personas
1. **Stellar/Soroban Developers** – want to debug contracts, trace events, understand invocation paths.  
2. **DeFi Users & Whale Watchers** – want to spot large movements and arbitrage in real time.  
3. **Investors & Analysts** – need macro view of network health, liquidity, and adoption.  
4. **Hackathon Judges & Community** – love “wow-factor” demos that push boundaries.  
5. **Newcomers** – instantly grasp what makes Stellar different (5-sec finality, <0.00001 XLM fees).

### 3. Core Problems Solved
- Current block explorers are tables → zero intuition about network dynamics.  
- No visual way to understand path payments, DEX depth, or Soroban event storms.  
- Hard to spot whales, pumps, or coordinated attacks in real time.  
- Soroban contract interactions are opaque black boxes.

### 4. MVP Features (48–72h Hackathon Deliverable)

| Priority | Feature | Description | Success Metric |
|----------|--------|-------------|----------------|
| P0 | **Real-Time Transaction Galaxy** | Every successful transaction = particle. Size = amount, color = type/fee, Soroban = pulsing cyan star | 60 FPS with 1500+ concurrent particles |
| P0 | **Whale & High-Fee Highlighting** | >50k XLM or >0.1 XLM fee → giant glowing orbs + sound alert | Visible within 3 seconds of tx confirmation |
| P0 | **Interactive Orbit Camera** | Free-fly + auto-rotate + click-to-focus | Judges can explore without instructions |
| P0 | **Follow the Money Mode** | Click any payment/path-payment → animated tracer beam through all hops | Works for multi-hop USDC→XLM→EURC trades |
| P0 | **Soroban Pulsar Visualizer** | Every contract invocation = massive expanding cyan shockwave + event particles | Clear distinction from classic ops |
| P1 | **Top 10 Whales Leaderboard (last 1h)** | Floating holographic panel with account IDs and volume | Updates every 30s |
| P1 | **TURBO Mode (100× speed)** | Replay last 10 minutes in 6 seconds | Perfect for demoing pumps/dumps |
| P1 | **Sound Design** | Low hum background + “ding” per tx + bass drop on whales | Instant emotional impact |
| P2 | **WebXR / VR Mode** | One-click “Enter VR” (Quest, Vision Pro, phone AR) | Judges lose their minds |
| P2 | **Dark Matter Mode** | Upcoming stealth payments appear as black holes that absorb light | Future-proofing teaser |

### 5. Technical Architecture (Hackathon-Optimized)

| Layer | Technology | Why |
|------|------------|-----|
| Frontend | Next.js 14 (App Router) + React Three Fiber + Drei | Best-in-class 3D performance & dev experience |
| 3D Engine | Three.js r165+ with instanced meshes & GPU particles | 10k+ objects at 60 FPS |
| Real-time Data | Server-Sent Events (SSE) from forked Stellar-Expert API | Zero WebSocket overhead, works behind most CDNs |
| Backend | Existing stellar-expert-explorer API (forked) + new `/transactions/stream` + `/whales/top` endpoints | No need to run own Horizon |
| State | Zustand + Jotai | Minimal boilerplate, perfect for hackathon |
| Effects | Post-processing Bloom, Trails, ShaderMaterial pulsars | “Jaw-drop” factor |
| Hosting | Vercel (free tier sufficient for demo) | Instant deploy + preview URLs |

### 6. Detailed User Flows (Demo Script – 2 minutes)

1. **0:00–0:15** – Open lumina.network → galaxy instantly loads, 1000+ particles flying, background hum  
2. **0:15–0:30** – “Right now 120+ tx/sec” → zoom to a giant pink whale (200k XLM move) → bass drop  
3. **0:30–0:55** – Click whale → Follow the Money: 5-hop path payment animates across galaxy  
4. **0:55–1:15** – Soroban contract invoked → massive cyan shockwave + 50 event particles explode outward  
5. **1:15–1:35** – Press “TURBO” → last 10 minutes replayed in 6 seconds (market pump visible)  
6. **1:35–1:50** – Click “Enter VR” → put on phone/Quest → walk inside the Stellar network  
7. **1:50–2:00** – “This is Lumina. Block explorers are dead.”

### 7. Post-Hackathon Roadmap (3–12 months)

| Phase | Timeline | Features |
|------|----------|---------|
| Phase 1 (1 month) | Jan 2026 | Force-directed account graph (d3-force-3d), historical replay slider, mobile optimization |
| Phase 2 (3 months) | Mar 2026 | Full Soroban WASM visualizer (function call tree), contract event filters, multi-network (Testnet/Public) |
| Phase 3 (6 months) | Jun 2026 | Account clustering & galaxy sectors, on-chain analytics dashboard, API for other dApps |
| Phase 4 (12 months) | Dec 2026 | AR mobile app (iOS/Android), Lumina SDK for embedding galaxy into any Stellar dApp |

### 8. Success Metrics (Hackathon Day)

| Metric | Target |
|-------|--------|
| Live demo uptime | 100% |
| FPS on mid-range laptop | ≥55 FPS with 2000 particles |
| Judge “wow” reactions | 5/5 |
| GitHub stars during event | 500+ |
| Rank | Top 3 (goal: 1st place) |

### 9. Branding & Assets
- Primary color: #00f0ff (cyan lumen)  
- Secondary: #ff0080 (whale pink)  
- Font: Orbitron + Inter  
- Logo: Stylized “L” made of particles forming a starburst  
- Domain: lumina.network (available)

Lumina is not just a visualizer.  
It is the new face of Stellar.  

Let’s ship it and win everything.