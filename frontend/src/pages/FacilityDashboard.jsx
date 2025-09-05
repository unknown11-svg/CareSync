
import { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import FacilityProviders from './FacilityProviders';
import FacilityDepartments from './FacilityDepartments';
import FacilitySlots from './FacilitySlots';
import FacilityEvents from './FacilityEvents';
import FacilityPatients from './FacilityPatients';

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
  const [facility, setFacility] = useState(null);

  // Fetch the current facility (simulate or replace with real fetch as needed)
  useEffect(() => {
    async function fetchFacility() {
      try {
        const res = await fetch('/api/facility-admin/my-facility', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch facility');
        const data = await res.json();
        setFacility(data || null);
      } catch {
        setFacility(null);
      }
    }
    fetchFacility();
  }, []);

  // Simulate loading for dashboard switch (optional, can be removed if not needed)
  const handleTabChange = (tab) => {
    setLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setLoading(false);
    }, 400); // quick fade for UX
  };

  return (
    <div className="bg-background rounded-card shadow-card p-6 font-sans text-text-primary">
      <h1 className="text-2xl font-bold mb-6 text-facility-accent">Facility Admin Dashboard</h1>
      <div className="mb-6 flex gap-4 border-b border-neutral-gray">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`py-2 px-4 font-semibold transition-colors ${activeTab === tab.key ? 'border-b-2 border-facility-accent text-facility-accent' : 'text-neutral-gray hover:text-facility-accent hover:border-facility-accent-hover'}`}
            onClick={() => handleTabChange(tab.key)}
            disabled={loading}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[20vh]">
          <FaSpinner className="animate-spin text-3xl text-facility-accent mb-2" />
          <div className="text-neutral-gray">Loading...</div>
        </div>
      ) : (
        facility ? (
          <>
            {activeTab === 'providers' && <FacilityProviders departments={facility.departments || []} />}
            {activeTab === 'departments' && <FacilityDepartments />}
            {activeTab === 'slots' && <FacilitySlots />}
            {activeTab === 'events' && <FacilityEvents />}
            {activeTab === 'patients' && <FacilityPatients />}
            {activeTab === 'analytics' && <FacilityAnalytics />}
          </>
        ) : (
          <div className="text-neutral-gray text-center py-8">No facility found or assigned to your account.</div>
        )
      )}
    </div>
  );
}
