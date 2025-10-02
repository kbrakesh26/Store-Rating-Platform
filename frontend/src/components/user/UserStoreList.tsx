import React, { useState, useEffect, useCallback } from 'react';
import { storeAPI, ratingAPI } from '../../services/api';
import { Store } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Layout from '../layout/Layout';
import LoadingSpinner from '../common/LoadingSpinner';
import StarRating from '../common/StarRating';
import './UserStoreList.css';

const UserStoreList: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingRating, setSubmittingRating] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'name',
    order: 'asc'
  });
  const { user } = useAuth();

  const loadStores = useCallback(async () => {
    try {
      const storeData = await storeAPI.getStores(filters);
      setStores(storeData);
    } catch (error) {
      console.error('Failed to load stores:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const handleRatingSubmit = async (storeId: number, rating: number) => {
    if (!user) return;
    
    setSubmittingRating(storeId);
    try {
      await ratingAPI.submitRating({ storeId, rating });
      // Reload stores to get updated ratings
      await loadStores();
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(null);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
      <div className="user-store-list">
        <h1>Store Directory</h1>
        
        <div className="filters">
          <input
            type="text"
            placeholder="Search stores by name or address..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            aria-label="Sort by"
          >
            <option value="name">Sort by Name</option>
            <option value="address">Sort by Address</option>
            <option value="average_rating">Sort by Rating</option>
          </select>
          <select
            value={filters.order}
            onChange={(e) => handleFilterChange('order', e.target.value)}
            aria-label="Sort order"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <div className="stores-grid">
          {stores.length === 0 ? (
            <div className="no-stores">No stores found matching your criteria.</div>
          ) : (
            stores.map(store => (
              <div key={store.id} className="store-card">
                <div className="store-header">
                  <h3>{store.name}</h3>
                  <div className="store-rating">
                    <StarRating rating={Number(store.average_rating) || 0} readOnly size="small" />
                    <span className="rating-text">
                      {(Number(store.average_rating) || 0).toFixed(1)} ({store.total_ratings || 0} reviews)
                    </span>
                  </div>
                </div>
                
                <p className="store-address">{store.address}</p>
                
                <div className="user-rating-section">
                  <div className="your-rating">
                    <strong>Your Rating:</strong>
                    {store.user_rating ? (
                      <div className="current-rating">
                        <StarRating rating={store.user_rating} readOnly size="small" />
                        <span>({store.user_rating}/5)</span>
                      </div>
                    ) : (
                      <span className="no-rating">Not rated yet</span>
                    )}
                  </div>
                  
                  <div className="rating-actions">
                    <strong>{store.user_rating ? 'Update Rating:' : 'Rate this store:'}</strong>
                    <div className="rating-input">
                      <StarRating
                        rating={0}
                        onRatingChange={(rating) => handleRatingSubmit(store.id, rating)}
                        readOnly={submittingRating === store.id}
                        size="medium"
                      />
                      {submittingRating === store.id && (
                        <div className="submitting">Submitting...</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserStoreList;