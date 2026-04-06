import React, { useEffect, useState } from 'react';
import { Filter, Calendar, Users } from 'lucide-react';
import type { User } from '../../constants/types';
import { API_ENDPOINTS } from '../../constants/api';
// import { LoadingSpinner } from '../../atoms/LoadingSpinner/LoadingSpinner';
import { ErrorDisplay } from '../../molecules/ErrorDisplay/ErrorDisplay';
import Level0Nav from '../../molecules/Level0Nav/Level0Nav';
import { SearchBar } from '../../molecules/SearchBar/SearchBar';
import { FilterDropdown } from '../../molecules/FilterDropdown/FilterDropdown';
import { UserTableRow } from '../../molecules/UserTableRow/UserTableRow';
import { EmptyState } from '../../molecules/EmptyState/EmptyState';
import OrientationFeedbackModal from '../OrientationFeedbackModal/OrientationFeedbackModal';
import { PageHeader } from '../../atoms/PageHeader/PageHeader';


const PassedUsersTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pass', label: 'Pass' },
    { value: 'fail', label: 'Fail' }
  ];

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  const fetchData = async (tempId?: string) => {
    try {
      let url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ALL_PASSED_USERS}`;
      if (tempId) {
        url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PASSED_USER_BY_ID(tempId)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      console.log(data);
      setUsers(Array.isArray(data) ? data : [data]);
      setFilteredUsers(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const now = new Date();
    let filtered = [...users];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        // Get the most recent body check
        const latestBodyCheck = user.body_checks?.length > 0
          ? user.body_checks[user.body_checks.length - 1]
          : null;
        return latestBodyCheck && latestBodyCheck.overall_status === statusFilter;
      });
    }

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(user => {
          const latestBodyCheck = user.body_checks?.length > 0
            ? user.body_checks[user.body_checks.length - 1]
            : null;
          if (!latestBodyCheck) return false;
          const checkDate = new Date(latestBodyCheck.check_date);
          return (
            checkDate.getDate() === now.getDate() &&
            checkDate.getMonth() === now.getMonth() &&
            checkDate.getFullYear() === now.getFullYear()
          );
        });
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        filtered = filtered.filter(user => {
          const latestBodyCheck = user.body_checks?.length > 0
            ? user.body_checks[user.body_checks.length - 1]
            : null;
          if (!latestBodyCheck) return false;
          const checkDate = new Date(latestBodyCheck.check_date);
          return checkDate >= startOfWeek && checkDate <= now;
        });
        break;
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter(user => {
          const latestBodyCheck = user.body_checks?.length > 0
            ? user.body_checks[user.body_checks.length - 1]
            : null;
          if (!latestBodyCheck) return false;
          const checkDate = new Date(latestBodyCheck.check_date);
          return checkDate >= startOfMonth && checkDate <= now;
        });
        break;
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        filtered = filtered.filter(user => {
          const latestBodyCheck = user.body_checks?.length > 0
            ? user.body_checks[user.body_checks.length - 1]
            : null;
          if (!latestBodyCheck) return false;
          const checkDate = new Date(latestBodyCheck.check_date);
          return checkDate >= startOfYear && checkDate <= now;
        });
        break;
      default:
        break;
    }

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(user =>
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [dateFilter, statusFilter, users, searchTerm]);

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = async (tempId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        console.log('Attempting to delete user with temp_id:', tempId);

        // Optimistically update UI
        setUsers(users.filter(user => user.temp_id !== tempId));
        setFilteredUsers(filteredUsers.filter(user => user.temp_id !== tempId));

        // Use the correct endpoint for user deletion
        const deleteUrl = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.USER_BY_TEMP_ID(tempId)}`;
        console.log('Delete URL:', deleteUrl);

        const response = await fetch(deleteUrl, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Delete failed:', response.status, errorText);
          throw new Error(`Failed to delete user: ${response.status} ${response.statusText}`);
        }

        console.log('Delete successful');
        // Re-fetch to ensure data consistency
        fetchData();
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user. Check console for details.');
        // Rollback to server state
        fetchData();
      }
    }
  };

  if (loading) {
    // return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <>
      <Level0Nav />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Employee Details"
            subtitle="Manage and view employee information and body check results"
            icon={<Users className="h-5 w-5 text-gray-400" />}
          />

          <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800">Employee List</h2>

                <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
                  <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

                  <FilterDropdown
                    title="Status Filter"
                    currentValue={statusFilter}
                    options={statusOptions}
                    onSelect={setStatusFilter}
                    isOpen={showStatusDropdown}
                    setIsOpen={setShowStatusDropdown}
                    icon={Filter}
                  />

                  <FilterDropdown
                    title="Date Filter"
                    currentValue={dateFilter}
                    options={dateOptions}
                    onSelect={setDateFilter}
                    isOpen={showDateDropdown}
                    setIsOpen={setShowDateDropdown}
                    icon={Calendar}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Photo</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Check Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <UserTableRow
                      key={user.temp_id}
                      user={user}
                      onRowClick={handleRowClick}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <EmptyState hasUsers={users.length > 0} />
            )}
          </div>

          {showModal && selectedUser && (
            <OrientationFeedbackModal
              user={selectedUser}
              onClose={() => setShowModal(false)}
              onSave={() => {
                setShowModal(false);
                fetchData();
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default PassedUsersTable;