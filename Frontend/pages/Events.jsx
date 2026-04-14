import React, { useState, useEffect } from 'react';
import { eventApi } from '../api/events';
import { departmentApi } from '../api/institutes';
import { authApi } from '../api/auth'; // needed to get full users if we want to assign coordinators
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Calendar, MapPin, IndianRupee, Users } from 'lucide-react';
import './Pages.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  
  // Keep form data matching backend schema exactly
  const initialFormData = {
    EventName: '',
    EventTagline: '',
    EventImage: 'event_default.jpg',
    EventDescription: '',
    GroupMinParticipants: 1,
    GroupMaxParticipants: 1,
    EventFees: 0,
    EventFirstPrice: 0,
    EventSecondPrice: 0,
    EventThirdPrice: 0,
    DepartmentID: '',
    EventLocation: '',
    MaxGroupsAllowed: 10,
    EventMainStudentCoOrdinatorName: '',
    EventMainStudentCoOrdinatorPhone: '',
    EventMainStudentCoOrdinatorEmail: ''
  };
  
  const [formData, setFormData] = useState(initialFormData);

  const { user } = useAuth();
  const isAdmin = user?.isAdmin;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, deptRes] = await Promise.all([
        eventApi.getAll(),
        departmentApi.getAll()
      ]);
      setEvents(eventsRes.events || []);
      setDepartments(deptRes.departments || []);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (eventObj = null) => {
    if (eventObj) {
      setCurrentEvent(eventObj);
      setFormData({
        EventName: eventObj.EventName,
        EventTagline: eventObj.EventTagline || '',
        EventImage: eventObj.EventImage || 'event_default.jpg',
        EventDescription: eventObj.EventDescription || '',
        GroupMinParticipants: eventObj.GroupMinParticipants,
        GroupMaxParticipants: eventObj.GroupMaxParticipants,
        EventFees: eventObj.EventFees || 0,
        EventFirstPrice: eventObj.EventFirstPrice || 0,
        EventSecondPrice: eventObj.EventSecondPrice || 0,
        EventThirdPrice: eventObj.EventThirdPrice || 0,
        DepartmentID: eventObj.DepartmentID,
        EventLocation: eventObj.EventLocation || '',
        MaxGroupsAllowed: eventObj.MaxGroupsAllowed,
        EventMainStudentCoOrdinatorName: eventObj.EventMainStudentCoOrdinatorName || '',
        EventMainStudentCoOrdinatorPhone: eventObj.EventMainStudentCoOrdinatorPhone || '',
        EventMainStudentCoOrdinatorEmail: eventObj.EventMainStudentCoOrdinatorEmail || ''
      });
    } else {
      setCurrentEvent(null);
      setFormData({
        ...initialFormData,
        DepartmentID: departmentFilter || (departments.length > 0 ? departments[0]._id : '')
      });
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const numFields = [
      'GroupMinParticipants', 'GroupMaxParticipants', 'EventFees', 
      'EventFirstPrice', 'EventSecondPrice', 'EventThirdPrice', 'MaxGroupsAllowed'
    ];
    
    setFormData({ 
      ...formData, 
      [name]: numFields.includes(name) ? Number(value) : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.GroupMinParticipants > formData.GroupMaxParticipants) {
      alert("Minimum participants cannot be greater than maximum.");
      return;
    }

    try {
      if (currentEvent) {
        // Prepare partial updates (the API allows it)
        await eventApi.update(currentEvent._id, formData);
      } else {
        await eventApi.create({
          ...formData,
          EventCoOrdinatorID: user._id // Required by backend
        });
      }
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } catch (err) {
      alert("Error saving event: " + (err.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event? This will also delete groups.')) {
      try {
        await eventApi.delete(id);
        fetchData();
      } catch (err) {
        alert("Error deleting event: " + (err.data?.message || err.message));
      }
    }
  };

  // Filter events based on selected Department
  const filteredEvents = departmentFilter
    ? events.filter(e => e.DepartmentID === departmentFilter)
    : events;

  return (
    <div className="page-container fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">Organize and manage upcoming competitions and workshops.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select 
            className="form-input" 
            style={{ width: 'auto', minWidth: '200px' }}
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept._id} value={dept._id}>{dept.DepartmentName}</option>
            ))}
          </select>
          
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Create Event
          </button>
        </div>
      </header>

      {error && <div className="auth-error">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state glass-panel">
          <Calendar size={48} className="text-muted" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No Events Planned</h3>
          <p>There are currently no events registered for the selected filters.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => handleOpenModal()}>
            Host your first event
          </button>
        </div>
      ) : (
        <div className="grid-view" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
          {filteredEvents.map((evt) => (
            <div key={evt._id} className="glass-panel entity-card" style={{ gap: '0.5rem' }}>
              <div className="entity-header" style={{ marginBottom: '0.5rem' }}>
                <h3 className="entity-title" style={{ margin: 0, color: 'var(--color-primary)' }}>{evt.EventName}</h3>
                <span className="event-badge">₹{evt.EventFees}</span>
              </div>
              
              {evt.EventTagline && (
                <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                  "{evt.EventTagline}"
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', margin: '1rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <MapPin size={14} className="text-muted" /> {evt.EventLocation || 'TBA'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <Users size={14} className="text-muted" /> {evt.GroupMinParticipants}-{evt.GroupMaxParticipants} per team
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <IndianRupee size={14} className="text-muted" /> 1st: ₹{evt.EventFirstPrice}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ padding: '2px 6px', background: 'var(--color-surface-hover)', borderRadius: '4px' }}>
                    Max {evt.MaxGroupsAllowed} teams
                  </div>
                </div>
              </div>

              <p className="entity-meta" style={{ flex: 1, marginTop: '0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {evt.EventDescription || "No description provided."}
              </p>

              {(isAdmin || true) && (
                <div className="entity-actions" style={{ borderTop: '1px solid rgba(100, 116, 139, 0.2)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleOpenModal(evt)}>
                    <Edit2 size={16} /> Edit
                  </button>
                  <button className="btn btn-secondary text-error" style={{ flex: 1 }} onClick={() => handleDelete(evt._id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Complex Form Modal for Event */}
      {isModalOpen && (
        <div className="sidebar-overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', margin: '1rem', position: 'relative' }}>
            <h2>{currentEvent ? 'Edit Event' : 'Create New Event'}</h2>
            
            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
              
              <div className="auth-grid">
                <div className="form-group">
                  <label className="form-label">Event Name *</label>
                  <input type="text" name="EventName" className="form-input" value={formData.EventName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select name="DepartmentID" className="form-input" value={formData.DepartmentID} onChange={handleChange} required>
                    <option value="" disabled>Select Department</option>
                    {departments.map(dept => <option key={dept._id} value={dept._id}>{dept.DepartmentName}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tagline</label>
                <input type="text" name="EventTagline" className="form-input" value={formData.EventTagline} onChange={handleChange} />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="EventDescription" className="form-input" rows="3" value={formData.EventDescription} onChange={handleChange}></textarea>
              </div>

              <h3 style={{ fontSize: '1.1rem', margin: '1.5rem 0 1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-surface-hover)' }}>Rules & Structure</h3>
              <div className="auth-grid">
                <div className="form-group">
                  <label className="form-label">Min Participants/Team *</label>
                  <input type="number" min="1" name="GroupMinParticipants" className="form-input" value={formData.GroupMinParticipants} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Participants/Team *</label>
                  <input type="number" min="1" name="GroupMaxParticipants" className="form-input" value={formData.GroupMaxParticipants} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Teams Allowed *</label>
                  <input type="number" min="1" name="MaxGroupsAllowed" className="form-input" value={formData.MaxGroupsAllowed} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input type="text" name="EventLocation" className="form-input" value={formData.EventLocation} onChange={handleChange} />
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', margin: '1.5rem 0 1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-surface-hover)' }}>Financials</h3>
              <div className="auth-grid">
                <div className="form-group">
                  <label className="form-label">Registration Fee (₹) *</label>
                  <input type="number" min="0" name="EventFees" className="form-input" value={formData.EventFees} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">1st Prize (₹)</label>
                  <input type="number" min="0" name="EventFirstPrice" className="form-input" value={formData.EventFirstPrice} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">2nd Prize (₹)</label>
                  <input type="number" min="0" name="EventSecondPrice" className="form-input" value={formData.EventSecondPrice} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">3rd Prize (₹)</label>
                  <input type="number" min="0" name="EventThirdPrice" className="form-input" value={formData.EventThirdPrice} onChange={handleChange} />
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', margin: '1.5rem 0 1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-surface-hover)' }}>Student Coordinator Details</h3>
              <div className="auth-grid">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input type="text" name="EventMainStudentCoOrdinatorName" className="form-input" value={formData.EventMainStudentCoOrdinatorName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="tel" name="EventMainStudentCoOrdinatorPhone" className="form-input" value={formData.EventMainStudentCoOrdinatorPhone} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Email</label>
                  <input type="email" name="EventMainStudentCoOrdinatorEmail" className="form-input" value={formData.EventMainStudentCoOrdinatorEmail} onChange={handleChange} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', position: 'sticky', bottom: '-1rem', padding: '1rem 0', backgroundColor: 'var(--color-surface)' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {currentEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
