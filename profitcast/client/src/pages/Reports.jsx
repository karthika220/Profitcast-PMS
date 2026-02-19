import { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

export default function Reports() {
  const [activeReport, setActiveReport] = useState('project-health');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchReport(); }, [activeReport]);

  const fetchReport = async () => {
    setLoading(true);
    setData(null);
    try {
      let res;
      if (activeReport === 'project-health') res = await reportsAPI.getProjectHealth();
      else if (activeReport === 'employee-workload') res = await reportsAPI.getEmployeeWorkload();
      else if (activeReport === 'timesheet-summary') res = await reportsAPI.getTimesheetSummary();
      setData(res?.data);
    } catch {}
    finally { setLoading(false); }
  };

  const REPORTS = [
    { id: 'project-health', label: 'Project Health', icon: '📊' },
    { id: 'employee-workload', label: 'Employee Workload', icon: '👥' },
    { id: 'timesheet-summary', label: 'Timesheet Summary', icon: '⏱️' },
  ];

  const STATUS_COLORS = {
    PLANNING: '#8b5cf6',
    IN_PROGRESS: '#3b82f6',
    ON_HOLD: '#f97316',
    COMPLETED: '#10b981',
    ARCHIVED: '#6b7280',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Data-driven insights for informed decisions</p>
      </div>

      {/* Report tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {REPORTS.map(r => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeReport === r.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}
          >
            <span>{r.icon}</span> {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : (
        <>
          {activeReport === 'project-health' && data && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Projects', value: data.length },
                  { label: 'Active', value: data.filter(p => p.status === 'IN_PROGRESS').length },
                  { label: 'Completed', value: data.filter(p => p.status === 'COMPLETED').length },
                  { label: 'Overdue Tasks', value: data.reduce((s, p) => s + p.overdueTasks, 0) },
                ].map(s => (
                  <div key={s.label} className="card p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                    <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Project Progress Overview</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data} margin={{ bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="totalTasks" name="Total Tasks" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completedTasks" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="overdueTasks" name="Overdue" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-gray-900">Project Details</h3></div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Project</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Progress</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tasks</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Overdue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                            <span className="text-sm font-medium text-gray-900">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="badge-status text-xs" style={{ background: `${STATUS_COLORS[p.status]}20`, color: STATUS_COLORS[p.status] }}>
                            {p.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 bg-gray-100 rounded-full w-24">
                              <div className="h-full rounded-full bg-blue-500" style={{ width: `${p.progress}%` }} />
                            </div>
                            <span className="text-sm text-gray-700 font-medium">{p.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{p.completedTasks}/{p.totalTasks}</td>
                        <td className="px-6 py-4">
                          {p.overdueTasks > 0 ? (
                            <span className="text-red-600 font-semibold text-sm">{p.overdueTasks}</span>
                          ) : <span className="text-gray-400 text-sm">0</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'employee-workload' && data && (
            <div className="space-y-6">
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Hours Logged per Employee</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data} margin={{ bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="firstName" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(val, name) => [name === 'totalHoursLogged' ? `${val}h` : val, name === 'totalHoursLogged' ? 'Hours' : name.replace(/([A-Z])/g, ' $1')]} />
                    <Bar dataKey="totalHoursLogged" name="Hours Logged" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card overflow-hidden">
                <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-gray-900">Employee Details</h3></div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Active Tasks</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Completed</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Hours Logged</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.map(emp => (
                      <tr key={emp.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">{emp.firstName[0]}</div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                              <p className="text-xs text-gray-400">{emp.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{emp.role.replace('_', ' ')}</td>
                        <td className="px-6 py-4 text-sm font-medium text-blue-600">{emp.activeTasks}</td>
                        <td className="px-6 py-4 text-sm font-medium text-green-600">{emp.completedTasks}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{emp.totalHoursLogged.toFixed(1)}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'timesheet-summary' && data && (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Timesheet Entries</h3>
                <span className="text-sm text-gray-500">{data.length} entries</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Task</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Hours</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.slice(0, 50).map(ts => (
                    <tr key={ts.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{ts.user?.firstName} {ts.user?.lastName}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 truncate max-w-xs">{ts.task?.title}</p>
                        {ts.task?.project && <p className="text-xs text-gray-400">{ts.task.project.name}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(ts.date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">{ts.hoursLogged}h</td>
                      <td className="px-6 py-4">
                        <span className={`badge-status ${ts.isBillable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {ts.isBillable ? 'Billable' : 'Non-billable'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
