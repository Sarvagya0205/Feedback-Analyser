import React, { useState } from 'react'
import { analyzeFeedback } from '../services/api'
import { saveAnalysis, getSettings } from '../utils/storage'
import './Analyze.css'

export default function Analyze() {
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [autoSave, setAutoSave] = useState(true)

  React.useEffect(() => {
    const settings = getSettings()
    setAutoSave(settings.autoSave !== false)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!feedback.trim()) {
      setError('Please enter some feedback to analyze')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await analyzeFeedback(feedback)
      setResult(data)
      
      if (autoSave) {
        saveAnalysis(data)
      }
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing feedback')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setFeedback('')
    setResult(null)
    setError(null)
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return '#10b981' // green
      case 'negative':
        return '#ef4444' // red
      case 'neutral':
        return '#6b7280' // gray
      default:
        return '#6b7280'
    }
  }

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return '✓'
      case 'negative':
        return '✗'
      case 'neutral':
        return '○'
      default:
        return '○'
    }
  }

  return (
    <main className="page page--analyze">
      <div className="container">
        <div className="page-header">
          <h1>Analyze Feedback</h1>
          <p className="muted">Enter feedback text to analyze sentiment and get AI-powered insights.</p>
        </div>

        <form onSubmit={handleSubmit} className="analyze-form">
          <div className="form-group">
            <label htmlFor="feedback-input">Feedback Text</label>
            <textarea
              id="feedback-input"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter your feedback here... (e.g., 'The product is amazing and works perfectly!')"
              rows={6}
              disabled={loading}
              className="feedback-textarea"
            />
            <div className="form-footer">
              <span className="char-count">{feedback.length} characters</span>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                />
                <span>Auto-save to reports</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClear}
              className="btn btn--secondary"
              disabled={loading}
            >
              Clear
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading || !feedback.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                'Analyze Feedback'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="alert alert--error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <section className="results-panel">
            <div className="results-header">
              <h2>Analysis Results</h2>
              {autoSave && (
                <span className="badge badge--success">Saved to Reports</span>
              )}
            </div>

            <div className="result-card">
              <div className="result-item">
                <label>Feedback</label>
                <p className="result-text">{result.feedback}</p>
              </div>

              <div className="result-item">
                <label>Sentiment</label>
                <div className="sentiment-badge" style={{ backgroundColor: `${getSentimentColor(result.sentiment)}20`, color: getSentimentColor(result.sentiment), borderColor: getSentimentColor(result.sentiment) }}>
                  <span className="sentiment-icon">{getSentimentIcon(result.sentiment)}</span>
                  <span className="sentiment-text">{result.sentiment.charAt(0).toUpperCase() + result.sentiment.slice(1)}</span>
                </div>
              </div>
            </div>

            <div className="result-actions">
              <button
                onClick={() => {
                  setFeedback(result.feedback)
                  setResult(null)
                }}
                className="btn btn--secondary btn--small"
              >
                Analyze Again
              </button>
              <button
                onClick={() => {
                  const json = JSON.stringify(result, null, 2)
                  const blob = new Blob([json], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `feedback-analysis-${Date.now()}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="btn btn--secondary btn--small"
              >
                Export JSON
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
