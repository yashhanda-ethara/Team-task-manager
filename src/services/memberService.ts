import type { User } from '../types';

const API = import.meta.env.VITE_API_URL || '';

function getAuthHeaders() {
  const raw = localStorage.getItem('ttm_user');
  try {
    const u = raw ? JSON.parse(raw) : null;
    if (u && u.token) return { Authorization: `Bearer ${u.token}` };
  } catch {}
  return {} as Record<string, string>;
}

async function handleRes(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || res.statusText || 'API error');
  return json;
}

export async function getMembers(): Promise<User[]> {
  const res = await fetch(`${API}/api/users`, { headers: getAuthHeaders() });
  console.log('getMembers response status:', res.status, 'url:', `${API}/api/users`);
  const data = await handleRes(res);
  console.log('getMembers data:', data);
  return data;
}

export async function deleteMember(id: string): Promise<void> {
  const res = await fetch(`${API}/api/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleRes(res);
}
