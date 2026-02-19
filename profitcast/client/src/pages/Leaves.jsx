import { useState, useEffect } from 'react';
import { leavesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
};

const LEAVE_TYPES = ['ANNUAL', 'SICK', 'EMERGENCY', 'MATERNITY', 'PATERNITY', 'UNPAID'];

export default function Leaves() {
  const { user, hasRole } = useAuth();
  const canApprove = hasRole('MD', 'HR_MANAGER');

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'ANNUAL', startDate: '', endDate: '', reason: '' });
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchLeaves(); }, [statusFilter]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const res = await leavesAPI.getAll(params);
      setLeaves(res.data.leaves);
    } catch {}
    finally { setLoading(false); }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await leavesAPI.apply(form);
      setShowForm(false);
      setForm({ type: 'ANNUAL', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply for leave');
    } finally { setSaving(false); }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await leavesAPI.updateStatus(id, { status });
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Cancel this leave request?')) return;
    try { await leavesAPI.delete(id); fetchLeaves(); } catch {}
  };

  const getDurationDays = (start, end) => {
    const diff = new Date(end) - new Date(start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const pending = leaves.filter(l => l.status === 'PENDING').length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-500 text-sm mt-1">{pending > 0 ? `${pending} pending request${pending !== 1 ? 's' : ''}` : 'Manage leave requests'}</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="input-field w-36" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Apply Leave</button>
        </div>
      </div>

      {showForm && (
        <div className="card p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Apply for Leave</h3>
          <form onSubmit={handleApply} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
              <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})} required>
                {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input type="date" className="input-field" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input type="date" className="input-field" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required min={form.startDate} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <textarea className="input-field resize-none" rows={3} value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Provide reason for leave..." required />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Applying...' : 'Submit Request'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : (
        <div className="space-y-3">
          {leaves.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-5xl mb-4">🌴</div>
              <h3 className="text-lg font-semibold text-gray-700">No leave requests</h3>
            </div>
          ) : leaves.map(leave => (
            <div key={leave.id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                        {leave.user?.firstName[0]}
                      </div>
                      <span className="font-semibold text-gray-900">{leave.user?.firstName} {leave.user?.lastName}</span>
                    </div>
                    <span className="badge-status bg-blue-50 text-blue-600">{leave.type}</span>
                    <span className={`badge-status ${STATUS_COLORS[leave.status]}`}>{leave.status}</span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-2">
                    <span>📅 {new Date(leave.startDate).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})} → {new Date(leave.endDate).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</span>
                    <span>⏳ {getDurationDays(leave.startDate, leave.endDate)} day{getDurationDays(leave.startDate, leave.endDate) !== 1 ? 's' : ''}</span>
                    {leave.user?.department && <span>🏢 {leave.user.department}</span>}
                  </div>

                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-2">{leave.reason}</p>

                  {leave.approver && (
                    <p className="text-xs text-gray-400">
                      {leave.status} by {leave.approver.firstName} {leave.approver.lastName}
                      {leave.approvedAt && ` on ${new Date(leave.approvedAt).toLocaleDateString('en-IN', {day:'numeric',month:'short'})}`}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {canApprove && leave.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleUpdateStatus(leave.id, 'APPROVED')} className="btn-primary text-xs px-4">✓ Approve</button>
                      <button onClick={() => handleUpdateStatus(leave.id, 'REJECTED')} className="btn-danger text-xs px-4">✗ Reject</button>
                    </>
                  )}
                  {leave.userId === user.id && leave.status === 'PENDING' && (
                    <button onClick={() => handleDelete(leave.id)} className="btn-secondary text-xs px-4 text-red-600 border-red-200 hover:bg-red-50">Cancel</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
