import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export default function FacilityDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/facility/departments'); // Adjust endpoint as needed
      setDepartments(res.data);
    } catch (err) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setFormData({ name: '' });
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (dept) => {
    setFormData({ name: dept.name });
    setEditingId(dept._id);
    setFormError('');
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    setFormData({ name: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Department name is required');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/facility/departments/${editingId}`, formData);
        toast.success('Department updated');
      } else {
        await api.post('/facility/departments', formData);
        toast.success('Department created');
      }
      setShowForm(false);
      fetchDepartments();
    } catch (err) {
      setFormError('Failed to save department');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this department?')) return;
    try {
      await api.delete(`/facility/departments/${id}`);
      toast.success('Department removed');
      fetchDepartments();
    } catch (err) {
      toast.error('Failed to remove department');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Departments</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={openCreateForm}>Add Department</button>
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowForm(false)}>&times;</button>
            <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Department' : 'Add Department'}</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Department Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} className="input-field w-full" required />
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
        <Loader message="Loading departments..." />
      ) : departments.length === 0 ? (
        <div className="text-gray-500">No departments found.</div>
      ) : (
        <table className="w-full text-left border">
          <thead>
            <tr>
              <th className="p-2 border-b">Name</th>
              <th className="p-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(dept => (
              <tr key={dept._id}>
                <td className="p-2 border-b">{dept.name}</td>
                <td className="p-2 border-b">
                  <button className="text-blue-600 hover:underline mr-2" onClick={() => openEditForm(dept)}>Edit</button>
                  <button className="text-red-600 hover:underline" onClick={() => handleDelete(dept._id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
