import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './apiRouter';

dotenv.config();

export async function startServer() {
  const app = express();
  const args = process.argv;
  const portArgIdx = args.indexOf('--port');
  const portArg = portArgIdx !== -1 ? Number(args[portArgIdx + 1]) : NaN;
  const port = !isNaN(portArg) && portArg > 0 ? portArg : (Number(process.env.PORT) || 3000);
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ limit: '15mb', extended: true }));
  app.use('/api', apiRouter);

  // Ensure any unmatched /api/* requests return JSON errors instead of falling through to Vite/SPA HTML
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ success: false, error: 'API route not found' });
  });

  // Catch payload-too-large or JSON parsing errors cleanly as JSON
  app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err) {
      console.warn('Server middleware error:', err.message);
      return res.status(err.status || 500).json({
        success: false,
        error: err.type === 'entity.too.large' ? 'Uploaded photo is too large for the server.' : (err.message || 'Server request error')
      });
    }
    next();
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`HoloMeet AI server running on http://0.0.0.0:${port} (mode: ${isProd ? 'production' : 'development'})`);
  });
}
