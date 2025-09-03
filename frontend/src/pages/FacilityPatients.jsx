import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export default function FacilityPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    provider: '',
    department: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/facility/patients'); // Adjust endpoint as needed
      setPatients(res.data);
    } catch (err) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setFormData({ name: '', email: '', phone: '', provider: '', department: '' });
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (patient) => {
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone || '',
      provider: patient.provider || '',
      department: patient.department || '',
    });
    setEditingId(patient._id);
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
        await api.put(`/facility/patients/${editingId}`, formData);
        toast.success('Patient updated');
      } else {
        await api.post('/facility/patients', formData);
        toast.success('Patient created');
      }
      setShowForm(false);
      fetchPatients();
    } catch (err) {
      setFormError('Failed to save patient');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this patient?')) return;
    try {
      await api.delete(`/facility/patients/${id}`);
      toast.success('Patient removed');
      fetchPatients();
    } catch (err) {
      toast.error('Failed to remove patient');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Patients</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={openCreateForm}>Add Patient</button>
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowForm(false)}>&times;</button>
            <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Patient' : 'Add Patient'}</h3>
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
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleFormChange} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Provider</label>
                <input type="text" name="provider" value={formData.provider} onChange={handleFormChange} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleFormChange} className="input-field w-full" />
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
        <Loader message="Loading patients..." />
      ) : patients.length === 0 ? (
        <div className="text-gray-500">No patients found.</div>
      ) : (
        <table className="w-full text-left border">
          <thead>
            <tr>
              <th className="p-2 border-b">Name</th>
              <th className="p-2 border-b">Email</th>
              <th className="p-2 border-b">Phone</th>
              <th className="p-2 border-b">Provider</th>
              <th className="p-2 border-b">Department</th>
              <th className="p-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(patient => (
              <tr key={patient._id}>
                <td className="p-2 border-b">{patient.name}</td>
                <td className="p-2 border-b">{patient.email}</td>
                <td className="p-2 border-b">{patient.phone}</td>
                <td className="p-2 border-b">{patient.provider}</td>
                <td className="p-2 border-b">{patient.department}</td>
                <td className="p-2 border-b">
                  <button className="text-blue-600 hover:underline mr-2" onClick={() => openEditForm(patient)}>Edit</button>
                  <button className="text-red-600 hover:underline" onClick={() => handleDelete(patient._id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
