import React, { useState, useEffect } from 'react';
import api, { storeAPI } from '../../services/api';
import Layout from '../layout/Layout';
import LoadingSpinner from '../common/LoadingSpinner';
import StarRating from '../common/StarRating';
import './StoreOwnerDashboard.css';

interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  average_rating: number;
  total_ratings: number;
}

interface UserWhoRated {
  id: number;
  name: string;
  email: string;
  rating: number;
  created_at: string;
}

interface StoreOwnerDashboardData {
  store: Store;
  usersWhoRated: UserWhoRated[];
}

const StoreOwnerDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<StoreOwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      const response = await storeAPI.getOwnerDashboard();
      setDashboardData(response);
      setError('');
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.error || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      setPasswordError('Password must be 8-16 characters with at least one uppercase letter, one lowercase letter, one number, and one special character');
      return;
    }

    try {
      await api.put('/store-owner/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    } catch (err: any) {
      console.error('Password update error:', err);
      setPasswordError(err.response?.data?.error || 'Failed to update password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error-message">{error}</div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout>
        <div className="no-store">No store found for your account.</div>
      </Layout>
    );
  }

  const { store, usersWhoRated } = dashboardData;

  return (
    <Layout>
      <div className="store-owner-dashboard">
        <div className="dashboard-header">
          <h1>Store Owner Dashboard</h1>
          <div className="header-actions">
            <button 
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="btn btn-secondary"
            >
              Change Password
            </button>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>

        {passwordSuccess && (
          <div className="success-message">{passwordSuccess}</div>
        )}

        {showPasswordForm && (
          <div className="password-form-container">
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordUpdate} className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password:</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password:</label>
                <input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password:</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value
                  })}
                  required
                />
              </div>
              {passwordError && (
                <div className="error-message">{passwordError}</div>
              )}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Update Password
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowPasswordForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="store-info-card">
          <h2>{store.name}</h2>
          <p className="store-address">{store.address}</p>
          <p className="store-email">{store.email}</p>
          
          <div className="store-rating-summary">
            <div className="rating-display">
              <StarRating rating={Number(store.average_rating) || 0} readOnly size="large" />
              <div className="rating-details">
                <span className="avg-rating">{(Number(store.average_rating) || 0).toFixed(1)}/5</span>
                <span className="total-ratings">({store.total_ratings || 0} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ratings-section">
          <h3>Customer Reviews</h3>
          
          {usersWhoRated.length === 0 ? (
            <div className="no-ratings">
              No ratings have been submitted for your store yet.
            </div>
          ) : (
            <div className="ratings-table-container">
              <table className="ratings-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Rating</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {usersWhoRated.map((user: UserWhoRated) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <div className="rating-cell">
                          <StarRating rating={user.rating} readOnly size="small" />
                          <span className="rating-number">({user.rating})</span>
                        </div>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h4>Average Rating</h4>
            <div className="stat-value">{(Number(store.average_rating) || 0).toFixed(1)}</div>
          </div>
          <div className="stat-card">
            <h4>Total Reviews</h4>
            <div className="stat-value">{store.total_ratings}</div>
          </div>
          <div className="stat-card">
            <h4>5-Star Reviews</h4>
            <div className="stat-value">
              {usersWhoRated.filter((r: UserWhoRated) => r.rating === 5).length}
            </div>
          </div>
          <div className="stat-card">
            <h4>Latest Review</h4>
            <div className="stat-value">
              {usersWhoRated.length > 0 
                ? new Date(usersWhoRated[0].created_at).toLocaleDateString()
                : 'N/A'
              }
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StoreOwnerDashboard;