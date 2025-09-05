const express = require('express');
const router = express.Router();
const Facility = require('../models/facilities');

// Public endpoint to get departments for a facility
router.get('/:facilityId/departments', async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.facilityId);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    res.json(facility.departments || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
});

module.exports = router;
