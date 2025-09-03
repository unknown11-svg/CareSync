const express = require('express');
const router = express.Router();
const { rsvpEvent } = require('../controllers/events');
const { verifyToken } = require('../middleware/authMiddleware');

// RSVP or cancel RSVP for an event
router.post('/:eventId/rsvp', verifyToken, rsvpEvent);

module.exports = router;
