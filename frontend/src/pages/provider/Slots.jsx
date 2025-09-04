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
    try {
      await api.post('/provider/slots', {
        startAt,
        endAt,
        status
      });
      toast.success('Slot created');
      setStartAt('');
      setEndAt('');
      setStatus('open');
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

  return (
    <div className="space-y-6 font-sans bg-background text-text-primary">
      <h2 className="text-xl font-semibold text-myreferrals-accent">Slots</h2>
      <form onSubmit={createSlot} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <input type="datetime-local" className="input-field" value={startAt} onChange={(e) => setStartAt(e.target.value)} required />
        <input type="datetime-local" className="input-field" value={endAt} onChange={(e) => setEndAt(e.target.value)} required />
        <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
        <button type="submit" className="bg-myreferrals-accent text-white px-4 py-2 rounded hover:bg-myreferrals-accent-hover transition-colors">Add Slot</button>
      </form>

      {loading ? (
        <div className="text-neutral-gray">Loading...</div>
      ) : slots.length === 0 ? (
        <div className="text-neutral-gray">No slots yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {slots.map((s) => (
            <div key={s._id} className="bg-surface rounded shadow-card flex items-center justify-between p-4">
              <div className="text-sm text-text-secondary">
                {new Date(s.startAt).toLocaleString()} → {new Date(s.endAt).toLocaleString()} ({s.status})
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEditSlot(s)} className="bg-myreferrals-accent text-white px-3 py-1 rounded hover:bg-myreferrals-accent-hover transition-colors">Edit</button>
                {s.status !== 'booked' && (
                  <button onClick={async () => { await api.post(`/provider/slots/${s._id}/book`); toast.success('Booked'); fetchSlots(); }} className="bg-myreferrals-accent text-white px-3 py-1 rounded hover:bg-myreferrals-accent-hover transition-colors">Book</button>
                )}
                <button onClick={async () => { await api.patch(`/provider/slots/${s._id}/status`, { status: s.status === 'closed' ? 'open' : 'closed' }); toast.success('Status updated'); fetchSlots(); }} className="bg-myreferrals-accent text-white px-3 py-1 rounded hover:bg-myreferrals-accent-hover transition-colors">{s.status === 'closed' ? 'Open' : 'Close'}</button>
                <button onClick={async () => { await api.delete(`/provider/slots/${s._id}`); toast.success('Deleted'); fetchSlots(); }} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-surface rounded shadow-card p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-neutral-gray hover:text-text-primary" onClick={closeEditModal}>&times;</button>
            <h3 className="text-lg font-bold mb-4 text-myreferrals-accent">Edit Slot</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input type="datetime-local" name="startAt" value={editForm.startAt} onChange={handleEditFormChange} className="input-field w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input type="datetime-local" name="endAt" value={editForm.endAt} onChange={handleEditFormChange} className="input-field w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" value={editForm.status} onChange={handleEditFormChange} className="input-field w-full">
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
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

export default Slots;


