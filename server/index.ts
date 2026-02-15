import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { streamSSE } from 'hono/streaming';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { buildSystemPrompt } from './prompt.ts';

const app = new Hono();
const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env

// Static assets from Vite build
app.use('/assets/*', serveStatic({ root: './dist' }));
app.use('/vite.svg', serveStatic({ root: './dist' }));

// Chat endpoint — streams Claude responses as SSE
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

// SPA fallback — serve index.html for all non-API, non-asset routes
const indexHtml = readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf-8');
app.get('*', (c) => c.html(indexHtml));

const port = Number(process.env.PORT) || 3000;
console.log(`Server running on port ${port}`);
serve({ fetch: app.fetch, port });
