from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from database import init_db, get_db_connection

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

# Initialize database on startup
def create_tables():
    try:
        init_db()
    except Exception as e:
        print(f"Warning: Could not initialize database: {e}")

# Lazy load langchain to avoid import errors on Vercel
_analyze_feedback = None

def get_analyzer():
    global _analyze_feedback
    if _analyze_feedback is None:
        from llm import analyze_feedback
        _analyze_feedback = analyze_feedback
    return _analyze_feedback

# Analyze route
@app.route('/analyze', methods=['POST'])
def analyze():
    print("Analyze request received")
    data = request.get_json()
    user_input = data.get('text')
    if not user_input:
        return jsonify({'error': 'No feedback text provided'}), 400
    
    print(f" Analyzing feedback: {user_input[:50]}...")
    analyze_feedback = get_analyzer()
    result = analyze_feedback(user_input)
    print(f"Analysis result: {result}")
    
    # Save to database
    try:
        connection = get_db_connection()
        print("Database connection established")
        with connection.cursor() as cursor:
            print(f"Saving to DB - user_id: 1, feedback: {result['feedback'][:30]}..., sentiment: {result['sentiment']}")
            cursor.execute("""
                INSERT INTO user_analyses (user_id, feedback, sentiment)
                VALUES (%s, %s, %s)
            """, (1, result['feedback'], result['sentiment']))
            connection.commit()
            print("Data saved to database successfully!")
        connection.close()
    except Exception as e:
        print(f"Error saving analysis: {e}")
        import traceback
        traceback.print_exc()
    
    return jsonify(result)

if __name__ == '__main__':
    # Initialize database
    create_tables()
    
    port = int(os.environ.get('PORT', 5500))
    app.run(debug=True, port=port)
