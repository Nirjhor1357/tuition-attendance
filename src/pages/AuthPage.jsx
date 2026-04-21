import React, { useState } from 'react';

const INITIAL_SIGNUP = {
  name: '',
  email: '',
  password: '',
  instituteName: '',
};

function AuthPage({ onLogin, onSignup, onBack, demoCredentials }) {
  const [mode, setMode] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState(INITIAL_SIGNUP);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submitLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(loginData);
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const submitSignup = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSignup(signupData);
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <button className="btn btn-ghost" onClick={onBack} type="button">
        Back
      </button>

      <div className="auth-card card">
        <div className="auth-switcher">
          <button
            className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-light'}`}
            type="button"
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`btn ${mode === 'signup' ? 'btn-primary' : 'btn-light'}`}
            type="button"
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={submitLogin} className="auth-form">
            <h2>Welcome back</h2>
            <label>
              Email
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
            </label>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setLoginData(demoCredentials)}
            >
              Fill Demo Credentials
            </button>
          </form>
        ) : (
          <form onSubmit={submitSignup} className="auth-form">
            <h2>Create your institute workspace</h2>
            <label>
              Full Name
              <input
                type="text"
                value={signupData.name}
                onChange={(e) => setSignupData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </label>
            <label>
              Institute Name
              <input
                type="text"
                value={signupData.instituteName}
                onChange={(e) => setSignupData((prev) => ({ ...prev, instituteName: e.target.value }))}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={signupData.email}
                onChange={(e) => setSignupData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={signupData.password}
                onChange={(e) => setSignupData((prev) => ({ ...prev, password: e.target.value }))}
                minLength={6}
                required
              />
            </label>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {error ? <p className="error-text">{error}</p> : null}
      </div>
    </div>
  );
}

export default AuthPage;
