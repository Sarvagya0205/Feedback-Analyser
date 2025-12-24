from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
]
CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": allowed_origins}},
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Type", "Authorization"],
)

# Health check route - doesn't require any imports
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

@app.route('/', methods=['GET'])
def index():
    return jsonify({'message': 'Feedback Analyser API is running'}), 200

# Lazy load langchain and database modules
_analyze_feedback = None
_db_connection = None

def get_analyzer():
    global _analyze_feedback
    if _analyze_feedback is None:
        try:
            from llm import analyze_feedback
            _analyze_feedback = analyze_feedback
        except Exception as e:
            print(f"Error loading analyzer: {e}")
            raise
    return _analyze_feedback

def get_db_connection():
    try:
        from database import get_db_connection as db_get_connection
        return db_get_connection()
    except Exception as e:
        print(f"Error getting database connection: {e}")
        return None

def init_db_safely():
    try:
        from database import init_db
        init_db()
    except Exception as e:
        print(f"Warning: Could not initialize database: {e}")

# Analyze route
@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        print("Analyze request received")
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        user_input = data.get('text')
        if not user_input:
            return jsonify({'error': 'No feedback text provided'}), 400
        
        print(f"Analyzing feedback: {user_input[:50]}...")
        analyze_feedback = get_analyzer()
        result = analyze_feedback(user_input)
        print(f"Analysis result: {result}")
        
        # Save to database (optional - don't fail if DB is unavailable)
        try:
            connection = get_db_connection()
            if connection:
                with connection.cursor() as cursor:
                    print(f"Saving to DB - feedback: {result.get('feedback', '')[:30]}..., sentiment: {result.get('sentiment')}")
                    cursor.execute("""
                        INSERT INTO user_analyses (user_id, feedback, sentiment)
                        VALUES (%s, %s, %s)
                    """, (1, result.get('feedback', ''), result.get('sentiment', '')))
                    connection.commit()
                    print("Data saved to database successfully!")
                connection.close()
        except Exception as e:
            print(f"Warning: Error saving analysis to database: {e}")
            # Don't fail the request if DB fails
        
        return jsonify(result), 200
    except Exception as e:
        print(f"Error in analyze route: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Route not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Initialize database (optional)
    init_db_safely()
    
    port = int(os.environ.get('PORT', 5500))
    app.run(debug=True, port=port)
