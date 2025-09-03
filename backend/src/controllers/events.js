const Patient = require('../models/patients');
// Get event with RSVP patient names (for export/download and UI)
const getEventWithRSVPs = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await MobileClinic.findById(eventId).lean();
    if (!event) return res.status(404).json({ message: 'Event not found' });
    // Populate patient names for each RSVP
    const patientIds = event.rsvps.map(r => r.patientId);
    const patients = await Patient.find({ _id: { $in: patientIds } }).select('_id phone preferredLanguage').lean();
    const patientMap = Object.fromEntries(patients.map(p => [p._id.toString(), p]));
    const rsvpsWithNames = event.rsvps.map(r => ({
      ...r,
      patient: patientMap[r.patientId?.toString()] || null
    }));
    res.json({ ...event, rsvps: rsvpsWithNames });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch event details', error: error.message });
  }
};
// Public RSVP endpoint for WhatsApp links (no auth required)
const publicRSVP = async (req, res) => {
  try {
    const { eventId, patientId } = req.params;
    const { status } = req.body; // 'yes' or 'no'
    const event = await MobileClinic.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Remove any existing RSVP for this patient
    event.rsvps = event.rsvps.filter(r => r.patientId.toString() !== patientId);
    if (status === 'yes' || status === 'no') {
      event.rsvps.push({ patientId, status });
    }
    await event.save();
    res.json({ message: 'RSVP updated', event });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update RSVP', error: error.message });
  }
};
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
  rsvpEvent,
  publicRSVP,
  getEventWithRSVPs
};
