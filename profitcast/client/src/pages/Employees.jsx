import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = { MD: 'Managing Director', HR_MANAGER: 'HR & Manager', TEAM_LEAD: 'Team Lead', EMPLOYEE: 'Employee' };
const ROLE_COLORS = {
  MD: 'bg-purple-100 text-purple-700',
  HR_MANAGER: 'bg-blue-100 text-blue-700',
  TEAM_LEAD: 'bg-orange-100 text-orange-700',
  EMPLOYEE: 'bg-green-100 text-green-700',
};

const EmployeeModal = ({ employee, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState(employee ? {
    firstName: employee.firstName, lastName: employee.lastName,
    email: employee.email, role: employee.role, department: employee.department || '',
    phone: employee.phone || '', birthday: employee.birthday?.split('T')[0] || '',
    joinDate: employee.joinDate?.split('T')[0] || '', isActive: employee.isActive,
  } : {
    firstName: '', lastName: '', email: '', password: 'Password123!',
    role: 'EMPLOYEE', department: '', phone: '', birthday: '', joinDate: new Date().toISOString().split('T')[0],
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{employee ? 'Edit Employee' : 'Add Employee'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input className="input-field" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input className="input-field" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} disabled={!!employee} />
          </div>
          {!employee && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" className="input-field" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select className="input-field" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input className="input-field" value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="Engineering" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91-9876543210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
              <input type="date" className="input-field" value={form.joinDate} onChange={e => setForm({...form, joinDate: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
            <input type="date" className="input-field" value={form.birthday} onChange={e => setForm({...form, birthday: e.target.value})} />
          </div>
          {employee && (
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="rounded" />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active Employee</label>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={() => onSubmit(form)} disabled={loading || !form.firstName || !form.lastName || !form.email} className="btn-primary">
            {loading ? 'Saving...' : employee ? 'Save Changes' : 'Add Employee'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Employees() {
  const { canManageUsers } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, [search, roleFilter]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await usersAPI.getAll(params);
      setEmployees(res.data.users);
    } catch {}
    finally { setLoading(false); }
  };

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await usersAPI.create(form);
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create employee');
    } finally { setSaving(false); }
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      await usersAPI.update(editEmployee.id, form);
      setEditEmployee(null);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update employee');
    } finally { setSaving(false); }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this employee?')) return;
    try {
      await usersAPI.delete(id);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-500 text-sm mt-1">{employees.length} employee{employees.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <input className="input-field w-48" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="input-field w-40" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {canManageUsers() && (
            <button onClick={() => setShowModal(true)} className="btn-primary whitespace-nowrap">+ Add Employee</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Department</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Join Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                {canManageUsers() && <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No employees found</td></tr>
              ) : employees.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-gray-400">{emp.email}</p>
                        {emp.phone && <p className="text-xs text-gray-400">{emp.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`badge-status ${ROLE_COLORS[emp.role]}`}>{ROLE_LABELS[emp.role]}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">{emp.department || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden xl:table-cell">
                    {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge-status ${emp.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {canManageUsers() && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditEmployee(emp)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                        {emp.isActive && (
                          <button onClick={() => handleDeactivate(emp.id)} className="text-red-600 hover:text-red-700 text-sm font-medium">Deactivate</button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <EmployeeModal onClose={() => setShowModal(false)} onSubmit={handleCreate} loading={saving} />
      )}
      {editEmployee && (
        <EmployeeModal employee={editEmployee} onClose={() => setEditEmployee(null)} onSubmit={handleUpdate} loading={saving} />
      )}
    </div>
  );
}
