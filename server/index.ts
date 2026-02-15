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
