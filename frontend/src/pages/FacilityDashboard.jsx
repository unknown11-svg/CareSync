import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import FacilityProviders from './FacilityProviders';
import FacilityDepartments from './FacilityDepartments';
import FacilitySlots from './FacilitySlots';
import FacilityEvents from './FacilityEvents';
import FacilityPatients from './FacilityPatients';
import { useEffect, useState as useState2 } from 'react';

const TABS = [
  { key: 'providers', label: 'Providers' },
  { key: 'departments', label: 'Departments' },
  { key: 'slots', label: 'Slots' },
  { key: 'events', label: 'Events' },
  { key: 'patients', label: 'Patients' },
  { key: 'analytics', label: 'Analytics' },
];

export default function FacilityDashboard() {
  const [activeTab, setActiveTab] = useState('providers');
  const [loading, setLoading] = useState(false);

  // Simulate loading for dashboard switch (optional, can be removed if not needed)
  const handleTabChange = (tab) => {
    setLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setLoading(false);
    }, 400); // quick fade for UX
  };

  return (
    <div className="bg-white rounded shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Facility Admin Dashboard</h1>
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
          {activeTab === 'providers' && <FacilityProviders />}
          {activeTab === 'departments' && <FacilityDepartments />}
          {activeTab === 'slots' && <FacilitySlots />}
          {activeTab === 'events' && <FacilityEvents />}
          {activeTab === 'patients' && <FacilityPatients />}
          {activeTab === 'analytics' && <FacilityAnalytics />}
        </>
      )}
    </div>
  );
}
