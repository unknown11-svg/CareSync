const express = require('express');
const router = express.Router();
const Facility = require('../models/facilities');

// Public endpoint to get all facilities
router.get('/', async (req, res) => {
  try {
    const facilities = await Facility.find();
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching facilities', error: error.message });
  }
});

module.exports = router;
