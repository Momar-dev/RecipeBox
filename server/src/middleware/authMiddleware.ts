import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  name: string | null;
}

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

  }

  next();
}
