import React, { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import { useAuth } from '@context/AuthContext';
import { Edit, Save, CheckCircle } from '@mui/icons-material';
import apiClient from '../../services/api';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  designation: string;
  bio: string;
  location: string;
}

export const RecruiterProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    company_name: '',
    designation: '',
    bio: '',
    location: '',
  });

  // Load profile from API
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiClient.get('/auth/profile/');
        if (response.data.status && response.data.data) {
          const p = response.data.data;
          setFormData(prev => ({
            ...prev,
            phone: p.phone || '',
            company_name: p.company_name || '',
            designation: p.designation || '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await apiClient.put('/auth/profile/', {
        phone: formData.phone,
        company_name: formData.company_name,
        designation: formData.designation,
        bio: formData.bio,
        location: formData.location,
      });
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        action={
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="btn-primary"
            disabled={saving}
          >
            {isEditing ? (
              <><Save style={{ fontSize: 18 }} /> {saving ? 'Saving...' : 'Save Changes'}</>
            ) : (
              <><Edit style={{ fontSize: 18 }} /> Edit Profile</>
            )}
          </button>
        }
      />

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2">
          <CheckCircle style={{ fontSize: 18 }} className="text-emerald-600" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400">Profile saved successfully.</p>
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="card-base p-6 space-y-6">
        {/* Personal Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="input-label">First Name</label>
              <input type="text" name="first_name" value={formData.first_name} disabled className="input-base bg-gray-100 dark:bg-[#1a1a1a] cursor-not-allowed" />
            </div>
            <div>
              <label className="input-label">Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} disabled className="input-base bg-gray-100 dark:bg-[#1a1a1a] cursor-not-allowed" />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input type="email" name="email" value={formData.email} disabled className="input-base bg-gray-100 dark:bg-[#1a1a1a] cursor-not-allowed" />
            </div>
            <div>
              <label className="input-label">Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} placeholder="Enter your phone number" className="input-base disabled:bg-gray-100 dark:disabled:bg-[#1a1a1a]" />
            </div>
            <div className="md:col-span-2">
              <label className="input-label">Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., Bangalore, India" className="input-base disabled:bg-gray-100 dark:disabled:bg-[#1a1a1a]" />
            </div>
          </div>
        </div>

        {/* Company Section */}
        <div className="border-t border-gray-200 dark:border-[#222222] pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="input-label">Company Name</label>
              <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., Tech Corp Inc." className="input-base disabled:bg-gray-100 dark:disabled:bg-[#1a1a1a]" />
            </div>
            <div>
              <label className="input-label">Designation</label>
              <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., HR Manager" className="input-base disabled:bg-gray-100 dark:disabled:bg-[#1a1a1a]" />
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="border-t border-gray-200 dark:border-[#222222] pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bio</h3>
          <textarea name="bio" value={formData.bio} onChange={handleInputChange} disabled={!isEditing} placeholder="Tell us about yourself..." className="input-base disabled:bg-gray-100 dark:disabled:bg-[#1a1a1a] w-full" rows={4} />
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfile;
