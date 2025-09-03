const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/events');
const { rsvpEvent, publicRSVP } = eventsController;
const { verifyToken } = require('../middleware/authMiddleware');

// Get event with RSVP patient names (for export/download and UI)
router.get('/:eventId/details', eventsController.getEventWithRSVPs);
// Public RSVP endpoint for WhatsApp links (no auth required)
router.post('/public/:eventId/:patientId/rsvp', publicRSVP);
// RSVP or cancel RSVP for an event
router.post('/:eventId/rsvp', verifyToken, rsvpEvent);

module.exports = router;
