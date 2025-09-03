import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import FilterBar from '../components/FilterBar';
import Dropdown from '../components/Dropdown';

export default function FacilityProviders({ departments = [] }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: '',
    phone: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/facility/providers'); // Adjust endpoint as needed
      setProviders(res.data);
    } catch (err) {
      toast.error('Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setFormData({ name: '', email: '', department: '', role: '', phone: '' });
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (provider) => {
    setFormData({
      name: provider.name,
      email: provider.email,
      department: provider.department || '',
      role: provider.role || '',
      phone: provider.phone || '',
    });
    setEditingId(provider._id);
    setFormError('');
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setFormError('Name and email are required');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/facility/providers/${editingId}`, formData);
        toast.success('Provider updated');
      } else {
        await api.post('/facility/providers', formData);
        toast.success('Provider created');
      }
      setShowForm(false);
      fetchProviders();
    } catch (err) {
      setFormError('Failed to save provider');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this provider?')) return;
    try {
      await api.delete(`/facility/providers/${id}`);
      toast.success('Provider removed');
      fetchProviders();
    } catch (err) {
      toast.error('Failed to remove provider');
    }
  };

  // Filter providers by search
  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.department || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Providers/Employees</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={openCreateForm}>Add Provider</button>
      </div>
      <FilterBar value={search} onChange={setSearch} placeholder="Search providers..." />
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowForm(false)}>&times;</button>
            <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Provider' : 'Add Provider'}</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} className="input-field w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleFormChange} className="input-field w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <Dropdown
                  name="department"
                  value={formData.department}
                  onChange={val => setFormData(prev => ({ ...prev, department: val }))}
                  options={
                    Array.from(
                      new Set(
                        (departments || [])
                          .map(d => d && d.name ? d.name : null)
                          .filter(Boolean)
                      )
                    ).map(name => ({ value: name, label: name }))
                  }
                  placeholder="Select department"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input type="text" name="role" value={formData.role} onChange={handleFormChange} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleFormChange} className="input-field w-full" />
              </div>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? 'Update' : 'Create'}</button>
                <button type="button" className="bg-gray-300 text-gray-700 px-4 py-2 rounded" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {loading ? (
        <Loader message="Loading providers..." />
      ) : filteredProviders.length === 0 ? (
        <div className="text-gray-500">No providers found.</div>
      ) : (
        <table className="w-full text-left border">
          <thead>
            <tr>
              <th className="p-2 border-b">Name</th>
              <th className="p-2 border-b">Email</th>
              <th className="p-2 border-b">Department</th>
              <th className="p-2 border-b">Role</th>
              <th className="p-2 border-b">Phone</th>
              <th className="p-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProviders.map(provider => (
              <tr key={provider._id}>
                <td className="p-2 border-b">{provider.name}</td>
                <td className="p-2 border-b">{provider.email}</td>
                <td className="p-2 border-b">{provider.department}</td>
                <td className="p-2 border-b">{provider.role}</td>
                <td className="p-2 border-b">{provider.phone}</td>
                <td className="p-2 border-b">
                  <button className="text-blue-600 hover:underline mr-2" onClick={() => openEditForm(provider)}>Edit</button>
                  <button className="text-red-600 hover:underline" onClick={() => handleDelete(provider._id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
