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
- `/admin` adds inline editing, note management, and a Save button that overwrites `public-data.json` through the local Vite server.
- `public-data.json` is the canonical source for the public timeline and is bundled into production builds.
- Saving is intentionally local-only; commit the changed `public-data.json` and open a PR to publish it through GitHub → Vercel.

## Stack

- Vite, React, TypeScript
- Tailwind CSS v4
- Motion for React
- Lucide React
- Local shadcn-style UI primitives
