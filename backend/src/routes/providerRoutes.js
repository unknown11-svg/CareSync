const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const providerController = require('../controllers/providerController');

// Public
router.post('/login', providerController.providerLogin);

// Protected routes
router.use(authMiddleware.requireProvider);

// Placeholder endpoints
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Provider dashboard placeholder' });
});

// Example protected resources with permissions
router.get('/referrals', authMiddleware.requirePermission('manage_slots'), (req, res) => {
  res.json([]);
});

router.get('/slots', authMiddleware.requirePermission('manage_slots'), providerController.getMySlots);
router.post('/slots', authMiddleware.requirePermission('manage_slots'), providerController.createMySlot);
router.patch('/slots/:slotId/status', authMiddleware.requirePermission('manage_slots'), providerController.setMySlotStatus);
router.delete('/slots/:slotId', authMiddleware.requirePermission('manage_slots'), providerController.deleteMySlot);
router.post('/slots/:slotId/book', authMiddleware.requirePermission('manage_slots'), providerController.bookMySlot);

router.get('/analytics', authMiddleware.requirePermission('view_analytics'), providerController.getMyAnalytics);

// Events (manage_events)
router.get('/events', authMiddleware.requirePermission('manage_events'), providerController.listMyEvents);
router.post('/events', authMiddleware.requirePermission('manage_events'), providerController.createMyEvent);
router.patch('/events/:eventId', authMiddleware.requirePermission('manage_events'), providerController.updateMyEvent);
router.delete('/events/:eventId', authMiddleware.requirePermission('manage_events'), providerController.deleteMyEvent);

module.exports = router;


