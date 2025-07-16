import React, { useState } from 'react';
import { User2, Edit3, Save, X } from 'lucide-react';
import { useAuthStore } from '../../../store/auth.store';
import type { User } from '../../../types/auth';

interface ProfileSettingsProps {
  user: User;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    gender: user.gender || '',
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
  });

  const { updateUserInfo, isUpdatingProfile } = useAuthStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const updateData: any = {};
      
      // Only include fields that have values
      if (formData.fullName.trim()) updateData.fullName = formData.fullName.trim();
      if (formData.email.trim()) updateData.email = formData.email.trim();
      if (formData.gender) updateData.gender = formData.gender;
      if (formData.dateOfBirth) updateData.dateOfBirth = formData.dateOfBirth;

      await updateUserInfo(updateData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      gender: user.gender || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    });
    setIsEditing(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (!isEditing) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <User2 className="w-4 h-4" />
            Profile Information
          </h3>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Edit3 className="w-3 h-3" />
            Edit
          </button>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Full Name:</span>
            <span className="text-gray-800 font-medium">{user.fullName || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="text-gray-800 font-medium">{user.email || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Gender:</span>
            <span className="text-gray-800 font-medium capitalize">{user.gender || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date of Birth:</span>
            <span className="text-gray-800 font-medium">{formatDate(user.dateOfBirth)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <User2 className="w-4 h-4" />
          Edit Profile Information
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isUpdatingProfile}
            className="flex items-center gap-1 px-3 py-1 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
          <button
            onClick={handleCancel}
            disabled={isUpdatingProfile}
            className="flex items-center gap-1 px-3 py-1 text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
