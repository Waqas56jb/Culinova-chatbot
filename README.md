# Culinova Chatbot

Professional kitchen and laundry engineering assistant for [culinova.sa](https://culinova.sa).

## Structure

- `client/` — React chat widget UI
- `server/` — Node.js API with OpenAI prompt engineering
- `admin/` — reserved

## Quick Start

### 1. Server

```bash
cd server
npm install
cp .env.example .env
# Add OPENAI_API_KEY to .env
npm run dev
```

### 2. Client

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

## Embed on your website

Paste this before `</body>` on any page:

```html
<script src="https://culinova-chatbot-client.vercel.app/widget.js" async></script>
```

- Optional: `data-position="left"` or `data-position="right"`
- Local preview: `http://localhost:5173/embed-demo.html`
- Direct chat URL: `https://culinova-chatbot-client.vercel.app/?embed=1`

## Stack

**Client:** React 19, TypeScript, Vite  
**Server:** Node.js, Express, OpenAI, Zod
