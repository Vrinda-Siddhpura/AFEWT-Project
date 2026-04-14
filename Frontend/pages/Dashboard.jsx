import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { eventApi } from '../api/events';
import { instituteApi } from '../api/institutes';
import { Calendar, Building2, Users, Trophy, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Pages.css';

const StatCard = ({ title, value, icon, color, delay }) => (
  <div className="glass-panel stat-card" style={{ animationDelay: `${delay}ms` }}>
    <div className="stat-icon" style={{ backgroundColor: `rgba(${color}, 0.1)`, color: `rgb(${color})` }}>
      {icon}
    </div>
    <div className="stat-content">
      <h3 className="stat-title">{title}</h3>
      <p className="stat-value">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    events: 0,
    institutes: 0,
    recentEvents: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [eventsRes, instRes] = await Promise.all([
          eventApi.getAll(),
          instituteApi.getAll()
        ]);
        
        setStats({
          events: eventsRes.events?.length || 0,
          institutes: instRes.institutes?.length || 0,
          // Get 3 most recent events
          recentEvents: (eventsRes.events || []).slice(0, 3) 
        });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="page-container fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.UserName?.split(' ')[0] || 'User'}! 👋</h1>
          <p className="page-subtitle">Here's what's happening with your events today.</p>
        </div>
        <Link to="/events" className="btn btn-primary">
          Explore Events <ArrowRight size={16} />
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard 
          title="Total Events" 
          value={loading ? "..." : stats.events} 
          icon={<Calendar size={24} />}
          color="99, 102, 241" // Primary
          delay={0}
        />
        <StatCard 
          title="Participating Institutes" 
          value={loading ? "..." : stats.institutes} 
          icon={<Building2 size={24} />}
          color="20, 184, 166" // Teal
          delay={100}
        />
        <StatCard 
          title="Total Groups" 
          value="-" // Requires aggregation query or detailed events fetching
          icon={<Users size={24} />}
          color="236, 72, 153" // Pink
          delay={200}
        />
        <StatCard 
          title="Winners Declared" 
          value="-" 
          icon={<Trophy size={24} />}
          color="245, 158, 11" // Amber
          delay={300}
        />
      </div>

      {/* Main Content Area Grid */}
      <div className="dashboard-grid">
        <div className="glass-panel section-card">
          <div className="section-header">
            <h2 className="section-title">Recent Events</h2>
            <Link to="/events" className="text-primary btn-link">View All</Link>
          </div>
          
          {loading ? (
            <div className="loading-state">Loading events...</div>
          ) : stats.recentEvents.length > 0 ? (
            <div className="event-list">
              {stats.recentEvents.map(event => (
                <div key={event._id} className="event-list-item">
                  <div className="event-icon">
                    <Calendar size={20} />
                  </div>
                  <div className="event-info">
                    <h4>{event.EventName}</h4>
                    <p>{event.EventTagline || event.EventLocation}</p>
                  </div>
                  <div className="event-badge">₹{event.EventFees}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No events found. Start by creating one!</p>
            </div>
          )}
        </div>

        <div className="glass-panel section-card">
          <div className="section-header">
            <h2 className="section-title">Quick Actions</h2>
          </div>
          <div className="action-grid">
            <Link to="/institutes" className="action-card">
              <Building2 size={24} className="text-secondary" />
              <span>Manage Institutes</span>
            </Link>
            <Link to="/events" className="action-card">
              <Calendar size={24} className="text-primary" />
              <span>Manage Events</span>
            </Link>
            <Link to="/groups" className="action-card">
              <Users size={24} className="text-accent" />
              <span>Manage Groups</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
