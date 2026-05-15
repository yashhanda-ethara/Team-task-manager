import { useEffect, useState } from 'react';
import { Users, CheckSquare, Clock, Trash2, FolderKanban } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import type { User } from '../types';

export default function MembersPage() {
  const { members, tasks, projects, fetchAll, removeMember, loading } = useApp();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { 
    fetchAll().then(() => {
      console.log('members after fetchAll:', members);
    });
  }, [fetchAll]);

  console.log('render - members:', members, 'loading:', loading);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeMember(deleteTarget.id);
      toast.success(`${deleteTarget.name} has been removed`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // exclude admin from the member cards
  const teamMembers = members.filter((m) => m.role !== 'admin');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'} on your team
          </p>
          {isAdmin && teamMembers.length === 0 && (
            <p className="text-xs text-blue-500 mt-0.5">
              Share the signup link so members can join: <span className="font-medium">/signup</span>
            </p>
          )}
        </div>
      </div>

      {teamMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members yet"
          description={
            isAdmin
              ? 'Members can sign up at /signup. Once they join, you can assign them to projects and tasks.'
              : 'No team members have joined yet.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {teamMembers.map((member) => {
            const memberTasks = tasks.filter((t) => t.assignedTo === member.id);
            const completed = memberTasks.filter((t) => t.status === 'completed').length;
            const pending = memberTasks.filter((t) => t.status !== 'completed').length;
            const inProgress = memberTasks.filter((t) => t.status === 'in_progress').length;
            const memberProjects = projects.filter((p) => p.memberIds.includes(member.id));
            const completionPct = memberTasks.length > 0
              ? Math.round((completed / memberTasks.length) * 100)
              : 0;

            return (
              <div key={member.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={member.name} size="lg" />
                    <div>
                      <h3 className="font-semibold text-gray-900 leading-tight">{member.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{member.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                        {member.role}
                      </span>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => setDeleteTarget(member)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Remove member"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                {/* Task stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-gray-900">{memberTasks.length}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Total</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-green-700">{completed}</p>
                    <p className="text-xs text-green-500 mt-0.5">Done</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-amber-700">{pending}</p>
                    <p className="text-xs text-amber-500 mt-0.5">Pending</p>
                  </div>
                </div>

                {/* Progress bar */}
                {memberTasks.length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span className="flex items-center gap-1">
                        <CheckSquare size={11} className="text-green-500" />
                        {completed} completed · <Clock size={11} className="text-blue-400 ml-1" /> {inProgress} in progress
                      </span>
                      <span>{completionPct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div
                        className="h-1.5 bg-green-500 rounded-full transition-all"
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Projects */}
                {memberProjects.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <FolderKanban size={11} /> Projects
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {memberProjects.map((p) => (
                        <span key={p.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">
                          {p.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {memberTasks.length === 0 && memberProjects.length === 0 && (
                  <p className="text-xs text-gray-400 italic">No assignments yet</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Remove ${deleteTarget.name} from the team? Their account will be deleted and they will lose access.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
