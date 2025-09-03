import { useState } from 'react';
import api from '../services/api';
import { useParams } from 'react-router-dom';

export default function RSVPConfirmation() {
  const { eventId, patientId } = useParams();
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');

  const handleRSVP = async (response) => {
    setStatus('loading');
    try {
      await api.post(`/events/public/${eventId}/${patientId}/rsvp`, { status: response });
      setStatus(response === 'yes' ? 'confirmed' : 'declined');
    } catch {
      setError('Failed to update RSVP. Please try again.');
      setStatus('pending');
    }
  };

  if (status === 'loading') return <div className="p-8 text-center">Updating RSVP...</div>;
  if (status === 'confirmed') return <div className="p-8 text-center text-green-600 font-bold">Thank you! Your attendance is confirmed.</div>;
  if (status === 'declined') return <div className="p-8 text-center text-gray-600 font-bold">You have declined this event.</div>;

  return (
    <div className="max-w-md mx-auto mt-16 bg-white rounded shadow p-8 text-center">
      <h2 className="text-xl font-bold mb-4">Event RSVP Confirmation</h2>
      <p className="mb-6">Will you attend this event?</p>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="flex justify-center gap-4">
        <button className="bg-green-600 text-white px-6 py-2 rounded" onClick={() => handleRSVP('yes')}>Yes</button>
        <button className="bg-gray-400 text-white px-6 py-2 rounded" onClick={() => handleRSVP('no')}>No</button>
      </div>
    </div>
  );
}
