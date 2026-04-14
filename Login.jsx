import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    EmailAddress: '',
    UserPassword: ''
  });
  
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/'); // Redirect to dashboard on success
    } catch (err) {
      // Error is handled by context, but we could do more here if needed
      console.error("Login component caught error:", err);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to manage your events</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label className="form-label" htmlFor="EmailAddress">Email Address</label>
            <input
              type="email"
              id="EmailAddress"
              name="EmailAddress"
              className="form-input"
              placeholder="you@example.com"
              value={formData.EmailAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-input-group">
            <label className="form-label" htmlFor="UserPassword">Password</label>
            <input
              type="password"
              id="UserPassword"
              name="UserPassword"
              className="form-input"
              placeholder="••••••••"
              value={formData.UserPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary auth-btn" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : (
              <>
                <LogIn size={20} /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? 
          <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
