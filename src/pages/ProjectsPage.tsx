import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, FolderKanban, Calendar, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils';
import type { Project } from '../types';

interface ProjectFormData {
  title: string;
  description: string;
  deadline: string;
  memberIds: string[];
}

export default function ProjectsPage() {
  const { projects, members, tasks, fetchAll, addProject, editProject, removeProject, loading } = useApp();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>();

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function openCreate() {
    setEditTarget(null);
    reset({ title: '', description: '', deadline: '', memberIds: [] });
    setModalOpen(true);
  }

  function openEdit(project: Project) {
    setEditTarget(project);
    reset({ title: project.title, description: project.description, deadline: project.deadline, memberIds: project.memberIds });
    setModalOpen(true);
  }

  async function onSubmit(data: ProjectFormData) {
    setSaving(true);
    try {
      const memberIds = Array.isArray(data.memberIds) ? data.memberIds : [data.memberIds].filter(Boolean);
      if (editTarget) {
        await editProject(editTarget.id, { ...data, memberIds });
        toast.success('Project updated');
      } else {
        await addProject({ ...data, memberIds, createdBy: user!.id });
        toast.success('Project created');
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Project save error:', err);
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeProject(deleteTarget.id);
      toast.success('Project deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  }

  const visibleProjects = isAdmin ? projects : projects.filter((p) => p.memberIds.includes(user?.id ?? ''));
  // only show non-admin users in the member picker
  const assignableMembers = members.filter((m) => m.role !== 'admin');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{visibleProjects.length} projects</p>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
            New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : visibleProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to get started organizing work."
          action={isAdmin ? <button onClick={openCreate} className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">Create Project</button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleProjects.map((project) => {
            const ptasks = tasks.filter((t) => t.projectId === project.id);
            const done = ptasks.filter((t) => t.status === 'completed').length;
            const pct = ptasks.length > 0 ? Math.round((done / ptasks.length) * 100) : 0;

            return (
              <div key={project.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FolderKanban size={18} className="text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 leading-snug">{project.title}</h3>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 ml-2">
                      <button onClick={() => openEdit(project)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(project)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{done}/{ptasks.length} tasks</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className="h-1.5 bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar size={13} />
                    {formatDate(project.deadline)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Users size={13} />
                    <div className="flex -space-x-1.5">
                      {project.memberIds.slice(0, 3).map((id) => {
                        const m = members.find((x) => x.id === id);
                        return m ? <Avatar key={id} name={m.name} size="sm" /> : null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <Modal title={editTarget ? 'Edit Project' : 'New Project'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Project title</label>
              <input
                {...register('title', { required: 'Title is required' })}
                placeholder="e.g. Website Redesign"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={3}
                placeholder="Describe the project goals..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deadline</label>
              <input
                type="date"
                {...register('deadline', { required: 'Deadline is required' })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Team Members <span className="text-gray-400 font-normal">(optional)</span></label>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-40 overflow-y-auto">
                {assignableMembers.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-gray-400 text-center">
                    No members yet. Ask them to sign up at /signup.
                  </p>
                ) : (
                  assignableMembers.map((m) => (
                    <label key={m.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        value={m.id}
                        {...register('memberIds')}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <Avatar name={m.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{m.name}</p>
                        <p className="text-xs text-gray-400">{m.email}</p>
                      </div>
                    </label>
                  ))
                )}
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
          message={`Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
