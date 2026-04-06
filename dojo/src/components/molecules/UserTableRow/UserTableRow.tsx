import React from 'react';
import { Mail, Phone, User as UserIcon, Trash2 } from 'lucide-react';
import type { User } from '../../constants/types';
import { Icon } from '../../atoms/LucidIcons/LucidIcons';
import { StatusBadge } from '../../atoms/StatusBadge/StatusBadge';

interface UserTableRowProps {
  user: User;
  onRowClick: (user: User) => void;
  onDelete: (tempId: string) => void;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({ user, onRowClick, onDelete }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid time';
    }
  };

  // Get the latest body check (using body_checks array instead of body_check)
  const latestCheck = user.body_checks && user.body_checks.length > 0
    ? user.body_checks[user.body_checks.length - 1]
    : null;

  const isPassed = latestCheck && latestCheck.overall_status === 'pass';
  const hasChecks = latestCheck !== null;
  const isAddedToMaster = user.is_added_to_master;

  // Updated conditional logic: onClick only works if NOT added to master AND status is pass
  const isClickable = !isAddedToMaster && isPassed;

  // Conditional onClick handler
  const handleRowClick = () => {
    if (isClickable) {
      onRowClick(user);
    }
  };

  // Updated cursor and hover styles based on clickable state
  const getRowClasses = () => {
    if (isAddedToMaster) {
      return "bg-gray-50 cursor-default opacity-60";
    } else if (isPassed) {
      return "hover:bg-gray-50 cursor-pointer hover:shadow-sm";
    } else {
      // Not passed - should not be clickable
      return "hover:bg-gray-50 cursor-default opacity-75";
    }
  };

  return (
    <tr
      className={`transition-colors ${getRowClasses()}`}
      onClick={handleRowClick}
    >
      {/* User Name Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {user.photo ? (
            <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100">
              <img
                src={user.photo}
                alt={`${user.first_name} ${user.last_name}`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-blue-700" />
            </div>
          )}
          <div className="ml-4">
            <div className="text-sm font-semibold text-gray-900">
              {user.first_name} {user.last_name}
            </div>
            <div className="text-xs text-gray-500">{user.temp_id}</div>
          </div>
        </div>
      </td>

      {/* Photo Column - Simplified */}
      <td className="px-6 py-4 whitespace-nowrap">
        {user.photo ? (
          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100">
            <img
              src={user.photo}
              alt={`${user.first_name} ${user.last_name}`}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-blue-700" />
          </div>
        )}
      </td>

      {/* Email Column */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline flex items-center" onClick={(e) => e.stopPropagation()}>
          <Icon icon={Mail} size={14} className="mr-1" />
          {user.email}
        </a>
      </td>

      {/* Phone Column */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <a href={`tel:${user.phone_number}`} className="hover:text-blue-600 flex items-center" onClick={(e) => e.stopPropagation()}>
          <Icon icon={Phone} size={14} className="mr-1" />
          {user.phone_number}
        </a>
      </td>

      {/* Check Date Column */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {hasChecks ? (
          <div>
            <div className="font-medium">{formatDate(latestCheck.check_date)}</div>
            {/* <div className="text-xs text-gray-500">{formatTime(latestCheck.check_date)}</div> */}
          </div>
        ) : (
          <span className="text-gray-400">No checks</span>
        )}
      </td>

      {/* Created Date Column */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div>
          <div className="font-medium">{formatDate(user.created_at)}</div>
          {/* <div className="text-xs text-gray-500">{formatTime(user.created_at)}</div> */}
        </div>
      </td>

      {/* Status Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        {isAddedToMaster ? (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            ADDED
          </span>
        ) : hasChecks ? (
          <StatusBadge status={latestCheck.overall_status} />
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            PENDING
          </span>
        )}
      </td>

      {/* Delete Column */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(user.temp_id);
          }}
          className="text-red-600 hover:text-red-900 focus:outline-none transition-colors p-2 rounded-full hover:bg-red-50"
          title="Delete User"
        >
          <Icon icon={Trash2} size={18} />
        </button>
      </td>
    </tr>
  );
};