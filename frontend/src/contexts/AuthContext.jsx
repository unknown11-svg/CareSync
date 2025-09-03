import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on app load
    const token = localStorage.getItem('authToken');
    const userJson = localStorage.getItem('authUser');
    if (token && userJson) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(userJson));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role = 'admin') => {
    try {
      let endpoint, profileKey, payload;
      if (role === 'provider') {
        endpoint = '/provider/login';
        profileKey = 'provider';
        payload = { email, password };
      } else if (role === 'patient') {
        endpoint = '/patient/login';
        profileKey = 'patient';
        payload = { phone: email };
      } else if (role === 'facility-admin') {
        endpoint = '/facility-admin/login';
        profileKey = 'admin';
        payload = { email, password };
      } else {
        endpoint = '/admin/login';
        profileKey = 'admin';
        payload = { email, password };
      }
      const response = await api.post(endpoint, payload);
      const { token } = response.data;
      const profile = response.data[profileKey];
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify({ ...profile, type: role }));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser({ ...profile, type: role });
      toast.success('Login successful!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    hasPermission: (perm) => Array.isArray(user?.permissions) && user.permissions.includes(perm),
    login,
    logout,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
export { useAuth };
export default AuthProvider;

