import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Project, Task, User } from '../types';
import * as projectService from '../services/projectService';
import * as taskService from '../services/taskService';
import * as memberService from '../services/memberService';

interface AppContextValue {
  projects: Project[];
  tasks: Task[];
  members: User[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  addProject: (data: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  editProject: (id: string, data: Partial<Project>) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  addTask: (data: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  editTask: (id: string, data: Partial<Task>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [p, t, m] = await Promise.all([
        projectService.getProjects().catch((e) => { console.error('projects error:', e); return []; }),
        taskService.getTasks().catch((e) => { console.error('tasks error:', e); return []; }),
        memberService.getMembers().catch((e) => { console.error('members error:', e); return []; }),
      ]);
      console.log('fetchAll - projects:', p.length, 'tasks:', t.length, 'members:', m.length);
      setProjects(p as Project[]);
      setTasks(t as Task[]);
      setMembers(m as User[]);
    } catch (err) {
      console.error('fetchAll fatal error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  async function addProject(data: Omit<Project, 'id' | 'createdAt'>) {
    const p = await projectService.createProject(data);
    setProjects((prev) => [...prev, p]);
  }

  async function editProject(id: string, data: Partial<Project>) {
    const p = await projectService.updateProject(id, data);
    setProjects((prev) => prev.map((x) => (x.id === id ? p : x)));
  }

  async function removeProject(id: string) {
    await projectService.deleteProject(id);
    setProjects((prev) => prev.filter((x) => x.id !== id));
  }

  async function addTask(data: Omit<Task, 'id' | 'createdAt'>) {
    const t = await taskService.createTask(data);
    setTasks((prev) => [...prev, t]);
  }

  async function editTask(id: string, data: Partial<Task>) {
    const t = await taskService.updateTask(id, data);
    setTasks((prev) => prev.map((x) => (x.id === id ? t : x)));
  }

  async function removeTask(id: string) {
    await taskService.deleteTask(id);
    setTasks((prev) => prev.filter((x) => x.id !== id));
  }

  async function removeMember(id: string) {
    await memberService.deleteMember(id);
    setMembers((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <AppContext.Provider
      value={{
        projects, tasks, members, loading, fetchAll,
        addProject, editProject, removeProject,
        addTask, editTask, removeTask,
        removeMember,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
