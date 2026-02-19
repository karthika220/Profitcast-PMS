import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsAPI.getAll();
      setSettings(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  const handleSave = async (key, value) => {
    setSaving(true);
    try {
      await settingsAPI.update(key, { value });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save settings');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure your organization's preferences</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          ✅ Settings saved successfully
        </div>
      )}

      <div className="space-y-6">
        {/* Company Info */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">🏢 Company Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <div className="flex gap-3">
                <input
                  className="input-field"
                  value={settings.company_name?.value || ''}
                  onChange={e => setSettings({ ...settings, company_name: { value: e.target.value } })}
                  placeholder="Company Name"
                />
                <button onClick={() => handleSave('company_name', settings.company_name)} disabled={saving} className="btn-primary whitespace-nowrap">Save</button>
              </div>
            </div>
          </div>
        </div>

        {/* Work Hours */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">⏰ Operating Hours</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                className="input-field"
                value={settings.work_hours?.start || '09:00'}
                onChange={e => setSettings({ ...settings, work_hours: { ...settings.work_hours, start: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                className="input-field"
                value={settings.work_hours?.end || '18:45'}
                onChange={e => setSettings({ ...settings, work_hours: { ...settings.work_hours, end: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lunch Start</label>
              <input
                type="time"
                className="input-field"
                value={settings.work_hours?.lunch_start || '13:30'}
                onChange={e => setSettings({ ...settings, work_hours: { ...settings.work_hours, lunch_start: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lunch End</label>
              <input
                type="time"
                className="input-field"
                value={settings.work_hours?.lunch_end || '14:30'}
                onChange={e => setSettings({ ...settings, work_hours: { ...settings.work_hours, lunch_end: e.target.value } })}
              />
            </div>
          </div>
          <div className="mt-4">
            <button onClick={() => handleSave('work_hours', settings.work_hours)} disabled={saving} className="btn-primary">Save Hours</button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            📅 Working days: Monday – Saturday | Operating hours: 9:00 AM – 6:45 PM
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">🔔 Notification Settings</h2>
          <div className="space-y-3">
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Send notifications via email' },
              { key: 'inApp', label: 'In-App Notifications', desc: 'Show notifications within the application' },
              { key: 'taskAssigned', label: 'Task Assignment Alerts', desc: 'Notify when tasks are assigned' },
              { key: 'milestoneAlert', label: 'Milestone Reminders', desc: 'Alert 3 days before milestone due date' },
              { key: 'overdueAlert', label: 'Overdue Task Alerts', desc: 'Notify when tasks become overdue' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <button
                  onClick={() => {
                    const updated = { ...settings.notifications, [item.key]: !settings.notifications?.[item.key] };
                    setSettings({ ...settings, notifications: updated });
                    handleSave('notifications', updated);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notifications?.[item.key] ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${settings.notifications?.[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">ℹ️ System Information</h2>
          <dl className="grid grid-cols-2 gap-4">
            {[
              { label: 'Application Version', value: '1.0.0' },
              { label: 'Platform', value: 'Profitcast PMS' },
              { label: 'Operating Days', value: 'Monday – Saturday' },
              { label: 'Operating Hours', value: '9:00 AM – 6:45 PM' },
            ].map(item => (
              <div key={item.label}>
                <dt className="text-xs font-medium text-gray-400 uppercase mb-0.5">{item.label}</dt>
                <dd className="text-sm font-medium text-gray-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
