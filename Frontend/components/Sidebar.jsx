import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Building2, 
  Briefcase, 
  Calendar, 
  Users, 
  Trophy 
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Overview', icon: <Home size={20} /> },
  { path: '/events', label: 'Events', icon: <Calendar size={20} /> },
  { path: '/institutes', label: 'Institutes', icon: <Building2 size={20} /> },
  { path: '/departments', label: 'Departments', icon: <Briefcase size={20} /> },
  { path: '/groups', label: 'Groups & Teams', icon: <Users size={20} /> },
];

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={closeSidebar}></div>
      <aside className={`sidebar glass-panel ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">Navigation</div>
        </div>
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    // Only close sidebar on mobile when a link is clicked
                    if (window.innerWidth <= 768) {
                      closeSidebar();
                    }
                  }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
            
            {/* Admin specific links */}
            {user?.isAdmin && (
              <li className="nav-item nav-item-admin">
                <div className="nav-section-title">Admin</div>
                <NavLink 
                  to="/admin/users" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon"><Users size={20} /></span>
                  <span className="nav-label">User Management</span>
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
