import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminDashboard from './components/admin/AdminDashboard';
import UserStoreList from './components/user/UserStoreList';
import StoreOwnerDashboard from './components/storeOwner/StoreOwnerDashboard';
import './App.css';
import './components/common/ModernUI.css';

const AppRouter: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const getDefaultRoute = () => {
    if (!isAuthenticated || !user) return '/login';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'store_owner':
        return '/owner/dashboard';
      case 'user':
        return '/user/stores';
      default:
        return '/login';
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
        <Route path="/login" element={
          isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Register />
        } />
        
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/user/stores" element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserStoreList />
          </ProtectedRoute>
        } />
        
        <Route path="/owner/dashboard" element={
          <ProtectedRoute allowedRoles={['store_owner']}>
            <StoreOwnerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRouter />
      </div>
    </AuthProvider>
  );
}

export default App;
