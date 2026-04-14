import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    UserName: '',
    UserPassword: '',
    confirmPassword: '',
    EmailAddress: '',
    PhoneNumber: '',
    isAdmin: false
  });
  
  const [validationError, setValidationError] = useState('');
  const { register, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
    // Clear validation error when user types
    if (validationError) setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.UserPassword !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    try {
      // Exclude confirmPassword from the actual API request
      const { confirmPassword, ...dataToSend } = formData;
      await register(dataToSend);
      // Registration successful, redirect to login
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card" style={{ maxWidth: '550px' }}>
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join Frolic to manage and participate in events</p>
        </div>

        {(error || validationError) && (
          <div className="auth-error">{validationError || error}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label className="form-label" htmlFor="UserName">Full Name</label>
            <input
              type="text"
              id="UserName"
              name="UserName"
              className="form-input"
              placeholder="John Doe"
              value={formData.UserName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-grid">
            <div className="auth-input-group">
              <label className="form-label" htmlFor="EmailAddress">Email Address</label>
              <input
                type="email"
                id="EmailAddress"
                name="EmailAddress"
                className="form-input"
                placeholder="john@example.com"
                value={formData.EmailAddress}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-input-group">
              <label className="form-label" htmlFor="PhoneNumber">Phone Number</label>
              <input
                type="tel"
                id="PhoneNumber"
                name="PhoneNumber"
                className="form-input"
                placeholder="1234567890"
                value={formData.PhoneNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-grid">
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
                minLength="6"
              />
            </div>

            <div className="auth-input-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>
          </div>

          {/* Hidden/Admin specific checkbox for testing mostly, in production usually not exposed directly on signup */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="isAdmin"
              name="isAdmin"
              checked={formData.isAdmin}
              onChange={handleChange}
            />
            <label htmlFor="isAdmin" style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Register as Admin (For testing purposes)
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary auth-btn" 
            disabled={loading}
          >
            {loading ? 'Creating account...' : (
              <>
                <UserPlus size={20} /> Sign Up
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? 
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
