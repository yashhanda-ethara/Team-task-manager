import type { Task, TaskStatus } from '../types';

const API = import.meta.env.VITE_API_URL || '';

async function handleRes(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || res.statusText || 'API error');
  return json;
}

function getAuthHeaders() {
  const raw = localStorage.getItem('ttm_user');
  try {
    const u = raw ? JSON.parse(raw) : null;
    if (u && u.token) return { Authorization: `Bearer ${u.token}` };
  } catch {}
  return {} as Record<string, string>;
}

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API}/api/tasks`, { headers: getAuthHeaders() });
  return handleRes(res);
}

export async function createTask(data: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
  const res = await fetch(`${API}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API}/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  return updateTask(id, { status });
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API}/api/tasks/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  await handleRes(res);
}
