import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const STATUS_COLORS = {
  TODO: '#6b7280',
  IN_PROGRESS: '#3b82f6',
  IN_REVIEW: '#f59e0b',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
  PLANNING: '#8b5cf6',
  ON_HOLD: '#f97316',
  ARCHIVED: '#6b7280',
};

const KPICard = ({ title, value, subtitle, icon, color = 'blue', to }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const content = (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-600 mt-0.5">{title}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await reportsAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  const taskChartData = (data?.taskStatusBreakdown || []).map(t => ({
    name: t.status.replace('_', ' '),
    count: t._count.status,
    fill: STATUS_COLORS[t.status] || '#6b7280',
  }));

  const projectChartData = (data?.projectStatusBreakdown || []).map(p => ({
    name: p.status.replace('_', ' '),
    value: p._count.status,
    fill: STATUS_COLORS[p.status] || '#6b7280',
  }));

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Projects"
          value={data?.stats?.activeProjects || 0}
          subtitle={`${data?.stats?.totalProjects || 0} total`}
          icon="📁"
          color="blue"
          to="/projects"
        />
        <KPICard
          title="My Tasks"
          value={data?.stats?.myTasks || 0}
          subtitle={`${data?.stats?.totalTasks || 0} total assigned`}
          icon="✅"
          color="green"
          to="/tasks"
        />
        <KPICard
          title="Overdue Tasks"
          value={data?.stats?.overdueTasks || 0}
          subtitle="Requires immediate attention"
          icon="⚠️"
          color="red"
          to="/tasks?status=overdue"
        />
        <KPICard
          title="Completion Rate"
          value={`${data?.stats?.taskCompletionRate || 0}%`}
          subtitle={`${data?.stats?.completedTasks || 0} tasks completed`}
          icon="🎯"
          color="purple"
        />
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Status Chart */}
        <div className="card p-5 col-span-1">
          <h3 className="font-semibold text-gray-900 mb-4">Task Status Breakdown</h3>
          {taskChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={taskChartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {taskChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No task data</div>
          )}
        </div>

        {/* Project Status Pie */}
        <div className="card p-5 col-span-1">
          <h3 className="font-semibold text-gray-900 mb-4">Projects by Status</h3>
          {projectChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={projectChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                    {projectChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {projectChartData.map((item, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs text-gray-600">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.fill }} />
                    {item.name}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No project data</div>
          )}
        </div>

        {/* Upcoming Milestones */}
        <div className="card p-5 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Upcoming Milestones</h3>
            <span className="text-xs text-gray-500">Next 14 days</span>
          </div>
          {data?.upcomingMilestones?.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingMilestones.map((m) => {
                const daysLeft = Math.ceil((new Date(m.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={m.id} className="flex items-start gap-3">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: m.project?.color || '#3b82f6' }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                      <p className="text-xs text-gray-500 truncate">{m.project?.name}</p>
                      <span className={`text-xs font-medium ${daysLeft <= 3 ? 'text-red-600' : 'text-orange-600'}`}>
                        {daysLeft === 0 ? 'Due today' : daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">No upcoming milestones</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
        {data?.recentActivity?.length > 0 ? (
          <div className="space-y-3">
            {data.recentActivity.slice(0, 8).map((log) => (
              <div key={log.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold flex-shrink-0">
                  {log.user?.firstName?.[0]}{log.user?.lastName?.[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{log.user?.firstName} {log.user?.lastName}</span>
                    {' '}
                    <span className="text-gray-500">{log.action.toLowerCase()}</span>
                    {' '}
                    <span className="text-gray-700">{log.entity}</span>
                    {log.details?.name && <span className="text-gray-500"> — {log.details.name}</span>}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">No recent activity</div>
        )}
      </div>
    </div>
  );
}
