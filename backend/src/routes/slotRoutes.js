const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');
const authMiddleware = require('../middleware/authMiddleware');
const Facility = require('../models/facilities');



// GET slots: public (for patients to view open slots)
router.get('/', slotController.getSlots);

// The following require provider authentication
router.use(authMiddleware.requireProvider);
router.post('/', slotController.createSlot);
router.post('/book', slotController.bookSlot);
router.get('/:facilityId/departments/:departmentId', async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.facilityId);
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Find department by ID
    const department = facility.departments.id(req.params.departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(department.slots || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching slots', error: error.message });
  }
});

module.exports = router;