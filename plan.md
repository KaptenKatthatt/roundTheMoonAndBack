# Plan: roundTheMoonAndBack — Artemis II 3D Mission Visualizer

## TL;DR

Interaktiv 3D-visualisering av Artemis II-missionen (1–11 april 2026) med React Three Fiber. Användaren spelar upp hela missionen med tidslinjekontroller. NASAs officiella ephemeris-data (OEM-format, J2000-ramverk) ger trajektorian. JPL Horizons ger Månens position. Hono-proxy cachar API-anrop. Deploy till Vercel som monorepo.

---

## Datakällor

| Källa                       | Vad                                                      | Format                              | URL                                           |
| --------------------------- | -------------------------------------------------------- | ----------------------------------- | --------------------------------------------- |
| **NASA Ephemeris (primär)** | Orions state vectors (pos + vel), 4-min intervall, J2000 | CCSDS OEM (.txt i ZIP)              | `nasa.gov/.../2026-04-10-post-rtc3-to-ei.zip` |
| **NASA SVS #5610**          | Nominal (reference) trajectory — pre-flight bana         | Bara video, ingen rådatanedladdning | `svs.gsfc.nasa.gov/5610`                      |
| **NASA SVS #5632**          | Flight-derived trajectory visualization                  | Bara video, länk till ephemeris     | `svs.gsfc.nasa.gov/5632`                      |
| **JPL Horizons**            | Månens position relativt Jorden                          | Vectors via REST API                | `ssd.jpl.nasa.gov/api/horizons.api`           |

**Strategi:** NASA-ephemeris-filen (OEM) täcker **post-RTC3 till Entry Interface** (returfasen). Tidiga faser (launch → TLI → outbound coast → lunar flyby) kompletteras med beräknade waypoints baserade på publicerade missionsparametrar. All data transformeras till en enhetlig JSON-tidsserie.

---

## Fas 1: Projektstruktur & Setup

### 1.1 Scaffolda monorepo (pnpm workspace)

- `apps/frontend` — Vite + React + TypeScript
- `apps/backend` — Hono + TypeScript
- `packages/shared` — Gemensamma typer (trajektori, API-kontrakt)
- Root: `pnpm-workspace.yaml`, `package.json`, `.gitignore`, `tsconfig.base.json`

### 1.2 Frontend-bas

