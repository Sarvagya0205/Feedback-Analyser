import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAnalyses, deleteAnalysis, clearAllAnalyses, getSettings } from '../utils/storage'
import './Reports.css'

export default function Reports() {
  const [analyses, setAnalyses] = useState([])
  const [filter, setFilter] = useState('all') // all, positive, negative, neutral
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = () => {
    const saved = getAnalyses()
    setAnalyses(saved)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      deleteAnalysis(id)
      loadAnalyses()
    }
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all analyses? This cannot be undone.')) {
      clearAllAnalyses()
      loadAnalyses()
    }
  }

  const handleExport = (analysis) => {
    const settings = getSettings()
    const format = settings.exportFormat || 'json'
    
    if (format === 'json') {
      const json = JSON.stringify(analysis, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `feedback-${analysis.id}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      const csv = `Feedback,Sentiment,Date\n"${analysis.feedback.replace(/"/g, '""')}",${analysis.sentiment},${new Date(analysis.timestamp).toLocaleString()}\n`
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `feedback-${analysis.id}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleExportAll = () => {
    const filtered = getFilteredAnalyses()
    const settings = getSettings()
    const format = settings.exportFormat || 'json'
    
    if (format === 'json') {
      const json = JSON.stringify(filtered, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `all-feedback-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      const csv = ['Feedback,Sentiment,Date', ...filtered.map(a => 
        `"${a.feedback.replace(/"/g, '""')}",${a.sentiment},${new Date(a.timestamp).toLocaleString()}`
      )].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `all-feedback-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const getFilteredAnalyses = () => {
    let filtered = analyses

    // Filter by sentiment
    if (filter !== 'all') {
      filtered = filtered.filter(a => a.sentiment === filter)
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(a => 
        a.feedback.toLowerCase().includes(term) ||
        a.sentiment.toLowerCase().includes(term)
      )
    }

    return filtered
  }

  const filteredAnalyses = getFilteredAnalyses()

  const getSentimentStats = () => {
    const stats = {
      total: analyses.length,
      positive: analyses.filter(a => a.sentiment === 'positive').length,
      negative: analyses.filter(a => a.sentiment === 'negative').length,
      neutral: analyses.filter(a => a.sentiment === 'neutral').length,
    }
    return stats
  }

  const stats = getSentimentStats()

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return '#10b981'
      case 'negative':
        return '#ef4444'
      case 'neutral':
        return '#6b7280'
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
    <main className="page page--reports">
      <div className="container">
        <div className="page-header">
          <h1>Reports</h1>
          <p className="muted">View and manage your saved feedback analyses.</p>
        </div>

        {analyses.length > 0 ? (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Analyses</div>
              </div>
              <div className="stat-card stat-card--positive">
                <div className="stat-value">{stats.positive}</div>
                <div className="stat-label">Positive</div>
              </div>
              <div className="stat-card stat-card--negative">
                <div className="stat-value">{stats.negative}</div>
                <div className="stat-label">Negative</div>
              </div>
              <div className="stat-card stat-card--neutral">
                <div className="stat-value">{stats.neutral}</div>
                <div className="stat-label">Neutral</div>
              </div>
            </div>

            <div className="filters-panel">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${filter === 'positive' ? 'active' : ''}`}
                  onClick={() => setFilter('positive')}
                >
                  Positive
                </button>
                <button
                  className={`filter-btn ${filter === 'negative' ? 'active' : ''}`}
                  onClick={() => setFilter('negative')}
                >
                  Negative
                </button>
                <button
                  className={`filter-btn ${filter === 'neutral' ? 'active' : ''}`}
                  onClick={() => setFilter('neutral')}
                >
                  Neutral
                </button>
              </div>
              <div className="export-actions">
                <button onClick={handleExportAll} className="btn btn--secondary btn--small">
                  Export All ({filteredAnalyses.length})
                </button>
                <button onClick={handleClearAll} className="btn btn--danger btn--small">
                  Clear All
                </button>
              </div>
            </div>

            <div className="reports-list">
              {filteredAnalyses.length > 0 ? (
                filteredAnalyses.map((analysis) => (
                  <div key={analysis.id} className="report-card">
                    <div className="report-header">
                      <div className="report-meta">
                        <span
                          className="sentiment-badge"
                          style={{
                            backgroundColor: `${getSentimentColor(analysis.sentiment)}20`,
                            color: getSentimentColor(analysis.sentiment),
                            borderColor: getSentimentColor(analysis.sentiment),
                          }}
                        >
                          <span className="sentiment-icon">{getSentimentIcon(analysis.sentiment)}</span>
                          <span className="sentiment-text">
                            {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}
                          </span>
                        </span>
                        <span className="report-date">
                          {new Date(analysis.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="report-actions">
                        <button
                          onClick={() => handleExport(analysis)}
                          className="btn-icon"
                          title="Export"
                        >
                          ⬇
                        </button>
                        <button
                          onClick={() => handleDelete(analysis.id)}
                          className="btn-icon btn-icon--danger"
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                    <div className="report-content">
                      <p>{analysis.feedback}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No analyses match your filters.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h2>No Reports Yet</h2>
            <p>Start analyzing feedback to see your reports here.</p>
            <Link to="/analyze" className="btn btn--primary">
              Analyze Feedback
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
