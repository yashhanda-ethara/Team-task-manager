import type { AuthUser, Role } from '../types';

const API = import.meta.env.VITE_API_URL || '';

async function handleRes(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || res.statusText || 'API error');
  return json;
}

export async function loginService(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleRes(res);
  return { ...data.user, token: data.token } as AuthUser;
}

export async function signupService(name: string, email: string, password: string, role: Role): Promise<AuthUser> {
  const res = await fetch(`${API}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  const data = await handleRes(res);
  return { ...data.user, token: data.token } as AuthUser;
}

