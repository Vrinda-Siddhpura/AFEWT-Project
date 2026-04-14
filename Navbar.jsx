import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu, User, LogOut } from 'lucide-react';
import './Layout.css'; // Add local CSS for layout

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-left">
        <button className="icon-btn" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <Menu size={24} />
        </button>
        <div className="brand">
          <span className="brand-highlight">Frolic</span> Events
        </div>
      </div>

      <div className="navbar-right">
        {user ? (
          <div className="user-menu">
            <div className="user-info">
              <span className="user-name">{user.UserName || 'User'}</span>
              {user.isAdmin && <span className="badge-admin">Admin</span>}
            </div>
            <button className="icon-btn" title="Profile">
              <User size={20} />
            </button>
            <button className="icon-btn text-error" onClick={handleLogout} title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <div className="auth-links">
            <button className="btn btn-secondary" onClick={() => navigate('/login')}>Login</button>
            <button className="btn btn-primary" onClick={() => navigate('/register')}>Sign Up</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
