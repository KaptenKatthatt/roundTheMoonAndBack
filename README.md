# 🌕 Round the Moon and Back

An interactive 3D visualization of the **Artemis II mission** (April 1–11, 2026) — humanity's first crewed lunar flyby in over 50 years. Follow Orion's complete journey from launch to splashdown in real time.

> 🎙️ Inspired by [this episode](https://youtu.be/zRwK7lmbFR8?si=QqjrxgTu110Hrlw_) from the [Syntax](https://syntax.fm) podcast.
> 🤖 Built through **vibe coding** with [Claude](https://claude.ai) and [Gemini](https://gemini.google.com).

---

## 🚀 What is this?

A browser-based mission visualizer that lets you scrub through the entire Artemis II trajectory. The spacecraft's path is derived from **NASA's official post-flight ephemeris data** (OEM format, J2000 reference frame), and the Moon's position is fetched live from **JPL Horizons**. Everything renders in a real-time 3D scene directly in your browser.

---

## 🛸 Tech Stack

### Frontend

| Technology                           | Purpose                                            |
| ------------------------------------ | -------------------------------------------------- |
| **React 18**                         | UI framework and component model                   |
| **TypeScript**                       | Type safety across the entire codebase             |
| **Vite**                             | Lightning-fast dev server and bundler              |
| **Three.js**                         | Low-level 3D engine (WebGL)                        |
| **React Three Fiber**                | Declarative React bindings for Three.js            |
| **@react-three/drei**                | Ready-made helpers: orbit controls, stars, loaders |
| **@react-three/postprocessing**      | Post-processing effects (bloom, tone mapping)      |
| **Framer Motion / framer-motion-3d** | Smooth animations for UI and 3D camera             |
| **Zustand**                          | Lightweight global state for the timeline          |
| **CSS Modules**                      | Scoped component styles                            |

### Backend

| Technology           | Purpose                                    |
| -------------------- | ------------------------------------------ |
| **Hono**             | Ultra-fast web framework for the API proxy |
| **Node.js**          | Runtime environment                        |
| **tsx**              | TypeScript execution for development       |
| **JPL Horizons API** | Source of Moon ephemeris data              |
| **In-memory cache**  | Avoids redundant external API calls        |

### Shared / Infra

| Technology          | Purpose                                     |
| ------------------- | ------------------------------------------- |
| **pnpm workspaces** | Monorepo management                         |
| **TypeScript**      | Shared types between frontend and backend   |
| **Vercel**          | Deployment platform (frontend + serverless) |

---

## 🌍 Data Sources

- **NASA Ephemeris (OEM)** — Orion's state vectors (position + velocity) at 4-minute intervals in J2000 Earth-centered frame, covering the return phase (post-RTC3 to Entry Interface)
- **JPL Horizons REST API** — Moon position relative to Earth throughout the mission
- **Calculated waypoints** — Early mission phases (launch → TLI → outbound coast → lunar flyby) reconstructed from published mission parameters

---

## ☄️ Getting Started

```bash
# Install dependencies
pnpm install

# Start frontend + backend in parallel
pnpm dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

---

## 🪐 Project Structure

```
apps/
  frontend/   # React + Three.js visualizer
  backend/    # Hono API proxy + data pipeline
packages/
  shared/     # Shared TypeScript types
```

---

## 👨‍🚀 Credits

Built as a vibe coding experiment — the plan, architecture, and code were all co-created with **Claude** (Anthropic) and **Gemini** (Google). The original idea came from the Syntax podcast.

Mission data courtesy of **NASA** and **JPL**.
