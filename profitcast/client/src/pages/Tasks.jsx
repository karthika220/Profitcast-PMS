import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { tasksAPI, projectsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  TODO: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
};
const PRIORITY_ICONS = { LOW: '↓', MEDIUM: '→', HIGH: '↑', CRITICAL: '🔥' };
const PRIORITY_COLORS = {
  LOW: 'text-gray-400',
  MEDIUM: 'text-blue-500',
  HIGH: 'text-orange-500',
  CRITICAL: 'text-red-500',
};

const TaskModal = ({ onClose, onSubmit, loading, projects, users, defaultProjectId }) => {
  const [form, setForm] = useState({
    title: '', description: '', priority: 'MEDIUM', status: 'TODO',
    startDate: '', dueDate: '', estimatedHours: '', projectId: defaultProjectId || '',
    assigneeId: '', tags: '',
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold">New Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
            <input className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Implement auth module" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
            <select className="input-field" value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})}>
              <option value="">Select project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Task details..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select className="input-field" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              <select className="input-field" value={form.assigneeId} onChange={e => setForm({...form, assigneeId: e.target.value})}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" className="input-field" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" className="input-field" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
            <input type="number" className="input-field" value={form.estimatedHours} onChange={e => setForm({...form, estimatedHours: e.target.value})} placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input className="input-field" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="Frontend, API" />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={() => onSubmit({
            ...form,
            tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
            assigneeId: form.assigneeId || null,
          })} disabled={loading || !form.title || !form.projectId} className="btn-primary">
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Tasks() {
  const { canCreateTasks } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultProjectId = searchParams.get('projectId') || '';

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '', projectId: defaultProjectId, search: '' });
  const [viewMode, setViewMode] = useState('list'); // list | kanban

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  useEffect(() => {
    projectsAPI.getAll({ limit: 100 }).then(r => setProjects(r.data.projects));
    usersAPI.getAll({ limit: 100 }).then(r => setUsers(r.data.users));
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.projectId) params.projectId = filters.projectId;
      if (filters.search) params.search = filters.search;
      params.limit = 100;
      const res = await tasksAPI.getAll(params);
      setTasks(res.data.tasks);
    } catch {}
    finally { setLoading(false); }
  };

  const handleCreate = async (data) => {
    setCreating(true);
    try {
      await tasksAPI.create(data);
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusUpdate = async (taskId, status) => {
    try {
      await tasksAPI.update(taskId, { status });
      fetchTasks();
    } catch {}
  };

  const KANBAN_COLUMNS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input className="input-field w-44" placeholder="Search tasks..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
          <select className="input-field w-36" value={filters.projectId} onChange={e => setFilters({...filters, projectId: e.target.value})}>
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="input-field w-32" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="">All Status</option>
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select className="input-field w-32" value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})}>
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setViewMode('list')} className={`px-3 py-1 rounded text-sm font-medium ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>List</button>
            <button onClick={() => setViewMode('kanban')} className={`px-3 py-1 rounded text-sm font-medium ${viewMode === 'kanban' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>Board</button>
          </div>
          {canCreateTasks() && <button onClick={() => setShowModal(true)} className="btn-primary">+ New Task</button>}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-gray-700">No tasks found</h3>
          {canCreateTasks() && <button onClick={() => setShowModal(true)} className="btn-primary mt-4">Create Task</button>}
        </div>
      ) : viewMode === 'list' ? (
        <div className="card">
          <div className="divide-y divide-gray-50">
            {tasks.map(task => (
              <div key={task.id} className="p-4 hover:bg-gray-50 flex items-center gap-4">
                <select
                  value={task.status}
                  onChange={e => handleStatusUpdate(task.id, e.target.value)}
                  className={`badge-status border-0 cursor-pointer text-xs font-medium ${STATUS_COLORS[task.status]} py-1 px-2 rounded-full`}
                  onClick={e => e.stopPropagation()}
                >
                  {['TODO','IN_PROGRESS','IN_REVIEW','COMPLETED','CANCELLED'].map(s => (
                    <option key={s} value={s}>{s.replace('_',' ')}</option>
                  ))}
                </select>

                <Link to={`/tasks/${task.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium text-sm ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_ICONS[task.priority]}</span>
                    <span className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    {task.project && <span style={{ color: task.project.color }}>{task.project.name}</span>}
                    {task.milestone && <span>📌 {task.milestone.name}</span>}
                    {task._count?.subtasks > 0 && <span>└ {task._count.subtasks} subtasks</span>}
                    {task._count?.comments > 0 && <span>💬 {task._count.comments}</span>}
                  </div>
                </Link>

                {task.assignee ? (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">{task.assignee.firstName[0]}</div>
                    <span className="text-xs text-gray-500 hidden md:block">{task.assignee.firstName}</span>
                  </div>
                ) : <div className="w-6 h-6 flex-shrink-0" />}

                {task.dueDate && (
                  <span className={`text-xs flex-shrink-0 ${new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                    {new Date(task.dueDate).toLocaleDateString('en-IN', {day:'numeric',month:'short'})}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Kanban Board
        <div className="grid grid-cols-4 gap-4 min-h-96">
          {KANBAN_COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col);
            return (
              <div key={col} className="bg-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">{col.replace('_', ' ')}</h3>
                  <span className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full font-medium">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map(task => (
                    <Link key={task.id} to={`/tasks/${task.id}`}>
                      <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-gray-900 leading-tight">{task.title}</p>
                          <span className={`text-xs flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_ICONS[task.priority]}</span>
                        </div>
                        {task.project && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: task.project.color }} />
                            <span className="text-xs text-gray-400 truncate">{task.project.name}</span>
                          </div>
                        )}
                        {task.dueDate && (
                          <p className={`text-xs ${new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'text-red-600' : 'text-gray-400'}`}>
                            Due {new Date(task.dueDate).toLocaleDateString('en-IN', {day:'numeric',month:'short'})}
                          </p>
                        )}
                        {task.assignee && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">{task.assignee.firstName[0]}</div>
                            <span className="text-xs text-gray-400">{task.assignee.firstName} {task.assignee.lastName}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <TaskModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
          loading={creating}
          projects={projects}
          users={users}
          defaultProjectId={defaultProjectId}
        />
      )}
    </div>
  );
}
