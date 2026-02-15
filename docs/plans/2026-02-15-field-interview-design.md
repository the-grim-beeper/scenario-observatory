# Field Interview — Design Document

## Overview

Add a "Field Interview" feature that lets users have conversations with synthetic personas representing the five survey-grounded population segments, placed in any of the eight scenario contexts. Powered by Claude Opus 4.6 via a server-side proxy.

## Architecture

Single Hono server (`server/index.ts`) replaces `serve` for static file serving and adds one API endpoint:

- Serves Vite `dist/` with SPA fallback for client-side routing
- `POST /api/chat` — streaming Claude responses via SSE
- One Railway service, one `PORT`, one env var (`ANTHROPIC_API_KEY`)

## API Endpoint

**`POST /api/chat`**

Request:
```json
{
  "populationId": "moderately-insecure",
  "scenarioId": "drift-economy",
  "messages": [
    { "role": "user", "content": "What's your day-to-day like?" }
  ]
}
```

Response: `text/event-stream` — SSE stream of Claude text deltas.

Server-side logic:
1. Look up population and scenario from shared data module
2. Assemble system prompt (persona + scenario context + grounding stats)
3. Call `anthropic.messages.stream()` with Claude Opus 4.6
4. Pipe text deltas back as SSE

Guardrails: max 20 messages per conversation (client-enforced), `max_tokens: 1024` per response.

## System Prompt Construction

Three layers assembled server-side:

**Persona layer** (from Population data):
- Segment name, description, key vulnerability/risk
- Concrete survey statistics woven into identity

**World layer** (from Scenario data):
- Scenario name and description
- Youth reactions: career, work, mental health, politics
- Population profile text

**Behavioural rules:**
- First person, concrete daily experiences, natural speech
- Can reference survey numbers as lived experience
- Never breaks character
- 2-3 paragraph responses

Total prompt: ~800 tokens.

## Frontend — InterviewView

New route `/interview`, new nav tab "Interview" (MessageSquare icon).

**Layout:**
1. **Left sidebar** (~280px): Population selector (5 cards with name, cohort size, color) + scenario selector (8 pills, affinities shown first). Both required before chat activates.
2. **Chat area** (flex-1): Field notebook style — user messages right-aligned in surface bubbles, persona messages left-aligned with population-colored left border. Streaming text. Spectral font for persona name, Source Sans 3 for body.
3. **Context strip** (top of chat): Selected population + scenario pills, "New Interview" reset button.

**Interactions:**
- Changing population or scenario clears conversation
- Enter to send, Shift+Enter for newline
- Auto-scroll to latest message
- Empty state prompt when no selection made

## Data Sharing

Move `src/data/scenarios.ts` to `shared/scenarios.ts`. Both server and frontend import from it. Frontend `src/data/scenarios.ts` re-exports from `shared/` for backward compatibility. Vite path alias `@shared` points to the shared directory.

## File Structure

```
scenario-observatory/
├── shared/
│   └── scenarios.ts
├── server/
│   ├── index.ts
│   ├── prompt.ts
│   └── tsconfig.json
├── src/
│   ├── data/scenarios.ts  (re-exports from shared/)
│   ├── views/InterviewView.tsx
│   └── ...
├── package.json
└── ...
```

## Dependencies Added

- `hono` — HTTP server
- `@hono/node-server` — Node.js adapter
- `@anthropic-ai/sdk` — Claude API client
