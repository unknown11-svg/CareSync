
import { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);
  const chartRef = useRef();
  // Export analytics as CSV
  const handleExportCSV = () => {
    if (!data) return;
    const csv = Papa.unparse([
      { Metric: 'Total Referrals', Value: data.referrals.total },
      ...Object.entries(data.referrals).filter(([k]) => k !== 'total').map(([k, v]) => ({ Metric: `Referrals: ${k}`, Value: v })),
      { Metric: 'Total Slots', Value: data.slots.total },
      ...Object.entries(data.slots).filter(([k]) => k !== 'total').map(([k, v]) => ({ Metric: `Slots: ${k}`, Value: v })),
      { Metric: 'Total Events', Value: data.events.total },
      { Metric: 'Total RSVPs', Value: data.events.totalRsvps },
      { Metric: 'Total Capacity', Value: data.events.totalCapacity },
      { Metric: 'Capacity Utilization (%)', Value: data.events.capacityUtilization }
    ]);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'provider-analytics.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Export analytics as PDF
  const handleExportPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.text('Provider Analytics Dashboard', 14, 16);
    doc.autoTable({
      startY: 24,
      head: [['Metric', 'Value']],
      body: [
        ['Total Referrals', data.referrals.total],
        ...Object.entries(data.referrals).filter(([k]) => k !== 'total').map(([k, v]) => [`Referrals: ${k}`, v]),
        ['Total Slots', data.slots.total],
        ...Object.entries(data.slots).filter(([k]) => k !== 'total').map(([k, v]) => [`Slots: ${k}`, v]),
        ['Total Events', data.events.total],
        ['Total RSVPs', data.events.totalRsvps],
        ['Total Capacity', data.events.totalCapacity],
        ['Capacity Utilization (%)', data.events.capacityUtilization]
      ]
    });
    doc.save('provider-analytics.pdf');
  };

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/provider/analytics')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Provider Analytics Dashboard</h2>
      <div className="flex gap-4 mb-6">
        <button onClick={handleExportCSV} className="btn-secondary">Export CSV</button>
        <button onClick={handleExportPDF} className="btn-secondary">Export PDF</button>
      </div>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded shadow p-4 flex flex-col items-center">
              <div className="text-lg font-bold">{data.referrals.total}</div>
              <div className="text-gray-600">Total Referrals</div>
            </div>
            <div className="bg-white rounded shadow p-4 flex flex-col items-center">
              <div className="text-lg font-bold">{data.slots.total}</div>
              <div className="text-gray-600">Total Slots</div>
            </div>
            <div className="bg-white rounded shadow p-4 flex flex-col items-center">
              <div className="text-lg font-bold">{data.events.total}</div>
              <div className="text-gray-600">Total Events</div>
            </div>
          </div>

          {/* Referrals by Status Bar Chart */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Referrals by Status</h3>
            <Bar
              data={{
                labels: Object.keys(data.referrals).filter(k => k !== 'total'),
                datasets: [{
                  label: 'Referrals',
                  data: Object.entries(data.referrals).filter(([k]) => k !== 'total').map(([_, v]) => v),
                  backgroundColor: 'rgba(59, 130, 246, 0.6)'
                }]
              }}
              options={{ plugins: { legend: { display: false } } }}
            />
          </div>

          {/* Slots by Status Pie Chart */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Slots by Status</h3>
            <Pie
              data={{
                labels: Object.keys(data.slots).filter(k => k !== 'total'),
                datasets: [{
                  data: Object.entries(data.slots).filter(([k]) => k !== 'total').map(([_, v]) => v),
                  backgroundColor: ['#22c55e', '#f59e42', '#3b82f6']
                }]
              }}
              options={{ plugins: { legend: { position: 'bottom' } } }}
            />
          </div>

          {/* Event Attendance Line Chart */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Event Attendance vs Capacity</h3>
            <Bar
              data={{
                labels: ['RSVPs', 'Capacity'],
                datasets: [
                  {
                    label: 'Count',
                    data: [data.events.totalRsvps, data.events.totalCapacity],
                    backgroundColor: ['#a78bfa', '#fbbf24']
                  }
                ]
              }}
              options={{ plugins: { legend: { display: false } } }}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

export default Analytics;


