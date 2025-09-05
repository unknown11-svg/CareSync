import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Badge, Alert } from 'react-bootstrap';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX, FiActivity, FiStar, FiChevronUp } from 'react-icons/fi';
import './FacilitiesAdminTab.css'; 

const FacilitiesAdminTab = () => {
  const [facilities, setFacilities] = useState([]);
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    description: '',
    department: '',
    services: '',
    referralContact: '',
    notes: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch facilities from API
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/facility`, {
          withCredentials: true,
        });
        setFacilities(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching facilities:', err);
        setIsLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveFacility = async () => {
    try {
      const url = formData._id
        ? `${config.API_URL}/api/facility/${formData._id}`
        : `${config.API_URL}/api/facility`;

      const method = formData._id ? 'put' : 'post';
      const payload = { ...formData };

      if (!formData._id) {
        delete payload._id;
      }

      const response = await axios({
        method,
        url,
        data: payload,
        withCredentials: true,
      });

      const savedFacility = response.data;

      if (formData._id) {
        setFacilities(
          facilities.map((f) => (f._id === savedFacility._id ? savedFacility : f))
        );
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        setFacilities([...facilities, savedFacility]);
        // Close the form after successful addition
        setShowForm(false);
      }

      setFormData({
        _id: '',
        name: '',
        description: '',
        department: '',
        services: '',
        referralContact: '',
        notes: '',
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data || err.message);
        alert('Error saving facility: ' + (err.response?.data?.message || err.message));
      } else {
        console.error(err);
        alert('Error saving facility');
      }
    }
  };

  const editFacility = (f) => {
    setFormData(f);
    setShowForm(true); // Open the form when editing
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteFacility = async (id) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) {
      return;
    }
    
    try {
      await axios.delete(`${config.API_URL}/api/facility/${id}`, {
        withCredentials: true,
      });

      setFacilities(facilities.filter((f) => f._id !== id));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data || err.message);
        alert('Error deleting facility: ' + (err.response?.data?.message || err.message));
      } else {
        console.error(err);
        alert('Error deleting facility');
      }
    }
  };

  const filteredFacilities = facilities.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.services.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to get a random color for department badges
  const getDepartmentColor = (department) => {
    const colors = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796', '#f8f9fc', '#5a5c69'];
    let hash = 0;
    for (let i = 0; i < department.length; i++) {
      hash = department.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    // If we're closing the form and it was in edit mode, reset the form
    if (showForm && formData._id) {
      setFormData({
        _id: '',
        name: '',
        description: '',
        department: '',
        services: '',
        referralContact: '',
        notes: '',
      });
    }
  };

  return (
    <div className="container my-4 facilities-container">
      {/* Header Section with Colorful Background */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <FiActivity className="title-icon" /> Hospital Facilities Management
          </h1>
          <p className="page-subtitle">Manage all medical facilities and departments in one place</p>
        </div>
        <div className="header-graphic">
          <div className="graphic-circle graphic-circle-1"></div>
          <div className="graphic-circle graphic-circle-2"></div>
          <div className="graphic-circle graphic-circle-3"></div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search facilities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <FiX className="clear-search" onClick={() => setSearchTerm('')} />
          )}
        </div>
        
        <div className="stats-box">
          <div className="stat-item">
            <span className="stat-number">{facilities.length}</span>
            <span className="stat-label">Facilities</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{new Set(facilities.map(f => f.department)).size}</span>
            <span className="stat-label">Departments</span>
          </div>
        </div>
      </div>

      {showAlert && (
        <Alert variant="success" className="alert-custom">
          Facility updated successfully!
        </Alert>
      )}

      {/* Toggle Button for Add Facility Form */}
      <div className="d-flex justify-content-center mb-4">
        <Button 
          variant={showForm ? "outline-secondary" : "primary"} 
          onClick={toggleForm}
          className="toggle-form-btn"
        >
          {showForm ? (
            <>
              <FiChevronUp className="me-2" /> Close Form
            </>
          ) : (
            <>
              <FiPlus className="me-2" /> Add New Facility
            </>
          )}
        </Button>
      </div>

      {/* Form Section with Left-Right Layout - Conditionally Rendered */}
      {showForm && (
        <div className="form-section">
          <h4 className="form-title">
            {formData._id ? (
              <>
                <FiEdit2 className="me-2" /> Edit Facility
              </>
            ) : (
              <>
                <FiPlus className="me-2" /> Add New Facility
              </>
            )}
          </h4>
          <div className="form-container">
            <div className="form-left">
              <Form.Group className="form-group-custom">
                <Form.Label>Facility Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Cardiology Center"
                  className="form-control-custom"
                />
              </Form.Group>

              <Form.Group className="form-group-custom">
                <Form.Label>Department *</Form.Label>
                <Form.Control
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Heart Institute"
                  className="form-control-custom"
                />
              </Form.Group>

              <Form.Group className="form-group-custom">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Comprehensive cardiac care facility..."
                  className="form-control-custom"
                />
              </Form.Group>
            </div>

            <div className="form-right">
              <Form.Group className="form-group-custom">
                <Form.Label>Services Offered</Form.Label>
                <Form.Control
                  type="text"
                  name="services"
                  value={formData.services}
                  onChange={handleInputChange}
                  placeholder="Angioplasty, Bypass Surgery, Pediatric Cardiology"
                  className="form-control-custom"
                />
                <Form.Text className="text-muted">Separate services with commas</Form.Text>
              </Form.Group>

              <Form.Group className="form-group-custom">
                <Form.Label>Referral Contact</Form.Label>
                <Form.Control
                  type="text"
                  name="referralContact"
                  value={formData.referralContact}
                  onChange={handleInputChange}
                  placeholder="Dr. Smith (referrals@hospital.com, +1 555-1234)"
                  className="form-control-custom"
                />
              </Form.Group>

              <Form.Group className="form-group-custom">
                <Form.Label>Additional Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Emergency cases accepted anytime"
                  className="form-control-custom"
                />
              </Form.Group>
            </div>
          </div>
          
          <div className="form-actions">
            <Button variant="primary" onClick={saveFacility} className="btn-save">
              {formData._id ? 'Save Changes' : 'Add Facility'}
            </Button>
            {formData._id && (
              <Button variant="outline-secondary" onClick={() => {
                setFormData({ _id: '', name: '', description: '', department: '', services: '', referralContact: '', notes: '' });
                setShowForm(false);
              }}>
                Cancel Edit
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Facilities Table */}
      <div className="table-section">
        <div className="table-header">
          <h4>
            <FiStar className="me-2" /> Existing Facilities
          </h4>
          <Badge bg="primary" className="count-badge">
            {filteredFacilities.length} {filteredFacilities.length === 1 ? 'entry' : 'entries'}
          </Badge>
        </div>
        
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading facilities...</p>
          </div>
        ) : filteredFacilities.length === 0 ? (
          <div className="text-center py-5 empty-state">
            <FiSearch size={48} className="mb-3 text-muted" />
            <h5 className="text-muted">
              {searchTerm ? 'No matching facilities found' : 'No facilities added yet'}
            </h5>
            <p className="text-muted">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding a new facility'}
            </p>
            {!searchTerm && (
              <Button variant="primary" onClick={toggleForm} className="mt-3">
                <FiPlus className="me-2" /> Add Your First Facility
              </Button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="facilities-table">
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>Department</th>
                  <th>Services</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFacilities.map(f => (
                  <tr key={f._id} className={f._id === formData._id ? 'editing-row' : ''}>
                    <td>
                      <div className="d-flex flex-column">
                        <strong>{f.name}</strong>
                        <small className="text-muted">{f.description}</small>
                      </div>
                    </td>
                    <td>
                      <Badge 
                        style={{ 
                          backgroundColor: getDepartmentColor(f.department),
                          color: '#fff'
                        }}
                      >
                        {f.department}
                      </Badge>
                    </td>
                    <td>
                      <div className="services-container">
                        {f.services.split(',').map((service, index) => (
                          <Badge key={index} bg="light" text="dark" className="service-badge">
                            {service.trim()}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td>
                      <small>{f.referralContact}</small>
                    </td>
                    <td>
                      <div className="d-flex">
                        <Button variant="outline-primary" size="sm" className="me-2 action-btn" onClick={() => editFacility(f)}>
                          <FiEdit2 />
                        </Button>
                        <Button variant="outline-danger" size="sm" className="action-btn" onClick={() => deleteFacility(f._id)}>
                          <FiTrash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilitiesAdminTab;