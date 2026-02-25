import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUser, deleteUser, createUser } from '../services/adminService';
import ConfirmModal from '../components/ConfirmModal';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const newUser = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        phone: formData.get('phone') as string,
        role: formData.get('role') as string,
      };

      const response = await createUser(newUser);
      setUsers([...users, response.data]);
      setShowCreateModal(false);
      form.reset();
    } catch (err: any) {
      console.error('Error creating user:', err);
      alert(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const formData = new FormData(e.currentTarget);
      const updates = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        role: formData.get('role') as string,
      };

      const updatedUser = await updateUser(editingUser._id, updates);
      setUsers(users.map(u => u._id === editingUser._id ? updatedUser.data : u));
      setShowEditModal(false);
      setEditingUser(null);
    } catch (err: any) {
      console.error('Error updating user:', err);
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) {
      console.error('No user to delete');
      return;
    }

    console.log('Deleting user:', userToDelete);

    try {
      await deleteUser(userToDelete._id);
      console.log('User deleted successfully');
      setUsers(users.filter(u => u._id !== userToDelete._id));
      setShowDeleteModal(false);
      setSuccessMessage(`User "${userToDelete.firstName} ${userToDelete.lastName}" has been deleted successfully.`);
      setShowSuccessModal(true);
      setUserToDelete(null);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="section-padding bg-cream flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-tea mx-auto mb-4"></div>
          <p className="text-dark-tea">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding bg-cream min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-primary-tea">User Management</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create User
            </button>
            <button
              onClick={fetchUsers}
              className="btn-secondary"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-tea mb-2">
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-tea mb-2">
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-tea">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Joined</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-secondary-tea hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.phone || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-heading font-semibold text-primary-tea">
                  Create New User
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  />
                  <p className="mt-1 text-xs text-secondary-tea">Must be at least 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    defaultValue="customer"
                    required
                    className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-heading font-semibold text-primary-tea">
                  Edit User
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    defaultValue={editingUser.firstName}
                    required
                    className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    defaultValue={editingUser.lastName}
                    required
                    className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingUser.email}
                    required
                    className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingUser.phone || ''}
                    className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    defaultValue={editingUser.role}
                    required
                    className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={userToDelete ? `Are you sure you want to delete "${userToDelete.firstName} ${userToDelete.lastName}"? This action cannot be undone.` : ''}
        confirmText="Delete"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        cancelText="Cancel"
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-dark-tea mb-2">Success!</h3>
              <p className="text-sm text-secondary-tea mb-4">{successMessage}</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="btn-primary"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;