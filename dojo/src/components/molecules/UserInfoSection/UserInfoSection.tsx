import React from 'react';
import { User as UserIcon, Mail, Phone, Calendar, CreditCard, Briefcase, Award, Building } from 'lucide-react';
import type { User } from '../../constants/types';
import { Input } from '../../atoms/Inputs/Inputs';
import { Icon } from '../../atoms/LucidIcons/LucidIcons';

interface UserInfoSectionProps {
  user: User;
}

export const UserInfoSection: React.FC<UserInfoSectionProps> = ({ user }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">User Information</h4>
      <div className="space-y-8 p-4 bg-gray-50 rounded-lg">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Full Name"
            type="text"
            id="fullName"
            // value={`${user.first_name} ${user.last_name}`}
            value={[user.first_name, user.last_name].filter(Boolean).join(" ")}
            onChange={() => {}}
            icon={<Icon icon={UserIcon} className="text-gray-400" />}
            disabled
          />
          <Input
            label="Temp ID"
            type="text"
            id="tempId"
            value={user.temp_id}
            onChange={() => {}}
            icon={<Icon icon={UserIcon} className="text-gray-400" />}
            disabled
          />
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Email"
            type="email"
            id="email"
            value={user.email}
            onChange={() => {}}
            icon={<Icon icon={Mail} className="text-gray-400" />}
            
          />
          <Input
            label="Phone Number"
            type="text"
            id="phoneNumber"
            value={user.phone_number}
            onChange={() => {}}
            icon={<Icon icon={Phone} className="text-gray-400" />}
            disabled
          />
        </div>

        {/* Identity and Employment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Aadhar Number"
            type="text"
            id="aadharNumber"
            value={user.aadharNumber || 'N/A'}
            onChange={() => {}}
            icon={<Icon icon={CreditCard} className="text-gray-400" />}
            disabled
          />
          <Input
            label="Created Date"
            type="text"
            id="createdDate"
            value={formatDate(user.created_at)}
            onChange={() => {}}
            icon={<Icon icon={Calendar} className="text-gray-400" />}
            disabled
          />
        </div>

        {/* Employment Type */}
        <div>
          <label className="font-medium text-gray-700 mb-4 block">Employment Type:</label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="employmentTypeDisplay"
                value="contractual"
                checked={user.employment_type === 'contractual'}
                onChange={() => {}}
                disabled
                className="opacity-60"
              />
              <span className={user.employment_type === 'contractual' ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                Contractual
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="employmentTypeDisplay"
                value="permanent"
                checked={user.employment_type === 'permanent'}
                onChange={() => {}}
                disabled
                className="opacity-60"
              />
              <span className={user.employment_type === 'permanent' ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                Permanent
              </span>
            </label>
            {!user.employment_type && (
              <span className="text-gray-500 italic">Not specified</span>
            )}
          </div>
        </div>

        {/* Experience Section */}
        <div>
          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={user.hasExperience}
              onChange={() => {}}
              disabled
              className="opacity-60"
            />
            <span className={user.hasExperience ? 'text-gray-900 font-medium' : 'text-gray-500'}>
              Have Experience?
            </span>
          </label>

          {user.hasExperience && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input
                label="Years of Experience"
                type="text"
                id="experienceYears"
                value={user.experienceYears ? String(user.experienceYears) : 'N/A'}
                onChange={() => {}}
                icon={<Icon icon={Award} className="text-gray-400" />}
                disabled
              />
              <Input
                label="Company of Experience"
                type="text"
                id="companyOfExperience"
                value={user.companyOfExperience || 'N/A'}
                onChange={() => {}}
                icon={<Icon icon={Building} className="text-gray-400" />}
                disabled
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};