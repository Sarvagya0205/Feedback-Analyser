from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from llm import analyze_feedback
from auth import (
    register_user, authenticate_user, generate_token, verify_token,
    get_user_by_id, create_or_update_oauth_user
)
from database import init_db

app = Flask(__name__)
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]
CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": allowed_origins}},
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Type", "Authorization"],
)

# Initialize database on startup
def create_tables():
    try:
        init_db()
    except Exception as e:
        print(f"Warning: Could not initialize database: {e}")

# Helper function to get current user from token
def get_current_user():
    """Extract user from Authorization header"""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    
    try:
        token = auth_header.split(' ')[1]  # Bearer <token>
        payload = verify_token(token)
        if payload:
            return get_user_by_id(payload['user_id'])
        return None
    except:
        return None

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        user, error = register_user(email, password, name)
        if error:
            return jsonify({'error': error}), 400
        
        token = generate_token(user['id'], user['email'])
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'provider': user['provider']
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        user, error = authenticate_user(email, password)
        if error:
            return jsonify({'error': error}), 401
        
        token = generate_token(user['id'], user['email'])
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'provider': user['provider'],
                'avatar_url': user.get('avatar_url')
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/me', methods=['GET'])
def get_current_user_info():
    """Get current authenticated user info"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    return jsonify({
        'id': user['id'],
        'email': user['email'],
        'name': user['name'],
        'provider': user['provider'],
        'avatar_url': user.get('avatar_url')
    }), 200

@app.route('/api/auth/oauth/google', methods=['POST'])
def oauth_google():
    """Handle Google OAuth callback"""
    try:
        data = request.get_json()
        id_token_str = data.get('id_token') or data.get('credential') or data.get('access_token')
        
        if not id_token_str:
            return jsonify({'error': 'Google token is required'}), 400
        
        # Verify Google ID token and get user info
        from google.oauth2 import id_token
        from google.auth.transport import requests
        
        google_client_id = os.getenv(
            'GOOGLE_CLIENT_ID',
            '1058789935119-ir2vemi3kdutvsu9mgsar8i2qccsqooi.apps.googleusercontent.com'
        )
        if not google_client_id:
            return jsonify({'error': 'Google OAuth not configured'}), 500
        
        try:
            idinfo = id_token.verify_oauth2_token(
                id_token_str, requests.Request(), google_client_id
            )
            
            email = idinfo.get('email')
            name = idinfo.get('name')
            provider_id = idinfo.get('sub')
            avatar_url = idinfo.get('picture')
            
            if not email:
                return jsonify({'error': 'Could not get email from Google'}), 400
            
            # Create or update user
            user = create_or_update_oauth_user(
                email, name, 'google', provider_id, avatar_url
            )
            
            if not user:
                return jsonify({'error': 'Failed to create user'}), 500
            
            token = generate_token(user['id'], user['email'])
            return jsonify({
                'message': 'OAuth login successful',
                'token': token,
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'name': user['name'],
                    'provider': user['provider'],
                    'avatar_url': user.get('avatar_url')
                }
            }), 200
            
        except ValueError as e:
            return jsonify({'error': f'Invalid Google token: {str(e)}'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Existing analyze route (now with optional user tracking)
@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    user_input = data.get('text')
    if not user_input:
        return jsonify({'error': 'No feedback text provided'}), 400
    
    result = analyze_feedback(user_input)
    
    # Optionally save to database if user is authenticated
    user = get_current_user()
    if user:
        try:
            from database import get_db_connection
            connection = get_db_connection()
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO user_analyses (user_id, feedback, sentiment)
                    VALUES (%s, %s, %s)
                """, (user['id'], result['feedback'], result['sentiment']))
                connection.commit()
            connection.close()
        except Exception as e:
            print(f"Error saving analysis: {e}")
    
    return jsonify(result)

if __name__ == '__main__':
    # Initialize database
    create_tables()
    
    port = int(os.environ.get('PORT', 5500))
    app.run(debug=True, port=port)
