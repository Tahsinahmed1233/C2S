import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@c2s.com');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState('admin'); // 'admin' or 'worker'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userObj = {
      id: role === 'admin' ? 1 : 14,
      email: email,
      full_name:
        role === 'admin' ? 'Taskin Amir (Admin)' : 'Md. Rafiq (Worker)',
      role: role,
    };

    localStorage.setItem('user', JSON.stringify(userObj));
    await authAPI.login(email, password);

    setTimeout(() => {
      setLoading(false);
      navigate(role === 'admin' ? '/dashboard' : '/safety');
    }, 400);
  };

  return (
    <div className="login-container">
      <div className="login-hero-panel">
        <div className="login-hero-overlay">
          <div className="login-hero-content">
            <div className="login-badge-tag">C2S Smart Garments Platform</div>
            <h1>
              Automating Factory Intelligence, Worker Safety &amp; Production
            </h1>
            <p>
              Integrated performance appraisals, Bengali-first safety reporting,
              predictive maintenance, and real-time floor balancing.
            </p>
            <div className="login-feature-list">
              <div>
                <i className="fas fa-check-circle"></i> Fair rating-based worker
                wages
              </div>
              <div>
                <i className="fas fa-check-circle"></i> Bangla hazard reporting
                protocol
              </div>
              <div>
                <i className="fas fa-check-circle"></i> AQL 2.5 defect telemetry
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-box-card">
          <div className="login-header-block">
            <div className="brand-logo-badge" style={{ marginBottom: '1rem' }}>
              C2S
            </div>
            <h2>Welcome to C2S</h2>
            <p>Please enter your factory credentials to access your portal</p>
          </div>

          <div className="login-role-tabs">
            <button
              type="button"
              className={`role-tab-btn ${role === 'admin' ? 'active' : ''}`}
              onClick={() => {
                setRole('admin');
                setEmail('admin@c2s.com');
              }}
            >
              <i className="fas fa-user-shield"></i> Admin / Management
            </button>
            <button
              type="button"
              className={`role-tab-btn ${role === 'worker' ? 'active' : ''}`}
              onClick={() => {
                setRole('worker');
                setEmail('worker@c2s.com');
              }}
            >
              <i className="fas fa-user-hard-hat"></i> Factory Worker
            </button>
          </div>

          <form onSubmit={handleLogin} className="login-form-fields">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="login-options-row">
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: 'var(--font-size-xs)',
                  cursor: 'pointer',
                }}
              >
                <input type="checkbox" defaultChecked /> Remember session
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Reset request submitted to factory IT admin.');
                }}
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-primary-500)',
                }}
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Authenticating...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i> Log In as{' '}
                  {role === 'admin' ? 'Admin' : 'Worker'}
                </>
              )}
            </button>
          </form>

          <div className="login-footer-text">
            <span>© 2026 Team The Blueprints • CSE-3411</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
