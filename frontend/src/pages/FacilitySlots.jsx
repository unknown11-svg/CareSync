
import { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import Dropdown from '../components/Dropdown';
import Loader from '../components/Loader';

export default function FacilitySlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    provider: '',
    department: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [providers, setProviders] = useState([]);
  const [filterDept, setFilterDept] = useState('');
  const [filterProvider, setFilterProvider] = useState('');


  useEffect(() => {
    fetchSlots();
    fetchDepartments();
    fetchProviders();
  }, []);

  // Refetch slots when filters change
  useEffect(() => {
    fetchSlots();
  }, [filterDept, filterProvider]);


  const fetchSlots = async () => {
    setLoading(true);
    try {
      // Build query params for filters
      let params = {};
      if (filterDept) params.department = filterDept;
      if (filterProvider) params.provider = filterProvider;
      const res = await api.get('/facility/slots', { params });
      setSlots(res.data);
    } catch (err) {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/facility/departments');
      setDepartments(res.data);
    } catch {}
  };

  const fetchProviders = async () => {
    try {
      const res = await api.get('/facility/providers');
      setProviders(res.data);
    } catch {}
  };

  const openCreateForm = () => {
    setFormData({ date: '', time: '', provider: '', department: '' });
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (slot) => {
    setFormData({
      date: slot.date,
      time: slot.time,
      provider: slot.provider || '',
      department: slot.department || '',
    });
    setEditingId(slot._id);
    setFormError('');
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time) {
      setFormError('Date and time are required');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/facility/slots/${editingId}`, formData);
        toast.success('Slot updated');
      } else {
        await api.post('/facility/slots', formData);
        toast.success('Slot created');
      }
      setShowForm(false);
      fetchSlots();
    } catch (err) {
      setFormError('Failed to save slot');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this slot?')) return;
    try {
      await api.delete(`/facility/slots/${id}`);
      toast.success('Slot removed');
      fetchSlots();
    } catch (err) {
      toast.error('Failed to remove slot');
    }
  };

  // Only show open slots
  const openSlots = slots.filter(slot => slot.status === 'open');

  // Book slot handler
  const handleBook = async (slotId) => {
    try {
      await api.post('/facility/slots/book', { slot_id: slotId });
      toast.success('Slot booked!');
      fetchSlots();
    } catch (err) {
      toast.error('Failed to book slot');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Slots</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={openCreateForm}>Add Slot</button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <Dropdown
          name="department"
          value={filterDept}
          onChange={setFilterDept}
          options={[{ value: '', label: 'All Departments' }, ...departments.map(d => ({ value: d.name, label: d.name }))]}
          placeholder="Filter by department"
        />
        <Dropdown
          name="provider"
          value={filterProvider}
          onChange={setFilterProvider}
          options={[{ value: '', label: 'All Providers' }, ...providers.map(p => ({ value: p.name, label: p.name }))]}
          placeholder="Filter by provider"
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowForm(false)}>&times;</button>
            <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Slot' : 'Add Slot'}</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleFormChange} className="input-field w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input type="time" name="time" value={formData.time} onChange={handleFormChange} className="input-field w-full" required />
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
        <Loader message="Loading slots..." />
      ) : openSlots.length === 0 ? (
        <div className="text-gray-500">No open slots found.</div>
      ) : (
        <table className="w-full text-left border">
          <thead>
            <tr>
              <th className="p-2 border-b">Date</th>
              <th className="p-2 border-b">Time</th>
              <th className="p-2 border-b">Provider</th>
              <th className="p-2 border-b">Department</th>
              <th className="p-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {openSlots.map(slot => (
              <tr key={slot._id}>
                <td className="p-2 border-b">{slot.date || (slot.start_at && slot.start_at.slice(0,10))}</td>
                <td className="p-2 border-b">{slot.time || (slot.start_at && slot.start_at.slice(11,16))}</td>
                <td className="p-2 border-b">{slot.provider || slot.provider_name || ''}</td>
                <td className="p-2 border-b">{slot.department || slot.department_name || ''}</td>
                <td className="p-2 border-b flex gap-2">
                  <button className="text-green-600 hover:underline" onClick={() => handleBook(slot._id)}>Book</button>
                  <button className="text-blue-600 hover:underline" onClick={() => openEditForm(slot)}>Edit</button>
                  <button className="text-red-600 hover:underline" onClick={() => handleDelete(slot._id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
