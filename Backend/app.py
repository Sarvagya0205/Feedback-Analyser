from flask import Flask, request, jsonify
import os
from llm import analyze_feedback

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    user_input = data.get('text')
    if not user_input:
        return jsonify({'error': 'No feedback text provided'}), 400
    result = analyze_feedback(user_input)
    return jsonify(result)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, port=port)
from flask import Flask, request, jsonify

