const MobileClinic = require('../models/events');
const mongoose = require('mongoose');

// RSVP or cancel RSVP for an event
const rsvpEvent = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { eventId } = req.params;
    const { action } = req.body; // 'yes' or 'cancel'
    const event = await MobileClinic.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Remove any existing RSVP for this patient
    event.rsvps = event.rsvps.filter(r => r.patientId.toString() !== patientId.toString());
    if (action === 'yes') {
      event.rsvps.push({ patientId, status: 'yes' });
    }
    await event.save();
    res.json({ message: 'RSVP updated', event });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update RSVP', error: error.message });
  }
};

module.exports = {
  rsvpEvent
};
