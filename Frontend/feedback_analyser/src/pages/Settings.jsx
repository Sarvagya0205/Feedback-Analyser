import React, { useState, useEffect } from 'react'
import { getSettings, saveSettings } from '../utils/storage'
import './Settings.css'

export default function Settings() {
  const [settings, setSettings] = useState({
    apiUrl: 'http://localhost:5500',
    exportFormat: 'json',
    autoSave: true,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const loaded = getSettings()
    setSettings(loaded)
  }, [])

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
    setSaved(false)
  }

  const handleSave = () => {
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    const defaultSettings = {
      apiUrl: 'http://localhost:5500',
      exportFormat: 'json',
      autoSave: true,
    }
    setSettings(defaultSettings)
    saveSettings(defaultSettings)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <main className="page page--settings">
      <div className="container">
        <div className="page-header">
          <h1>Settings</h1>
          <p className="muted">Configure your analysis preferences and export options.</p>
        </div>

        <div className="settings-panel">
          <section className="settings-section">
            <h2>API Configuration</h2>
            <div className="setting-item">
              <label htmlFor="api-url">Backend API URL</label>
              <input
                id="api-url"
                type="text"
                value={settings.apiUrl}
                onChange={(e) => handleChange('apiUrl', e.target.value)}
                placeholder="http://localhost:5500"
                className="setting-input"
              />
              <p className="setting-hint">
                The URL of your Flask backend server. Default: http://localhost:5500
              </p>
            </div>
          </section>

          <section className="settings-section">
            <h2>Export Settings</h2>
            <div className="setting-item">
              <label htmlFor="export-format">Default Export Format</label>
              <select
                id="export-format"
                value={settings.exportFormat}
                onChange={(e) => handleChange('exportFormat', e.target.value)}
                className="setting-select"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
              <p className="setting-hint">
                Choose the default format for exporting reports.
              </p>
            </div>
          </section>

          <section className="settings-section">
            <h2>Analysis Settings</h2>
            <div className="setting-item">
              <label className="checkbox-setting">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleChange('autoSave', e.target.checked)}
                />
                <span>Auto-save analyses to Reports</span>
              </label>
              <p className="setting-hint">
                When enabled, all analyses will be automatically saved to the Reports page.
              </p>
            </div>
          </section>

          <div className="settings-actions">
            <button onClick={handleReset} className="btn btn--secondary">
              Reset to Defaults
            </button>
            <button onClick={handleSave} className="btn btn--primary">
              {saved ? (
                <>
                  <span className="check-icon">✓</span>
                  Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>

          {saved && (
            <div className="save-notification">
              Settings saved successfully!
            </div>
          )}
        </div>

        <section className="info-panel">
          <h2>About</h2>
          <div className="info-content">
            <p>
              <strong>Feedback Analyser</strong> is an AI-powered tool for analyzing user feedback
              and extracting sentiment insights. Configure your settings above to customize the
              application behavior.
            </p>
            <div className="info-list">
              <div className="info-item">
                <strong>API Endpoint:</strong> POST /analyze
              </div>
              <div className="info-item">
                <strong>Request Body:</strong> {'{ "text": "your feedback here" }'}
              </div>
              <div className="info-item">
                <strong>Response:</strong> {'{ "feedback": "...", "sentiment": "positive|negative|neutral" }'}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
