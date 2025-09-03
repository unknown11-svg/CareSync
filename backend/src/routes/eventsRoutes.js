// Get event with RSVP patient names (for export/download and UI)
router.get('/:eventId/details', require('../controllers/events').getEventWithRSVPs);
const express = require('express');
const router = express.Router();
const { rsvpEvent, publicRSVP } = require('../controllers/events');
// Public RSVP endpoint for WhatsApp links (no auth required)
router.post('/public/:eventId/:patientId/rsvp', publicRSVP);
const { verifyToken } = require('../middleware/authMiddleware');

// RSVP or cancel RSVP for an event
router.post('/:eventId/rsvp', verifyToken, rsvpEvent);

module.exports = router;
