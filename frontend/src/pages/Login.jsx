import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Building2 } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const [role, setRole] = useState('admin');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let success = false;
    if (role === 'patient') {
      success = await login(phone, '', role);
    } else {
      success = await login(email, password, role);
    }
    if (success) {
  let target = '/admin';
  if (role === 'provider') target = '/provider';
  else if (role === 'facility-admin') target = '/admin/hospital';
  else if (role === 'patient') target = '/patient/dashboard';
      navigate(target);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <Building2 className="h-6 w-6 text-primary-500" />
          </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {role === 'admin' && 'CareSync Admin'}
              {role === 'provider' && 'Provider Login'}
              {role === 'facility-admin' && 'Facility Admin Login'}
              {role === 'patient' && 'Patient Login'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {role === 'admin' && 'Sign in to your admin account'}
              {role === 'provider' && 'Sign in to your provider account'}
              {role === 'facility-admin' && 'Sign in to your facility admin account'}
              {role === 'patient' && 'Sign in to your patient account'}
            </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sign in as</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field">
                <option value="admin">Admin</option>
                <option value="provider">Provider</option>
                  <option value="facility-admin">Facility Admin</option>
                <option value="patient">Patient</option>
              </select>
            </div>
            {role === 'patient' ? (
              <div>
                <label htmlFor="phone" className="sr-only">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  className="input-field rounded-lg"
                  placeholder="Phone number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input-field rounded-t-lg"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="input-field rounded-b-lg pr-10"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
