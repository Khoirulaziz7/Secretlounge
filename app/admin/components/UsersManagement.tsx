'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  UserMinusIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface UsersManagementProps {
  user: any;
}

export default function UsersManagement({ user }: UsersManagementProps) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, search, filter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search,
        filter,
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (userId: number, action: string, reason?: string) => {
    setActionLoading(`${action}-${userId}`);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action, userId, reason }),
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
      } else {
        const data = await response.json();
        alert(data.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanUser = (userId: number) => {
    const reason = prompt('Masukkan alasan ban (opsional):');
    if (reason !== null) { // User didn't cancel
      handleUserAction(userId, 'ban', reason);
    }
  };

  const getStatusBadge = (user: any) => {
    if (user.is_banned) {
      return <span className="badge-danger">Banned</span>;
    }
    if (user.is_admin) {
      return <span className="badge-info">Admin</span>;
    }
    if (user.is_active) {
      return <span className="badge-success">Aktif</span>;
    }
    return <span className="badge-warning">Tidak Aktif</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h2>
        <div className="mt-4 sm:mt-0">
          <p className="text-sm text-gray-600">
            Total: {pagination?.total || 0} pengguna
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan username, nama, atau ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field"
            >
              <option value="all">Semua Pengguna</option>
              <option value="active">Aktif</option>
              <option value="banned">Banned</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="loading-spinner mx-auto"></div>
            <p className="mt-2 text-gray-500">Memuat data pengguna...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pengguna
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bergabung
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Karma
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userItem: any) => (
                    <tr key={userItem.id} className="table-row">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {userItem.first_name?.charAt(0) || userItem.username?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {userItem.first_name || userItem.username || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {userItem.id}
                            </div>
                            {userItem.username && (
                              <div className="text-sm text-gray-500">
                                @{userItem.username}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(userItem)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(userItem.join_date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userItem.karma || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {!userItem.is_banned ? (
                            <button
                              onClick={() => handleBanUser(userItem.id)}
                              disabled={actionLoading === `ban-${userItem.id}`}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Ban User"
                            >
                              {actionLoading === `ban-${userItem.id}` ? (
                                <div className="loading-spinner"></div>
                              ) : (
                                <UserMinusIcon className="w-5 h-5" />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(userItem.id, 'unban')}
                              disabled={actionLoading === `unban-${userItem.id}`}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Unban User"
                            >
                              {actionLoading === `unban-${userItem.id}` ? (
                                <div className="loading-spinner"></div>
                              ) : (
                                <UserPlusIcon className="w-5 h-5" />
                              )}
                            </button>
                          )}
                          
                          {user.is_owner && userItem.id !== parseInt(process.env.NEXT_PUBLIC_OWNER_ID || '0') && (
                            <>
                              {!userItem.is_admin ? (
                                <button
                                  onClick={() => handleUserAction(userItem.id, 'promote')}
                                  disabled={actionLoading === `promote-${userItem.id}`}
                                  className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                  title="Promote to Admin"
                                >
                                  {actionLoading === `promote-${userItem.id}` ? (
                                    <div className="loading-spinner"></div>
                                  ) : (
                                    <ShieldCheckIcon className="w-5 h-5" />
                                  )}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserAction(userItem.id, 'demote')}
                                  disabled={actionLoading === `demote-${userItem.id}`}
                                  className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                                  title="Demote from Admin"
                                >
                                  {actionLoading === `demote-${userItem.id}` ? (
                                    <div className="loading-spinner"></div>
                                  ) : (
                                    <ShieldExclamationIcon className="w-5 h-5" />
                                  )}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                    disabled={currentPage === pagination.pages}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {(currentPage - 1) * pagination.limit + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * pagination.limit, pagination.total)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      
                      {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                        disabled={currentPage === pagination.pages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}