/**
 * Configuration de l'URL de base de l'API.
 * En développement local : VITE_API_URL est vide -> appels relatifs '/api/...' via le proxy Vite.
 * En production (ex. Vercel) : VITE_API_URL pointe vers l'URL du backend (ex. 'https://recipe-box-api.onrender.com').
 */
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
