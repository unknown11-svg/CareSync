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
  
  // New state for the card-based UI
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showReferrals, setShowReferrals] = useState(false);
  const [showSlots, setShowSlots] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);

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
  }, []);

  // Fetch referrals for provider
  const fetchReferrals = async () => {
    setReferralsLoading(true);
    setReferralsError('');
    try {
      const res = await api.get('/referrals');
      setReferrals(res.data);
    } catch (err) {
      setReferralsError('Could not load referrals.');
    }
    setReferralsLoading(false);
  };

  // Fetch departments when facility is selected
  const handleFacilitySelect = (facility) => {
    setSelectedFacility(facility);
    setForm({ ...form, fromFacilityId: facility._id });
    setSelectedDepartment(null);
    setShowSlots(false);
    setShowBookingForm(false);
    
    api.get(`/departments/${facility._id}/departments`)
      .then(res => setDepartments(res.data))
      .catch(() => setDepartments([]));
  };

  // Fetch slots when department is selected
  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    setForm({ ...form, toDepartmentId: department._id });
    
    api.get(`/slots/${selectedFacility._id}/departments/${department._id}`)
      .then(res => {
        setSlots(res.data);
        setShowSlots(true);
      })
      .catch(() => {
        setSlots([]);
        setShowSlots(true);
      });
  };

  // Handle slot selection
  const handleSlotSelect = (slot) => {
    setForm({ ...form, slotId: slot._id });
    setShowBookingForm(true);
  };

  // Handle patient selection
  const handlePatientSelect = (e) => {
    setForm({ ...form, patientId: e.target.value });
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
      // Reset the form and UI state
      setForm({
        fromFacilityId: '',
        toDepartmentId: '',
        patientId: '',
        slotId: ''
      });
      setSelectedFacility(null);
      setSelectedDepartment(null);
      setShowSlots(false);
      setShowBookingForm(false);
      fetchReferrals();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error booking referral');
    }
    setLoading(false);
  };

  // Department icons mapping
  const departmentIcons = {
    'General Medicine': '🏥',
    'Cardiology': '❤️',
    'Neurology': '🧠',
    'Pediatrics': '👶',
    'Orthopedics': '🦴',
    'Dermatology': '🔬',
    'Ophthalmology': '👁️',
    'Dental': '🦷',
    'default': '🏢'
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Medical Referral System</h1>
        <p className="opacity-90">Easily book and manage patient referrals to specialized departments</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Book a Referral
        </h2>
        <button 
          onClick={() => {
            setShowReferrals(!showReferrals);
            if (!showReferrals) fetchReferrals();
          }} 
          className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors flex items-center"
        >
          <span className="mr-2">{showReferrals ? 'Hide' : 'View'} My Referrals</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Facilities Grid */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Select a Facility</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {facilities.map(facility => (
            <div 
              key={facility._id}
              onClick={() => handleFacilitySelect(facility)}
              className={`p-6 rounded-2xl shadow-md cursor-pointer transition-all duration-300 ${
                selectedFacility?._id === facility._id 
                  ? 'bg-indigo-100 border-2 border-indigo-500 transform scale-105' 
                  : 'bg-white hover:bg-gray-50 hover:shadow-lg'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🏥</div>
                <h4 className="font-medium text-gray-800">{facility.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{facility.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Departments Modal */}
      {selectedFacility && (
        <section className="my-6 p-6 bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Departments at {selectedFacility.name}
            </h3>
            <button
              onClick={() => {
                setSelectedFacility(null);
                setDepartments([]);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {departments.map((department) => (
              <div
                key={department._id}
                onClick={() => handleDepartmentSelect(department)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                  selectedDepartment?._id === department._id
                    ? 'bg-indigo-50 border-indigo-500'
                    : 'bg-white border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {departmentIcons[department.name] || departmentIcons.default}
                  </span>
                  <span className="font-medium text-gray-800">{department.name}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Slots Calendar View */}
      {showSlots && selectedDepartment && (
        <div className="mb-8 mt-8 transition-all duration-500 ease-in-out">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Available Slots for {selectedDepartment.name}</h3>
          <div className="bg-white rounded-2xl shadow-md p-6">
            {slots.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No available slots for this department.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {slots.map(slot => (
                  <div 
                    key={slot._id}
                    onClick={() => handleSlotSelect(slot)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                      form.slotId === slot._id 
                        ? 'bg-green-50 border-green-500' 
                        : 'bg-white border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-medium text-gray-800">
                        {new Date(slot.startAt || slot.start_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(slot.startAt || slot.start_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                        {new Date(slot.endAt || slot.end_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="text-xs mt-2 text-gray-500 capitalize">
                        Status: {slot.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Form */}
      {showBookingForm && (
        <div className="mb-8 mt-8 transition-all duration-500 ease-in-out">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Complete Booking</h3>
            {formError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{formError}</div>
            )}
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800">Booking Summary</h4>
              <p className="text-sm text-blue-600">
                Facility: {selectedFacility?.name} | 
                Department: {selectedDepartment?.name} | 
                Slot: {slots.find(s => s._id === form.slotId) ? 
                  `${new Date(slots.find(s => s._id === form.slotId).startAt || slots.find(s => s._id === form.slotId).start_at).toLocaleString()} - 
                  ${new Date(slots.find(s => s._id === form.slotId).endAt || slots.find(s => s._id === form.slotId).end_at).toLocaleTimeString()}` 
                  : ''}
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">Select Patient</label>
              <select 
                name="patientId" 
                value={form.patientId} 
                onChange={handlePatientSelect} 
                required 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.name} {p.surname}</option>)}
              </select>
            </div>
            
            <button 
              type="button" 
              onClick={handleSubmit} 
              disabled={loading || !form.patientId}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading && (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              )}
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}

      {confirmation && (
        <div className="mt-6 p-6 bg-green-50 rounded-2xl border border-green-200">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="font-bold text-green-800">Referral Booked Successfully!</h3>
          </div>
          <div className="mt-2 text-sm text-green-700">
            <p>Your referral has been confirmed. Details have been sent to the patient.</p>
          </div>
        </div>
      )}

      {/* Referrals Panel */}
      {showReferrals && (
        <div className="mt-8 transition-all duration-500 ease-in-out">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Your Referrals</h2>
              <button 
                onClick={() => setShowReferrals(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {cancelError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{cancelError}</div>
            )}
            
            {referralsLoading ? (
              <div className="flex justify-center py-8">
                <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              </div>
            ) : referralsError ? (
              <div className="text-red-600 py-4 text-center">{referralsError}</div>
            ) : referrals.length === 0 ? (
              <div className="py-6 text-center text-gray-500">No referrals found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {referrals.map(r => (
                      <tr key={r._id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">
                          {r.patientId ? `${r.patientId.name} ${r.patientId.surname}` : '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">
                          {r.fromFacilityId?.name || '-'}
                        </td>
                        <td className="p-2 border">
                          {r.fromFacilityId?.departments
                            ?.map(dept => dept.name)
                            .join(', ') || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">
                          {r.slotId ? `${new Date(r.slotId.start_at || r.slotId.startAt).toLocaleString()} - ${new Date(r.slotId.end_at || r.slotId.endAt).toLocaleTimeString()}` : '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            r.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            r.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          {r.status !== 'cancelled' ? (
                            <div className="flex space-x-2">
                              <button
                                className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                                onClick={() => handleEditReferral(r)}
                                disabled={cancellingId === r._id}
                              >
                                Edit
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                disabled={cancellingId === r._id}
                                onClick={() => handleCancelReferral(r._id)}
                              >
                                {cancellingId === r._id ? 'Cancelling...' : 'Cancel'}
                              </button>
                            </div>
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
        </div>
      )}

      {/* Edit Referral Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-black" onClick={closeEditModal}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-lg font-bold mb-4">Edit Referral</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select name="toDepartmentId" value={editForm.toDepartmentId} onChange={handleEditFormChange} required className="w-full border rounded-xl p-2">
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slot</label>
                <select name="slotId" value={editForm.slotId} onChange={handleEditFormChange} required className="w-full border rounded-xl p-2">
                  <option value="">Select Slot</option>
                  {editSlots.map(s => (
                    <option key={s._id} value={s._id}>
                      {new Date(s.startAt).toLocaleString()} - {new Date(s.endAt).toLocaleTimeString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <input type="text" name="notes" value={editForm.notes} onChange={handleEditFormChange} className="w-full border rounded-xl p-2" />
              </div>
              {editError && <div className="bg-red-100 text-red-700 p-2 rounded-lg text-sm">{editError}</div>}
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors flex-1 flex items-center justify-center" disabled={editLoading}>
                  {editLoading && (
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                  )}
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl flex-1" onClick={closeEditModal} disabled={editLoading}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Referrals;