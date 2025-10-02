# Store Rating Application

A full-stack web application for store rating system with role-based access control.

## Project Overview

This project was developed as part of a web development assignment. It implements a complete store rating system where users can rate and review stores, store owners can manage their store information, and administrators can oversee the entire system.

## Features

- **User Authentication**: Secure login/registration with JWT
- **Role-Based Access**: Admin, Normal User, Store Owner roles
- **Store Management**: Store listings with ratings and reviews
- **Real-time Ratings**: Interactive star rating system
- **Admin Dashboard**: User and store management
- **Store Owner Dashboard**: View store ratings and customer feedback
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Backend**: Express.js, Node.js, MySQL, JWT
- **Frontend**: React.js, TypeScript, Axios
- **Database**: MySQL with triggers for rating calculations

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- Git

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`

4. Import database schema from `database/schema.sql`

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

## Default Access

- **Admin**: admin@storerating.com (password needs to be set)
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## User Roles & Features

### System Administrator
- Dashboard with statistics
- User and store management
- Create new users and stores
- View all ratings and reviews

### Normal User
- Register and login
- Browse and search stores
- Submit and update ratings
- View store details and reviews

### Store Owner
- Dashboard with store statistics
- View customer ratings and feedback
- Monitor store performance

## API Endpoints

- `/api/auth/*` - Authentication routes
- `/api/users/*` - User management
- `/api/stores/*` - Store operations
- `/api/ratings/*` - Rating system