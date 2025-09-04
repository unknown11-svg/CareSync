
import { useEffect, useState, useMemo } from 'react';
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

  const fetchSlots = async () => {
    try {
      const { data } = await api.get('/facility/slots');
      setSlots(data);
    } catch (err) {
      toast.error('Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/facility/departments');
      setDepartments(data);
    } catch (err) {
      toast.error('Failed to fetch departments');
    }
  };

  const fetchProviders = async () => {
    try {
      const { data } = await api.get('/facility/providers');
      setProviders(data);
    } catch (err) {
      toast.error('Failed to fetch providers');
    }
  };

  useEffect(() => {
    fetchSlots();
    fetchDepartments();
    fetchProviders();
  }, []);

  const openCreateForm = () => {
    setFormData({ date: '', time: '', provider: '', department: '' });
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (slot) => {
    setFormData({
      date: slot.date || (slot.start_at ? slot.start_at.slice(0, 10) : ''),
      time: slot.time || (slot.start_at ? slot.start_at.slice(11, 16) : ''),
      provider: slot.provider || slot.provider_id || '',
      department: slot.department || slot.department_id || '',
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
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this slot?')) return;
    setLoading(true);
    try {
      await api.delete(`/facility/slots/${id}`);
      toast.success('Slot removed');
      fetchSlots();
    } catch (err) {
      toast.error('Failed to remove slot');
      setLoading(false);
    }
  };

  const handleBook = async (slotId) => {
    setLoading(true);
    try {
      await api.post('/facility/slots/book', { slot_id: slotId });
      toast.success('Slot booked!');
      fetchSlots();
    } catch (err) {
      toast.error('Failed to book slot');
      setLoading(false);
    }
  };

  const filteredSlots = useMemo(() => {
    return slots.filter(slot => {
      const departmentMatch = !filterDept || (slot.department_name || slot.department) === filterDept;
      const providerMatch = !filterProvider || (slot.provider_name || slot.provider) === filterProvider;
      return departmentMatch && providerMatch;
    });
  }, [slots, filterDept, filterProvider]);

  return (
    <div className="font-sans bg-background text-text-primary p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slots-accent">Slots Management</h2>
        <button className="bg-slots-accent text-white px-4 py-2 rounded hover:bg-slots-accent-hover transition-colors" onClick={openCreateForm}>Add Slot</button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4 p-4 bg-surface rounded-lg shadow">
        <Dropdown
          name="department"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          options={[{ value: '', label: 'All Departments' }, ...departments.map(d => ({ value: d.name, label: d.name }))]}
          placeholder="Filter by department"
        />
        <Dropdown
          name="provider"
          value={filterProvider}
          onChange={(e) => setFilterProvider(e.target.value)}
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
                <select name="provider" value={formData.provider} onChange={handleFormChange} className="input-field w-full">
                  <option value="">Select Provider</option>
                  {providers.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select name="department" value={formData.department} onChange={handleFormChange} className="input-field w-full">
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-slots-accent text-white px-4 py-2 rounded hover:bg-slots-accent-hover">{editingId ? 'Update' : 'Create'}</button>
                <button type="button" className="bg-gray-300 text-gray-700 px-4 py-2 rounded" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {loading ? (
        <Loader message="Loading slots..." />
      ) : filteredSlots.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No slots found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border border-neutral-gray bg-surface">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 border-b border-neutral-gray text-slots-accent">Date</th>
                <th className="p-3 border-b border-neutral-gray text-slots-accent">Time</th>
                <th className="p-3 border-b border-neutral-gray text-slots-accent">Provider</th>
                <th className="p-3 border-b border-neutral-gray text-slots-accent">Department</th>
                <th className="p-3 border-b border-neutral-gray text-slots-accent">Status</th>
                <th className="p-3 border-b border-neutral-gray text-slots-accent">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSlots.map(slot => (
                <tr key={slot._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 border-b border-neutral-gray">{slot.date || (slot.start_at && slot.start_at.slice(0, 10))}</td>
                  <td className="p-3 border-b border-neutral-gray">{slot.time || (slot.start_at && slot.start_at.slice(11, 16))}</td>
                  <td className="p-3 border-b border-neutral-gray">{slot.provider_name || slot.provider || ''}</td>
                  <td className="p-3 border-b border-neutral-gray">{slot.department_name || slot.department || ''}</td>
                  <td className="p-3 border-b border-neutral-gray">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${slot.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {slot.status}
                    </span>
                  </td>
                  <td className="p-3 border-b border-neutral-gray flex gap-2">
                    {slot.status === 'open' && (
                      <button className="text-green-600 hover:underline" onClick={() => handleBook(slot._id)}>Book</button>
                    )}
                    <button className="bg-slots-accent text-white px-3 py-1 rounded hover:bg-slots-accent-hover transition-colors" onClick={() => openEditForm(slot)}>Edit</button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors" onClick={() => handleDelete(slot._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
