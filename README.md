# Scribbly — Collaborative Whiteboard

![CI](https://github.com/TejasRamanujam/Scribbly-Collaborative-Whiteboard/actions/workflows/ci.yml/badge.svg)

**Live: https://scribbly-collab.vercel.app**

Real-time collaborative whiteboard. Every stroke is broadcast to everyone on the board, filed in a permanent event log, and replayable on a timeline.

## Features
- Multi-user freehand drawing with live cursors (Liveblocks realtime, polling fallback)
- Persistent stroke history in Postgres — nothing lost on refresh
- Timeline replay: scrub or play back the entire drawing history
- Pen, marker, eraser, shapes; per-user undo/redo; SVG/PNG export
- Touch drawing on mobile

## Stack
React + TypeScript (Vite) · FastAPI on Vercel functions · Neon Postgres · Liveblocks

## Run locally
```bash
cd frontend && npm install && npm run dev   # frontend on :5173
cd backend && pip install -r ../requirements.txt && uvicorn main:app --reload
```

## Architecture
`frontend/` Vite SPA → `/api/*` rewrites → `api/index.py` (FastAPI) → Neon. Realtime layer broadcasts events over Liveblocks; the durable event log reconciles by stroke id, so transports never double-apply.
