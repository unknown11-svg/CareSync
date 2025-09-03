import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { 
  Building2, 
  Users, 
  UserCheck, 
  FileText,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useContext } from 'react';
import Facilities from './Facilities';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalFacilities: 0,
    totalProviders: 0,
    totalPatients: 0,
    activeReferrals: 0
  });
  const [loading, setLoading] = useState(true);
  // Add activeTab state for tab switching
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Facilities',
      value: stats.totalFacilities,
      icon: Building2,
      color: 'bg-primary-500',
      description: 'Registered healthcare facilities'
    },
    {
      name: 'Active Providers',
      value: stats.totalProviders,
      icon: Users,
      color: 'bg-accent-500',
      description: 'Healthcare staff accounts'
    },
    {
      name: 'Registered Patients',
      value: stats.totalPatients,
      icon: UserCheck,
      color: 'bg-primary-600',
      description: 'Patients in the system'
    },
    {
      name: 'Active Referrals',
      value: stats.activeReferrals,
      icon: FileText,
      color: 'bg-accent-600',
      description: 'Pending and confirmed referrals'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your CareSync system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions - Only show once */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Quick Actions</h2>
          <div className="flex gap-4">
            <Link to="/admin/providers" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Manage Providers</Link>
            <Link to="/admin/facilities" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Manage Facilities</Link>
          </div>
        </div>
        <h2 className="text-xl font-bold mb-2">System Status</h2>
        <div className="text-gray-600">All systems operational.</div>
        {activeTab === 'facilities' && (
          <Facilities />
        )}
        <span className="text-sm text-gray-600">Database Connection</span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Connected
        </span>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">API Status</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Operational
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Last Backup</span>
          <span className="text-sm text-gray-900">2 hours ago</span>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
