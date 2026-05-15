import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, CheckSquare, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import { formatDate, isOverdue, statusLabels } from '../utils';
import type { Task, TaskStatus } from '../types';

interface TaskFormData {
  title: string;
  description: string;
  assignedTo: string;
  status: TaskStatus;
  dueDate: string;
  projectId: string;
}

const STATUS_OPTIONS: TaskStatus[] = ['todo', 'in_progress', 'completed'];

export default function TasksPage() {
  const { tasks, projects, members, fetchAll, addTask, editTask, removeTask, loading } = useApp();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterProject, setFilterProject] = useState('all');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormData>();

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function openCreate() {
    setEditTarget(null);
    reset({ title: '', description: '', assignedTo: '', status: 'todo', dueDate: '', projectId: '' });
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditTarget(task);
    reset({ title: task.title, description: task.description, assignedTo: task.assignedTo, status: task.status, dueDate: task.dueDate, projectId: task.projectId });
    setModalOpen(true);
  }

  async function onSubmit(data: TaskFormData) {
    setSaving(true);
    try {
      if (editTarget) {
        await editTask(editTarget.id, data);
        toast.success('Task updated');
      } else {
        await addTask({ ...data, createdBy: user!.id });
        toast.success('Task created');
      }
      setModalOpen(false);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeTask(deleteTarget.id);
      toast.success('Task deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange(id: string, status: TaskStatus) {
    try {
      await editTask(id, { status });
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update');
    }
  }

  const visibleTasks = isAdmin ? tasks : tasks.filter((t) => t.assignedTo === user?.id);
  // only non-admin members can be assigned tasks
  const assignableMembers = members.filter((m) => m.role !== 'admin');

  const filtered = visibleTasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchProject = filterProject === 'all' || t.projectId === filterProject;
    return matchSearch && matchStatus && matchProject;
  });

  function getMemberName(id: string) { return members.find((m) => m.id === id)?.name ?? 'Unassigned'; }
  function getProjectName(id: string) { return projects.find((p) => p.id === id)?.title ?? '—'; }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
          </select>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap">
            <Plus size={16} />
            New Task
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description="Try adjusting your search or filters."
          action={isAdmin ? <button onClick={openCreate} className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">Create Task</button> : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Task</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Project</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Assigned To</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Due Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((task) => {
                  const overdue = isOverdue(task.dueDate) && task.status !== 'completed';
                  return (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{task.description}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-gray-600">{getProjectName(task.projectId)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Avatar name={getMemberName(task.assignedTo)} size="sm" />
                          <span className="text-sm text-gray-600">{getMemberName(task.assignedTo)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-sm ${overdue ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                          {formatDate(task.dueDate)}
                          {overdue && <span className="ml-1 text-xs">(overdue)</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          disabled={!isAdmin && task.assignedTo !== user?.id}
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3.5">
                        {isAdmin && (
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => openEdit(task)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => setDeleteTarget(task)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <Modal title={editTarget ? 'Edit Task' : 'New Task'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Task title</label>
              <input
                {...register('title', { required: 'Title is required' })}
                placeholder="e.g. Design homepage"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={2}
                placeholder="What needs to be done..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Project</label>
                <select
                  {...register('projectId', { required: 'Project is required' })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select project</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
                {errors.projectId && <p className="text-red-500 text-xs mt-1">{errors.projectId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign To</label>
                <select
                  {...register('assignedTo', { required: 'Assignee is required' })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select member</option>
                  {assignableMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                {errors.assignedTo && <p className="text-red-500 text-xs mt-1">{errors.assignedTo.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
                <input
                  type="date"
                  {...register('dueDate', { required: 'Due date is required' })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : editTarget ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${deleteTarget.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
