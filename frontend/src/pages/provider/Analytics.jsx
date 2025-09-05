import { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

function Analytics() {
  const chartRef = useRef();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    api.get('/provider/analytics')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  // Color palette that complements the pink-to-orange gradient
  const colors = {
    primary: {
      light: '#FF9E8D',
      medium: '#FF7C72',
      dark: '#FF6B6B'
    },
    secondary: {
      light: '#6DCFF6',
      medium: '#4AAEDE',
      dark: '#2A93CC'
    },
    accent: {
      light: '#A5D6A7',
      medium: '#66BB6A',
      dark: '#43A047'
    },
    neutral: {
      light: '#F5F5F5',
      medium: '#E0E0E0',
      dark: '#9E9E9E'
    },
    gradient: {
      pink: '#FF9E8D',
      orange: '#FF7C72',
      purple: '#A78BFA',
      indigo: '#818CF8'
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-400 to-teal-500 rounded-2xl p-6 mb-8 text-white
">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="opacity-90">Track your performance and insights at a glance</p>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={handleExportCSV}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />

          </svg>
          Export CSV
        </button>
        <button 
          onClick={handleExportPDF}
          className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 py-2 rounded-full hover:from-pink-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export PDF
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-md">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">Unable to load analytics</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-2xl font-bold mb-1">{data.referrals.total}</div>
                  <div className="text-sm opacity-90">Total Referrals</div>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <div className="text-xs">Last 30 days</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-2xl font-bold mb-1">{data.slots.total}</div>
                  <div className="text-sm opacity-90">Total Slots</div>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />

                  </svg>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <div className="text-xs">Across all events</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-2xl font-bold mb-1">{data.events.total}</div>
                  <div className="text-sm opacity-90">Total Events</div>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <div className="text-xs">Organized by you</div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referrals by Status Bar Chart */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 w-3 h-6 rounded-full mr-2"></span>
                Referrals by Status
              </h3>
              <div className="h-72">
                <Bar
                  data={{
                    labels: Object.keys(data.referrals).filter(k => k !== 'total').map(label => 
                      label.charAt(0).toUpperCase() + label.slice(1)
                    ),
                    datasets: [{
                      label: 'Referrals',
                      data: Object.entries(data.referrals).filter(([k]) => k !== 'total').map(([_, v]) => v),
                      backgroundColor: [
                        'rgba(99, 102, 241, 0.7)',
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(236, 72, 153, 0.7)',
                        'rgba(249, 115, 22, 0.7)'
                      ],
                      borderColor: [
                        'rgb(99, 102, 241)',
                        'rgb(139, 92, 246)',
                        'rgb(236, 72, 153)',
                        'rgb(249, 115, 22)'
                      ],
                      borderWidth: 1,
                      borderRadius: 8,
                    }]
                  }}
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { display: false },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Slots by Status Doughnut Chart */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <span className="bg-gradient-to-r from-pink-500 to-orange-500 w-3 h-6 rounded-full mr-2"></span>
                Slots by Status
              </h3>
              <div className="h-72">
                <Doughnut
                  data={{
                    labels: Object.keys(data.slots).filter(k => k !== 'total').map(label => 
                      label.charAt(0).toUpperCase() + label.slice(1)
                    ),
                    datasets: [{
                      data: Object.entries(data.slots).filter(([k]) => k !== 'total').map(([_, v]) => v),
                      backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                      ],
                      borderColor: [
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)'
                      ],
                      borderWidth: 2,
                      hoverOffset: 12
                    }]
                  }}
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { 
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                          pointStyle: 'circle'
                        }
                      } 
                    },
                    cutout: '60%'
                  }}
                />
              </div>
            </div>

            {/* Event Attendance Comparison */}
            <div className="bg-white rounded-2xl shadow-md p-6 lg:col-span-2">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <span className="bg-gradient-to-r from-green-500 to-teal-500 w-3 h-6 rounded-full mr-2"></span>
                Event Attendance vs Capacity
              </h3>
              <div className="h-72">
                <Bar
                  data={{
                    labels: ['RSVPs', 'Capacity'],
                    datasets: [
                      {
                        label: 'Count',
                        data: [data.events.totalRsvps, data.events.totalCapacity],
                        backgroundColor: [
                          'rgba(139, 92, 246, 0.7)',
                          'rgba(16, 185, 129, 0.7)'
                        ],
                        borderColor: [
                          'rgb(139, 92, 246)',
                          'rgb(16, 185, 129)'
                        ],
                        borderWidth: 1,
                        borderRadius: 8,
                      }
                    ]
                  }}
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { display: false },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-4 text-center text-sm text-gray-600">
                Capacity Utilization: <span className="font-semibold">{data.events.capacityUtilization}%</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Analytics;