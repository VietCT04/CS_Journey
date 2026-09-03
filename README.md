# CS Journey

A local-first personal engineering knowledge journey.

## Run locally

```bash
npm install
npm run dev
```

Open `/knowledge` for the read-only public view or `/admin` for the local editor.

## Product shape

- Both routes render the same timeline components.
- `/admin` adds inline editing, note management, and a public-data export.
- Changes are stored in browser `localStorage` under `cs-journey-data-v1`.
- `public-data.json` is the checked-in seed/export shape for a future GitHub → Vercel publishing step.

## Stack

- Vite, React, TypeScript
- Tailwind CSS v4
- Motion for React
- Lucide React
- Local shadcn-style UI primitives
