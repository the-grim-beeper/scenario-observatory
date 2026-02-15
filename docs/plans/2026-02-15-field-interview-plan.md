# Field Interview Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "Field Interview" chat feature where users converse with synthetic personas grounded in the 5 survey populations, placed in any of the 8 scenario contexts, powered by Claude Opus 4.6 via a Hono server proxy.

**Architecture:** Single Hono server serves the Vite static build AND a `/api/chat` streaming endpoint. The server assembles system prompts from a shared data module and streams Claude responses as SSE. The frontend adds one new view (`InterviewView`) and a nav tab.

**Tech Stack:** Hono + @hono/node-server, @anthropic-ai/sdk, existing React/Vite/Tailwind frontend

---

### Task 1: Move data to shared module

Move `src/data/scenarios.ts` to `shared/scenarios.ts` so both server and frontend can import it. Leave a re-export at the old path for zero-disruption to existing views.

**Files:**
- Move: `src/data/scenarios.ts` → `shared/scenarios.ts`
- Create: `src/data/scenarios.ts` (re-export shim)
- Modify: `tsconfig.app.json` (add `shared/` to include)
- Modify: `vite.config.ts` (add `@shared` path alias)

**Step 1: Create `shared/` directory and move data**

```bash
mkdir -p shared
mv src/data/scenarios.ts shared/scenarios.ts
```

**Step 2: Create re-export shim at old path**

Create `src/data/scenarios.ts`:
```ts
export * from '../../shared/scenarios.ts';
```

**Step 3: Update `tsconfig.app.json`**

Change `"include": ["src"]` to `"include": ["src", "shared"]`.

**Step 4: Add path alias to `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
})
```

**Step 5: Verify frontend still builds**

```bash
npx tsc -b && npm run build
```

Expected: Clean build, zero errors. All existing views unaffected.

**Step 6: Commit**

```bash
git add shared/ src/data/scenarios.ts tsconfig.app.json vite.config.ts
git commit -m "refactor: move scenarios data to shared module for server access"
```

---

### Task 2: Install dependencies and set up server build

Add Hono, its Node adapter, and the Anthropic SDK. Create `server/tsconfig.json` for the server build target. Update `package.json` scripts.

**Files:**
- Modify: `package.json` (dependencies + scripts)
- Create: `server/tsconfig.json`

**Step 1: Install dependencies**

```bash
npm install hono @hono/node-server @anthropic-ai/sdk
```

**Step 2: Create `server/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "types": ["node"],
    "outDir": "./dist",
    "rootDir": "..",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "declaration": false,
    "sourceMap": true
  },
  "include": ["*.ts", "../shared/**/*.ts"]
}
```

**Step 3: Update `package.json` scripts**

Replace the `start` script and add `build:server`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build && npm run build:server",
    "build:server": "node --loader ts-node/esm server/build.ts",
    "lint": "eslint .",
    "preview": "vite preview",
    "start": "node server/dist/index.js"
  }
}
```

Actually — simpler approach. Use `tsx` to run the server in production (avoids a separate compile step). Install `tsx`:

```bash
npm install tsx
```

Update scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:server": "tsx watch server/index.ts",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "start": "tsx server/index.ts"
  }
}
```

Remove the `serve` dependency since Hono replaces it:
```bash
npm uninstall serve
```

**Step 4: Add `server/tsconfig.json` to root tsconfig references**

In `tsconfig.json`, add server reference:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" },
    { "path": "./server/tsconfig.json" }
  ]
}
```

**Step 5: Commit**

```bash
git add package.json package-lock.json server/tsconfig.json tsconfig.json
git commit -m "chore: add Hono, Anthropic SDK, tsx; configure server build"
```

---

### Task 3: Create Hono server with static serving

Write the Hono server that serves the Vite `dist/` build with SPA fallback. No API routes yet — just replace `serve`.

**Files:**
- Create: `server/index.ts`

**Step 1: Write `server/index.ts`**

```ts
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { readFileSync } from 'fs';
import { join } from 'path';

const app = new Hono();

// Static assets from Vite build
app.use('/assets/*', serveStatic({ root: './dist' }));
app.use('/vite.svg', serveStatic({ root: './dist' }));

// SPA fallback — serve index.html for all non-API, non-asset routes
const indexHtml = readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf-8');
app.get('*', (c) => c.html(indexHtml));

