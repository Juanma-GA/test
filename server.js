import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env manually (ESM compatible)
try {
  const envFile = readFileSync(join(__dirname, '.env'), 'utf-8');
  envFile.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && key.trim() && !key.startsWith('#')) {
      process.env[key.trim()] = vals.join('=').trim();
    }
  });
} catch {
  // .env not found, continue with existing env vars
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve Vite build
app.use(express.static(join(__dirname, 'dist')));

// Proxy endpoint — receives { targetEndpoint, apiKey, provider, payload } from llmAPI.js
app.post('/api/proxy', async (req, res) => {
  const { targetEndpoint, apiKey, provider, payload } = req.body;

  if (!targetEndpoint || !apiKey || !payload) {
    return res.status(400).json({ error: 'Missing required fields: targetEndpoint, apiKey, payload' });
  }

  // Build auth headers only — payload already built by llmAPI.js
  const headers = { 'Content-Type': 'application/json' };
  if (provider === 'Anthropic') {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
  } else {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    const response = await fetch(targetEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).send(errText);
    }

    // Pipe response back to client (handles both streaming and non-streaming)
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    const reader = response.body.getReader();
    const pump = async () => {
      const { done, value } = await reader.read();
      if (done) { res.end(); return; }
      res.write(value);
      return pump();
    };
    await pump();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`BRDP Manager running at http://localhost:${PORT}`);
});
