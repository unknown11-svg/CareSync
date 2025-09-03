
const express = require('express');
const router = express.Router();
const facilityAdminController = require('../controllers/facilityAdminController');
const authMiddleware = require('../middleware/authMiddleware');

// Get the facility for the logged-in facility admin
router.get('/my-facility', authMiddleware.requireFacilityAdmin, facilityAdminController.getMyFacility);

// Login
router.post('/login', facilityAdminController.login);

// Get profile (protected)
router.get('/profile', authMiddleware.requireFacilityAdmin, facilityAdminController.getProfile);

module.exports = router;
