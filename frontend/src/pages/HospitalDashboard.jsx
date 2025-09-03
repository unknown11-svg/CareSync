import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';

const TABS = [
  { key: 'patients', label: 'Patients' },
  { key: 'referrals', label: 'Referrals' },
  { key: 'slots', label: 'Slots' },
  { key: 'events', label: 'Events' },
];

export default function HospitalDashboard() {
  const [activeTab, setActiveTab] = useState('patients');
  const [loading, setLoading] = useState(false);

  // Simulate loading for dashboard switch (optional, can be removed if not needed)
  const handleTabChange = (tab) => {
    setLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="bg-white rounded shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Hospital Dashboard</h1>
      <div className="mb-6 flex gap-4 border-b">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`py-2 px-4 font-semibold ${activeTab === tab.key ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-600'}`}
            onClick={() => handleTabChange(tab.key)}
            disabled={loading}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[20vh]">
          <FaSpinner className="animate-spin text-3xl text-blue-400 mb-2" />
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <>
          {activeTab === 'patients' && (
            <div> {/* TODO: Patient management UI here */} <p>Patient management coming soon...</p> </div>
          )}
          {activeTab === 'referrals' && (
            <div> {/* TODO: Referrals management UI here */} <p>Referrals management coming soon...</p> </div>
          )}
          {activeTab === 'slots' && (
            <div> {/* TODO: Slots management UI here */} <p>Slots management coming soon...</p> </div>
          )}
          {activeTab === 'events' && (
            <div> {/* TODO: Events management UI here */} <p>Events management coming soon...</p> </div>
          )}
        </>
      )}
    </div>
  );
}