- Installera: `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `three`, `framer-motion`
- CSS Modules (inbyggt i Vite)
- Grundläggande `<Canvas>` med `<Suspense>` och loading-state

### 1.3 Backend-bas

- Hono-app med CORS-middleware
- Endpoints:
  - `GET /api/trajectory` → Parsad Artemis II ephemeris + beräknade waypoints
  - `GET /api/moon?start=&stop=&step=` → Proxy till JPL Horizons
- In-memory cache (24h för Horizons, permanent för ephemeris)

**✓ Verifikation:** `pnpm dev` startar frontend + backend. Canvas renderas. API:er svarar.

---

## Fas 2: Data Pipeline

### 2.1 NASA Ephemeris — hämta, parsa, konvertera

- Ladda ner OEM-ZIP från NASA tracking page
- Parsa state vectors (J2000 Earth-centered): `timestamp, [x,y,z] km, [vx,vy,vz] km/s`
- Konvertera till JSON: `{ t: ISO8601, p: [x,y,z], v: [vx,vy,vz] }`
- Spara som `apps/backend/data/trajectory.json`

### 2.2 Komplettera tidiga faser med beräknade waypoints

NASA-filen täcker bara returfasen. Vi bygger ut med waypoints för:

| Fas               | Tid (UTC)    | Parametrar                                              |
| ----------------- | ------------ | ------------------------------------------------------- |
| Launch → LEO      | Apr 1 22:35  | 192 km altitude, inkl. 28.5°                            |
| High Earth Orbit  | Apr 1–2      | Elliptisk: perigee 192 km, apogee ~71 000 km            |
| TLI-burn          | Apr 3        | Translunar injection                                    |
| Outbound coast    | Apr 3–6      | Interpolerad kurva mot Månen                            |
| Lunar flyby       | Apr 6 ~23:00 | Pericynthion 6 545 km ovanför ytan, farthest 406 771 km |
| Return coast → EI | Apr 7–11     | **Från NASA ephemeris (OEM)**                           |

### 2.3 JPL Horizons — Månens position

- `COMMAND='301'`, `CENTER='500@399'`, `EPHEM_TYPE='VECTORS'`
- Parsa `$$SOE`/`$$EOE`-block → `{ t, p: [x,y,z] }[]`
- Step: 1h, cache 24h

### 2.4 Interpolering i frontend

- Backend levererar tidsstämplade punkter
- Frontend bygger `CatmullRomCurve3` (Three.js) från punkterna
- Hermite-interpolering möjlig tack vare att vi har velocity-data
- Smooth animation mellan API-datapunkter

**✓ Verifikation:** `/api/trajectory` returnerar 100+ punkter som täcker hela missionen. `/api/moon` returnerar ~240 positioner.

---

## Fas 3: 3D-scen — Jord, Måne & Rymd

### 3.1 Jorden

- **Texturer** (Solar System Scope, CC BY 4.0):
  - Day map (8K) + normal map + specular map
  - Cloud map (separat sfär, radius 1.003, roterande)
- `MeshStandardMaterial` med daymap, normalMap, roughnessMap
- Atmosfär-glow via `@react-three/postprocessing` Bloom
- **Skala:** Jordradie = 1 enhet (6 371 km → 1). All data skalas `÷ 6371`

### 3.2 Månen

- Textur: Solar System Scope 8K + optional bump map
- Radie: `1737 / 6371 ≈ 0.2727` enheter
- Position: Från `/api/moon`, interpolerad till aktuell tidpunkt
- Synkron rotation (alltid samma sida mot Jorden)

### 3.3 Stjärnfält & Belysning

- `<Stars>` (drei) som bakgrund
- `<directionalLight>` — solriktning april 2026
- Svag `<ambientLight>` för att undvika helsvart nattsida

**✓ Verifikation:** Jorden roterar med moln. Månen korrekt placerad (~60 enheter bort). Stjärnfält i bakgrund.

---

## Fas 4: Trajektori & Farkost

### 4.1 Banlinje

- Trajektori → `Vector3[]` skalat ÷ 6371
- Rendera med `<Line>` (drei) med gradient-färg, eller `<TubeGeometry>` längs kurva
- Visuell markering av missionsfaser (olika färger)

### 4.2 Orion-farkost

- **Primärt:** NASA 3D Resources `.glb`-modell (public domain), ladda med `useGLTF`
- **Fallback:** Geometrisk representation (kon + cylinder + solpaneler)
- Storlek: Visuellt överdimensionerad (~0.5 enheter) — verklig skala vore osynlig
- Position: Interpolera längs `CatmullRomCurve3` vid aktuell tid
- Orientering: `lookAt()` längs banans tangent

### 4.3 Tidslinjelogik (state)

```
{ currentTime: Date, isPlaying: boolean, playbackSpeed: number }
```

- `useFrame` driver `currentTime` framåt med `playbackSpeed × delta`
- Interpolera farkost + Måne + datavärden till `currentTime`
- Hastighet: derivata av position (Δpos / Δt mellan närliggande datapunkter)

**✓ Verifikation:** Farkosten rör sig längs banan. Play/scrub fungerar. Banan renderas Jord → Måne → Jord.

---

## Fas 5: Kameraanimation — Sverige-zoom

### 5.1 Startvy

- Kamera vid `latLonToVector3(62°N, 15°E, radius=1.5)` — satellitkänsla över Sverige
- Tittar mot `[0, 0, 0]` (jordens centrum)

### 5.2 Zoom-ut

- Animera kameraposition: nära Jorden → överblicksvy (Jord + Måne + bana synliga)
- Duration: ~4–5 sekunder, easing `easeInOutCubic`
- Implementera med `useFrame` + progress-ref (0→1) som lerpar position

### 5.3 Fri navigering

- Efter zoom-ut: aktivera `OrbitControls`
- Användaren kan rotera, zooma, panorera fritt

**✓ Verifikation:** Appen startar med satellitvy över Sverige → zoomar ut mjukt → fri rotation.

---

## Fas 6: UI & Meny

### 6.1 Tidslinjekontroller

- **Komponent:** `TimelineControls` (CSS Modules + Framer Motion)
- Play/Pause, tidslinje-slider, hastighetsväljare (1×/10×/100×/1000×)
- Visar missionstid: `DD:HH:MM:SS` sedan launch

### 6.2 Datapanel

- **Komponent:** `MissionData` (CSS Modules + Framer Motion)
- Hastighet (km/s, km/h)
- Avstånd från Jorden / till Månen (km)
- Missionsfas (Launch / TLI / Outbound / Flyby / Return / Re-entry)
- Färdtid + tid kvar till splashdown
- Animerade siffror

### 6.3 Polish

- Loading screen med progress bar (texturer tar tid)
- Keyboard: `Space` = play/pause, `←/→` = scrub
- Responsiv: paneler kollapsar på mobil

**✓ Verifikation:** Data uppdateras korrekt vid scrubbing. Mjuka animationer. Play/pause fungerar.

---

## Fas 7: Deploy & Optimering

### 7.1 Vercel

- Två Vercel-projekt, samma repo:
  - Frontend: root = `apps/frontend`
  - Backend: root = `apps/backend`
- Env: `VITE_API_URL` pekar på backend

### 7.2 Prestanda

- Texture LOD: 2K-texturer först → 8K asynkront
- `useMemo` för tunga beräkningar
- Lazy-load 3D-modell
- Mål: Lighthouse Performance > 80

---

## Filstruktur

```
roundTheMoonAndBack/
├── apps/
│   ├── frontend/
│   │   ├── public/
│   │   │   └── textures/          # Jord, Måne, moln (2K + 8K)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Scene.tsx
│   │   │   │   ├── Earth.tsx
│   │   │   │   ├── Moon.tsx
│   │   │   │   ├── Spacecraft.tsx
│   │   │   │   ├── Trajectory.tsx
│   │   │   │   ├── CameraAnimation.tsx
│   │   │   │   └── ui/
│   │   │   │       ├── TimelineControls.tsx
│   │   │   │       ├── TimelineControls.module.css
│   │   │   │       ├── MissionData.tsx
│   │   │   │       └── MissionData.module.css
│   │   │   ├── hooks/
│   │   │   │   ├── useTrajectory.ts
│   │   │   │   ├── useMoonPosition.ts
│   │   │   │   └── useTimeline.ts
│   │   │   ├── utils/
│   │   │   │   └── coordinates.ts
│   │   │   ├── App.tsx
│   │   │   ├── App.module.css
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── backend/
│       ├── data/
│       │   └── trajectory.json    # Parsad ephemeris + waypoints
│       ├── src/
│       │   ├── index.ts
│       │   ├── routes/
│       │   │   ├── moon.ts
│       │   │   └── trajectory.ts
│       │   └── lib/
│       │       ├── horizons-parser.ts
│       │       └── cache.ts
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   └── shared/
│       ├── src/
│       │   └── types.ts
│       ├── tsconfig.json
│       └── package.json
├── docs/
│   └── PROMPT-md
├── plan.md
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
└── .gitignore
```

---

## Avgränsningar

| Inkluderat                               | Exkluderat                                 |
| ---------------------------------------- | ------------------------------------------ |
| Jord med texturer + moln + atmosfär      | Solens 3D-modell (bara ljuskälla)          |
| Måne med textur                          | Andra planeter                             |
| Orion-farkost (3D-modell eller fallback) | Detaljerad LEO/parking orbit-visualisering |
| Komplett bana (waypoints + ephemeris)    | Ljud/musik                                 |
| Tidslinjekontroller med scrub            | Multi-mission-stöd                         |
| Datapanel (hastighet, avstånd, fas)      |                                            |
| Sverige-start med zoom-ut                |                                            |
| Vercel-deploy                            |                                            |

---

## End-to-end Verifikation

1. `pnpm dev` startar frontend + backend utan errors
2. `curl localhost:3001/api/trajectory` → 100+ tidsstämplade punkter
3. `curl localhost:3001/api/moon?start=2026-04-01&stop=2026-04-11&step=1h` → 240 positioner
4. Appen startar med satellitvy över Sverige
5. Kameran zoomar ut mjukt till överblicksvy (~4s)
6. Jorden roterar med moln, Månen på rätt avstånd
7. Trajektori-linje renderas Jord → Måne → Jord
8. Play animerar farkosten längs banan
9. Slider scrubbar korrekt genom missionen
10. Datapanelen visar korrekt hastighet, avstånd, missionsfas
11. `pnpm build` bygger utan errors
12. Vercel preview fungerar

## Uppdateringar & Förfiningar (2026-04-19)

### 1. Backend-data: Persistent Caching

- Istället för enbart in-memory cache, lagras alla API-svar (JPL Horizons, Ephemeris) som statiska JSON-filer i `apps/backend/data/`.
- Backend-proxyn läser i första hand från disk för att säkerställa 0ms latens vid "cold starts" på Vercel, då data inte ändras för denna historiska mission.

### 2. Kamera & Navigation (Fas 5 - Förtydligande)

- Använd sfäriska koordinater för kamerapositionen.
- Vid zoom-ut: Animera både `camera.position` och `camera.quaternion` (för att bibehålla korrekt upp-vektor och rotation mot rymden) under zoom-sekvensen för att undvika "kollision" med jordytan.
- Använd `framer-motion-3d` för att kontrollera kamerans transformationer under zoom-sekvensen för optimal easing.

### 3. Atmosfärisk Rendering (Fas 3 - Förtydligande)

- Utöver Bloom-effekt, implementera en dedikerad "Atmosphere Layer" (en extra sfär med något större radie, `1.01`) med `THREE.AdditiveBlending` och en shader-baserad gradient för att simulera atmosfäriskt skimmer/glow.

### 4. Tidslinjehantering (Fas 4 - Förtydligande)

- Internt i både backend och frontend ska `currentTime` hanteras som en `number` (Unix-timestamp i millisekunder) istället för `Date`-objekt.
- Detta förenklar `CatmullRomCurve3`-interpolering och alla tidsbaserade beräkningar i `useFrame`.

### 5. Framer Motion Integration

- Implementera `framer-motion-3d` för att animera farkostens position och rotation. Detta ger mer naturliga "in/out"-rörelser för farkosten när den följer trajektorian, utan att behöva skriva komplex manuell interpolering för animationerna.
