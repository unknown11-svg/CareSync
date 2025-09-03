
import { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import MapPicker from '../components/MapPicker';
import Dropdown from '../components/Dropdown';
import FilterBar from '../components/FilterBar';
import { exportRSVPsToCSV } from '../utils/exportRSVPs';
import Loader from '../components/Loader';

export default function FacilityEvents() {
  const [events, setEvents] = useState([]);
  const [eventDetails, setEventDetails] = useState({}); // eventId -> RSVP details with patient names
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: '', // mobile_clinic, meds_pickup, etc.
    capacity: '',
    lat: '',
    lng: '',
    description: '',
  });
  const [filter, setFilter] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      
      setEvents(res.data);
      // Preload RSVP details for all events
      for (const event of res.data) {
        fetchEventDetails(event._id);
      }
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Fetch RSVP details with patient names for a single event
  const fetchEventDetails = async (eventId) => {
    try {
      const res = await api.get(`/events/${eventId}/details`);
      setEventDetails(prev => ({ ...prev, [eventId]: res.data }));
    } catch (err) {
      // ignore for now
    }
  };

  const openCreateForm = () => {
    setFormData({ title: '', date: '', type: '', capacity: '', lat: '', lng: '', description: '' });
            <Loader message="Loading events..." />
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (event) => {
    setFormData({
      title: event.title,
      date: event.date,
      type: event.type || '',
      capacity: event.capacity || '',
      lat: event.lat || '',
      lng: event.lng || '',
      description: event.description || '',
    });
    setEditingId(event._id);
    setFormError('');
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleMapChange = (lat, lng) => {
    setFormData(prev => ({ ...prev, lat, lng }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.type || !formData.capacity || !formData.lat || !formData.lng) {
      setFormError('All fields including event type, capacity, and location are required');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/facility/events/${editingId}`, formData);
        toast.success('Event updated');
      } else {
        await api.post('/facility/events', formData);
        toast.success('Event created');
      }
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      setFormError('Failed to save event');
    }
  };

  // Broadcast action (stub)
  const handleBroadcast = async (event) => {
    setBroadcasting(true);
    try {
      // Simulate API call to send SMS/WhatsApp
      await new Promise(res => setTimeout(res, 1200));
      toast.success('Broadcast sent to nearby patients!');
    } catch {
      toast.error('Failed to broadcast');
    } finally {
      setBroadcasting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this event?')) return;
    try {
      await api.delete(`/facility/events/${id}`);
      toast.success('Event removed');
      fetchEvents();
    } catch (err) {
      toast.error('Failed to remove event');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Mobile Clinic Events</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={openCreateForm}>Add Event</button>
      </div>
      <FilterBar value={filter} onChange={setFilter} placeholder="Search events by title, type, or date..." />
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowForm(false)}>&times;</button>
            <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Event' : 'Add Event'}</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleFormChange} className="input-field w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleFormChange} className="input-field w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Event Type</label>
                <Dropdown
                  name="type"
                  value={formData.type}
                  onChange={val => setFormData(prev => ({ ...prev, type: val }))}
                  options={[{ value: 'mobile_clinic', label: 'Mobile Clinic' }, { value: 'meds_pickup', label: 'Meds Pickup' }]}
                  placeholder="Select type"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <input type="number" name="capacity" value={formData.capacity} onChange={handleFormChange} className="input-field w-full" required min="1" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location (pick on map)</label>
                <MapPicker lat={formData.lat ? Number(formData.lat) : null} lng={formData.lng ? Number(formData.lng) : null} onChange={handleMapChange} />
                {formData.lat && formData.lng && (
                  <div className="text-xs text-gray-500">Lat: {formData.lat}, Lng: {formData.lng}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleFormChange} className="input-field w-full" />
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
        <div>Loading...</div>
      ) : events.length === 0 ? (
        <div className="text-gray-500">No events found.</div>
      ) : (
        <table className="w-full text-left border">
          <thead>
            <tr>
              <th className="p-2 border-b">Title</th>
              <th className="p-2 border-b">Type</th>
              <th className="p-2 border-b">Date</th>
              <th className="p-2 border-b">Location</th>
              <th className="p-2 border-b">Capacity</th>
              <th className="p-2 border-b">RSVPs</th>
              <th className="p-2 border-b">Status</th>
              <th className="p-2 border-b">RSVP Details</th>
              <th className="p-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events
              .filter(e =>
                e.title.toLowerCase().includes(filter.toLowerCase()) ||
                (e.type || '').toLowerCase().includes(filter.toLowerCase()) ||
                (e.date || '').includes(filter)
              )
              .map(event => (
                <tr key={event._id}>
                  <td className="p-2 border-b">{event.title}</td>
                  <td className="p-2 border-b">{event.type || '-'}</td>
                  <td className="p-2 border-b">{event.date}</td>
                  <td className="p-2 border-b">{event.lat && event.lng ? `${event.lat}, ${event.lng}` : '-'}</td>
                  <td className="p-2 border-b">{event.capacity || '-'}</td>
                  <td className="p-2 border-b">{Array.isArray(event.rsvps) ? event.rsvps.filter(r => r.status === 'yes').length : 0}</td>
                  <td className="p-2 border-b">{event.capacity && event.rsvps ? (event.rsvps.filter(r => r.status === 'yes').length >= event.capacity ? 'Full' : 'Open') : '-'}</td>
                  <td className="p-2 border-b">
                    {eventDetails[event._id] && Array.isArray(eventDetails[event._id].rsvps) && eventDetails[event._id].rsvps.length > 0 ? (
                      <details>
                        <summary className="cursor-pointer text-blue-600 underline">View</summary>
                        <ul className="text-xs mt-2">
                          {eventDetails[event._id].rsvps.map((r, idx) => (
                            <li key={idx} className={r.status === 'yes' ? 'text-green-700' : 'text-gray-500'}>
                              {r.patient?.preferredLanguage || 'Unknown'} ({r.patient?.phone || r.patientId}): <b>{r.status}</b>
                            </li>
                          ))}
                        </ul>
                        <button
                          className="mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                          onClick={() => exportRSVPsToCSV(eventDetails[event._id])}
                        >
                          Export CSV
                        </button>
                      </details>
                    ) : (
                      <span className="text-gray-400">No RSVPs</span>
                    )}
                  </td>
                  <td className="p-2 border-b">
                    <button className="text-blue-600 hover:underline mr-2" onClick={() => openEditForm(event)}>Edit</button>
                    <button className="text-red-600 hover:underline mr-2" onClick={() => handleDelete(event._id)}>Remove</button>
                    <button className="text-green-600 hover:underline" disabled={broadcasting} onClick={() => handleBroadcast(event)}>
                      {broadcasting ? 'Broadcasting...' : 'Broadcast'}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
