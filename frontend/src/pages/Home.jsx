import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <section className="hero-section">
        <h1 className="hero-title">SafeMaga Research Platform</h1>
        <p className="hero-subtitle">
          An end-to-end full-stack research system integrating MERN architecture with high-performance Python AI/ML analytical pipelines.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/dashboard" className="btn btn-primary">
            Explore Dashboard
          </Link>
          <a href="#features" className="btn btn-secondary">
            System Overview
          </a>
        </div>
      </section>

      <section id="features" className="card-grid">
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem', color: '#1e3a8a' }}>Full-Stack Client & API</h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Built on React (Vite) and Node.js Express, providing modern state management, secure JWT authentication, and responsive interfaces.
          </p>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '0.5rem', color: '#1e3a8a' }}>FastAPI AI/ML Bridge</h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Dedicated high-throughput Python inference engine bridging data pipelines, model inference, and real-time analytical evaluation.
          </p>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '0.5rem', color: '#1e3a8a' }}>Modular Data Layer</h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Clean MongoDB persistence layer structured with Mongoose schemas, connection pooling, and automated seed scripts for team parity.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
