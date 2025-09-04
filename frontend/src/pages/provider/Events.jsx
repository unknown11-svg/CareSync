import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'mobile_clinic',
    services: '',
    startsAt: '',
    capacity: 0,
    longitude: '',
    latitude: ''
  });
  const [editModal, setEditModal] = useState({ open: false, event: null });
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/provider/events');
      setEvents(res.data);
    } catch (e) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      const location = { type: 'Point', coordinates: [parseFloat(form.longitude) || 0, parseFloat(form.latitude) || 0] };
      const payload = {
        title: form.title,
        description: form.description,
        type: form.type,
        location,
        services: form.services.split(',').map(s => s.trim()).filter(Boolean),
        startsAt: form.startsAt,
        capacity: Number(form.capacity) || 0
      };
      await api.post('/provider/events', payload);
      toast.success('Event created');
      setForm({ title: '', description: '', type: 'mobile_clinic', services: '', startsAt: '', capacity: 0, longitude: '', latitude: '' });
      fetchEvents();
    } catch (e) {
      toast.error('Failed to create event');
    }
  };

  // Edit modal logic
  const openEditModal = (ev) => {
    setEditForm({
      title: ev.title || '',
      description: ev.description || '',
      type: ev.type || 'mobile_clinic',
      services: (ev.services || []).join(', '),
      startsAt: ev.startsAt ? new Date(ev.startsAt).toISOString().slice(0, 16) : '',
      capacity: ev.capacity || 0,
      longitude: ev.location?.coordinates?.[0]?.toString() || '',
      latitude: ev.location?.coordinates?.[1]?.toString() || ''
    });
    setEditModal({ open: true, event: ev });
  };
  const closeEditModal = () => setEditModal({ open: false, event: null });
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const location = { type: 'Point', coordinates: [parseFloat(editForm.longitude) || 0, parseFloat(editForm.latitude) || 0] };
      const payload = {
        title: editForm.title,
        description: editForm.description,
        type: editForm.type,
        location,
        services: editForm.services.split(',').map(s => s.trim()).filter(Boolean),
        startsAt: editForm.startsAt,
        capacity: Number(editForm.capacity) || 0
      };
      await api.patch(`/provider/events/${editModal.event._id}`, payload);
      toast.success('Event updated');
      closeEditModal();
      fetchEvents();
    } catch (e) {
      toast.error('Failed to update event');
    }
    setEditLoading(false);
  };
  // Delete event
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/provider/events/${id}`);
      toast.success('Event deleted');
      fetchEvents();
    } catch (e) {
      toast.error('Failed to delete event');
    }
  };

  return (
    <div className="space-y-6 font-sans bg-background text-text-primary">
      <h2 className="text-xl font-semibold text-myreferrals-accent">Events</h2>
      <form onSubmit={createEvent} className="grid grid-cols-1 gap-4 sm:grid-cols-6">
        <input className="input-field sm:col-span-3" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <input className="input-field sm:col-span-3" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <select className="input-field sm:col-span-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="mobile_clinic">Mobile Clinic</option>
          <option value="meds_pickup">Meds Pickup</option>
        </select>
        <input className="input-field sm:col-span-2" placeholder="Services (comma-separated)" value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} />
        <input type="datetime-local" className="input-field sm:col-span-2" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} required />
        <input type="number" className="input-field sm:col-span-2" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
        <input className="input-field" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
        <input className="input-field" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
  <button type="submit" className="bg-myreferrals-accent text-white px-4 py-2 rounded hover:bg-myreferrals-accent-hover transition-colors sm:col-span-2">Create Event</button>
      </form>

      {loading ? (
        <div className="text-neutral-gray">Loading...</div>
      ) : events.length === 0 ? (
        <div className="text-neutral-gray">No events yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {events.map((ev) => (
            <div key={ev._id} className="bg-surface rounded shadow-card p-4">
              <div className="text-lg font-bold text-myreferrals-accent">{ev.title}</div>
              <div className="text-sm text-text-secondary font-medium">{ev.type}</div>
              <div className="text-sm text-neutral-gray">{new Date(ev.startsAt).toLocaleString()} • Capacity {ev.capacity}</div>
              <div className="text-sm text-neutral-gray">Services: {(ev.services || []).join(', ') || '—'}</div>
              <div className="text-sm text-neutral-gray">{ev.description}</div>
              <div className="text-xs text-neutral-gray">Location: {ev.location?.coordinates?.join(', ')}</div>
              <div className="flex gap-2 mt-2">
                <button className="bg-myreferrals-accent text-white px-3 py-1 rounded hover:bg-myreferrals-accent-hover transition-colors" onClick={() => openEditModal(ev)}>Edit</button>
                <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors" onClick={() => handleDelete(ev._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Event Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-surface rounded shadow-card p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-neutral-gray hover:text-text-primary" onClick={closeEditModal}>&times;</button>
            <h3 className="text-lg font-bold mb-4 text-myreferrals-accent">Edit Event</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input className="input-field w-full" name="title" placeholder="Title" value={editForm.title} onChange={handleEditChange} required />
              <input className="input-field w-full" name="description" placeholder="Description" value={editForm.description} onChange={handleEditChange} />
              <select className="input-field w-full" name="type" value={editForm.type} onChange={handleEditChange}>
                <option value="mobile_clinic">Mobile Clinic</option>
                <option value="meds_pickup">Meds Pickup</option>
              </select>
              <input className="input-field w-full" name="services" placeholder="Services (comma-separated)" value={editForm.services} onChange={handleEditChange} />
              <input type="datetime-local" className="input-field w-full" name="startsAt" value={editForm.startsAt} onChange={handleEditChange} required />
              <input type="number" className="input-field w-full" name="capacity" placeholder="Capacity" value={editForm.capacity} onChange={handleEditChange} />
              <input className="input-field w-full" name="longitude" placeholder="Longitude" value={editForm.longitude} onChange={handleEditChange} />
              <input className="input-field w-full" name="latitude" placeholder="Latitude" value={editForm.latitude} onChange={handleEditChange} />
              <div className="flex gap-2">
                <button type="submit" className="bg-myreferrals-accent text-white px-4 py-2 rounded hover:bg-myreferrals-accent-hover transition-colors flex-1" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="bg-surface border border-neutral-gray text-text-primary px-4 py-2 rounded flex-1" onClick={closeEditModal} disabled={editLoading}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;


