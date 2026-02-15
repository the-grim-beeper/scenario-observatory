import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { streamSSE } from 'hono/streaming';
import { getCookie, setCookie } from 'hono/cookie';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { buildSystemPrompt } from './prompt.ts';

const app = new Hono();
const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env
const SITE_PASSWORD = process.env.SITE_PASSWORD;

// --------------------------------------------------------------------------
// Site password gate (skipped if SITE_PASSWORD is not set)
// --------------------------------------------------------------------------
if (SITE_PASSWORD) {
  app.post('/auth', async (c) => {
    const body = await c.req.parseBody();
    if (body['password'] === SITE_PASSWORD) {
      setCookie(c, 'site_auth', SITE_PASSWORD, {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return c.redirect('/');
    }
    return c.html(passwordPage('Incorrect password'), 401);
  });

  app.use('*', async (c, next) => {
    // Allow the auth POST through
    if (c.req.path === '/auth') return next();
    // Allow static assets through (needed for password page styling)
    if (c.req.path.startsWith('/assets/')) return next();

    const cookie = getCookie(c, 'site_auth');
    if (cookie === SITE_PASSWORD) return next();

    return c.html(passwordPage(), 401);
  });
}

function passwordPage(error?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Scenario Atlas</title>
  <link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400;600&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F5F2EB;
      font-family: 'Source Sans 3', system-ui, sans-serif;
      color: #3D3A35;
    }
    .card {
      background: #FEFDFB;
      border: 1px solid #E0DCD3;
      border-radius: 12px;
      padding: 2.5rem;
      width: 100%;
      max-width: 380px;
      box-shadow: 0 1px 3px rgba(28,26,23,0.04);
    }
    h1 {
      font-family: 'Spectral', Georgia, serif;
      font-size: 1.5rem;
      color: #1C1A17;
      margin-bottom: 0.25rem;
    }
    .subtitle {
      font-size: 0.625rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #8C8578;
      margin-bottom: 1.5rem;
    }
    input {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid #E0DCD3;
      border-radius: 8px;
      font-family: inherit;
      font-size: 0.875rem;
      background: #FAF8F3;
      color: #2D2A26;
      outline: none;
      transition: border-color 0.15s;
    }
    input:focus { border-color: #5E8C61; }
    button {
      width: 100%;
      margin-top: 0.75rem;
      padding: 0.625rem;
      border: none;
      border-radius: 8px;
      background: #5E8C61;
      color: white;
      font-family: inherit;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    button:hover { background: #4e7a51; }
    .error {
      color: #E11D48;
      font-size: 0.8rem;
      margin-bottom: 0.75rem;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>The Scenario Atlas</h1>
    <div class="subtitle">Youth &amp; AI Futures</div>
    ${error ? `<div class="error">${error}</div>` : ''}
    <form method="POST" action="/auth">
      <input type="password" name="password" placeholder="Enter site password" autofocus required />
      <button type="submit">Enter</button>
    </form>
  </div>
</body>
</html>`;
}

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
