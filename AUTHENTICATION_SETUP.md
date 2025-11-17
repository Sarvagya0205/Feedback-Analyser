# Authentication System Setup

## ✅ What's Been Implemented

### Backend (Flask + MySQL)
- ✅ MySQL database schema with users, sessions, and analyses tables
- ✅ User registration with email/password
- ✅ User login with JWT tokens
- ✅ Google OAuth integration
- ✅ Password hashing with bcrypt
- ✅ Protected API endpoints
- ✅ Automatic database initialization

### Frontend (React)
- ✅ Login page with email/password and Google OAuth
- ✅ Signup page with email/password and Google OAuth
- ✅ Authentication context for state management
- ✅ Protected routes
- ✅ Navbar with login/logout functionality
- ✅ User session persistence

## 📋 Setup Instructions

### 1. Database Setup

**Install MySQL:**
- Download from https://dev.mysql.com/downloads/mysql/
- Or use XAMPP/WAMP/MySQL Workbench

**Create Database:**
```sql
CREATE DATABASE feedback_analyser;
```

**Configure Backend `.env` file:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=feedback_analyser
DB_PORT=3306

JWT_SECRET=your-super-secret-jwt-key-change-this
GOOGLE_CLIENT_ID=1058789935119-ir2vemi3kdutvsu9mgsar8i2qccsqooi.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. Google OAuth Setup

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Type: Web application
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173`
5. Copy the Client ID (current Mang app client ID: `1058789935119-ir2vemi3kdutvsu9mgsar8i2qccsqooi.apps.googleusercontent.com`)

**Frontend `.env` file** (in `Frontend/feedback_analyser/.env`):
```env
VITE_GOOGLE_CLIENT_ID=1058789935119-ir2vemi3kdutvsu9mgsar8i2qccsqooi.apps.googleusercontent.com
VITE_API_URL=http://localhost:5500
```

### 3. Install Dependencies

**Backend:**
```bash
cd Backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd Frontend/feedback_analyser
npm install
```

### 4. Run the Application

**Start MySQL server** (make sure it's running)

**Start Backend:**
```bash
cd Backend
python app.py
```
Backend runs on http://localhost:5500

**Start Frontend:**
```bash
cd Frontend/feedback_analyser
npm run dev
```
Frontend runs on http://localhost:5173

## 🔐 Authentication Features

### Email/Password Authentication
- Users can register with email, password, and name
- Passwords are hashed with bcrypt
- JWT tokens are issued on successful login
- Tokens expire after 24 hours

### Google OAuth
- One-click sign-in with Google
- Automatically creates user account if doesn't exist
- Stores user profile information (name, avatar)

### Session Management
- JWT tokens stored in localStorage
- Automatic token verification on app load
- Protected routes require authentication
- Logout clears session

## 📁 File Structure

### Backend
```
Backend/
├── app.py              # Main Flask app with auth routes
├── auth.py             # Authentication functions
├── database.py         # MySQL connection and schema
├── llm.py              # Existing LLM functionality
└── requirements.txt    # Python dependencies
```

### Frontend
```
Frontend/feedback_analyser/src/
├── contexts/
│   └── AuthContext.jsx    # Authentication state management
├── pages/
│   ├── Login.jsx          # Login page
│   ├── Signup.jsx         # Signup page
│   └── Auth.css           # Auth page styles
└── components/
    └── navbar.jsx          # Updated with auth
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/oauth/google` - Google OAuth
  ```json
  {
    "id_token": "google-id-token"
  }
  ```

- `GET /api/auth/me` - Get current user (requires Authorization header)
  ```
  Authorization: Bearer <token>
  ```

## 🎨 User Interface

- **Login Page**: `/login`
  - Email/password form
  - Google OAuth button
  - Link to signup

- **Signup Page**: `/signup`
  - Registration form with name, email, password
  - Password confirmation
  - Google OAuth button
  - Link to login

- **Navbar**
  - Shows "Sign in" when not authenticated
  - Shows user name and "Sign out" when authenticated
  - Mobile-responsive

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- CORS configured for frontend origins
- SQL injection protection with parameterized queries
- Token expiration (24 hours)
- Secure password requirements (min 6 characters)

## 📝 Notes

- Database tables are created automatically on first run
- If Google OAuth is not configured, users can still use email/password
- User analyses are saved to database when authenticated
- All existing functionality (analyze, reports, settings) works with or without authentication

## 🐛 Troubleshooting

**Database connection error:**
- Check MySQL is running
- Verify database credentials in `.env`
- Ensure database exists

**Google OAuth not working:**
- Verify Client ID is set in both backend and frontend `.env`
- Check authorized origins in Google Console
- Ensure Google+ API is enabled

**Token expired:**
- User will be automatically logged out
- Need to login again

**CORS errors:**
- Update CORS origins in `Backend/app.py` if using different ports

