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
  const [showCreateForm, setShowCreateForm] = useState(false);

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
      toast.success('Event created successfully!');
      setForm({ title: '', description: '', type: 'mobile_clinic', services: '', startsAt: '', capacity: 0, longitude: '', latitude: '' });
      setShowCreateForm(false);
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
      toast.success('Event updated successfully!');
      closeEditModal();
      fetchEvents();
    } catch (e) {
      toast.error('Failed to update event');
    }
    setEditLoading(false);
  };
  // Delete event
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/provider/events/${id}`);
      toast.success('Event deleted successfully!');
      fetchEvents();
    } catch (e) {
      toast.error('Failed to delete event');
    }
  };

  // Event type colors and icons
  const eventTypeStyles = {
    mobile_clinic: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: '🏥',
      text: 'text-blue-800'
    },
    meds_pickup: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: '💊',
      text: 'text-green-800'
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-orange-400 rounded-2xl p-6 mb-8 text-white
">
        <h1 className="text-3xl font-bold mb-2">Event Management</h1>
        <p className="opacity-90">Create and manage healthcare events for your community</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent
">
          Healthcare Events
        </h2>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors flex items-center shadow-md hover:shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />

          </svg>
          {showCreateForm ? 'Cancel' : 'Create New Event'}
        </button>
      </div>

      {/* Create Event Form */}
      {showCreateForm && (
        <div className="bg-gradient-to-r from-pink-100 to-yellow-100 rounded-2xl shadow-md p-6 mb-8 border border-gray-200 transition-all duration-500 ease-in-out">
          <h3 className="text-xl font-semibold mb-4 flex items-center bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent
">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Create New Event
          </h3>
          <form onSubmit={createEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">Event Title</label>
              <input 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                placeholder="Enter event title" 
                value={form.title} 
                onChange={e => setForm({ ...form, title: e.target.value })} 
                required 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
              <textarea 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                placeholder="Describe your event" 
                value={form.description} 
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows="3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Event Type</label>
              <select 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                value={form.type} 
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="mobile_clinic">Mobile Clinic</option>
                <option value="meds_pickup">Medication Pickup</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Capacity</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                placeholder="Number of attendees" 
                value={form.capacity} 
                onChange={(e) => setForm({ ...form, capacity: e.target.value })} 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Date & Time</label>
              <input 
                type="datetime-local" 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                value={form.startsAt} 
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })} 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Services (comma-separated)</label>
              <input 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                placeholder="Service 1, Service 2, ..." 
                value={form.services} 
                onChange={(e) => setForm({ ...form, services: e.target.value })} 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Longitude</label>
              <input 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                placeholder="Longitude coordinate" 
                value={form.longitude} 
                onChange={(e) => setForm({ ...form, longitude: e.target.value })} 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Latitude</label>
              <input 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                placeholder="Latitude coordinate" 
                value={form.latitude} 
                onChange={(e) => setForm({ ...form, latitude: e.target.value })} 
              />
            </div>
            
            <div className="md:col-span-2">
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                Create Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-md">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No events yet</h3>
          <p className="text-gray-500">Create your first event to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => {
            const style = eventTypeStyles[ev.type] || eventTypeStyles.mobile_clinic;
            return (
              <div key={ev._id} className={`rounded-2xl shadow-md p-5 border ${style.bg} ${style.border} transition-all hover:shadow-lg`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-2xl mb-1">{style.icon}</div>
                    <h3 className="text-lg font-bold text-gray-800">{ev.title}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${style.text} ${style.bg}`}>
                      {ev.type === 'mobile_clinic' ? 'Mobile Clinic' : 'Medication Pickup'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-500">
                      {new Date(ev.startsAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(ev.startsAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{ev.description}</p>
                
                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-500 mb-1">Services Offered</div>
                  <div className="text-sm text-gray-700">
                    {(ev.services || []).join(', ') || 'No specific services listed'}
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Capacity:</span> {ev.capacity}
                  </div>
                  {ev.location?.coordinates && (
                    <div className="text-xs text-gray-500">
                      📍 {ev.location.coordinates[0]?.toFixed(4)}, {ev.location.coordinates[1]?.toFixed(4)}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg hover:bg-indigo-200 transition-colors text-sm flex items-center"
                    onClick={() => openEditModal(ev)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                  <button 
                    className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center"
                    onClick={() => handleDelete(ev._id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Event Modal */}
{/* Edit Event Modal */}
{editModal.open && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
      <button className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors" onClick={closeEditModal}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h3 className="text-xl font-bold mb-4 text-gray-800">Edit Event</h3>
      <form onSubmit={handleEditSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Event Title</label>
          <input 
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
            name="title" 
            placeholder="Title" 
            value={editForm.title} 
            onChange={handleEditChange} 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
          <textarea 
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
            name="description" 
            placeholder="Description" 
            value={editForm.description} 
            onChange={handleEditChange}
            rows="3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Event Type</label>
          <select 
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
            name="type" 
            value={editForm.type} 
            onChange={handleEditChange}
          >
            <option value="mobile_clinic">Mobile Clinic</option>
            <option value="meds_pickup">Medication Pickup</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Services (comma-separated)</label>
          <input 
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
            name="services" 
            placeholder="Services" 
            value={editForm.services} 
            onChange={handleEditChange} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Date & Time</label>
          <input 
            type="datetime-local" 
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
            name="startsAt" 
            value={editForm.startsAt} 
            onChange={handleEditChange} 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Capacity</label>
          <input 
            type="number" 
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
            name="capacity" 
            placeholder="Capacity" 
            value={editForm.capacity} 
            onChange={handleEditChange} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Longitude</label>
          <input 
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
            name="longitude" 
            placeholder="Longitude" 
            value={editForm.longitude} 
            onChange={handleEditChange} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Latitude</label>
          <input 
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
            name="latitude" 
            placeholder="Latitude" 
            value={editForm.latitude} 
            onChange={handleEditChange} 
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button 
            type="submit" 
            className="bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 transition-colors flex-1 flex items-center justify-center" 
            disabled={editLoading}
          >
            {editLoading && (
              <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            )}
            {editLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            type="button" 
            className="bg-gray-200 text-gray-800 px-4 py-3 rounded-xl flex-1 hover:bg-gray-300 transition-colors" 
            onClick={closeEditModal} 
            disabled={editLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}

export default Events;