import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import Tabs from '@components/Tabs';
import { useAuth } from '@context/AuthContext';
import { Person, Lock, Notifications as NotifIcon, Delete, Save, Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';
import apiClient from '../../services/api';
export const CandidateSettings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('account');
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);
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
            }
            catch (err) {
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
        }
        catch (err) {
            setError('Failed to save changes. Please try again.');
        }
        finally {
            setSaving(false);
        }
    };
    const tabs = [
        { id: 'account', label: 'Account', icon: _jsx(Person, { style: { fontSize: 16 } }) },
        { id: 'security', label: 'Security', icon: _jsx(Lock, { style: { fontSize: 16 } }) },
        { id: 'notifications', label: 'Preferences', icon: _jsx(NotifIcon, { style: { fontSize: 16 } }) },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Settings", description: "Manage your account, security, and notification preferences." }), _jsx(Tabs, { tabs: tabs, activeTab: activeTab, onChange: setActiveTab }), saved && (_jsxs("div", { className: "p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2", children: [_jsx(CheckCircle, { style: { fontSize: 18 }, className: "text-emerald-600" }), _jsx("p", { className: "text-sm text-emerald-700 dark:text-emerald-400", children: "Changes saved successfully." })] })), error && (_jsx("div", { className: "p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50", children: _jsx("p", { className: "text-sm text-red-700 dark:text-red-400", children: error }) })), _jsxs("div", { className: "max-w-2xl", children: [activeTab === 'account' && (_jsxs("div", { className: "card-base p-6 space-y-6 animate-fadeIn", children: [_jsx("h2", { className: "section-header", children: "Account Information" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "input-label", children: "First Name" }), _jsx("input", { type: "text", value: form.first_name, disabled: true, className: "input-base bg-gray-100 dark:bg-[#1a1a1a] cursor-not-allowed" }), _jsx("p", { className: "text-[10px] text-gray-400 mt-1", children: "Contact support to change name" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Last Name" }), _jsx("input", { type: "text", value: form.last_name, disabled: true, className: "input-base bg-gray-100 dark:bg-[#1a1a1a] cursor-not-allowed" })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "input-label", children: "Email" }), _jsx("input", { type: "email", value: form.email, disabled: true, className: "input-base bg-gray-100 dark:bg-[#1a1a1a] cursor-not-allowed" })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "input-label", children: "Phone" }), _jsx("input", { type: "tel", value: form.phone, onChange: e => setForm({ ...form, phone: e.target.value }), className: "input-base", placeholder: "Enter your phone number" })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "input-label", children: "Location" }), _jsx("input", { type: "text", value: form.location, onChange: e => setForm({ ...form, location: e.target.value }), className: "input-base", placeholder: "e.g., Bangalore, India" })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "input-label", children: "Bio" }), _jsx("textarea", { value: form.bio, onChange: e => setForm({ ...form, bio: e.target.value }), className: "input-base min-h-[80px] resize-y", placeholder: "Tell us about yourself..." })] })] }), _jsx("div", { className: "flex justify-end", children: _jsxs("button", { onClick: handleSave, className: "btn-primary", disabled: saving, children: [_jsx(Save, { style: { fontSize: 16 } }), " ", saving ? 'Saving...' : 'Save Changes'] }) })] })), activeTab === 'security' && (_jsxs("div", { className: "space-y-6 animate-fadeIn", children: [_jsxs("div", { className: "card-base p-6 space-y-6", children: [_jsx("h2", { className: "section-header", children: "Change Password" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Current Password" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPassword ? 'text' : 'password', value: passwords.current, onChange: e => setPasswords({ ...passwords, current: e.target.value }), className: "input-base pr-10", placeholder: "Enter current password" }), _jsx("button", { onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400", children: showPassword ? _jsx(VisibilityOff, { style: { fontSize: 18 } }) : _jsx(Visibility, { style: { fontSize: 18 } }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "New Password" }), _jsx("input", { type: "password", value: passwords.new_password, onChange: e => setPasswords({ ...passwords, new_password: e.target.value }), className: "input-base", placeholder: "Enter new password" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Confirm New Password" }), _jsx("input", { type: "password", value: passwords.confirm, onChange: e => setPasswords({ ...passwords, confirm: e.target.value }), className: "input-base", placeholder: "Confirm new password" })] })] }), _jsx("div", { className: "flex justify-end", children: _jsxs("button", { onClick: () => { }, className: "btn-primary", children: [_jsx(Lock, { style: { fontSize: 16 } }), " Update Password"] }) })] }), _jsxs("div", { className: "card-base p-6 border-red-200 dark:border-red-900/30", children: [_jsx("h2", { className: "text-lg font-bold text-red-600 dark:text-red-400 mb-2", children: "Danger Zone" }), _jsx("p", { className: "text-sm text-gray-600 dark:text-zinc-400 mb-4", children: "Once you delete your account, there is no going back. All your data, resumes, and applications will be permanently removed." }), _jsxs("button", { className: "btn-danger text-sm", children: [_jsx(Delete, { style: { fontSize: 16 } }), " Delete Account"] })] })] })), activeTab === 'notifications' && (_jsxs("div", { className: "card-base p-6 space-y-6 animate-fadeIn", children: [_jsx("h2", { className: "section-header", children: "Notification Preferences" }), _jsx("div", { className: "space-y-4", children: [
                                    { key: 'email_notifs', label: 'Email Notifications', desc: 'Receive updates via email' },
                                    { key: 'sms_notifs', label: 'SMS Notifications', desc: 'Get text message alerts' },
                                    { key: 'whatsapp_notifs', label: 'WhatsApp Notifications', desc: 'Receive WhatsApp messages' },
                                    { key: 'job_alerts', label: 'Job Alerts', desc: 'Get notified about matching jobs' },
                                    { key: 'interview_reminders', label: 'Interview Reminders', desc: 'Receive interview schedule reminders' },
                                    { key: 'marketing', label: 'Marketing Emails', desc: 'Tips, updates, and product news' },
                                ].map(item => (_jsxs("div", { className: "flex items-center justify-between py-3 border-b border-gray-100 dark:border-[#222222]/50 last:border-0", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: item.label }), _jsx("p", { className: "text-xs text-gray-500 dark:text-zinc-400", children: item.desc })] }), _jsx("button", { onClick: () => setPrefs({ ...prefs, [item.key]: !prefs[item.key] }), className: `relative w-11 h-6 rounded-full transition-colors ${prefs[item.key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-zinc-600'}`, children: _jsx("span", { className: "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform left-0.5", style: { transform: prefs[item.key] ? 'translateX(22px)' : 'translateX(0)' } }) })] }, item.key))) }), _jsx("div", { className: "flex justify-end", children: _jsxs("button", { onClick: handleSave, className: "btn-primary", children: [_jsx(Save, { style: { fontSize: 16 } }), " Save Preferences"] }) })] }))] })] }));
};
export default CandidateSettings;
