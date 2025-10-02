export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'store_owner';
  address?: string;
  created_at?: string;
}

export interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  owner_id?: number;
  average_rating: number;
  total_ratings: number;
  created_at?: string;
  user_rating?: number;
  owner_name?: string;
}

export interface Rating {
  id: number;
  user_id: number;
  store_id: number;
  rating: number;
  created_at: string;
  updated_at: string;
  store_name?: string;
  store_address?: string;
  user_name?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}