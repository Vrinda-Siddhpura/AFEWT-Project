import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { eventApi } from '../api/events';
import { groupApi } from '../api/events'; // groupApi was exported from events.js in our setup
import { Users, Plus, UserPlus, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import './Pages.css';

const Groups = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [groups, setGroups] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Group Creation Modal
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupFormData, setGroupFormData] = useState({ GroupName: '' });

  // Participant Management Modal
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [participantFormData, setParticipantFormData] = useState({
    ParticipantName: '',
    ParticipantEnrollmentNumber: '',
    ParticipantInstituteName: '',
    ParticipantCity: '',
    ParticipantMobile: '',
    ParticipantEmail: ''
  });

  const { user } = useAuth();
  const isAdmin = user?.isAdmin;

  // Initialize: Fetch Events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await eventApi.getAll();
        const activeEvents = res.events || [];
        setEvents(activeEvents);
        if (activeEvents.length > 0) {
          setSelectedEventId(activeEvents[0]._id);
        }
      } catch (err) {
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Fetch Groups when Selected Event changes
  useEffect(() => {
    if (!selectedEventId) return;
    
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const res = await eventApi.getGroups(selectedEventId);
        setGroups(res.groups || []);
      } catch (err) {
        // Handle 404 gracefully if no groups exist yet
        if (err.status === 404) {
          setGroups([]);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroups();
  }, [selectedEventId]);

  // Group Handlers
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await eventApi.createGroup(selectedEventId, groupFormData);
      setIsGroupModalOpen(false);
      setGroupFormData({ GroupName: '' });
      // Refresh groups
      const res = await eventApi.getGroups(selectedEventId);
      setGroups(res.groups || []);
    } catch (err) {
      alert("Error creating group: " + (err.data?.message || err.message));
    }
  };

  const handleDeleteGroup = async (id) => {
    if (window.confirm('Delete this group and all its participants?')) {
      try {
        await groupApi.delete(id);
        setGroups(groups.filter(g => g._id !== id));
      } catch (err) {
         alert("Error deleting group: " + (err.data?.message || err.message));
      }
    }
  };

  const toggleGroupStatus = async (groupId, field, currentValue) => {
    try {
      await groupApi.update(groupId, { [field]: !currentValue });
      // Update local state optimistic
      setGroups(groups.map(g => g._id === groupId ? { ...g, [field]: !currentValue } : g));
    } catch (err) {
      alert("Error updating status: " + (err.data?.message || err.message));
    }
  };

  // Participant Handlers
  const openParticipantModal = async (group) => {
    setActiveGroup(group);
    setIsParticipantModalOpen(true);
    try {
      const res = await groupApi.getParticipants(group._id);
      setParticipants(res.participants || []);
    } catch (err) {
      setParticipants([]);
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    try {
      await groupApi.addParticipant(activeGroup._id, participantFormData);
      // Refresh participants
      const res = await groupApi.getParticipants(activeGroup._id);
      setParticipants(res.participants || []);
      
      // Reset form but keep institute/city empty for convenience often
      setParticipantFormData({
        ParticipantName: '',
        ParticipantEnrollmentNumber: '',
        ParticipantInstituteName: participantFormData.ParticipantInstituteName,
        ParticipantCity: participantFormData.ParticipantCity,
        ParticipantMobile: '',
        ParticipantEmail: ''
      });
    } catch (err) {
       alert("Error adding participant: " + (err.data?.message || err.message));
    }
  };

  const getEventName = () => {
    const ev = events.find(e => e._id === selectedEventId);
    return ev ? ev.EventName : '';
  };

  return (
    <div className="page-container fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Groups & Teams</h1>
          <p className="page-subtitle">Manage teams for {getEventName() || 'events'}.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select 
            className="form-input" 
            style={{ width: 'auto', minWidth: '250px' }}
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.length === 0 && <option value="">No Events Available</option>}
            {events.map(evt => (
              <option key={evt._id} value={evt._id}>{evt.EventName}</option>
            ))}
          </select>
          
          {selectedEventId && (isAdmin || true) && (
            <button className="btn btn-primary" onClick={() => setIsGroupModalOpen(true)}>
              <Plus size={18} /> Add Group
            </button>
          )}
        </div>
      </header>

      {error && <div className="auth-error">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading data...</div>
      ) : !selectedEventId ? (
        <div className="empty-state glass-panel">
           <Users size={48} className="text-muted" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
           <h3>No Events Found</h3>
           <p>You need to create an event before you can manage groups.</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="empty-state glass-panel">
          <Users size={48} className="text-muted" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No Groups Registered</h3>
          <p>There are currently no teams registered for {getEventName()}.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setIsGroupModalOpen(true)}>
            Register first team
          </button>
        </div>
      ) : (
        <div className="grid-view">
          {groups.map((grp) => (
            <div key={grp._id} className="glass-panel entity-card">
              <div className="entity-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="stat-icon" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(20, 184, 166, 0.1)', color: 'var(--color-accent)' }}>
                    <Users size={20} />
                  </div>
                  <h3 className="entity-title" style={{ margin: 0 }}>{grp.GroupName}</h3>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-muted">Payment Status</span>
                  <button 
                    className={`btn btn-secondary ${grp.IsPaymentDone ? 'text-success' : 'text-error'}`}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                    onClick={() => toggleGroupStatus(grp._id, 'IsPaymentDone', grp.IsPaymentDone)}
                  >
                    {grp.IsPaymentDone ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                    {grp.IsPaymentDone ? ' Paid' : ' Unpaid'}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-muted">Attendance</span>
                   <button 
                    className={`btn btn-secondary ${grp.IsPresent ? 'text-success' : 'text-muted'}`}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                    onClick={() => toggleGroupStatus(grp._id, 'IsPresent', grp.IsPresent)}
                  >
                    {grp.IsPresent ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                    {grp.IsPresent ? ' Present' : ' Absent'}
                  </button>
                </div>
              </div>

              <div className="entity-actions" style={{ borderTop: '1px solid rgba(100, 116, 139, 0.2)', paddingTop: '1rem', marginTop: 'auto' }}>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => openParticipantModal(grp)}>
                  <UserPlus size={16} /> Manage Members
                </button>
                {(isAdmin || true) && (
                  <button className="btn btn-secondary text-error" style={{ flex: 1 }} onClick={() => handleDeleteGroup(grp._id)}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {isGroupModalOpen && (
        <div className="sidebar-overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', margin: '1rem' }}>
            <h2>Create New Team</h2>
            <form onSubmit={handleCreateGroup} style={{ marginTop: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Team/Group Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={groupFormData.GroupName}
                  onChange={(e) => setGroupFormData({GroupName: e.target.value})}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsGroupModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Group</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Participants Modal */}
      {isParticipantModalOpen && activeGroup && (
        <div className="sidebar-overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', margin: '1rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Team Members: {activeGroup.GroupName}</h2>
                <button className="icon-btn text-error" onClick={() => setIsParticipantModalOpen(false)}>
                  <XCircle size={24} />
                </button>
             </div>

             <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
               {/* List Participants */}
               <div>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Current Members ({participants.length})</h3>
                  {participants.length === 0 ? (
                    <div className="text-muted" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                      No members added yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {participants.map(p => (
                        <div key={p._id} style={{ padding: '1rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: '600' }}>
                              {p.ParticipantName} 
                              {p.IsGroupLeader && <span className="badge-admin" style={{ marginLeft: '0.5rem', backgroundColor: 'var(--color-success)' }}>Leader</span>}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>{p.ParticipantEnrollmentNumber} &bull; {p.ParticipantInstituteName}</div>
                          </div>
                   
                        </div>
                      ))}
                    </div>
                  )}
               </div>

               {/* Add Participant Form */}
               <div>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Add New Member</h3>
                  <form onSubmit={handleAddParticipant} style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input type="text" className="form-input" required 
                        value={participantFormData.ParticipantName} 
                        onChange={e => setParticipantFormData({...participantFormData, ParticipantName: e.target.value})} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Enrollment Number *</label>
                      <input type="text" className="form-input" required 
                        value={participantFormData.ParticipantEnrollmentNumber} 
                        onChange={e => setParticipantFormData({...participantFormData, ParticipantEnrollmentNumber: e.target.value})} 
                      />
                    </div>
                    
                    <div className="auth-grid" style={{ gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Institute</label>
                        <input type="text" className="form-input" 
                          value={participantFormData.ParticipantInstituteName} 
                          onChange={e => setParticipantFormData({...participantFormData, ParticipantInstituteName: e.target.value})} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input type="text" className="form-input" 
                          value={participantFormData.ParticipantCity} 
                          onChange={e => setParticipantFormData({...participantFormData, ParticipantCity: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div className="auth-grid" style={{ gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Mobile</label>
                        <input type="tel" className="form-input" 
                          value={participantFormData.ParticipantMobile} 
                          onChange={e => setParticipantFormData({...participantFormData, ParticipantMobile: e.target.value})} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-input" 
                          value={participantFormData.ParticipantEmail} 
                          onChange={e => setParticipantFormData({...participantFormData, ParticipantEmail: e.target.value})} 
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                      <UserPlus size={16} /> Add Member
                    </button>
                  </form>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
