import express from 'express';
import cors from 'cors';
import { config, assertCriticalConfig } from './config/index.js';
import { initDb } from './db/index.js';
import { authRouter } from './routes/auth.js';
import { generateRouter } from './routes/generate.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

assertCriticalConfig();

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin/non-browser requests (no Origin header) and
      // anything explicitly listed in CORS_ORIGIN.
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: config.nodeEnv, providerChain: config.providerChain });
});

app.use('/api/auth', authRouter);
app.use('/api/generate', generateRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const start = async () => {
  await initDb();
  app.listen(config.port, () => {
    console.log(`AI Content Studio backend listening on port ${config.port} (${config.nodeEnv})`);
    console.log(`Provider chain: ${config.providerChain.join(' -> ')}`);
  });
};

start();
