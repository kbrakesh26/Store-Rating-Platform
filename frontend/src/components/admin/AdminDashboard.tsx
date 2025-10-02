import React, { useState, useEffect, useCallback } from 'react';
import { userAPI, storeAPI } from '../../services/api';
import { DashboardStats, User, Store } from '../../types';
import Layout from '../layout/Layout';
import LoadingSpinner from '../common/LoadingSpinner';
import StarRating from '../common/StarRating';
import AddStoreForm from './AddStoreForm';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'stores'>('dashboard');
  const [showAddStoreForm, setShowAddStoreForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'user' | 'store', id: number, name: string} | null>(null);
  const [userFilters, setUserFilters] = useState({
    search: '',
    role: '',
    sortBy: 'name',
    order: 'asc'
  });
  const [storeFilters, setStoreFilters] = useState({
    search: '',
    sortBy: 'name',
    order: 'asc'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const userData = await userAPI.getUsers(userFilters);
      setUsers(userData);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }, [userFilters]);

  const loadStores = useCallback(async () => {
    try {
      const storeData = await storeAPI.getStores(storeFilters);
      setStores(storeData);
    } catch (error) {
      console.error('Failed to load stores:', error);
    }
  }, [storeFilters]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'stores') {
      loadStores();
    }
  }, [activeTab, loadUsers, loadStores]);

  const loadDashboardData = async () => {
    try {
      const dashboardStats = await userAPI.getDashboard();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserFilterChange = (key: string, value: string) => {
    setUserFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleStoreFilterChange = (key: string, value: string) => {
    setStoreFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleStoreCreated = () => {
    setShowAddStoreForm(false);
    // Refresh stores list if on stores tab
    if (activeTab === 'stores') {
      loadStores();
    }
    // Refresh dashboard stats
    loadDashboardData();
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await userAPI.deleteUser(userId);
      loadUsers(); // Refresh users list
      loadDashboardData(); // Refresh stats
      setDeleteConfirm(null);
      alert('User deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete user';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDeleteStore = async (storeId: number) => {
    try {
      await storeAPI.deleteStore(storeId);
      loadStores(); // Refresh stores list
      loadDashboardData(); // Refresh stats
      setDeleteConfirm(null);
      alert('Store deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete store:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete store';
      alert(`Error: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-dashboard">
        <h1>Admin Dashboard</h1>
        
        <div className="dashboard-tabs">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={activeTab === 'stores' ? 'active' : ''}
            onClick={() => setActiveTab('stores')}
          >
            Stores
          </button>
        </div>

        {activeTab === 'dashboard' && stats && (
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Users</h3>
              <div className="stat-number">{stats.totalUsers}</div>
            </div>
            <div className="stat-card">
              <h3>Total Stores</h3>
              <div className="stat-number">{stats.totalStores}</div>
            </div>
            <div className="stat-card">
              <h3>Total Ratings</h3>
              <div className="stat-number">{stats.totalRatings}</div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <div className="filters">
              <input
                type="text"
                placeholder="Search by name, email, or address"
                value={userFilters.search}
                onChange={(e) => handleUserFilterChange('search', e.target.value)}
              />
              <select
                value={userFilters.role}
                onChange={(e) => handleUserFilterChange('role', e.target.value)}
                aria-label="Filter by role"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="store_owner">Store Owner</option>
              </select>
              <select
                value={userFilters.sortBy}
                onChange={(e) => handleUserFilterChange('sortBy', e.target.value)}
                aria-label="Sort users by"
              >
                <option value="name">Sort by Name</option>
                <option value="email">Sort by Email</option>
                <option value="role">Sort by Role</option>
                <option value="created_at">Sort by Date</option>
              </select>
              <select
                value={userFilters.order}
                onChange={(e) => handleUserFilterChange('order', e.target.value)}
                aria-label="Sort order"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.address}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>{new Date(user.created_at || '').toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="delete-btn"
                          onClick={() => setDeleteConfirm({type: 'user', id: user.id, name: user.name})}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'stores' && (
          <div className="stores-section">
            <div className="stores-header">
              <div className="filters">
                <input
                  type="text"
                  placeholder="Search by name or address"
                  value={storeFilters.search}
                  onChange={(e) => handleStoreFilterChange('search', e.target.value)}
                />
                <select
                  value={storeFilters.sortBy}
                  onChange={(e) => handleStoreFilterChange('sortBy', e.target.value)}
                  aria-label="Sort stores by"
                >
                  <option value="name">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                  <option value="address">Sort by Address</option>
                  <option value="average_rating">Sort by Rating</option>
                </select>
                <select
                  value={storeFilters.order}
                  onChange={(e) => handleStoreFilterChange('order', e.target.value)}
                  aria-label="Sort order"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
              <button 
                className="add-store-btn"
                onClick={() => setShowAddStoreForm(true)}
              >
                Add Store
              </button>
            </div>

            <div className="stores-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Rating</th>
                    <th>Total Ratings</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map(store => (
                    <tr key={store.id}>
                      <td>{store.name}</td>
                      <td>{store.email}</td>
                      <td>{store.address}</td>
                      <td>
                        <div className="rating-display">
                          <StarRating rating={Number(store.average_rating) || 0} readOnly size="small" />
                          <span>({(Number(store.average_rating) || 0).toFixed(1)})</span>
                        </div>
                      </td>
                      <td>{store.total_ratings}</td>
                      <td>
                        <button 
                          className="delete-btn"
                          onClick={() => setDeleteConfirm({type: 'store', id: store.id, name: store.name})}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showAddStoreForm && (
          <AddStoreForm 
            onClose={() => setShowAddStoreForm(false)}
            onStoreAdded={handleStoreCreated}
          />
        )}

        {deleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Confirm Delete</h2>
                <button 
                  className="close-btn"
                  onClick={() => setDeleteConfirm(null)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete the {deleteConfirm.type} "{deleteConfirm.name}"?</p>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-delete-btn"
                  onClick={() => {
                    if (deleteConfirm.type === 'user') {
                      handleDeleteUser(deleteConfirm.id);
                    } else {
                      handleDeleteStore(deleteConfirm.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;