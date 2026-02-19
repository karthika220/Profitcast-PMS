import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  PLANNING: 'bg-purple-100 text-purple-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  ON_HOLD: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-600',
};

const Modal = ({ onClose, onSubmit, loading, users }) => {
  const [form, setForm] = useState({
    name: '', description: '', startDate: '', endDate: '',
    budget: '', color: '#3B82F6', tags: '', memberIds: [],
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold">New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
            <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. ERP System Development" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Project overview..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input type="date" className="input-field" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input type="date" className="input-field" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹)</label>
              <input type="number" className="input-field" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input type="color" className="h-10 w-full border border-gray-300 rounded-lg cursor-pointer" value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input className="input-field" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="Backend, Frontend, Design" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Members</label>
            <select multiple className="input-field h-32" value={form.memberIds} onChange={e => setForm({...form, memberIds: Array.from(e.target.selectedOptions, o => o.value)})}>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={() => onSubmit({
            ...form,
            tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
            memberIds: form.memberIds,
          })} disabled={loading || !form.name || !form.startDate || !form.endDate} className="btn-primary">
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Projects() {
  const { canManageProjects } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchProjects();
    if (canManageProjects()) usersAPI.getAll({ limit: 100 }).then(r => setUsers(r.data.users));
  }, [statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await projectsAPI.getAll(params);
      setProjects(res.data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    setCreating(true);
    try {
      await projectsAPI.create(data);
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const filtered = projects.filter(p =>
    !filter || p.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            className="input-field w-52"
            placeholder="Search projects..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          <select className="input-field w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="PLANNING">Planning</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          {canManageProjects() && (
            <button onClick={() => setShowModal(true)} className="btn-primary whitespace-nowrap">+ New Project</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">📁</div>
          <h3 className="text-lg font-semibold text-gray-700">No projects found</h3>
          <p className="text-gray-400 text-sm mt-1">Create your first project to get started</p>
          {canManageProjects() && <button onClick={() => setShowModal(true)} className="btn-primary mt-4">Create Project</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <div className="card p-5 hover:shadow-md transition-all duration-200 cursor-pointer group h-full flex flex-col">
                {/* Color bar */}
                <div className="h-1.5 rounded-full mb-4" style={{ background: project.color }} />

                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                    {project.name}
                  </h3>
                  <span className={`badge-status ml-2 flex-shrink-0 ${STATUS_COLORS[project.status]}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                {project.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>
                )}

                {/* Tags */}
                {project.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${project.progress}%`, background: project.color }} />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                  <div className="flex -space-x-2">
                    {project.members?.slice(0, 4).map(({ user }) => (
                      <div key={user.id} className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold" title={`${user.firstName} ${user.lastName}`}>
                        {user.firstName[0]}
                      </div>
                    ))}
                    {project.members?.length > 4 && (
                      <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600">
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {project._count?.tasks || 0} tasks
                  </div>
                </div>

                {/* Dates */}
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(project.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' → '}
                  {new Date(project.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)} onSubmit={handleCreate} loading={creating} users={users} />
      )}
    </div>
  );
}
