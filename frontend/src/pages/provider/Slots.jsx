import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

function Slots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [status, setStatus] = useState('open');
  const [editModal, setEditModal] = useState({ open: false, slot: null });
  const [editForm, setEditForm] = useState({ startAt: '', endAt: '', status: 'open' });
  const [editLoading, setEditLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  // Open edit modal and prefill form
  const handleEditSlot = (slot) => {
    setEditForm({
      startAt: slot.startAt ? new Date(slot.startAt).toISOString().slice(0, 16) : '',
      endAt: slot.endAt ? new Date(slot.endAt).toISOString().slice(0, 16) : '',
      status: slot.status || 'open'
    });
    setEditModal({ open: true, slot });
  };

  // Create slot handler
  const createSlot = async (e) => {
    e.preventDefault();
    if (!startAt || !endAt) return toast.error('Start and end time required');
    console.log({ startAt, endAt, status });
    try {
      await api.post('/provider/slots', {
        startAt,
        endAt,
        status
      });
      toast.success('Slot created successfully! 🎉');
      setStartAt('');
      setEndAt('');
      setStatus('open');
      setShowCreateForm(false);
      fetchSlots();
    } catch (err) {
      toast.error('Failed to create slot');
    }
  };

  // Fetch slots on mount
  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await api.get('/provider/slots');
      setSlots(res.data.slots || []);
    } catch (err) {
      toast.error('Failed to fetch slots');
      setSlots([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // Close the edit modal and reset form
  const closeEditModal = () => {
    setEditModal({ open: false, slot: null });
    setEditForm({ startAt: '', endAt: '', status: 'open' });
    setEditLoading(false);
  };

  // Handle edit form field changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit edited slot
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    const { startAt, endAt, status } = editForm;
    if (!startAt || !endAt) return toast.error('Start and end time required');
    try {
      await api.patch(`/provider/slots/${editModal.slot._id}`, {
        startAt,
        endAt,
        status
      });
      toast.success('Slot updated successfully! ✅');
      closeEditModal();
      fetchSlots();
    } catch (err) {
      toast.error('Failed to update slot');
      setEditLoading(false);
    }
  };

  // Get status styles
  const getStatusStyle = (status) => {
    switch (status) {
      case 'open':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      case 'closed':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      case 'booked':
        return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  // Format time range
  const formatTimeRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const sameDay = startDate.toDateString() === endDate.toDateString();
    
    if (sameDay) {
      return `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else {
      return `${startDate.toLocaleString()} - ${endDate.toLocaleString()}`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-400 via-teal-500 to-blue-600 text-white rounded-2xl shadow-md p-6 mb-8 border border-gray-300 transition-all duration-500 ease-in-out
">
        <h1 className="text-3xl font-bold mb-2">Time Slot Management</h1>
        <p className="opacity-90">Create and manage available time slots for appointments</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Available Slots
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {viewMode === 'list' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              )}
            </svg>
            {viewMode === 'list' ? 'Calendar View' : 'List View'}
          </button>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path  fillRule="evenodd"  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"   clipRule="evenodd" 
/>

            </svg>
            {showCreateForm ? 'Cancel' : 'New Slot'}
          </button>
        </div>
      </div>

      {/* Create Slot Form */}
      {showCreateForm && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100 transition-all duration-500 ease-in-out">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Create New Time Slot
          </h3>
          <form onSubmit={createSlot} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Start Time</label>
              <input 
                type="datetime-local" 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                value={startAt} 
                onChange={(e) => setStartAt(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">End Time</label>
              <input 
                type="datetime-local" 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                value={endAt} 
                onChange={(e) => setEndAt(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Status</label>
              <select 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                Create Time Slot
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && !loading && slots.length > 0 && (
        <div className="mb-8 bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Calendar View</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((s) => {
              const style = getStatusStyle(s.status);
              return (
                <div 
                  key={s._id} 
                  className={`rounded-xl border p-4 ${style.bg} ${style.border} transition-all hover:shadow-md`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${style.text} ${style.bg}`}>
                      {s.status.toUpperCase()}
                    </span>
                    <div className="text-xs text-gray-500">
                      {new Date(s.startAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-800 mb-1">
                    {new Date(s.startAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(s.endAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div className="text-xs text-gray-500">
                    Duration: {Math.round((new Date(s.endAt) - new Date(s.startAt)) / (1000 * 60))} mins
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Slots List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-md">
          <div className="text-5xl mb-4">⏰</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No time slots yet</h3>
          <p className="text-gray-500">Create your first time slot to get started</p>
        </div>
      ) : viewMode === 'list' && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Time Slot</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-4 text-right">Actions</div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {slots.map((s) => {
              const style = getStatusStyle(s.status);
              const duration = Math.round((new Date(s.endAt) - new Date(s.startAt)) / (1000 * 60));
              
              return (
                <div key={s._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatTimeRange(s.startAt, s.endAt)}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
                        {s.status}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">
                      {duration} minutes
                    </div>
                    <div className="col-span-4 flex justify-end gap-2">
                      <button 
                        onClick={() => handleEditSlot(s)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors p-2 rounded-lg hover:bg-indigo-50"
                        title="Edit slot"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      {s.status !== 'booked' && (
                        <button 
                          onClick={async () => { 
                            await api.post(`/provider/slots/${s._id}/book`); 
                            toast.success('Slot booked!'); 
                            fetchSlots(); 
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-lg hover:bg-blue-50"
                          title="Book slot"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                      <button 
                        onClick={async () => { 
                          await api.patch(`/provider/slots/${s._id}/status`, { status: s.status === 'closed' ? 'open' : 'closed' }); 
                          toast.success(`Slot ${s.status === 'closed' ? 'opened' : 'closed'}!`); 
                          fetchSlots(); 
                        }}
                        className="text-yellow-600 hover:text-yellow-900 transition-colors p-2 rounded-lg hover:bg-yellow-50"
                        title={s.status === 'closed' ? 'Open slot' : 'Close slot'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          {s.status === 'closed' ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 7.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 8.586V7z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          )}
                        </svg>
                      </button>
                      <button 
                        onClick={async () => { 
                          if (window.confirm('Are you sure you want to delete this slot?')) {
                            await api.delete(`/provider/slots/${s._id}`); 
                            toast.success('Slot deleted!'); 
                            fetchSlots(); 
                          }
                        }}
                        className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-lg hover:bg-red-50"
                        title="Delete slot"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Slot Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors" onClick={closeEditModal}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Edit Time Slot</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Start Time</label>
                <input 
                  type="datetime-local" 
                  name="startAt" 
                  value={editForm.startAt} 
                  onChange={handleEditFormChange} 
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">End Time</label>
                <input 
                  type="datetime-local" 
                  name="endAt" 
                  value={editForm.endAt} 
                  onChange={handleEditFormChange} 
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Status</label>
                <select 
                  name="status" 
                  value={editForm.status} 
                  onChange={handleEditFormChange} 
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
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

export default Slots;