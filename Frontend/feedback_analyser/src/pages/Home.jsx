import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

export default function Home() {
  return (
    <main className="page page--home">
      <section className="hero">
        <div className="hero__inner">
          <h1>Welcome to Feedback Analyser</h1>
          <p className="hero__subtitle">
            Quickly analyze and visualize user feedback using AI-powered sentiment analysis.
            Get instant insights from customer feedback to make data-driven decisions.
          </p>
          <div className="hero__actions">
            <Link to="/analyze" className="btn btn--primary btn--large">
              Start Analyzing
            </Link>
            <Link to="/reports" className="btn btn--secondary btn--large">
              View Reports
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="features__title">Features</h2>
          <div className="grid">
            <article className="card">
              <div className="card__icon">🔍</div>
              <h3>Analyze Feedback</h3>
              <p>
                Upload or paste feedback text to get instant sentiment analysis. 
                Our AI classifies feedback as positive, negative, or neutral.
              </p>
              <Link to="/analyze" className="card__link">
                Try it now →
              </Link>
            </article>
            <article className="card">
              <div className="card__icon">📊</div>
              <h3>View Reports</h3>
              <p>
                Access all your saved analyses in one place. Filter by sentiment, 
                search through feedback, and export your data.
              </p>
              <Link to="/reports" className="card__link">
                View reports →
              </Link>
            </article>
            <article className="card">
              <div className="card__icon">⚙️</div>
              <h3>Customize Settings</h3>
              <p>
                Configure your API endpoint, export formats, and analysis preferences 
                to match your workflow.
              </p>
              <Link to="/settings" className="card__link">
                Configure →
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step__number">1</div>
              <h3>Enter Feedback</h3>
              <p>Paste or type your customer feedback text into the analysis form.</p>
            </div>
            <div className="step">
              <div className="step__number">2</div>
              <h3>AI Analysis</h3>
              <p>Our AI-powered system analyzes the sentiment and classifies the feedback.</p>
            </div>
            <div className="step">
              <div className="step__number">3</div>
              <h3>Get Insights</h3>
              <p>View the results instantly and save them to your reports for later review.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
