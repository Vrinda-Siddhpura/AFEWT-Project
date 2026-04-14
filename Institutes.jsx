import React, { useState, useEffect } from 'react';
import { instituteApi } from '../api/institutes';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import './Pages.css';

const Institutes = () => {
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInstitute, setCurrentInstitute] = useState(null);
  const [formData, setFormData] = useState({
    InstituteName: '',
    InstituteDescription: '',
    InstituteImage: 'institute_default.jpg' // Default dummy image
  });

  const { user } = useAuth();
  const isAdmin = user?.isAdmin;

  // Since InstituteCoOrdinatorID is required when creating,
  // we default to the current user's ID for simplicity here.
  // In a full app, an admin might select a specific coordinator.

  const fetchInstitutes = async () => {
    setLoading(true);
    try {
      const res = await instituteApi.getAll();
      setInstitutes(res.institutes || []);
    } catch (err) {
      setError(err.message || "Failed to fetch institutes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const handleOpenModal = (institute = null) => {
    if (institute) {
      setCurrentInstitute(institute);
      setFormData({
        InstituteName: institute.InstituteName,
        InstituteDescription: institute.InstituteDescription || '',
        InstituteImage: institute.InstituteImage || 'institute_default.jpg'
      });
    } else {
      setCurrentInstitute(null);
      setFormData({
        InstituteName: '',
        InstituteDescription: '',
        InstituteImage: 'institute_default.jpg'
      });
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentInstitute) {
        await instituteApi.update(currentInstitute._id, formData);
      } else {
        await instituteApi.create({
          ...formData,
          InstituteCoOrdinatorID: user._id // Required by backend
        });
      }
      setIsModalOpen(false);
      fetchInstitutes(); // Refresh list
    } catch (err) {
      alert("Error saving institute: " + (err.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this institute?')) {
      try {
        await instituteApi.delete(id);
        fetchInstitutes();
      } catch (err) {
        alert("Error deleting institute: " + (err.data?.message || err.message));
      }
    }
  };

  return (
    <div className="page-container fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Institutes</h1>
          <p className="page-subtitle">Manage participating educational institutes.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Add Institute
          </button>
        )}
      </header>

      {error && <div className="auth-error">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading institutes...</div>
      ) : institutes.length === 0 ? (
        <div className="empty-state glass-panel">
          <Building2 size={48} className="text-muted" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No Institutes Found</h3>
          <p>There are currently no institutes registered in the system.</p>
          {isAdmin && (
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => handleOpenModal()}>
              Create the first one
            </button>
          )}
        </div>
      ) : (
        <div className="grid-view">
          {institutes.map((inst) => (
            <div key={inst._id} className="glass-panel entity-card">
              <div className="entity-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="stat-icon" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)' }}>
                    <Building2 size={20} />
                  </div>
                  <h3 className="entity-title">{inst.InstituteName}</h3>
                </div>
              </div>
              
              <p className="entity-meta" style={{ flex: 1 }}>
                {inst.InstituteDescription || "No description provided."}
              </p>
              
              <div className="entity-meta" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
                <div>Added: {new Date(inst.createdAt).toLocaleDateString()}</div>
              </div>

              {isAdmin && (
                <div className="entity-actions" style={{ borderTop: '1px solid rgba(100, 116, 139, 0.2)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleOpenModal(inst)}>
                    <Edit2 size={16} /> Edit
                  </button>
                  <button className="btn btn-secondary text-error" style={{ flex: 1 }} onClick={() => handleDelete(inst._id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Simple Modal */}
      {isModalOpen && (
        <div className="sidebar-overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', margin: '1rem', position: 'relative' }}>
            <h2>{currentInstitute ? 'Edit Institute' : 'Add New Institute'}</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Institute Name</label>
                <input
                  type="text"
                  name="InstituteName"
                  className="form-input"
                  value={formData.InstituteName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="InstituteDescription"
                  className="form-input"
                  rows="4"
                  value={formData.InstituteDescription}
                  onChange={handleChange}
                ></textarea>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {currentInstitute ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Institutes;
