import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import './AddStoreForm.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AddStoreFormProps {
  onClose: () => void;
  onStoreAdded: () => void;
}

const AddStoreForm: React.FC<AddStoreFormProps> = ({ onClose, onStoreAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await apiService.get('/users');
      // Filter to get store owners and users who could potentially own stores
      const storeOwners = response.data.filter((user: User) => 
        user.role === 'store_owner' || user.role === 'user'
      );
      setUsers(storeOwners);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.address) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Create store
      await apiService.post('/stores', {
        name: formData.name,
        email: formData.email,
        address: formData.address,
        owner_id: formData.owner_id || null
      });

      setSuccess('Store added successfully!');
      onStoreAdded();
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        address: '',
        owner_id: ''
      });

      // Close form after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error('Failed to add store:', error);
      setError(error.response?.data?.error || 'Failed to add store. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Store</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="add-store-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="name">Store Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter store name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Store Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="store@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Store Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter store address"
              rows={3}
              maxLength={400}
              required
            />
            <small>{formData.address.length}/400 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="owner_id">Store Owner (Optional)</label>
            <select
              id="owner_id"
              name="owner_id"
              value={formData.owner_id}
              onChange={handleInputChange}
            >
              <option value="">Select store owner (optional)</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email}) - {user.role}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Adding Store...' : 'Add Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStoreForm;