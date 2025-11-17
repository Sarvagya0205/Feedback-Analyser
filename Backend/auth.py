import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from flask import jsonify
from database import get_db_connection
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, password_hash):
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def generate_token(user_id, email):
    """Generate a JWT token for a user"""
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token):
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def register_user(email, password, name=None):
    """Register a new user"""
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Check if user already exists
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return None, "User with this email already exists"
            
            # Hash password and insert user
            password_hash = hash_password(password)
            cursor.execute("""
                INSERT INTO users (email, password_hash, name, provider)
                VALUES (%s, %s, %s, 'local')
            """, (email, password_hash, name or email.split('@')[0]))
            
            user_id = cursor.lastrowid
            connection.commit()
            
            # Get the created user
            cursor.execute("SELECT id, email, name, provider FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            
            return user, None
    except Exception as e:
        return None, str(e)
    finally:
        connection.close()

def authenticate_user(email, password):
    """Authenticate a user with email and password"""
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, email, password_hash, name, provider, avatar_url
                FROM users WHERE email = %s AND provider = 'local'
            """, (email,))
            user = cursor.fetchone()
            
            if not user:
                return None, "Invalid email or password"
            
            if not verify_password(password, user['password_hash']):
                return None, "Invalid email or password"
            
            # Remove password_hash from response
            user.pop('password_hash', None)
            return user, None
    except Exception as e:
        return None, str(e)
    finally:
        connection.close()

def get_user_by_id(user_id):
    """Get user by ID"""
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, email, name, provider, avatar_url, created_at
                FROM users WHERE id = %s
            """, (user_id,))
            return cursor.fetchone()
    except Exception as e:
        return None
    finally:
        connection.close()

def get_user_by_email(email):
    """Get user by email"""
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, email, name, provider, provider_id, avatar_url, created_at
                FROM users WHERE email = %s
            """, (email,))
            return cursor.fetchone()
    except Exception as e:
        return None
    finally:
        connection.close()

def create_or_update_oauth_user(email, name, provider, provider_id, avatar_url=None):
    """Create or update a user from OAuth provider"""
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Check if user exists
            cursor.execute("""
                SELECT id, email, name, provider, avatar_url
                FROM users WHERE email = %s
            """, (email,))
            user = cursor.fetchone()
            
            if user:
                # Update existing user
                cursor.execute("""
                    UPDATE users 
                    SET name = %s, provider = %s, provider_id = %s, avatar_url = %s
                    WHERE email = %s
                """, (name, provider, provider_id, avatar_url, email))
                connection.commit()
                cursor.execute("""
                    SELECT id, email, name, provider, avatar_url
                    FROM users WHERE email = %s
                """, (email,))
                return cursor.fetchone()
            else:
                # Create new user
                cursor.execute("""
                    INSERT INTO users (email, name, provider, provider_id, avatar_url)
                    VALUES (%s, %s, %s, %s, %s)
                """, (email, name, provider, provider_id, avatar_url))
                user_id = cursor.lastrowid
                connection.commit()
                cursor.execute("""
                    SELECT id, email, name, provider, avatar_url
                    FROM users WHERE id = %s
                """, (user_id,))
                return cursor.fetchone()
    except Exception as e:
        print(f"Error in create_or_update_oauth_user: {e}")
        return None
    finally:
        connection.close()

