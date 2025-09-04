import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function Referrals() {
  const [facilities, setFacilities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({
    fromFacilityId: '',
    toDepartmentId: '',
    patientId: '',
    slotId: ''
  });
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [formError, setFormError] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [referralsError, setReferralsError] = useState('');
  const [cancellingId, setCancellingId] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [editModal, setEditModal] = useState({ open: false, referral: null });
  const [editForm, setEditForm] = useState({ toDepartmentId: '', slotId: '', notes: '' });
  const [editSlots, setEditSlots] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  // Open edit modal and prefill form
  const handleEditReferral = (referral) => {
    setEditForm({
      toDepartmentId: referral.toDepartmentId?._id || referral.toDepartmentId || '',
      slotId: referral.slotId?._id || referral.slotId || '',
      notes: referral.notes || ''
    });
    setEditModal({ open: true, referral });
    // Fetch slots for the department
    if (referral.toDepartmentId?._id || referral.toDepartmentId) {
      api.get(`/slots?department_id=${referral.toDepartmentId?._id || referral.toDepartmentId}`)
        .then(res => setEditSlots(res.data))
        .catch(() => setEditSlots([]));
    } else {
      setEditSlots([]);
    }
    setEditError('');
  };

  // Handle edit form changes
  const handleEditFormChange = e => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
    // If department changes, fetch slots
    if (name === 'toDepartmentId') {
      setEditForm(f => ({ ...f, slotId: '' }));
      api.get(`/slots?department_id=${value}`)
        .then(res => setEditSlots(res.data))
        .catch(() => setEditSlots([]));
    }
  };

  // Submit edit
  const handleEditSubmit = async e => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      await api.patch(`/referrals/${editModal.referral._id}`, editForm);
      setEditModal({ open: false, referral: null });
      fetchReferrals();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Error updating referral');
    }
    setEditLoading(false);
  };

  // Close modal
  const closeEditModal = () => {
    setEditModal({ open: false, referral: null });
    setEditError('');
  };
  // Cancel a referral
  const handleCancelReferral = async (id) => {
    setCancellingId(id);
    setCancelError('');
    try {
      await api.patch(`/referrals/${id}/cancel`);
      fetchReferrals();
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Error cancelling referral');
    }
    setCancellingId('');
  };

  // Fetch facilities and patients on mount
  useEffect(() => {
    api.get('/facilities').then(res => setFacilities(res.data)).catch(() => setFacilities([]));
    api.get('/provider/patients').then(res => setPatients(res.data)).catch(() => setPatients([]));
    fetchReferrals();
  }, []);

  // Fetch referrals for provider
  const fetchReferrals = async () => {
    setReferralsLoading(true);
    setReferralsError('');
    try {
      const res = await api.get('/provider/referrals');
      setReferrals(res.data);
    } catch (err) {
      setReferralsError('Could not load referrals.');
    }
    setReferralsLoading(false);
  };

  // Fetch departments when facility changes
  useEffect(() => {

    if (form.fromFacilityId) {
      api.get(`/departments/${form.fromFacilityId}/departments`)
        .then(res => setDepartments(res.data))
        .catch(() => setDepartments([]));
    } else {
      setDepartments([]);
    }
    setForm(f => ({ ...f, toDepartmentId: '', slotId: '' }));
    setSlots([]);
  }, [form.fromFacilityId]);

  // Fetch slots when department changes
  useEffect(() => {
    if (form.toDepartmentId) {
      api.get(`/slots?department_id=${form.toDepartmentId}`)
        .then(res => setSlots(res.data))
        .catch(() => setSlots([]));
    } else {
      setSlots([]);
    }
    setForm(f => ({ ...f, slotId: '' }));
  }, [form.toDepartmentId]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setConfirmation(null);
    setFormError('');
    // Basic validation
    if (!form.fromFacilityId || !form.toDepartmentId || !form.patientId || !form.slotId) {
      setFormError('All fields are required.');
      setLoading(false);
      return;
    }
    try {
      const res = await api.post('/referrals', form);
      setConfirmation(res.data.referral);
      setForm({
        fromFacilityId: '',
        toDepartmentId: '',
        patientId: '',
        slotId: ''
      });
      setDepartments([]);
      setSlots([]);
      fetchReferrals();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error booking referral');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Book a Referral</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
        {formError && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-2 text-sm">{formError}</div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Facility</label>
          <select name="fromFacilityId" value={form.fromFacilityId} onChange={handleChange} required className="w-full border rounded p-2">
            <option value="">Select Facility</option>
            {facilities.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <select name="toDepartmentId" value={form.toDepartmentId} onChange={handleChange} required className="w-full border rounded p-2" disabled={!departments.length}>
            <option value="">Select Department</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Patient</label>
          <select name="patientId" value={form.patientId} onChange={handleChange} required className="w-full border rounded p-2">
            <option value="">Select Patient</option>
            {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slot</label>
          <select name="slotId" value={form.slotId} onChange={handleChange} required className="w-full border rounded p-2" disabled={!slots.length}>
            <option value="">Select Slot</option>
            {slots.map(s => (
              <option key={s._id} value={s._id}>
                {new Date(s.start_at).toLocaleString()} - {new Date(s.end_at).toLocaleTimeString()}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary w-full flex items-center justify-center" disabled={loading}>
          {loading && (
            <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          )}
          {loading ? 'Booking...' : 'Book Referral'}
        </button>
      </form>
      {confirmation && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <h3 className="font-bold">Referral Booked!</h3>
          <pre className="text-xs">{JSON.stringify(confirmation, null, 2)}</pre>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2">Your Referrals</h2>
        {cancelError && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-2 text-sm">{cancelError}</div>
        )}
        {referralsLoading ? (
          <div>Loading referrals...</div>
        ) : referralsError ? (
          <div className="text-red-600">{referralsError}</div>
        ) : referrals.length === 0 ? (
          <div>No referrals found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Patient</th>
                  <th className="p-2 border">Facility</th>
                  <th className="p-2 border">Department</th>
                  <th className="p-2 border">Slot</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map(r => (
                  <tr key={r._id}>
                    <td className="p-2 border">{r.patientId ? `${r.patientId.name} ${r.patientId.surname}` : '-'}</td>
                    <td className="p-2 border">{r.fromFacilityId?.name || '-'}</td>
                    <td className="p-2 border">{r.toDepartmentId?.name || '-'}</td>
                    <td className="p-2 border">{r.slotId ? `${
                      r.slotId.start_at || r.slotId.startAt ? new Date(r.slotId.start_at || r.slotId.startAt).toLocaleString() : '-'
                    } - ${
                      r.slotId.end_at || r.slotId.endAt ? new Date(r.slotId.end_at || r.slotId.endAt).toLocaleTimeString() : '-'
                    }` : '-'}</td>
                    <td className="p-2 border">{r.status}</td>
                    <td className="p-2 border flex gap-2 items-center">
                      {r.status !== 'cancelled' ? (
                        <>
                          <button
                            className="text-blue-600 hover:underline disabled:opacity-50"
                            onClick={() => handleEditReferral(r)}
                            disabled={cancellingId === r._id}
                          >Edit</button>
                          <button
                            className="text-red-600 hover:underline disabled:opacity-50"
                            disabled={cancellingId === r._id}
                            onClick={() => handleCancelReferral(r._id)}
                          >
                            {cancellingId === r._id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400">Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Edit Referral Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-black" onClick={closeEditModal}>&times;</button>
            <h3 className="text-lg font-bold mb-4">Edit Referral</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select name="toDepartmentId" value={editForm.toDepartmentId} onChange={handleEditFormChange} required className="w-full border rounded p-2">
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slot</label>
                <select name="slotId" value={editForm.slotId} onChange={handleEditFormChange} required className="w-full border rounded p-2">
                  <option value="">Select Slot</option>
                  {editSlots.map(s => (
                    <option key={s._id} value={s._id}>
                      {new Date(s.start_at).toLocaleString()} - {new Date(s.end_at).toLocaleTimeString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <input type="text" name="notes" value={editForm.notes} onChange={handleEditFormChange} className="w-full border rounded p-2" />
              </div>
              {editError && <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{editError}</div>}
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex-1" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="bg-gray-200 text-gray-800 px-4 py-2 rounded flex-1" onClick={closeEditModal} disabled={editLoading}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Referrals;


