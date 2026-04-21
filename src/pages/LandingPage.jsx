import React from 'react';

function LandingPage({ onStart, onDemoLogin }) {
  return (
    <div className="landing-wrap">
      <header className="landing-hero card">
        <span className="pill">SaaS Attendance Platform</span>
        <h1>Run modern tuition operations from a single dashboard</h1>
        <p>
          Manage students, capture attendance with status tracking, monitor risk students, and generate
          analytics reports that are ready for institutions.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={onStart} type="button">
            Get Started
          </button>
          <button className="btn btn-light" onClick={onDemoLogin} type="button">
            Use Demo Account
          </button>
        </div>
      </header>

      <section className="landing-grid">
        <article className="card feature-card">
          <h3>Multi-Institute Ready</h3>
          <p>Each account is mapped to an institute so data remains logically isolated by tenant.</p>
        </article>
        <article className="card feature-card">
          <h3>Actionable Reports</h3>
          <p>Visual monthly trends, student percentages, and low-attendance alerts for quick follow-up.</p>
        </article>
        <article className="card feature-card">
          <h3>Smart Attendance</h3>
          <p>Present, absent, and late tracking with one-click mark all present and editable history.</p>
        </article>
      </section>

      <footer className="landing-foot card">
        <p>Demo login: demo@tuitionpro.app / demo123</p>
      </footer>
    </div>
  );
}

export default LandingPage;
