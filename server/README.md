# Culinova Chatbot Server

Node.js + Express + OpenAI backend for the Culinova assistant.

## Setup

```bash
cd server
npm install
cp .env.example .env
```

Add your OpenAI API key to `.env`:

```env
OPENAI_API_KEY=sk-...
```

## Run

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build
npm start
```

Server runs at `http://localhost:3000`.

## API

### `GET /api/health`

Health check.

### `POST /api/chat`

Send conversation history and receive an AI reply.

**Request:**

```json
{
  "messages": [
    { "role": "assistant", "content": "Hello! ..." },
    { "role": "user", "content": "What services do you offer?" }
  ]
}
```

**Response:**

```json
{
  "message": {
    "id": "uuid",
    "role": "assistant",
    "content": "### Our Services\n...",
    "createdAt": "2026-07-05T..."
  }
}
```

## Prompt Engineering

Prompt logic lives in `src/prompts/`:

- `knowledge.ts` — grounded company facts (services, projects, contact, boundaries)
- `system.prompt.ts` — system instructions, tone, formatting, few-shot example

The system prompt enforces:

- Culinova-only scope and brand voice
- Markdown formatting aligned with the chat UI
- No fabricated prices, projects, or certifications
- Arabic/English language matching
- Consultation handoff when pricing or site-specific details are needed

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `OPENAI_API_KEY` | required | OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model name |
| `OPENAI_MAX_TOKENS` | `900` | Max reply tokens |
| `OPENAI_TEMPERATURE` | `0.4` | Response creativity |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed client origin |

## Client Integration

The React client calls `POST /api/chat` via `VITE_API_URL` (default `http://localhost:3000/api`).

Run both:

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```
