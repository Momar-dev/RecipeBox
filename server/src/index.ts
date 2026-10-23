import app from './app';

const PORT = parseInt(process.env.PORT || '3001', 10);

const server = app.listen(PORT, () => {
  console.log(`
  ┌────────────────────────────────────────────┐
  │   🍽️  Recipe Box API                        │
  │   Serveur Express + TypeScript actif        │
  │                                             │
  │   Local :  http://localhost:${PORT}          │
  │   Santé :  http://localhost:${PORT}/api/health│
  └────────────────────────────────────────────┘
  `);
});

// Arrêt propre (SIGTERM / SIGINT)
const shutdown = (signal: string) => {
  console.log(`\n[${signal}] Arrêt du serveur en cours...`);
  server.close(() => {
    console.log('Serveur arrêté proprement.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
