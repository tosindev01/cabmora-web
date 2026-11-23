import React, { useState } from 'react';
import { UserPlus, Search, Edit2, Trash2, HardDrive } from 'lucide-react';
import { useAdmin, User, UserRole, UserStatus } from '@/context/AdminContext';
import AdminLayout from '@/components/AdminLayout';
import { Modal } from '@cabmora/ui';

export default function AdminUserManagementPage() {
  const { users, addUser, updateUser, toggleUserStatus, deleteUser } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State for New User
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Creator' as UserRole,
    specialization: '',
    status: 'Active' as UserStatus,
    storageUsedGB: 50,
  });

  // Filtered User List
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.specialization && u.specialization.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    addUser({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop`,
      specialization:
        formData.specialization || (formData.role === 'Creator' ? 'Media Creator' : undefined),
      joinedDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      storageUsedGB: formData.storageUsedGB,
      projectsCount: 0,
      totalBilledOrEarned: formData.role === 'Creator' ? '$0' : '$0 Billed',
    });

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      email: '',
      role: 'Creator',
      specialization: '',
      status: 'Active',
      storageUsedGB: 50,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUser(editingUser.id, {
      name: editingUser.name,
      email: editingUser.email,
      role: editingUser.role,
      specialization: editingUser.specialization,
      status: editingUser.status,
    });

    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  return (
    <AdminLayout>
      <div className="max-w-[1320px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <div>
            <h1 className="text-[30px] font-sans font-medium text-ink">User Management</h1>
            <p className="text-ink/60 text-[14px]">
              View, search, create, edit, suspend, and manage customers, creators, and platform
              admins.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-ink text-white px-5 py-2.5 rounded-full text-[12px] font-bold tracking-[0.05em] uppercase hover:bg-gold hover:text-ink transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <UserPlus size={16} />
            Add New User Account
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-ink/10 p-5 rounded-xl shadow-xs space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or specialization..."
              className="w-full bg-canvas border border-ink/15 pl-10 pr-4 py-2.5 text-[13px] outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all rounded-lg"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/50">
                Role:
              </span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-canvas border border-ink/15 px-3 py-2 text-[12px] font-medium outline-none focus:border-gold rounded-lg"
              >
                <option value="All">All Roles ({users.length})</option>
                <option value="Customer">
                  Customers ({users.filter((u) => u.role === 'Customer').length})
                </option>
                <option value="Creator">
                  Creators ({users.filter((u) => u.role === 'Creator').length})
                </option>
                <option value="Admin">
                  Admins ({users.filter((u) => u.role === 'Admin').length})
                </option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/50">
                Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-canvas border border-ink/15 px-3 py-2 text-[12px] font-medium outline-none focus:border-gold rounded-lg"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-ink/10 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="bg-canvas border-b border-ink/10 text-ink/60 uppercase tracking-[0.08em] text-[10px] font-bold">
                  <th className="py-4 px-5">User Details</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Specialization / Info</th>
                  <th className="py-4 px-4">Storage Usage</th>
                  <th className="py-4 px-4">Projects</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-ink/50 text-[14px]">
                      No user accounts match your search filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-canvas/60 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border border-ink/10"
                          />
                          <div>
                            <div className="font-semibold text-ink text-[14px]">{user.name}</div>
                            <div className="text-[11px] text-ink/50">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-[0.05em] ${
                            user.role === 'Admin'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : user.role === 'Creator'
                                ? 'bg-gold/20 text-ink border border-gold/40'
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.05em] flex items-center gap-1 w-fit ${
                            user.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : user.status === 'Suspended'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status === 'Active' ? 'bg-emerald-600' : 'bg-red-600'
                            }`}
                          />
                          {user.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-ink/70 font-medium">
                        {user.specialization ||
                          (user.role === 'Customer' ? 'Client Account' : 'Platform Staff')}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-[12px]">
                          <HardDrive size={14} className="text-gold" />
                          <span>{user.storageUsedGB} GB</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-semibold text-ink">
                        {user.projectsCount} {user.projectsCount === 1 ? 'Project' : 'Projects'}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 text-ink/60 hover:text-ink hover:bg-gray-100 rounded transition-colors"
                            title="Edit User"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded uppercase tracking-[0.05em] transition-colors ${
                              user.status === 'Active'
                                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                                : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                            }`}
                          >
                            {user.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
                                deleteUser(user.id);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE NEW USER MODAL */}
      {isAddModalOpen && (
        <Modal
          open
          onOpenChange={(next) => {
            if (!next) (() => setIsAddModalOpen(false))();
          }}
          size="md"
          title="Create User Account"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Eleanor Vance"
                className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                required
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. eleanor@example.com"
                className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                >
                  <option value="Customer">Customer</option>
                  <option value="Creator">Creator</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as UserStatus })
                  }
                  className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            {formData.role === 'Creator' && (
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                  Creator Specialization
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g. Lead Wedding Photographer & Drone Operator"
                  className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                Storage Allocation (GB)
              </label>
              <input
                type="number"
                value={formData.storageUsedGB}
                onChange={(e) =>
                  setFormData({ ...formData, storageUsedGB: Number(e.target.value) })
                }
                className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink/10">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-[12px] font-semibold text-ink/60 hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-ink text-white px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-[0.05em] hover:bg-gold hover:text-ink transition-colors"
              >
                Save New Account
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT USER MODAL */}
      {isEditModalOpen && editingUser && (
        <Modal
          open
          onOpenChange={(next) => {
            if (!next) (() => setIsEditModalOpen(false))();
          }}
          size="md"
          title={<>Edit User: {editingUser.name}</>}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                required
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                  Role
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value as UserRole })
                  }
                  className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                >
                  <option value="Customer">Customer</option>
                  <option value="Creator">Creator</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                  Status
                </label>
                <select
                  value={editingUser.status}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, status: e.target.value as UserStatus })
                  }
                  className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                Specialization
              </label>
              <input
                type="text"
                value={editingUser.specialization || ''}
                onChange={(e) => setEditingUser({ ...editingUser, specialization: e.target.value })}
                className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink/10">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-[12px] font-semibold text-ink/60 hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-ink text-white px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-[0.05em] hover:bg-gold hover:text-ink transition-colors"
              >
                Update Account
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
}
