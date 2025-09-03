// Get the facility for the logged-in facility admin
exports.getMyFacility = async (req, res) => {
  try {
    const admin = await FacilityAdmin.findById(req.user.id).populate('facility');
    if (!admin || !admin.facility) return res.status(404).json({ message: 'Facility not found for this admin' });
    res.json(admin.facility);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
const FacilityAdmin = require('../models/facilityAdmin');
const Facility = require('../models/facilities');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await FacilityAdmin.findOne({ email }).populate('facility');
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: admin._id, role: 'facility-admin', facility: admin.facility._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email, facility: admin.facility } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const admin = await FacilityAdmin.findById(req.user.id).populate('facility');
    if (!admin) return res.status(404).json({ message: 'Facility admin not found' });
    res.json({ admin });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
