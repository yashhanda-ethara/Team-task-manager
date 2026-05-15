import { useEffect } from 'react';
import { CheckSquare, Clock, AlertCircle, ListTodo, FolderKanban } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import { formatDate, isOverdue } from '../utils';

export default function DashboardPage() {
  const { tasks, projects, members, fetchAll, loading } = useApp();
  const { user } = useAuth();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const myTasks = user?.role === 'admin' ? tasks : tasks.filter((t) => t.assignedTo === user?.id);
  const myProjects = user?.role === 'admin'
    ? projects
    : projects.filter((p) => p.memberIds.includes(user?.id ?? ''));

  const total = myTasks.length;
  const completed = myTasks.filter((t) => t.status === 'completed').length;
  const pending = myTasks.filter((t) => t.status !== 'completed').length;
  const overdue = myTasks.filter((t) => t.status !== 'completed' && isOverdue(t.dueDate)).length;

  const recentTasks = [...myTasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  function getProjectName(id: string) {
    return projects.find((p) => p.id === id)?.title ?? '—';
  }

  function getMemberName(id: string) {
    return members.find((m) => m.id === id)?.name ?? 'Unknown';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Good to see you, {user?.name?.split(' ')[0]}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {user?.role === 'admin'
            ? "Here's an overview of all tasks and projects."
            : "Here's your assigned work for today."}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={total} icon={ListTodo} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard label="Completed" value={completed} icon={CheckSquare} color="text-green-600" bgColor="bg-green-50" />
        <StatCard label="Pending" value={pending} icon={Clock} color="text-amber-600" bgColor="bg-amber-50" />
        <StatCard label="Overdue" value={overdue} icon={AlertCircle} color="text-red-500" bgColor="bg-red-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Recent Tasks</h3>
          </div>
          {recentTasks.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">No tasks yet.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentTasks.map((task) => (
                <div key={task.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{getProjectName(task.projectId)} · Due {formatDate(task.dueDate)}</p>
                  </div>
                  <Badge status={task.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Projects</h3>
            <span className="text-xs font-medium text-gray-400">{myProjects.length} total</span>
          </div>
          {myProjects.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">
              {user?.role === 'admin' ? 'No projects yet.' : 'You have not been added to any projects yet.'}
            </div>
          ) : (
          <div className="divide-y divide-gray-50">
            {myProjects.slice(0, 4).map((project) => {
              const ptasks = tasks.filter((t) => t.projectId === project.id);
              const done = ptasks.filter((t) => t.status === 'completed').length;
              const pct = ptasks.length > 0 ? Math.round((done / ptasks.length) * 100) : 0;
              return (
                <div key={project.id} className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FolderKanban size={14} className="text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{project.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{pct}%</span>
                  </div>
                  <div className="flex -space-x-1.5 mt-2">
                    {project.memberIds.slice(0, 3).map((id) => {
                      const name = getMemberName(id);
                      return <Avatar key={id} name={name} size="sm" />;
                    })}
                    {project.memberIds.length > 3 && (
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-medium">
                        +{project.memberIds.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
