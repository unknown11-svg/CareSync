const Admin = require('../models/admin');
const Provider = require('../models/provider');
const Facility = require('../models/facilities');
const jwt = require('jsonwebtoken');

// Admin authentication
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        email: admin.email, 
        role: admin.role,
        type: 'admin'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new facility
const createFacility = async (req, res) => {
  try {
    const { name, type, location, departments } = req.body;

    const facility = new Facility({
      name,
      type,
      location: {
        type: 'Point',
        coordinates: location.coordinates
      },
      departments: departments || []
    });

    await facility.save();

    res.status(201).json({
      message: 'Facility created successfully',
      facility
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating facility', error: error.message });
  }
};

// Get all facilities
const getFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find().populate('departments');
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching facilities', error: error.message });
  }
};

// Create provider account
const createProvider = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      name, 
      facilityId, 
      departmentId, 
      role, 
      phone, 
      permissions 
    } = req.body;

    // Check if facility exists
    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Check if email already exists
    const existingProvider = await Provider.findOne({ email });
    if (existingProvider) {
      return res.status(400).json({ message: 'Provider with this email already exists' });
    }

    const provider = new Provider({
      email,
      password,
      name,
      facilityId,
      departmentId,
      role,
      phone,
      permissions: permissions || []
    });

    await provider.save();

    // Remove password from response
    const providerResponse = provider.toObject();
    delete providerResponse.password;

    res.status(201).json({
      message: 'Provider account created successfully',
      provider: providerResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating provider', error: error.message });
  }
};

// Get all providers
const getProviders = async (req, res) => {
  try {
    const providers = await Provider.find({ isActive: true })
      .populate('facilityId', 'name type')
      .populate('departmentId', 'name')
      .select('-password');

    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching providers', error: error.message });
  }
};

// Update provider
const updateProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow password update through this endpoint
    delete updateData.password;

    const provider = await Provider.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.json({
      message: 'Provider updated successfully',
      provider
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating provider', error: error.message });
  }
};

// Deactivate provider
const deactivateProvider = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await Provider.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.json({
      message: 'Provider deactivated successfully',
      provider
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating provider', error: error.message });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalFacilities,
      totalProviders,
      totalPatients,
      activeReferrals
    ] = await Promise.all([
      Facility.countDocuments(),
      Provider.countDocuments({ isActive: true }),
      require('../models/patients').countDocuments(),
      require('../models/referral').countDocuments({ status: { $in: ['booked', 'confirmed'] } })
    ]);

    res.json({
      totalFacilities,
      totalProviders,
      totalPatients,
      activeReferrals
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

module.exports = {
  adminLogin,
  createFacility,
  getFacilities,
  createProvider,
  getProviders,
  updateProvider,
  deactivateProvider,
  getDashboardStats
};
