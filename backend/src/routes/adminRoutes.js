const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/login', adminController.adminLogin);

// Protected routes - require admin authentication
router.use(authMiddleware.requireAdmin);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// Facility management
router.post('/facilities', adminController.createFacility);
router.get('/facilities', adminController.getFacilities);

// Provider management
router.post('/providers', adminController.createProvider);
router.get('/providers', adminController.getProviders);
router.put('/providers/:id', adminController.updateProvider);
router.delete('/providers/:id', adminController.deactivateProvider);

module.exports = router;
