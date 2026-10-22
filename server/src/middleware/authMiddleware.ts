import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  name: string | null;
}

/**
 * Middleware d'authentification JWT strict.
 *
 * Lit le header `Authorization: Bearer <token>`, vérifie sa validité et
 * injecte `req.user` si le jeton est valide.
 *
 * Retourne 401 si le jeton est absent, invalide ou expiré.
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      status: 'error',
      message: 'Authentification requise. Fournissez un jeton Bearer valide.',
    });
    return;
  }

  const token = authHeader.slice(7).trim();

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[authMiddleware] JWT_SECRET manquant dans les variables d\'environnement.');
    res.status(500).json({
      status: 'error',
      message: 'Erreur de configuration du serveur.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: 'error',
        message: 'Le jeton d\'authentification a expiré. Veuillez vous reconnecter.',
      });
    } else {
      res.status(401).json({
        status: 'error',
        message: 'Jeton d\'authentification invalide.',
      });
    }
  }
}

/**
 * Middleware d'authentification JWT optionnel.
 *
 * Si un jeton Bearer est présent et valide, injecte `req.user`.
 * Si aucun en-tête n'est fourni ou si le jeton est absent, continue sans erreur (`req.user = undefined`).
 * Si un jeton est explicitement fourni mais invalide/expiré, on continue sans `req.user` (ou on ignore silencieusement pour la consultation publique).
 */
export function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7).trim();
  const secret = process.env.JWT_SECRET;

  if (!secret || !token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };
  } catch {
    // Si le jeton est invalide ou expiré, on ignore simplement pour l'authentification optionnelle
  }

  next();
}
