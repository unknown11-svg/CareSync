import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RSVPConfirmation from './pages/RSVPConfirmation';
import { Toaster } from 'react-hot-toast';
import AuthProvider, { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import PatientLogin from './pages/PatientLogin';
import PatientDashboard from './pages/PatientDashboard';
import PatientLayout from './components/PatientLayout';
import Dashboard from './pages/Dashboard';
import Facilities from './pages/Facilities';
import Providers from './pages/Providers';
import Layout from './components/Layout';
import HospitalDashboard from './pages/HospitalDashboard';
import ProviderLayout from './components/ProviderLayout';
import ProviderDashboard from './pages/ProviderDashboard';
import ProviderSlots from './pages/provider/Slots';
import ProviderReferrals from './pages/provider/Referrals';
import ProviderEvents from './pages/provider/Events';
import ProviderAnalytics from './pages/provider/Analytics';
import FacilityDashboard from './pages/FacilityDashboard';
            {/* Facility admin shell */}
            <Route path="/facility" element={
              <PrivateRoute roles={["facility-admin"]}>
                <FacilityDashboard />
              </PrivateRoute>
            } />

function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && user?.type && !roles.includes(user.type)) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Admin shell */}
            <Route path="/admin" element={
              <PrivateRoute roles={["admin", "facility-admin"]}>
                <Layout />
              </PrivateRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="facilities" element={<Facilities />} />
              <Route path="providers" element={<Providers />} />
              <Route path="hospital" element={
                <PrivateRoute roles={["admin", "facility-admin"]}>
                  <HospitalDashboard />
                </PrivateRoute>
              } />
            </Route>

            {/* Provider shell (placeholder) */}
            <Route path="/provider" element={
              <PrivateRoute roles={["provider"]}>
                <ProviderLayout />
              </PrivateRoute>
            }>
              <Route index element={<ProviderDashboard />} />
              <Route path="slots" element={<ProviderSlots />} />
              <Route path="referrals" element={<ProviderReferrals />} />
              <Route path="events" element={<ProviderEvents />} />
              <Route path="analytics" element={<ProviderAnalytics />} />
            </Route>


            {/* Patient login and dashboard */}
            <Route path="/patient/login" element={<PatientLogin />} />
            <Route path="/patient" element={
              <PrivateRoute roles={["patient"]}>
                <PatientLayout />
              </PrivateRoute>
            }>
              <Route path="dashboard" element={<PatientDashboard />} />
            </Route>

            {/* Public RSVP confirmation page for WhatsApp links */}
            <Route path="/rsvp/:eventId/:patientId" element={<RSVPConfirmation />} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/admin" />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
