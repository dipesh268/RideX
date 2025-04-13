
# RideX - Ride Sharing Application

A ride sharing application with Express.js backend, MongoDB database and React frontend.

## Project Structure

The project is organized into two main folders:
- `frontend/` - Contains the React frontend application
- `backend/` - Contains the Express.js backend server

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Setting up MongoDB

1. Install MongoDB locally or create a MongoDB Atlas account
2. If using MongoDB Atlas:
   - Create a new cluster
   - Create a database user
   - Get your connection string
   - Replace `mongodb://localhost:27017/ridex` with your connection string in the `.env` file

### Running the Application

1. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   MONGODB_URI=mongodb://localhost:27017/ridex
   JWT_SECRET=your_secret_key
   ```

2. Start the backend server:
   ```
   cd backend
   node server.js
   ```

3. In a separate terminal, start the frontend:
   ```
   cd frontend
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`
