import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { Plus, Users, Mail, Phone, Building2, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

function Providers() {
  const [providers, setProviders] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    facilityId: '',
    departmentId: '',
    department: '',
    role: 'doctor',
    phone: '',
    permissions: []
  });

  useEffect(() => {
    fetchProviders();
    fetchFacilities();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await api.get('/admin/providers');
      setProviders(response.data);
    } catch (error) {
      toast.error('Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await api.get('/admin/facilities');
      setFacilities(response.data);
    } catch (error) {
      toast.error('Failed to load facilities');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.departmentId) {
        delete payload.departmentId;
      }
      if (!payload.department) {
        delete payload.department;
      }
      if (editingId) {
        await api.put(`/admin/providers/${editingId}`, payload);
        toast.success('Provider updated successfully');
      } else {
        await api.post('/admin/providers', payload);
        toast.success('Provider account created successfully');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        email: '',
        password: '',
        name: '',
        facilityId: '',
        departmentId: '',
        department: '',
        role: 'doctor',
        phone: '',
        permissions: []
      });
      fetchProviders();
    } catch (error) {
      toast.error('Failed to create provider account');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const startEdit = (provider) => {
    setEditingId(provider._id);
    setShowForm(true);
    setShowPassword(false);
    setFormData({
      email: provider.email,
      password: '',
      name: provider.name,
      facilityId: provider.facilityId?._id || provider.facilityId,
      departmentId: provider.departmentId || '',
      department: provider.department || '',
      role: provider.role,
      phone: provider.phone,
      permissions: provider.permissions || []
    });
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleDeactivateProvider = async (providerId) => {
    if (window.confirm('Are you sure you want to deactivate this provider?')) {
      try {
        await api.delete(`/admin/providers/${providerId}`);
        toast.success('Provider deactivated successfully');
        fetchProviders();
      } catch (error) {
        toast.error('Failed to deactivate provider');
      }
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      doctor: 'bg-primary-100 text-primary-800',
      nurse: 'bg-accent-100 text-accent-800',
      admin: 'bg-primary-200 text-primary-900',
      coordinator: 'bg-accent-200 text-accent-900'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Providers</h1>
          <p className="text-gray-600">Manage healthcare provider accounts</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Provider
        </button>
      </div>

      {/* Add Provider Form */}
      {showForm && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create Provider Account</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-field pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility
                </label>
                <select
                  name="facilityId"
                  value={formData.facilityId}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select a facility</option>
                  {facilities.map((facility) => (
                    <option key={facility._id} value={facility._id}>
                      {facility.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="admin">Admin</option>
                  <option value="coordinator">Coordinator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Select department</option>
                  <option value="neurology">Neurology</option>
                  <option value="oncology">Oncology</option>
                  <option value="dental">Dental</option>
                  <option value="gynecology">Gynecology</option>
                  <option value="dermatology">Dermatology</option>
                  <option value="gastroenterology">Gastroenterology</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="orthopedics">Orthopedics</option>
                  <option value="radiology">Radiology</option>
                  <option value="psychiatry">Psychiatry</option>
                  <option value="urology">Urology</option>
                  <option value="nephrology">Nephrology</option>
                  <option value="ophthalmology">Ophthalmology</option>
                  <option value="ent">ENT</option>
                  <option value="general_medicine">General Medicine</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {['create_referrals', 'manage_slots', 'view_analytics', 'manage_events'].map((permission) => (
                  <label key={permission} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission)}
                      onChange={() => handlePermissionChange(permission)}
                      className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Providers List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Provider Accounts</h3>
        {providers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No provider accounts created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {providers.map((provider) => (
                  <tr key={provider._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {provider.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {provider.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(provider.role)}`}>
                        {provider.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {provider.department ? provider.department.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Building2 className="h-4 w-4 mr-1" />
                        {provider.facilityId?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-4 w-4 mr-1" />
                        {provider.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(provider)} className="text-primary-500 hover:text-primary-700">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeactivateProvider(provider._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Providers;