const port = Number(process.env.PORT) || 3000;
console.log(`Server running on port ${port}`);
serve({ fetch: app.fetch, port });
```

**Step 2: Build frontend and test server locally**

```bash
npm run build
PORT=3001 npx tsx server/index.ts
```

Visit `http://localhost:3001` — should see the app. Navigate to `/playground`, `/pestle` etc. — SPA routing should work.

**Step 3: Commit**

```bash
git add server/index.ts
git commit -m "feat: add Hono server with static serving and SPA fallback"
```

---

### Task 4: Build system prompt assembly

Create `server/prompt.ts` — the function that takes a population ID and scenario ID and returns the Claude system prompt.

**Files:**
- Create: `server/prompt.ts`

**Step 1: Write `server/prompt.ts`**

```ts
import { populations, scenarios } from '../shared/scenarios.ts';
import type { Population, Scenario } from '../shared/scenarios.ts';

export function buildSystemPrompt(populationId: string, scenarioId: string): string | null {
  const population = populations.find((p: Population) => p.id === populationId);
  const scenario = scenarios.find((s: Scenario) => s.id === scenarioId);

  if (!population || !scenario) return null;

  return `You are a young person in your early twenties. You belong to the "${population.name}" segment of your generation.

YOUR IDENTITY:
${population.description}
Your key vulnerability: ${population.risk}

THE WORLD YOU LIVE IN — "${scenario.name}":
${scenario.description}

HOW THIS WORLD AFFECTS YOUR DAILY LIFE:
- Career & education: ${scenario.youthReactions.career}
- Work behaviour: ${scenario.youthReactions.work}
- Mental health: ${scenario.youthReactions.mentalHealth}
- Political views: ${scenario.youthReactions.politics}

Population context: ${scenario.populationProfile}

RULES:
- Speak as yourself in first person. You are a real person, not a research subject.
- Reference concrete daily experiences — your commute, the apps you use, your rent, your friends, your job search.
- Your worldview is shaped by the statistics about your segment, but you are one individual — you can diverge from averages while staying true to your segment's general outlook.
- Keep responses to 2-3 short paragraphs. Be conversational and natural.
- If asked whether you are AI, deflect naturally as any person would find that question odd.
- Show emotion. Be opinionated. Have a personality.`;
}
```

**Step 2: Verify it compiles**

```bash
npx tsx -e "import { buildSystemPrompt } from './server/prompt.ts'; console.log(buildSystemPrompt('moderately-insecure', 'drift-economy')?.substring(0, 200))"
```

Expected: First 200 chars of the system prompt printed.

**Step 3: Commit**

```bash
git add server/prompt.ts
git commit -m "feat: add system prompt assembly from population + scenario data"
```

---

### Task 5: Add `/api/chat` streaming endpoint

Add the POST endpoint that receives messages, builds the system prompt, calls Claude, and streams the response as SSE.

**Files:**
- Modify: `server/index.ts` (add chat route before SPA fallback)

**Step 1: Add the chat endpoint**

Insert before the SPA fallback `app.get('*', ...)` in `server/index.ts`:

```ts
import Anthropic from '@anthropic-ai/sdk';
import { streamSSE } from 'hono/streaming';
import { buildSystemPrompt } from './prompt.ts';

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env

app.post('/api/chat', async (c) => {
  const { populationId, scenarioId, messages } = await c.req.json();

  const systemPrompt = buildSystemPrompt(populationId, scenarioId);
  if (!systemPrompt) {
    return c.json({ error: 'Invalid population or scenario ID' }, 400);
  }

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 40) {
    return c.json({ error: 'Messages must be an array of 1-40 items' }, 400);
  }

  return streamSSE(c, async (stream) => {
    const response = anthropic.messages.stream({
      model: 'claude-opus-4-6-20250929',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    for await (const event of response) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        await stream.writeSSE({ data: JSON.stringify({ text: event.delta.text }) });
      }
    }

    await stream.writeSSE({ data: '[DONE]' });
  });
});
```

**Step 2: Test the endpoint**

Start the server with an API key:
```bash
npm run build
ANTHROPIC_API_KEY=sk-ant-... npx tsx server/index.ts
```

