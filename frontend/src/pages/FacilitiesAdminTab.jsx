import { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import MapPicker from '../components/MapPicker';

export default function FacilitiesAdminTab() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'hospital',
    departments: [],
    latitude: '',
    longitude: '',
  });
  const [departmentInput, setDepartmentInput] = useState('');
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const openCreateForm = () => {
    setFormData({ name: '', type: 'hospital', departments: [], latitude: '', longitude: '' });
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (facility) => {
    setFormData({
      name: facility.name,
      type: facility.type,
      departments: facility.departments ? [...facility.departments] : [],
      latitude: facility.location?.coordinates?.[1]?.toString() || '',
      longitude: facility.location?.coordinates?.[0]?.toString() || '',
    });
    setEditingId(facility._id);
    setFormError('');
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDepartment = () => {
    const name = departmentInput.trim();
    if (!name) return;
    if (formData.departments.some(d => d.name.toLowerCase() === name.toLowerCase())) {
      setFormError('Department already exists');
      return;
    }
    setFormData(prev => ({ ...prev, departments: [...prev.departments, { name }] }));
    setDepartmentInput('');
    setFormError('');
  };

  const handleRemoveDepartment = (name) => {
    setFormData(prev => ({ ...prev, departments: prev.departments.filter(d => d.name !== name) }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Facility name is required';
    if (!formData.type) return 'Facility type is required';
    if (formData.latitude === '' || isNaN(Number(formData.latitude))) return 'Valid latitude is required';
    if (formData.longitude === '' || isNaN(Number(formData.longitude))) return 'Valid longitude is required';
    return '';
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }
    // Prepare location and departments for backend
    // Generate a random ObjectId for each department if missing
    function generateObjectId() {
      // 24 hex chars
      return Array(24)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('');
    }

    const payload = {
      ...formData,
      location: {
        type: 'Point',
        coordinates: [
          Number(formData.longitude),
          Number(formData.latitude)
        ]
      },
      departments: (formData.departments || []).map(dep => ({
        ...dep,
        id: dep.id || generateObjectId(),
      }))
    };
    try {
      if (editingId) {
        await api.put(`/admin/facilities/${editingId}`, payload);
        toast.success('Facility updated');
      } else {
        await api.post('/admin/facilities', payload);
        toast.success('Facility created');
      }
      setShowForm(false);
      fetchFacilities();
    } catch (err) {
      setFormError('Failed to save facility');
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/facilities');
      setFacilities(res.data);
    } catch (err) {
      setError('Failed to load facilities');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) return;
    try {
      await api.delete(`/admin/facilities/${id}`);
      toast.success('Facility deleted');
      fetchFacilities();
    } catch (err) {
      toast.error('Failed to delete facility');
    }
  };

  return (
    <div className="bg-white rounded shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Facilities Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={openCreateForm}>
          Add Facility
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowForm(false)}>&times;</button>
            <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Facility' : 'Add Facility'}</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Facility Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} className="input-field w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Facility Type</label>
                <select name="type" value={formData.type} onChange={handleFormChange} className="input-field w-full" required>
                  <option value="hospital">Hospital</option>
                  <option value="clinic">Clinic</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location (Latitude, Longitude)</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" name="latitude" value={formData.latitude} onChange={handleFormChange} className="input-field w-full" placeholder="e.g. -26.2041" required />
                  <input type="text" name="longitude" value={formData.longitude} onChange={handleFormChange} className="input-field w-full" placeholder="e.g. 28.0473" required />
                </div>
                <MapPicker
                  lat={formData.latitude ? parseFloat(formData.latitude) : 0}
                  lng={formData.longitude ? parseFloat(formData.longitude) : 0}
                  onChange={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat.toString(), longitude: lng.toString() }))}
                />
                <div className="text-xs text-gray-500">Click on the map to set the location.</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Departments</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={departmentInput} onChange={e => setDepartmentInput(e.target.value)} className="input-field flex-1" placeholder="Department name" />
                  <button type="button" className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleAddDepartment}>Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.departments.map((d, idx) => (
                    <span key={idx} className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center">
                      {d.name}
                      <button type="button" className="ml-1 text-red-500 hover:text-red-700" onClick={() => handleRemoveDepartment(d.name)}>&times;</button>
                    </span>
                  ))}
                </div>
              </div>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{editingId ? 'Update' : 'Create'}</button>
                <button type="button" className="bg-gray-300 text-gray-700 px-4 py-2 rounded" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : facilities.length === 0 ? (
        <div className="text-gray-500">No facilities found.</div>
      ) : (
        <table className="w-full text-left border">
          <thead>
            <tr>
              <th className="p-2 border-b">Name</th>
              <th className="p-2 border-b">Type</th>
              <th className="p-2 border-b">Departments</th>
              <th className="p-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {facilities.map(fac => (
              <tr key={fac._id}>
                <td className="p-2 border-b">{fac.name}</td>
                <td className="p-2 border-b">{fac.type}</td>
                <td className="p-2 border-b">{fac.departments?.map(d => d.name).join(', ')}</td>
                <td className="p-2 border-b">
                  <button className="text-blue-600 hover:underline mr-2" onClick={() => openEditForm(fac)}>Edit</button>
                  <button className="text-red-600 hover:underline" onClick={() => handleDelete(fac._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
