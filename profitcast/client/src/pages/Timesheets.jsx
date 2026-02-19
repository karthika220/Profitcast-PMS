import { useState, useEffect } from 'react';
import { timesheetsAPI, tasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Timesheets() {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    taskId: '', date: new Date().toISOString().split('T')[0],
    hoursLogged: '', description: '', isBillable: true,
  });
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  useEffect(() => { fetchTimesheets(); }, [filters]);
  useEffect(() => {
    tasksAPI.getAll({ limit: 100 }).then(r => setTasks(r.data.tasks));
  }, []);

  const fetchTimesheets = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const res = await timesheetsAPI.getAll(params);
      setTimesheets(res.data.timesheets);
    } catch {}
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await timesheetsAPI.log(form);
      setShowForm(false);
      setForm({ taskId: '', date: new Date().toISOString().split('T')[0], hoursLogged: '', description: '', isBillable: true });
      fetchTimesheets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log time');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this time log?')) return;
    try { await timesheetsAPI.delete(id); fetchTimesheets(); } catch {}
  };

  const totalHours = timesheets.reduce((sum, t) => sum + t.hoursLogged, 0);
  const billableHours = timesheets.filter(t => t.isBillable).reduce((sum, t) => sum + t.hoursLogged, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
          <p className="text-gray-500 text-sm mt-1">Track your work hours</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Log Time</button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Logs', value: timesheets.length, icon: '📋', color: 'text-gray-900' },
          { label: 'Total Hours', value: `${totalHours.toFixed(1)}h`, icon: '⏱️', color: 'text-blue-600' },
          { label: 'Billable Hours', value: `${billableHours.toFixed(1)}h`, icon: '💰', color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input type="date" className="input-field text-sm" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input type="date" className="input-field text-sm" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
        </div>
        <div className="flex items-end">
          <button onClick={() => setFilters({ startDate: '', endDate: '' })} className="btn-secondary text-sm">Clear</button>
        </div>
      </div>

      {showForm && (
        <div className="card p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Log New Time Entry</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Task *</label>
              <select className="input-field" value={form.taskId} onChange={e => setForm({...form, taskId: e.target.value})} required>
                <option value="">Select task</option>
                {tasks.map(t => <option key={t.id} value={t.id}>{t.project?.name ? `[${t.project.name}] ` : ''}{t.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" className="input-field" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours *</label>
              <input type="number" step="0.5" min="0.5" max="24" className="input-field" value={form.hoursLogged} onChange={e => setForm({...form, hoursLogged: e.target.value})} required placeholder="e.g. 2.5" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input className="input-field" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="What did you work on?" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="billable" checked={form.isBillable} onChange={e => setForm({...form, isBillable: e.target.checked})} className="rounded" />
              <label htmlFor="billable" className="text-sm text-gray-700 font-medium">Mark as billable</label>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Logging...' : 'Log Time'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Task</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Employee</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Hours</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Description</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {timesheets.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No time entries found</td></tr>
              ) : timesheets.map(ts => (
                <tr key={ts.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{new Date(ts.date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{ts.task?.title}</p>
                    {ts.task?.project && <p className="text-xs text-gray-400">{ts.task.project.name}</p>}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">{ts.user?.firstName[0]}</div>
                      <span className="text-sm text-gray-700">{ts.user?.firstName} {ts.user?.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-blue-600">{ts.hoursLogged}h</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell max-w-xs truncate">{ts.description || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`badge-status ${ts.isBillable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {ts.isBillable ? 'Billable' : 'Non-billable'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(ts.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
