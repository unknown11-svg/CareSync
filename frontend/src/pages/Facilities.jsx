import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { Plus, Building2, MapPin, Edit, Trash2 } from 'lucide-react';

function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'hospital',
    location: {
      coordinates: [0, 0]
    },
    departments: []
  });
  const [editingId, setEditingId] = useState(null);
  // string inputs to allow negative sign and partial decimals
  const [latInput, setLatInput] = useState('0');
  const [lngInput, setLngInput] = useState('0');

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const response = await api.get('/admin/facilities');
      setFacilities(response.data);
    } catch (error) {
      toast.error('Failed to load facilities');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const latitude = parseFloat(latInput);
      const longitude = parseFloat(lngInput);
      const payload = {
        ...formData,
        location: {
          ...formData.location,
          coordinates: [
            isNaN(longitude) ? 0 : longitude,
            isNaN(latitude) ? 0 : latitude
          ]
        }
      };
      if (editingId) {
        await api.put(`/admin/facilities/${editingId}`, payload);
        toast.success('Facility updated successfully');
      } else {
        await api.post('/admin/facilities', payload);
        toast.success('Facility created successfully');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        type: 'hospital',
        location: {
          coordinates: [0, 0]
        },
        departments: []
      });
      setLatInput('0');
      setLngInput('0');
      fetchFacilities();
    } catch (error) {
      toast.error('Failed to save facility');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const startEdit = (facility) => {
    setEditingId(facility._id);
    setFormData({
      name: facility.name,
      type: facility.type,
      location: {
        coordinates: [
          facility.location?.coordinates?.[0] || 0,
          facility.location?.coordinates?.[1] || 0
        ]
      },
      departments: facility.departments || []
    });
    setLngInput(String(facility.location?.coordinates?.[0] ?? 0));
    setLatInput(String(facility.location?.coordinates?.[1] ?? 0));
    setShowForm(true);
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    // Allow optional leading '-', digits, optional decimal point and fraction
    if (!/^[-]?\d*(?:[.]\d*)?$/.test(value)) return;
    if (name === 'latitude') {
      setLatInput(value);
    } else {
      setLngInput(value);
    }
  };

  const toDMS = (decimal, isLat) => {
    if (decimal === undefined || decimal === null || isNaN(decimal)) return '';
    const hemisphere = isLat ? (decimal < 0 ? 'S' : 'N') : (decimal < 0 ? 'W' : 'E');
    const abs = Math.abs(decimal);
    const degrees = Math.floor(abs);
    const minutesFloat = (abs - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = Math.round((minutesFloat - minutes) * 60);
    return `${degrees}° ${minutes}' ${seconds}"${hemisphere}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facilities</h1>
          <p className="text-gray-600">Manage healthcare facilities</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Facility
        </button>
      </div>

      {/* Add Facility Form */}
      {showForm && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Facility</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="hospital">Hospital</option>
                  <option value="clinic">Clinic</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  name="latitude"
                  value={latInput}
                  onChange={handleLocationChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  name="longitude"
                  value={lngInput}
                  onChange={handleLocationChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Create Facility
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Facilities List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Registered Facilities</h3>
        {facilities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No facilities registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {facilities.map((facility) => (
                  <tr key={facility._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {facility.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {facility.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>
                          Lat: {toDMS(facility.location?.coordinates?.[1], true)}
                          {', '}Lon: {toDMS(facility.location?.coordinates?.[0], false)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {facility.departments?.length || 0} departments
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(facility)} className="text-primary-500 hover:text-primary-700">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Facilities;
