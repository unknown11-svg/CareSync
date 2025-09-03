import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PatientLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow flex items-center justify-between px-6 py-3">
        <div className="font-bold text-lg">CareSync Patient</div>
        <div className="flex items-center gap-4">
          <Link to="/patient/dashboard" className="hover:underline">Dashboard</Link>
          <button onClick={logout} className="text-red-600 hover:underline">Logout</button>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
