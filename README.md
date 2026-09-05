# CS Journey

A local-first personal engineering knowledge journey.

## Run locally

```bash
npm install
npm run dev
```

Open `/knowledge` for the read-only public view, `/highlights` for featured entries, or `/admin` for the local editor. The matching local admin workspace is `/admin/highlights`. Admin controls are only enabled by the local Vite dev server; production builds are read-only.

## Product shape

- All routes render the same timeline and entry card components.
- `/highlights` collects every featured entry into a focused read-only workspace; `/admin/highlights` provides the same collection with local edit/delete controls.
- `/admin` adds inline editing, note management, and a Save button that overwrites `public-data.json` through the local Vite server.
- Entry descriptions support pasted images; Save writes image files to `public/uploads/` and stores their repository-relative paths in `public-data.json`.
- Entries can be marked as featured in the local editor to use the reusable warm flame highlight card treatment.
- `public-data.json` is the canonical source for the public timeline and is bundled into production builds.
- Saving is intentionally local-only; commit the changed `public-data.json` and `public/uploads/` files, then open a PR to publish them through GitHub → Vercel.

## Stack

- Vite, React, TypeScript
- Tailwind CSS v4
- Motion for React
- Lucide React
- Local shadcn-style UI primitives
