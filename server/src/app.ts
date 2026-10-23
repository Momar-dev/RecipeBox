import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import recipesRouter from './routes/recipes';
import authRouter from './routes/auth';
import uploadsRouter from './routes/uploads';
import favoritesRouter from './routes/favorites';

dotenv.config();

const app: Application = express();

const clientUrl = process.env.CLIENT_URL;
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
if (clientUrl) {
  clientUrl.split(',').forEach((url) => allowedOrigins.push(url.trim()));
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com')
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS bloqué pour l'origin : ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Recipe Box API opérationnelle',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

app.use('/api/auth', authRouter);

app.use('/api/recipes', recipesRouter);

app.use('/api/uploads', uploadsRouter);

app.use('/api/favorites', favoritesRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route non trouvée.',
  });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const isProd = process.env.NODE_ENV === 'production';
  console.error('[API Error]', err?.message || err);

  if (err?.code === 'P2002') {
    res.status(409).json({
      status: 'error',
      message: 'Un enregistrement avec cette valeur existe déjà.',
    });
    return;
  }

  if (err?.code === 'P2025') {
    res.status(404).json({
      status: 'error',
      message: 'Ressource introuvable.',
    });
    return;
  }

  res.status(500).json({
    status: 'error',
    message: isProd ? 'Erreur interne du serveur.' : (err?.message || 'Erreur interne.'),
  });
});

export default app;
