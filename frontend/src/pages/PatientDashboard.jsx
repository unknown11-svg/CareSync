import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { FaBell } from 'react-icons/fa';
import { FaRegClock } from 'react-icons/fa';
import { FaSpinner } from 'react-icons/fa';
  const [reminders, setReminders] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [selectedReferral, setSelectedReferral] = useState(null);

  // Download referral letter as PDF
  const handleDownloadReferral = (ref) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Referral Letter', 20, 20);
    doc.setFontSize(12);
    doc.text(`Referral ID: ${ref._id}`, 20, 35);
    if (ref.reason) doc.text(`Reason: ${ref.reason}`, 20, 45);
    if (ref.fromFacilityName) doc.text(`From: ${ref.fromFacilityName}`, 20, 55);
    if (ref.toDepartmentName) doc.text(`To: ${ref.toDepartmentName}`, 20, 65);
    doc.text(`Status: ${ref.status}`, 20, 75);
    doc.text(`Date: ${new Date(ref.createdAt).toLocaleString()}`, 20, 85);
    doc.save(`referral_${ref._id}.pdf`);
  };
import toast from 'react-hot-toast';
import SlotPicker from '../components/SlotPicker';
  const [rescheduleModal, setRescheduleModal] = useState({ open: false, appointmentId: null, departmentId: null });
  // Cancel appointment handler
  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.post(`/patient/appointments/${appointmentId}/cancel`);
      toast.success('Appointment cancelled');
      setAppointments(appts => appts.map(a => a._id === appointmentId ? { ...a, status: 'cancelled' } : a));
    } catch (err) {
      toast.error('Failed to cancel appointment');
    }
  };

  // Open slot picker modal
  const handleReschedule = (appointmentId, departmentId) => {
    setRescheduleModal({ open: true, appointmentId, departmentId });
  };

  // Handle slot selection from modal
  const handleSlotSelect = async (slotId) => {
    const { appointmentId } = rescheduleModal;
    try {
      await api.post(`/patient/appointments/${appointmentId}/reschedule`, { newSlotId: slotId });
      toast.success('Appointment rescheduled');
      setRescheduleModal({ open: false, appointmentId: null, departmentId: null });
      const apptRes = await api.get('/patient/appointments');
      setAppointments(apptRes.data);
    } catch (err) {
      toast.error('Failed to reschedule appointment');
    }
  };
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

  const { user, loading } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [eventActionLoading, setEventActionLoading] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  // RSVP or cancel RSVP for an event
  const handleEventRSVP = async (eventId, action) => {
    setEventActionLoading(eventId + action);
    try {
      await api.post(`/events/${eventId}/rsvp`, { action });
      toast.success(action === 'yes' ? 'RSVP confirmed' : 'RSVP cancelled');
      // Refetch events
      const evtRes = await api.get('/patient/events');
      setEvents(evtRes.data);
    } catch (err) {
      toast.error('Failed to update RSVP');
    } finally {
      setEventActionLoading(null);
    }
  };
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.type !== 'patient') return;
    const fetchData = async () => {
      setDashboardLoading(true);
      try {
        const [apptRes, refRes, evtRes, notifRes, reminderRes] = await Promise.all([
          api.get('/patient/appointments'),
          api.get('/patient/referrals'),
          api.get('/patient/events'),
          api.get('/patient/notifications'),
          api.get('/patient/reminders'),
        ]);
        setAppointments(apptRes.data);
        setReferrals(refRes.data);
        setEvents(evtRes.data);
        setNotifications(notifRes.data || []);
        setReminders(reminderRes.data || []);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setDashboardLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading || dashboardLoading) return (
    <div className="p-8 flex flex-col items-center justify-center text-center min-h-[40vh]">
      <FaSpinner className="animate-spin text-4xl text-blue-400 mb-4" />
      <div className="text-lg text-gray-600">Loading your dashboard...</div>
    </div>
  );
  if (!user || user.type !== 'patient') return <div className="p-8 text-center">Unauthorized</div>;

  // Count unread notifications (for hackathon, all are unread)
  const unreadCount = notifications.length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 24-hour Reminders Section */}
      {reminders.length > 0 && (
        <section className="mb-8 animate-fade-in">
          <div className="flex items-center mb-2">
            <FaRegClock className="text-2xl text-yellow-500 mr-2 animate-pulse" />
            <h2 className="text-lg font-bold tracking-tight text-yellow-700 drop-shadow">Upcoming in 24 Hours</h2>
          </div>
          <ul className="divide-y bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-300 rounded-xl shadow-sm">
            {reminders.map(rem => {
              // Highlight if within 2 hours
              const soon = rem.date && (new Date(rem.date) - new Date()) < 2 * 60 * 60 * 1000;
              return (
                <li
                  key={rem.appointmentId}
                  className={`p-4 flex flex-col md:flex-row md:items-center md:justify-between transition-all duration-300 ${soon ? 'bg-yellow-200/80 border-l-4 border-yellow-500 shadow-md' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 mr-2 border border-yellow-300">
                      <FaRegClock className="text-lg" />
                    </span>
                    <div>
                      <div className="font-semibold text-yellow-900">{rem.message}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{rem.date ? new Date(rem.date).toLocaleString() : ''}</div>
                    </div>
                  </div>
                  <button
                    className="mt-3 md:mt-0 px-4 py-1.5 bg-gradient-to-r from-blue-200 to-blue-100 text-blue-800 font-semibold rounded-lg hover:from-blue-300 hover:to-blue-200 shadow-sm border border-blue-200 transition-colors"
                    onClick={() => handleReschedule(rem.appointmentId)}
                  >
                    Reschedule
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Welcome, {user.name || user.email}</h1>
        <div className="relative">
          <button className="relative" onClick={() => setShowNotif(v => !v)}>
            <FaBell className="text-2xl text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-3 border-b font-semibold flex items-center justify-between">
                <span>Notifications</span>
                {notifications.length > 0 && (
                  <button
                    className="text-xs text-blue-600 hover:underline ml-2"
                    onClick={async () => {
                      try {
                        await api.post('/patient/notifications/clear');
                        setNotifications([]);
                        toast.success('Notifications cleared');
                      } catch {
                        toast.error('Failed to clear notifications');
                      }
                    }}
                  >Clear All</button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="p-4 text-gray-500">No notifications.</div>
              ) : (
                <ul>
                  {notifications.slice().reverse().map((notif, idx) => (
                    <li key={idx} className="px-4 py-2 border-b last:border-b-0 text-sm text-gray-700">
                      <div>{notif.message}</div>
                      <div className="text-xs text-gray-400 mt-1">{notif.sentAt ? new Date(notif.sentAt).toLocaleString() : ''}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Upcoming Appointments</h2>
        {appointments.length === 0 ? (
          <div className="text-gray-400 flex flex-col items-center">
            <span className="text-5xl mb-2">📅</span>
            No appointments found.
          </div>
        ) : (
          <ul className="divide-y">
            {appointments.map(appt => {
              let statusColor = 'text-gray-500';
              if (appt.status === 'confirmed') statusColor = 'text-green-600';
              else if (appt.status === 'booked') statusColor = 'text-blue-600';
              else if (appt.status === 'cancelled') statusColor = 'text-red-600';
              return (
                <li key={appt._id} className="py-3 flex flex-col gap-1 border-l-4 pl-3 mb-2" style={{ borderColor: appt.status === 'confirmed' ? '#16a34a' : appt.status === 'booked' ? '#2563eb' : appt.status === 'cancelled' ? '#dc2626' : '#6b7280' }}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <span className="font-medium">
                      {appt.slot?.start_at ? new Date(appt.slot.start_at).toLocaleString() : 'N/A'}
                      {appt.slot?.end_at && (
                        <span> - {new Date(appt.slot.end_at).toLocaleTimeString()}</span>
                      )}
                    </span>
                    <span className={`ml-2 text-sm font-semibold ${statusColor}`}>Status: {appt.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700 mt-1">
                    {appt.provider && <span>Provider: {appt.provider.name}</span>}
                    {appt.department && <span>Department: {appt.department}</span>}
                    {appt.facility && <span>Facility: {appt.facility.name}</span>}
                    <span>Slot ID: {appt.slot?._id}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {appt.status !== 'cancelled' && (
                      <>
                        <button
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                          onClick={() => handleCancel(appt._id)}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                          onClick={() => handleReschedule(appt._id, appt.slot?.department_id)}
                        >
                          Reschedule
                        </button>
      {rescheduleModal.open && (
        <SlotPicker
          departmentId={rescheduleModal.departmentId}
          onSelect={handleSlotSelect}
          onClose={() => setRescheduleModal({ open: false, appointmentId: null, departmentId: null })}
        />
      )}
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Referrals</h2>
        {referrals.length === 0 ? (
          <div className="text-gray-400 flex flex-col items-center">
            <span className="text-5xl mb-2">📄</span>
            No referrals found.
          </div>
        ) : (
          <ul className="divide-y">
            {referrals.map(ref => {
              let statusColor = 'text-gray-500';
              if (ref.status === 'confirmed') statusColor = 'text-green-600';
              else if (ref.status === 'booked') statusColor = 'text-blue-600';
              else if (ref.status === 'cancelled') statusColor = 'text-red-600';
              return (
                <li key={ref._id} className="py-3 flex flex-col gap-1 border-l-4 pl-3 mb-2" style={{ borderColor: ref.status === 'confirmed' ? '#16a34a' : ref.status === 'booked' ? '#2563eb' : ref.status === 'cancelled' ? '#dc2626' : '#6b7280' }}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <span className="font-medium">Referral ID: {ref._id}</span>
                    <span className={`ml-2 text-sm font-semibold ${statusColor}`}>Status: {ref.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700 mt-1">
                    {ref.reason && <span>Reason: {ref.reason}</span>}
                    {ref.fromFacilityName && <span>From: {ref.fromFacilityName}</span>}
                    {ref.toDepartmentName && <span>To: {ref.toDepartmentName}</span>}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                      onClick={() => setSelectedReferral(ref)}
                    >
                      View Details
                    </button>
                    <button
                      className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs"
                      onClick={() => handleDownloadReferral(ref)}
                    >
                      Download Letter
                    </button>
                  </div>
                </li>
              );
            })}
      {/* Referral Details Modal */}
      {selectedReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setSelectedReferral(null)}>&times;</button>
            <h2 className="text-lg font-bold mb-4">Referral Details</h2>
            <div className="mb-2"><b>Referral ID:</b> {selectedReferral._id}</div>
            {selectedReferral.reason && <div className="mb-2"><b>Reason:</b> {selectedReferral.reason}</div>}
            {selectedReferral.fromFacilityName && <div className="mb-2"><b>From:</b> {selectedReferral.fromFacilityName}</div>}
            {selectedReferral.toDepartmentName && <div className="mb-2"><b>To:</b> {selectedReferral.toDepartmentName}</div>}
            <div className="mb-2"><b>Status:</b> {selectedReferral.status}</div>
            <div className="mb-2"><b>Created:</b> {new Date(selectedReferral.createdAt).toLocaleString()}</div>
            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => handleDownloadReferral(selectedReferral)}
            >
              Download Letter
            </button>
          </div>
        </div>
      )}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Events</h2>
        {events.length === 0 ? (
          <div className="text-gray-400 flex flex-col items-center">
            <span className="text-5xl mb-2">🎪</span>
            No events found.
          </div>
        ) : (
          <ul className="divide-y">
            {events.map(evt => {
              // Find this patient's RSVP
              const myRSVP = evt.rsvps?.find(r => r.patientId === user.id || r.patientId === user._id);
              return (
                <li key={evt._id} className="py-3 flex flex-col gap-1 border-l-4 pl-3 mb-2 border-blue-300">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <span className="font-medium text-lg cursor-pointer underline hover:text-blue-700" onClick={() => setSelectedEvent(evt)}>{evt.title}</span>
                    <span className="text-sm text-gray-500">{evt.startsAt ? new Date(evt.startsAt).toLocaleString() : ''}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700 mt-1">
                    <span>Type: {evt.type}</span>
                    {evt.description && <span>Description: {evt.description}</span>}
                    {evt.services && evt.services.length > 0 && <span>Services: {evt.services.join(', ')}</span>}
                    {evt.location && evt.location.coordinates && (
                      <span>Location: <a href={`https://maps.google.com/?q=${evt.location.coordinates[1]},${evt.location.coordinates[0]}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Map</a></span>
                    )}
                    <span>Capacity: {evt.capacity}</span>
                    <span>Attending: {evt.rsvps?.length || 0}</span>
                  </div>
                  <div className="flex gap-2 mt-2 items-center">
                    <span className={myRSVP?.status === 'yes' ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                      RSVP: {myRSVP?.status === 'yes' ? 'Confirmed' : 'Not confirmed'}
                    </span>
                    {myRSVP?.status === 'yes' ? (
                      <button
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                        disabled={eventActionLoading === evt._id + 'cancel'}
                        onClick={() => handleEventRSVP(evt._id, 'cancel')}
                      >
                        {eventActionLoading === evt._id + 'cancel' ? 'Cancelling...' : 'Cancel RSVP'}
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs"
                        disabled={eventActionLoading === evt._id + 'yes'}
                        onClick={() => handleEventRSVP(evt._id, 'yes')}
                      >
                        {eventActionLoading === evt._id + 'yes' ? 'RSVPing...' : 'RSVP'}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setSelectedEvent(null)}>&times;</button>
            <h2 className="text-lg font-bold mb-4">Event Details</h2>
            <div className="mb-2"><b>Title:</b> {selectedEvent.title}</div>
            <div className="mb-2"><b>Date:</b> {selectedEvent.startsAt ? new Date(selectedEvent.startsAt).toLocaleString() : ''}</div>
            <div className="mb-2"><b>Type:</b> {selectedEvent.type}</div>
            {selectedEvent.description && <div className="mb-2"><b>Description:</b> {selectedEvent.description}</div>}
            {selectedEvent.services && selectedEvent.services.length > 0 && <div className="mb-2"><b>Services:</b> {selectedEvent.services.join(', ')}</div>}
            {selectedEvent.location && selectedEvent.location.coordinates && (
              <div className="mb-2"><b>Location:</b> <a href={`https://maps.google.com/?q=${selectedEvent.location.coordinates[1]},${selectedEvent.location.coordinates[0]}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Map</a></div>
            )}
            <div className="mb-2"><b>Capacity:</b> {selectedEvent.capacity}</div>
            <div className="mb-2"><b>Attending:</b> {selectedEvent.rsvps?.length || 0}</div>
            <div className="mb-2"><b>RSVP Status:</b> {selectedEvent.rsvps?.find(r => r.patientId === user.id || r.patientId === user._id)?.status === 'yes' ? 'Confirmed' : 'Not confirmed'}</div>
            <div className="flex gap-2 mt-4">
              {selectedEvent.rsvps?.find(r => r.patientId === user.id || r.patientId === user._id)?.status === 'yes' ? (
                <button
                  className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                  disabled={eventActionLoading === selectedEvent._id + 'cancel'}
                  onClick={() => handleEventRSVP(selectedEvent._id, 'cancel')}
                >
                  {eventActionLoading === selectedEvent._id + 'cancel' ? 'Cancelling...' : 'Cancel RSVP'}
                </button>
              ) : (
                <button
                  className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                  disabled={eventActionLoading === selectedEvent._id + 'yes'}
                  onClick={() => handleEventRSVP(selectedEvent._id, 'yes')}
                >
                  {eventActionLoading === selectedEvent._id + 'yes' ? 'RSVPing...' : 'RSVP'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
          </ul>
        )}
      </section>
    </div>
  );

