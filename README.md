# CS Journey

A local-first personal engineering knowledge journey.

## Run locally

```bash
npm install
npm run dev
```

Open `/knowledge` for the read-only public view or `/admin` for the local editor. Admin controls are only enabled by the local Vite dev server; production builds are read-only.

## Product shape

- Both routes render the same timeline components.
- `/admin` adds inline editing, note management, and a Save button that overwrites `public-data.json` through the local Vite server.
- Entry descriptions support pasted images; Save writes image files to `public/uploads/` and stores their repository-relative paths in `public-data.json`.
- `public-data.json` is the canonical source for the public timeline and is bundled into production builds.
- Saving is intentionally local-only; commit the changed `public-data.json` and `public/uploads/` files, then open a PR to publish them through GitHub → Vercel.

## Stack

- Vite, React, TypeScript
- Tailwind CSS v4
- Motion for React
- Lucide React
- Local shadcn-style UI primitives
