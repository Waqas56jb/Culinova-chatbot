# Culinova Client

React frontend for the Culinova chatbot.

## Stack

- React 19
- TypeScript
- Vite 8

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

The dev server runs at `http://localhost:5173`.

## Scripts

- `npm run dev` — start development server
- `npm run build` — type-check and build for production
- `npm run preview` — preview production build
- `npm run lint` — run oxlint

## Project structure

```text
src/
  components/   # shared UI components
  pages/        # route-level pages
  services/     # API helpers
  types/        # shared TypeScript types
  config/       # environment config
```

## Environment

| Variable       | Description              | Default                      |
| -------------- | ------------------------ | ---------------------------- |
| `VITE_API_URL` | Backend API base URL     | `http://localhost:3000/api`  |

Copy `.env.example` to `.env` and adjust values as needed.