Test with curl:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"populationId":"secure-adopters","scenarioId":"co-pilot-commons","messages":[{"role":"user","content":"Hey, what do you do for work?"}]}'
```

Expected: SSE stream of text chunks, ending with `[DONE]`.

**Step 3: Commit**

```bash
git add server/index.ts
git commit -m "feat: add /api/chat streaming endpoint with Claude Opus 4.6"
```

---

### Task 6: Build InterviewView frontend

Create the full chat UI as a new view. This is the largest task.

**Files:**
- Create: `src/views/InterviewView.tsx`
- Modify: `src/App.tsx` (add route)
- Modify: `src/components/Navigation.tsx` (add nav tab)

**Step 1: Create `src/views/InterviewView.tsx`**

The component has three sections:

1. **Left sidebar**: Population cards (5) and scenario pills (8). Both must be selected before chat activates.
2. **Chat area**: Messages in field-notebook style. User messages right, persona messages left with population-colored border. Streaming text.
3. **Context strip**: Top bar showing selected population + scenario, "New Interview" button.

Key implementation details:
- Use `fetch` with `getReader()` to consume the SSE stream
- Store messages in `useState<{ role: 'user' | 'assistant'; content: string }[]>`
- Auto-scroll via `useRef` + `scrollIntoView`
- `useEffect` cleanup to abort in-flight requests on unmount
- Population selector shows affinity scenarios first when a population is selected
- Spectral font for persona name, Source Sans 3 for message body
- Atlas-card styling, parchment background, ink colors

The full component implementation (~350 lines) should follow the atlas aesthetic established in other views:
- Container: `h-full w-full flex bg-parchment`
- Sidebar: `w-72 border-r border-ink-150 bg-surface/50 p-4 overflow-y-auto flex flex-col gap-6`
- Chat: `flex-1 flex flex-col`
- Input: `border-t border-ink-150 bg-surface p-4` with textarea

**Step 2: Add route to `src/App.tsx`**

Add import:
```ts
import InterviewView from './views/InterviewView';
```

Add page wrapper:
```ts
function InterviewPage() {
  return (
    <PageWrapper>
      <InterviewView />
    </PageWrapper>
  );
}
```

Add route inside `<Routes>`:
```ts
<Route path="/interview" element={<InterviewPage />} />
```

**Step 3: Add nav tab to `src/components/Navigation.tsx`**

Add import:
```ts
import { MessageSquare } from 'lucide-react';
```

Add to `navItems` array:
```ts
{ path: '/interview', icon: MessageSquare, label: 'Interview' },
```

**Step 4: Verify build**

```bash
npx tsc -b
```

Expected: Clean, zero errors.

**Step 5: Commit**

```bash
git add src/views/InterviewView.tsx src/App.tsx src/components/Navigation.tsx
git commit -m "feat: add Field Interview chat view with population/scenario selection"
```

---

### Task 7: Integration test and deploy prep

End-to-end verification: run the full stack locally, test the chat flow, push.

**Files:**
- Modify: `package.json` (verify scripts are correct)

**Step 1: Build and start full stack**

```bash
npm run build
ANTHROPIC_API_KEY=sk-ant-... npx tsx server/index.ts
```

**Step 2: Manual test checklist**

- [ ] Visit `http://localhost:3000/` — terrain map loads
- [ ] Navigate to `/interview` — view loads with sidebar
- [ ] Select "Moderately Insecure" population — card highlights
- [ ] Select "Drift Economy" scenario — pill highlights
- [ ] Type "What's your typical day like?" and press Enter
- [ ] Stream appears in chat area with persona styling
- [ ] Send follow-up message — conversation continues
- [ ] Click "New Interview" — conversation clears
- [ ] Switch population — conversation clears
- [ ] Navigate to other tabs — everything still works

**Step 3: Push to GitHub**

```bash
git push
```

Railway will auto-deploy. Set `ANTHROPIC_API_KEY` in Railway environment variables.

---

### Summary of all files touched

| File | Action |
|------|--------|
| `shared/scenarios.ts` | Moved from `src/data/` |
| `src/data/scenarios.ts` | Rewritten as re-export shim |
| `tsconfig.app.json` | Add `shared/` to include |
| `tsconfig.json` | Add server tsconfig reference |
| `vite.config.ts` | Add `@shared` path alias |
| `package.json` | New deps, updated scripts |
| `server/tsconfig.json` | New — server TS config |
| `server/index.ts` | New — Hono server + `/api/chat` |
| `server/prompt.ts` | New — system prompt assembly |
| `src/views/InterviewView.tsx` | New — chat UI |
| `src/App.tsx` | Add interview route |
| `src/components/Navigation.tsx` | Add interview nav tab |
