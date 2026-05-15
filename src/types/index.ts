export type Role = 'admin' | 'member';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  deadline: string;
  memberIds: string[];
  createdAt: string;
  createdBy: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: TaskStatus;
  dueDate: string;
  projectId: string;
  createdAt: string;
  createdBy: string;
}

export interface AuthUser extends User {
  token: string;
}
