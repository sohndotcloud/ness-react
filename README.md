# Ness

A PDF library and reading app with built-in habit tracking — read, organize, and build a daily practice around what you read.

> **Note:** This README was drafted from project context rather than a full repo audit. Sections marked _(inferred)_ describe conventions observed while building specific features — double-check them against the actual repo before treating them as ground truth, and feel free to edit freely.

## Features

- **PDF Viewer** — read documents in-app.
- **Habit Tracker** — track daily habits with streaks, a "tasks left today" summary, and a customizable calendar heatmap showing completion history per habit.
- **Auth** — cookie-based session with automatic access-token refresh.
- **Dark mode** — app-wide light/dark theme toggle.

## Tech Stack

- **React Router v7** — file-based routing (`clientAction`/`+types` conventions)
- **TypeScript**
- **Tailwind CSS** — class-based dark mode (`dark:` variants)
- **Vite** _(inferred from build tooling references)_
- **axios** — API client with request/response interceptors for token refresh
- **lucide-react** — icon set
- **pdfjs-dist** / **@embedpdf/react-pdf-viewer** — PDF thumbnailing and in-app viewing

## Getting Started

```bash
git clone <repo-url>
cd ness
npm install
```

Create a `.env` file with your API origin:

```
VITE_API_DOMAIN=https://your-api-domain.example.com
```

Then start the dev server:

```bash
npm run dev
```
