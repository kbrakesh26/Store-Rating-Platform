import React from 'react';
import './StarRating.css';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onRatingChange, 
  readOnly = false, 
  size = 'medium' 
}) => {
  const handleStarClick = (starValue: number) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  return (
    <div className={`star-rating ${size} ${readOnly ? 'readonly' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= rating ? 'filled' : ''}`}
          onClick={() => handleStarClick(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;