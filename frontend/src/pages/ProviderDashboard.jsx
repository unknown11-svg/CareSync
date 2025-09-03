import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';

function ProviderDashboard() {
  const [loading, setLoading] = useState(false);
  // Simulate loading for dashboard switch (optional, can be removed if not needed)
  // Add tab logic here if needed in the future

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[20vh]">
          <FaSpinner className="animate-spin text-3xl text-blue-400 mb-2" />
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-gray-600">Coming soon: slots, referrals, events</p>
        </div>
      )}
    </div>
  );
}

export default ProviderDashboard;


