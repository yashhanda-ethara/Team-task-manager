import type { Project } from '../types';

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

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API}/api/projects`, { headers: getAuthHeaders() });
  const data = await handleRes(res);
  return data;
}

export async function createProject(data: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
  const res = await fetch(`${API}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API}/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${API}/api/projects/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  await handleRes(res);
}
