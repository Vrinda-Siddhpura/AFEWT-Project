import React, { useState, useEffect } from 'react';
import { departmentApi, instituteApi } from '../api/institutes';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Briefcase, Filter } from 'lucide-react';
import './Pages.css';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [selectedInstituteFilter, setSelectedInstituteFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [formData, setFormData] = useState({
    DepartmentName: '',
    DepartmentDescription: '',
    InstituteID: '',
    DepartmentImage: 'dept_default.jpg'
  });

  const { user } = useAuth();
  const isAdmin = user?.isAdmin;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, instRes] = await Promise.all([
        departmentApi.getAll(),
        instituteApi.getAll()
      ]);
      setDepartments(deptRes.departments || []);
      setInstitutes(instRes.institutes || []);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setCurrentDepartment(dept);
      setFormData({
        DepartmentName: dept.DepartmentName,
        DepartmentDescription: dept.DepartmentDescription || '',
        InstituteID: dept.InstituteID,
        DepartmentImage: dept.DepartmentImage || 'dept_default.jpg'
      });
    } else {
      setCurrentDepartment(null);
      setFormData({
        DepartmentName: '',
        DepartmentDescription: '',
        InstituteID: selectedInstituteFilter || (institutes.length > 0 ? institutes[0]._id : ''),
        DepartmentImage: 'dept_default.jpg'
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
      if (currentDepartment) {
        await departmentApi.update(currentDepartment._id, formData);
      } else {
        await departmentApi.create({
          ...formData,
          DepartmentCoOrdinatorID: user._id // Required by backend
        });
      }
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } catch (err) {
      alert("Error saving department: " + (err.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentApi.delete(id);
        fetchData();
      } catch (err) {
        alert("Error deleting department: " + (err.data?.message || err.message));
      }
    }
  };

  // Filter departments based on selected institute
  const filteredDepartments = selectedInstituteFilter
    ? departments.filter(d => d.InstituteID === selectedInstituteFilter)
    : departments;

  // Helper to get institute name
  const getInstituteName = (instituteId) => {
    const inst = institutes.find(i => i._id === instituteId);
    return inst ? inst.InstituteName : 'Unknown Institute';
  };

  return (
    <div className="page-container fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">Manage departments across all institutes.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '0.25rem 1rem', borderRadius: 'var(--radius-full)' }}>
            <Filter size={16} className="text-muted" style={{ marginRight: '0.5rem' }} />
            <select
              className="form-input"
              style={{ border: 'none', background: 'transparent', padding: '0.25rem', minWidth: '200px' }}
              value={selectedInstituteFilter}
              onChange={(e) => setSelectedInstituteFilter(e.target.value)}
            >
              <option value="">All Institutes</option>
              {institutes.map(inst => (
                <option key={inst._id} value={inst._id}>{inst.InstituteName}</option>
              ))}
            </select>
          </div>

          {(isAdmin || true) && ( // Usually department coordinators can also add
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              <Plus size={18} /> Add Department
            </button>
          )}
        </div>
      </header>

      {error && <div className="auth-error">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading departments...</div>
      ) : filteredDepartments.length === 0 ? (
        <div className="empty-state glass-panel">
          <Briefcase size={48} className="text-muted" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No Departments Found</h3>
          <p>
            {selectedInstituteFilter
              ? "This institute doesn't have any departments yet."
              : "There are currently no departments registered in the system."}
          </p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => handleOpenModal()}>
            Create the first one
          </button>
        </div>
      ) : (
        <div className="grid-view">
          {filteredDepartments.map((dept) => (
            <div key={dept._id} className="glass-panel entity-card">
              <div className="entity-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="stat-icon" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(236, 72, 153, 0.1)', color: 'var(--color-secondary)' }}>
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="entity-title" style={{ marginBottom: '0.2rem' }}>{dept.DepartmentName}</h3>
                    <span className="badge-admin" style={{ backgroundColor: 'var(--color-primary-light)', color: 'white' }}>
                      {getInstituteName(dept.InstituteID)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="entity-meta" style={{ flex: 1, marginTop: '0.5rem' }}>
                {dept.DepartmentDescription || "No description provided."}
              </p>

              {(isAdmin || true) && (
                <div className="entity-actions" style={{ borderTop: '1px solid rgba(100, 116, 139, 0.2)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleOpenModal(dept)}>
                    <Edit2 size={16} /> Edit
                  </button>
                  <button className="btn btn-secondary text-error" style={{ flex: 1 }} onClick={() => handleDelete(dept._id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Basic Modal Implementation */}
      {isModalOpen && (
        <div className="sidebar-overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', margin: '1rem', position: 'relative' }}>
            <h2>{currentDepartment ? 'Edit Department' : 'Add New Department'}</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>

              <div className="form-group">
                <label className="form-label">Institute</label>
                <select
                  name="InstituteID"
                  className="form-input"
                  value={formData.InstituteID}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select an Institute</option>
                  {institutes.map(inst => (
                    <option key={inst._id} value={inst._id}>{inst.InstituteName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Department Name</label>
                <input
                  type="text"
                  name="DepartmentName"
                  className="form-input"
                  value={formData.DepartmentName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="DepartmentDescription"
                  className="form-input"
                  rows="3"
                  value={formData.DepartmentDescription}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {currentDepartment ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
