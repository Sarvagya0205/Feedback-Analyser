# Authentication Setup Guide

## Database Setup

1. **Install MySQL** (if not already installed)
   - Download from https://dev.mysql.com/downloads/mysql/
   - Or use a service like XAMPP, WAMP, or MySQL Workbench

2. **Create Database**
   ```sql
   CREATE DATABASE feedback_analyser;
   ```

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env` (or create `.env` file)
   - Update the database credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=feedback_analyser
   DB_PORT=3306
   ```

4. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Initialize Database Tables**
   - The database tables will be created automatically when you run the Flask app
   - Or run the `init_db()` function manually from `database.py`

## Google OAuth Setup

1. **Create Google OAuth Credentials**
   - Go to https://console.cloud.google.com/
   - Create a new project or select an existing one
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (Vite default)
     - `http://localhost:3000` (if using different port)
   - Add authorized redirect URIs:
     - `http://localhost:5173`
     - `http://localhost:3000`
   - Copy the Client ID

2. **Configure Environment Variables**
   - Add to your `.env` file:
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

3. **Frontend Configuration**
   - Create a `.env` file in `Frontend/feedback_analyser/`
   - Add:
   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

## JWT Secret Key

Generate a secure random string for JWT_SECRET:
```python
import secrets
print(secrets.token_urlsafe(32))
```

Add to `.env`:
```
JWT_SECRET=your-generated-secret-key
```

## Running the Application

1. **Start MySQL Server**
   - Make sure MySQL is running on your system

2. **Start Backend**
   ```bash
   cd Backend
   python app.py
   ```
   - Backend will run on http://localhost:5500

3. **Start Frontend**
   ```bash
   cd Frontend/feedback_analyser
   npm install
   npm run dev
   ```
   - Frontend will run on http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/oauth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user (requires auth token)

### Request Format
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"  // optional for register
}
```

### Response Format
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "provider": "local"
  }
}
```

## Database Schema

### users
- `id` (INT, PRIMARY KEY)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR, nullable for OAuth users)
- `name` (VARCHAR)
- `provider` (VARCHAR) - 'local' or 'google'
- `provider_id` (VARCHAR, nullable)
- `avatar_url` (VARCHAR, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### user_sessions
- `id` (INT, PRIMARY KEY)
- `user_id` (INT, FOREIGN KEY)
- `token_hash` (VARCHAR)
- `expires_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

### user_analyses
- `id` (INT, PRIMARY KEY)
- `user_id` (INT, FOREIGN KEY)
- `feedback` (TEXT)
- `sentiment` (VARCHAR)
- `created_at` (TIMESTAMP)

