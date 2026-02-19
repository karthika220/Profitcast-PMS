import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectsAPI, tasksAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  PLANNING: 'bg-purple-100 text-purple-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  ON_HOLD: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-600',
};
const TASK_STATUS_COLORS = {
  TODO: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
};
const PRIORITY_COLORS = {
  LOW: 'bg-gray-100 text-gray-500',
  MEDIUM: 'bg-blue-50 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-600',
  CRITICAL: 'bg-red-100 text-red-600',
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canManageProjects, canCreateTasks, user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showStatusEdit, setShowStatusEdit] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await projectsAPI.getById(id);
      setProject(res.data);
    } catch { navigate('/projects'); }
    finally { setLoading(false); }
  };

  const fetchTasks = async () => {
    try {
      const res = await tasksAPI.getAll({ projectId: id, limit: 50 });
      setTasks(res.data.tasks);
    } catch {}
  };

  const updateStatus = async (status) => {
    try {
      await projectsAPI.update(id, { status });
      setProject({ ...project, status });
      setShowStatusEdit(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  if (!project) return null;

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/projects" className="hover:text-gray-700">Projects</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{project.name}</span>
      </div>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-3 h-16 rounded-full flex-shrink-0" style={{ background: project.color }} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <div className="relative">
                <button
                  onClick={() => canManageProjects() && setShowStatusEdit(!showStatusEdit)}
                  className={`badge-status ${STATUS_COLORS[project.status]} ${canManageProjects() ? 'cursor-pointer' : ''}`}
                >
                  {project.status.replace('_', ' ')}
                  {canManageProjects() && ' ▾'}
                </button>
                {showStatusEdit && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowStatusEdit(false)} />
                    <div className="absolute left-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 min-w-[160px]">
                      {['PLANNING','IN_PROGRESS','ON_HOLD','COMPLETED','ARCHIVED'].map(s => (
                        <button key={s} onClick={() => updateStatus(s)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            {project.description && <p className="text-gray-500 text-sm mb-3">{project.description}</p>}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>📅 {new Date(project.startDate).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})} → {new Date(project.endDate).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</span>
              <span>👤 {project.owner?.firstName} {project.owner?.lastName}</span>
              {project.budget && <span>💰 ₹{Number(project.budget).toLocaleString()}</span>}
            </div>
            {project.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {project.tags.map((tag, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 flex-shrink-0">
            {[
              { label: 'Total', value: tasks.length, color: 'text-gray-900' },
              { label: 'Done', value: completedTasks, color: 'text-green-600' },
              { label: 'Overdue', value: overdueTasks, color: 'text-red-600' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Overall Progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${project.progress}%`, background: project.color }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {['overview', 'tasks', 'milestones', 'team'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'tasks' && (
        <div className="card">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold">Tasks ({tasks.length})</h3>
            {canCreateTasks() && (
              <Link to={`/tasks?projectId=${id}`} className="btn-primary text-xs">+ Add Task</Link>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No tasks yet</div>
            ) : tasks.map(task => (
              <Link key={task.id} to={`/tasks/${task.id}`}>
                <div className="p-4 hover:bg-gray-50 flex items-center gap-3">
                  <div className={`badge-status flex-shrink-0 ${TASK_STATUS_COLORS[task.status]}`}>{task.status.replace('_', ' ')}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    {task.assignee && <p className="text-xs text-gray-400">{task.assignee.firstName} {task.assignee.lastName}</p>}
                  </div>
                  <div className={`badge-status flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</div>
                  {task.dueDate && (
                    <span className={`text-xs flex-shrink-0 ${new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                      {new Date(task.dueDate).toLocaleDateString('en-IN', {day:'numeric',month:'short'})}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="card">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold">Milestones ({project.milestones?.length || 0})</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {project.milestones?.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No milestones yet</div>
            ) : project.milestones?.map(m => (
              <div key={m.id} className="p-4 flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${m.isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                  {m.isCompleted && <span className="text-white text-xs">✓</span>}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{m.name}</p>
                  {m.description && <p className="text-sm text-gray-500 mt-0.5">{m.description}</p>}
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>Target: {new Date(m.targetDate).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</span>
                    <span>Owner: {m.owner?.firstName} {m.owner?.lastName}</span>
                    <span>{m._count?.tasks || 0} tasks</span>
                  </div>
                </div>
                <span className={`badge-status flex-shrink-0 ${m.isCompleted ? 'bg-green-100 text-green-700' : new Date(m.targetDate) < new Date() ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                  {m.isCompleted ? 'Completed' : new Date(m.targetDate) < new Date() ? 'Overdue' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="card">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold">Team Members ({project.members?.length || 0})</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {project.members?.map(({ user, role, joinedAt }) => (
              <div key={user.id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="badge-status bg-blue-50 text-blue-700">{role}</span>
                  <span className="text-xs text-gray-400">{user.role?.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Task status breakdown */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Task Breakdown</h3>
            {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'CANCELLED'].map(status => {
              const count = tasks.filter(t => t.status === status).length;
              const pct = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0;
              return (
                <div key={status} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{status.replace('_', ' ')}</span>
                    <span className="text-gray-900 font-medium">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Project info */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Project Details</h3>
            <dl className="space-y-3">
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Status</dt>
                <dd className={`badge-status ${STATUS_COLORS[project.status]}`}>{project.status.replace('_', ' ')}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Owner</dt>
                <dd className="text-gray-900 font-medium">{project.owner?.firstName} {project.owner?.lastName}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Start Date</dt>
                <dd className="text-gray-900">{new Date(project.startDate).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">End Date</dt>
                <dd className="text-gray-900">{new Date(project.endDate).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</dd>
              </div>
              {project.budget && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Budget</dt>
                  <dd className="text-gray-900 font-medium">₹{Number(project.budget).toLocaleString()}</dd>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Team Size</dt>
                <dd className="text-gray-900">{project.members?.length || 0} members</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Milestones</dt>
                <dd className="text-gray-900">{project.milestones?.length || 0}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
