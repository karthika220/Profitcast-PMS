import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tasksAPI, timesheetsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  TODO: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, canCreateTasks } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [showLogTime, setShowLogTime] = useState(false);
  const [timeLog, setTimeLog] = useState({ date: new Date().toISOString().split('T')[0], hoursLogged: '', description: '' });
  const [loggingTime, setLoggingTime] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const res = await tasksAPI.getById(id);
      setTask(res.data);
      setStatus(res.data.status);
    } catch { navigate('/tasks'); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await tasksAPI.update(id, { status: newStatus });
      setStatus(newStatus);
      setTask({ ...task, status: newStatus });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleLogTime = async (e) => {
    e.preventDefault();
    setLoggingTime(true);
    try {
      await timesheetsAPI.log({ ...timeLog, taskId: id });
      setShowLogTime(false);
      setTimeLog({ date: new Date().toISOString().split('T')[0], hoursLogged: '', description: '' });
      fetchTask();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log time');
    } finally {
      setLoggingTime(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(id);
      navigate('/tasks');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  if (!task) return null;

  const totalHours = task.timesheets?.reduce((sum, t) => sum + t.hoursLogged, 0) || 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/tasks" className="hover:text-gray-700">Tasks</Link>
        <span>/</span>
        {task.project && (
          <>
            <Link to={`/projects/${task.project.id}`} className="hover:text-gray-700" style={{ color: task.project.color }}>{task.project.name}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 font-medium truncate">{task.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-xl font-bold text-gray-900">{task.title}</h1>
              <div className="flex gap-2 flex-shrink-0">
                {canCreateTasks() && (
                  <button onClick={handleDelete} className="btn-danger text-xs px-3 py-1.5">Delete</button>
                )}
              </div>
            </div>

            {task.description && <p className="text-gray-600 text-sm mb-4">{task.description}</p>}

            {task.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((tag, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Subtasks */}
          {task.subtasks?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Subtasks ({task.subtasks.length})</h3>
              <div className="space-y-2">
                {task.subtasks.map(st => (
                  <Link key={st.id} to={`/tasks/${st.id}`}>
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                      <span className={`badge-status ${STATUS_COLORS[st.status]}`}>{st.status.replace('_', ' ')}</span>
                      <span className="text-sm text-gray-700 flex-1">{st.title}</span>
                      {st.assignee && <span className="text-xs text-gray-400">{st.assignee.firstName}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Comments ({task.comments?.length || 0})</h3>
            {task.comments?.length === 0 ? (
              <p className="text-sm text-gray-400">No comments yet</p>
            ) : (
              <div className="space-y-4">
                {task.comments?.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {comment.user.firstName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{comment.user.firstName} {comment.user.lastName}</span>
                        <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Time logs */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Time Logged ({totalHours.toFixed(1)} hrs)</h3>
              <button onClick={() => setShowLogTime(!showLogTime)} className="btn-secondary text-xs">+ Log Time</button>
            </div>

            {showLogTime && (
              <form onSubmit={handleLogTime} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" className="input-field text-sm" value={timeLog.date} onChange={e => setTimeLog({...timeLog, date: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Hours</label>
                    <input type="number" step="0.5" min="0.5" className="input-field text-sm" value={timeLog.hoursLogged} onChange={e => setTimeLog({...timeLog, hoursLogged: e.target.value})} required placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                  <input className="input-field text-sm" value={timeLog.description} onChange={e => setTimeLog({...timeLog, description: e.target.value})} placeholder="What did you work on?" />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowLogTime(false)} className="btn-secondary text-xs px-3">Cancel</button>
                  <button type="submit" disabled={loggingTime} className="btn-primary text-xs px-3">{loggingTime ? 'Logging...' : 'Log Time'}</button>
                </div>
              </form>
            )}

            {task.timesheets?.length > 0 ? (
              <div className="space-y-2">
                {task.timesheets.slice(0, 5).map(ts => (
                  <div key={ts.id} className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">{ts.user.firstName[0]}</div>
                    <span className="text-gray-600 flex-1">{ts.description || 'Work logged'}</span>
                    <span className="text-blue-600 font-medium">{ts.hoursLogged}h</span>
                    <span className="text-gray-400 text-xs">{new Date(ts.date).toLocaleDateString('en-IN', {day:'numeric',month:'short'})}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No time logged yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-400 uppercase font-medium mb-1">Status</dt>
                <select value={status} onChange={e => handleStatusUpdate(e.target.value)} className={`w-full border-0 rounded-lg px-3 py-1.5 text-sm font-medium cursor-pointer ${STATUS_COLORS[status]}`}>
                  <option value="TODO">Todo</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div>
                <dt className="text-xs text-gray-400 uppercase font-medium mb-1">Priority</dt>
                <dd className="text-sm text-gray-900 font-medium">{task.priority}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 uppercase font-medium mb-1">Assignee</dt>
                <dd className="text-sm">
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">{task.assignee.firstName[0]}</div>
                      <span>{task.assignee.firstName} {task.assignee.lastName}</span>
                    </div>
                  ) : <span className="text-gray-400">Unassigned</span>}
                </dd>
              </div>
              {task.dueDate && (
                <div>
                  <dt className="text-xs text-gray-400 uppercase font-medium mb-1">Due Date</dt>
                  <dd className={`text-sm font-medium ${new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'text-red-600' : 'text-gray-900'}`}>
                    {new Date(task.dueDate).toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}
                  </dd>
                </div>
              )}
              {task.estimatedHours && (
                <div>
                  <dt className="text-xs text-gray-400 uppercase font-medium mb-1">Estimated</dt>
                  <dd className="text-sm text-gray-900">{task.estimatedHours} hours</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-400 uppercase font-medium mb-1">Logged</dt>
                <dd className="text-sm text-gray-900">{totalHours.toFixed(1)} hours</dd>
              </div>
              {task.project && (
                <div>
                  <dt className="text-xs text-gray-400 uppercase font-medium mb-1">Project</dt>
                  <dd>
                    <Link to={`/projects/${task.project.id}`} className="text-sm font-medium hover:underline" style={{ color: task.project.color }}>
                      {task.project.name}
                    </Link>
                  </dd>
                </div>
              )}
              {task.milestone && (
                <div>
                  <dt className="text-xs text-gray-400 uppercase font-medium mb-1">Milestone</dt>
                  <dd className="text-sm text-gray-900">📌 {task.milestone.name}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-400 uppercase font-medium mb-1">Created</dt>
                <dd className="text-sm text-gray-500">{new Date(task.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</dd>
              </div>
              {task.completedAt && (
                <div>
                  <dt className="text-xs text-gray-400 uppercase font-medium mb-1">Completed</dt>
                  <dd className="text-sm text-green-600">{new Date(task.completedAt).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Creator</h3>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-bold">{task.creator?.firstName[0]}</div>
              <div>
                <p className="text-sm font-medium text-gray-900">{task.creator?.firstName} {task.creator?.lastName}</p>
                <p className="text-xs text-gray-400">Creator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
