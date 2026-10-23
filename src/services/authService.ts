import { AuthUser } from '../types';
import { API_BASE } from './apiConfig';

const TOKEN_STORAGE_KEY = 'recipebox_jwt_token';

export interface AuthApiResponse {
  status: 'success' | 'error';
  message?: string;
  data?: {
    token?: string;
    user?: AuthUser;
  };
  errors?: string[];
}

export const authStorage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  },
  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (e) {
      console.warn('Impossible de persister le jeton JWT', e);
    }
  },
  removeToken(): void {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (e) {
      console.warn('Impossible de supprimer le jeton JWT', e);
    }
  },
};

export class AuthService {

  async login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const json: AuthApiResponse = await res.json().catch(() => ({ status: 'error', message: 'Erreur réseau' }));

    if (!res.ok || json.status !== 'success' || !json.data?.token || !json.data?.user) {
      throw new Error(json.message || 'Identifiants incorrects.');
    }

    authStorage.setToken(json.data.token);
    return { user: json.data.user, token: json.data.token };
  }

  async register(email: string, password: string, name?: string): Promise<{ user: AuthUser; token: string }> {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const json: AuthApiResponse = await res.json().catch(() => ({ status: 'error', message: 'Erreur réseau' }));

    if (!res.ok || json.status !== 'success' || !json.data?.token || !json.data?.user) {
      const errorMsg = json.errors?.join(' ') || json.message || 'Impossible de créer le compte.';
      throw new Error(errorMsg);
    }

    authStorage.setToken(json.data.token);
    return { user: json.data.user, token: json.data.token };
  }

  async getMe(token: string): Promise<AuthUser | null> {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          authStorage.removeToken();
        }
        return null;
      }

      const json = await res.json();
      return json.data?.user || null;
    } catch {
      return null;
    }
  }

  logout(): void {
    authStorage.removeToken();
  }
}

export const authService = new AuthService();
