/**
 * Validation des données d'authentification (inscription et connexion).
 */

export interface AuthRegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface AuthLoginInput {
  email: string;
  password: string;
}

export interface AuthValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: string[];
}

/**
 * Normalise un email : minuscules + trim.
 */
export function normalizeEmail(email: unknown): string {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Valide et normalise les données d'inscription.
 */
export function validateRegister(
  body: unknown
): AuthValidationResult<AuthRegisterInput> {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { isValid: false, errors: ['Corps de requête invalide.'] };
  }

  const { email, password, name } = body as Record<string, unknown>;

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    errors.push("L'adresse e-mail est requise.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.push("L'adresse e-mail est invalide.");
  }

  if (typeof password !== 'string' || password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères.');
  }

  let normalizedName: string | undefined;
  if (name !== undefined) {
    if (typeof name !== 'string') {
      errors.push('Le nom doit être une chaîne de caractères.');
    } else {
      normalizedName = name.trim() || undefined;
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    data: {
      email: normalizedEmail,
      password: password as string,
      name: normalizedName,
    },
    errors: [],
  };
}

/**
 * Valide et normalise les données de connexion.
 */
export function validateLogin(
  body: unknown
): AuthValidationResult<AuthLoginInput> {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { isValid: false, errors: ['Corps de requête invalide.'] };
  }

  const { email, password } = body as Record<string, unknown>;

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    errors.push("L'adresse e-mail est requise.");
  }

  if (typeof password !== 'string' || !password) {
    errors.push('Le mot de passe est requis.');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    data: {
      email: normalizedEmail,
      password: password as string,
    },
    errors: [],
  };
}
