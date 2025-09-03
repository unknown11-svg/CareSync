import { useEffect, useState } from 'react';

export default function SlotPicker({ departmentId, onSelect, onClose }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    setLoading(true);
    let url = `/api/slots?department_id=${departmentId || ''}`;
    if (date) {
      const start = new Date(date);
      start.setHours(0,0,0,0);
      const end = new Date(date);
      end.setHours(23,59,59,999);
      url += `&start_at=${start.toISOString()}&end_at=${end.toISOString()}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setSlots(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load slots');
        setLoading(false);
      });
  }, [departmentId, date]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-bold mb-4">Select a New Slot</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Filter by date:</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          />
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : slots.length === 0 ? (
          <div className="text-gray-500">No available slots.</div>
        ) : (
          <ul className="divide-y max-h-64 overflow-y-auto">
            {slots.map(slot => (
              <li key={slot._id} className="py-2 flex justify-between items-center">
                <span>{new Date(slot.start_at).toLocaleString()} - {new Date(slot.end_at).toLocaleTimeString()}</span>
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                  onClick={() => onSelect(slot._id)}
                >
                  Select
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
