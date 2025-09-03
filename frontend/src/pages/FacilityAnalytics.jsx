import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import api from '../services/api';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function FacilityAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [referralAnalytics, setReferralAnalytics] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchReferralAnalytics();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/facility/analytics');
      setStats(res.data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralAnalytics = async () => {
    try {
      const res = await api.get('/referral/analytics');
      setReferralAnalytics(res.data);
    } catch {
      setReferralAnalytics(null);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Facility Analytics</h2>
      {loading ? (
        <Loader message="Loading analytics..." />
      ) : !stats ? (
        <div className="text-gray-500">No analytics data available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded shadow p-6">
            <div className="text-gray-500">Total Patients</div>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
          </div>
          <div className="bg-white rounded shadow p-6">
            <div className="text-gray-500">Active Slots</div>
            <div className="text-2xl font-bold">{stats.activeSlots}</div>
          </div>
          <div className="bg-white rounded shadow p-6">
            <div className="text-gray-500">Upcoming Events</div>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
          </div>
          <div className="bg-white rounded shadow p-6">
            <div className="text-gray-500">Providers</div>
            <div className="text-2xl font-bold">{stats.providers}</div>
          </div>
          <div className="bg-white rounded shadow p-6">
            <div className="text-gray-500">Departments</div>
            <div className="text-2xl font-bold">{stats.departments}</div>
          </div>
        </div>
      )}
      {/* Referral Analytics Charts */}
      <div className="bg-white rounded shadow p-6 mt-6">
        <h3 className="text-md font-semibold mb-4">Referral Status Breakdown</h3>
        {referralAnalytics && referralAnalytics.statusCounts ? (
          <div className="max-w-xs mx-auto">
            <Pie
              data={{
                labels: Object.keys(referralAnalytics.statusCounts),
                datasets: [
                  {
                    data: Object.values(referralAnalytics.statusCounts),
                    backgroundColor: [
                      '#2563eb', // booked
                      '#16a34a', // confirmed
                      '#dc2626'  // cancelled
                    ],
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: { position: 'bottom' },
                },
              }}
            />
          </div>
        ) : (
          <div className="text-gray-400">No referral analytics data.</div>
        )}
      </div>
      <div className="bg-white rounded shadow p-6 mt-6">
        <h3 className="text-md font-semibold mb-4">Referral Monthly Trend</h3>
        {referralAnalytics && referralAnalytics.monthly ? (
          <Bar
            data={{
              labels: Object.keys(referralAnalytics.monthly),
              datasets: ['booked', 'confirmed', 'cancelled'].map((status, idx) => ({
                label: status.charAt(0).toUpperCase() + status.slice(1),
                data: Object.values(referralAnalytics.monthly).map(m => m[status] || 0),
                backgroundColor: [
                  '#2563eb', // booked
                  '#16a34a', // confirmed
                  '#dc2626'  // cancelled
                ][idx],
              })),
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' },
                title: { display: false },
              },
              scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true },
              },
            }}
          />
        ) : (
          <div className="text-gray-400">No monthly trend data.</div>
        )}
      </div>
    </div>
  );
}