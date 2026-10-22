/**
 * Augmentation du type Request d'Express pour transporter l'utilisateur authentifié.
 * Injecté par authMiddleware après vérification du JWT.
 */
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
      name: string | null;
    };
  }
}
