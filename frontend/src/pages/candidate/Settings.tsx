import React, { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import Tabs from '@components/Tabs';
import { useAuth } from '@context/AuthContext';
import { Person, Lock, Notifications as NotifIcon, Delete, Save, Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';
import apiClient from '../../services/api';

export const CandidateSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    location: '',
  });

  const [passwords, setPasswords] = useState({
    current: '', new_password: '', confirm: '',
  });

  const [prefs, setPrefs] = useState({
    email_notifs: true, sms_notifs: false, whatsapp_notifs: false,
    job_alerts: true, interview_reminders: true, marketing: false,
  });

  // Load profile data from API
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiClient.get('/auth/profile/');
        if (response.data.status && response.data.data) {
          const p = response.data.data;
          setForm(prev => ({
            ...prev,
            phone: p.phone || '',
            bio: p.bio || '',
            location: p.location || '',
          }));
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await apiClient.put('/auth/profile/', {
        phone: form.phone,
        bio: form.bio,
        location: form.location,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: <Person style={{ fontSize: 16 }} /> },
    { id: 'security', label: 'Security', icon: <Lock style={{ fontSize: 16 }} /> },
    { id: 'notifications', label: 'Preferences', icon: <NotifIcon style={{ fontSize: 16 }} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account, security, and notification preferences." />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Success/Error alerts */}
      {saved && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2">
          <CheckCircle style={{ fontSize: 18 }} className="text-emerald-600" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400">Changes saved successfully.</p>
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="max-w-2xl">
        {activeTab === 'account' && (
          <div className="card-base p-6 space-y-6 animate-fadeIn">
            <h2 className="section-header">Account Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">First Name</label>
                <input type="text" value={form.first_name} disabled className="input-base bg-gray-100 dark:bg-[#1a1a1a] cursor-not-allowed" />
                <p className="text-[10px] text-gray-400 mt-1">Contact support to change name</p>
              </div>
              <div>
                <label className="input-label">Last Name</label>
                <input type="text" value={form.last_name} disabled className="input-base bg-gray-100 dark:bg-[#1a1a1a] cursor-not-allowed" />
              </div>
              <div className="sm:col-span-2">
                <label className="input-label">Email</label>
                <input type="email" value={form.email} disabled className="input-base bg-gray-100 dark:bg-[#1a1a1a] cursor-not-allowed" />
              </div>
              <div className="sm:col-span-2">
                <label className="input-label">Phone</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-base" placeholder="Enter your phone number" />
              </div>
              <div className="sm:col-span-2">
                <label className="input-label">Location</label>
                <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-base" placeholder="e.g., Bangalore, India" />
              </div>
              <div className="sm:col-span-2">
                <label className="input-label">Bio</label>
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="input-base min-h-[80px] resize-y" placeholder="Tell us about yourself..." />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save style={{ fontSize: 16 }} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="card-base p-6 space-y-6">
              <h2 className="section-header">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="input-label">Current Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} className="input-base pr-10" placeholder="Enter current password" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <VisibilityOff style={{ fontSize: 18 }} /> : <Visibility style={{ fontSize: 18 }} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="input-label">New Password</label>
                  <input type="password" value={passwords.new_password} onChange={e => setPasswords({ ...passwords, new_password: e.target.value })} className="input-base" placeholder="Enter new password" />
                </div>
                <div>
                  <label className="input-label">Confirm New Password</label>
                  <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className="input-base" placeholder="Confirm new password" />
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={() => {}} className="btn-primary">
                  <Lock style={{ fontSize: 16 }} /> Update Password
                </button>
              </div>
            </div>

            <div className="card-base p-6 border-red-200 dark:border-red-900/30">
              <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
              <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
                Once you delete your account, there is no going back. All your data, resumes, and applications will be permanently removed.
              </p>
              <button className="btn-danger text-sm">
                <Delete style={{ fontSize: 16 }} /> Delete Account
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="card-base p-6 space-y-6 animate-fadeIn">
            <h2 className="section-header">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { key: 'email_notifs', label: 'Email Notifications', desc: 'Receive updates via email' },
                { key: 'sms_notifs', label: 'SMS Notifications', desc: 'Get text message alerts' },
                { key: 'whatsapp_notifs', label: 'WhatsApp Notifications', desc: 'Receive WhatsApp messages' },
                { key: 'job_alerts', label: 'Job Alerts', desc: 'Get notified about matching jobs' },
                { key: 'interview_reminders', label: 'Interview Reminders', desc: 'Receive interview schedule reminders' },
                { key: 'marketing', label: 'Marketing Emails', desc: 'Tips, updates, and product news' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-[#222222]/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setPrefs({ ...prefs, [item.key]: !prefs[item.key as keyof typeof prefs] })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      prefs[item.key as keyof typeof prefs] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-zinc-600'
                    }`}
                  >
                    <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform left-0.5" style={{ transform: prefs[item.key as keyof typeof prefs] ? 'translateX(22px)' : 'translateX(0)' }} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={handleSave} className="btn-primary">
                <Save style={{ fontSize: 16 }} /> Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateSettings;
