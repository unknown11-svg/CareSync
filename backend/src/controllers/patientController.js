// Cancel an appointment (referral)
const cancelAppointment = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { appointmentId } = req.params;
    // Find referral and ensure it belongs to this patient
    const referral = await Referral.findOne({ _id: appointmentId, patientId });
    if (!referral) return res.status(404).json({ message: 'Appointment not found' });
    if (referral.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });
    referral.status = 'cancelled';
    await referral.save();
    // Optionally, free up the slot
    if (referral.slotId) {
      await Slot.findByIdAndUpdate(referral.slotId, { status: 'open' });
    }
    res.json({ message: 'Appointment cancelled', referral });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel appointment', error: error.message });
  }
};

// Reschedule an appointment (change slot)
const rescheduleAppointment = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { appointmentId } = req.params;
    const { newSlotId } = req.body;
    // Find referral and ensure it belongs to this patient
    const referral = await Referral.findOne({ _id: appointmentId, patientId });
    if (!referral) return res.status(404).json({ message: 'Appointment not found' });
    if (referral.status === 'cancelled') return res.status(400).json({ message: 'Cannot reschedule a cancelled appointment' });
    // Free up old slot
    if (referral.slotId) {
      await Slot.findByIdAndUpdate(referral.slotId, { status: 'open' });
    }
    // Assign new slot
    referral.slotId = newSlotId;
    referral.status = 'booked';
    await referral.save();
    // Mark new slot as booked
    await Slot.findByIdAndUpdate(newSlotId, { status: 'booked' });
    res.json({ message: 'Appointment rescheduled', referral });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reschedule appointment', error: error.message });
  }
};
const Patient = require('../models/patients');
const Slot = require('../models/slot');
const Referral = require('../models/referral');
const MobileClinic = require('../models/events');
const Provider = require('../models/provider');
const Facility = require('../models/facilities');
const jwt = require('jsonwebtoken');

// Patient login
const patientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await patient.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      {
        id: patient._id,
        email: patient.email,
        role: 'patient',
        type: 'patient'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    const patientResponse = patient.toObject();
    delete patientResponse.password;
    res.json({ token, patient: patientResponse });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all appointments for the logged-in patient (slots with booked referrals)
const getAppointments = async (req, res) => {
  try {
    const patientId = req.user._id;
    // Find referrals for this patient, populate slot
    const referrals = await Referral.find({ patientId })
      .populate({ path: 'slotId', model: 'Slot' });

    // For each referral, fetch provider, department, and facility info
    const appointments = await Promise.all(referrals.map(async ref => {
      let provider = null;
      let departmentName = null;
      let facility = null;

      // Find provider by slot's department_id (if available)
      if (ref.slotId && ref.slotId.department_id) {
        provider = await Provider.findOne({ department: ref.slotId.department_id });
      }

      // Find department and facility
      if (ref.fromFacilityId) {
        facility = await Facility.findById(ref.fromFacilityId);
        if (facility && ref.toDepartmentId) {
          const dept = facility.departments.find(d => d.id.toString() === ref.toDepartmentId.toString());
          departmentName = dept ? dept.name : null;
        }
      }

      return {
        _id: ref._id,
        date: ref.slotId?.start_at,
        end: ref.slotId?.end_at,
        status: ref.status,
        slot: ref.slotId,
        referral: ref,
        provider: provider ? { name: provider.name, id: provider._id } : null,
        department: departmentName,
        facility: facility ? { name: facility.name, id: facility._id } : null
      };
    }));
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
};

// Get all referrals for the logged-in patient, with facility/department info
const getReferrals = async (req, res) => {
  try {
    const patientId = req.user._id;
    const referrals = await Referral.find({ patientId });
    const results = await Promise.all(referrals.map(async ref => {
      let fromFacilityName = null;
      let toDepartmentName = null;
      let reason = ref.reason || '';
      // Get facility name
      if (ref.fromFacilityId) {
        const facility = await Facility.findById(ref.fromFacilityId);
        if (facility) fromFacilityName = facility.name;
        // Get department name
        if (facility && ref.toDepartmentId) {
          const dept = facility.departments.find(d => d.id.toString() === ref.toDepartmentId.toString());
          if (dept) toDepartmentName = dept.name;
        }
      }
      return {
        ...ref.toObject(),
        reason,
        fromFacilityName,
        toDepartmentName
      };
    }));
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch referrals', error: error.message });
  }
};

// Get all events the patient RSVP'd to
const getEvents = async (req, res) => {
  try {
    const patientId = req.user._id;
    // Find events where rsvps contains this patient
    const events = await MobileClinic.find({ 'rsvps.patientId': patientId });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

module.exports = {
  patientLogin,
  getAppointments,
  getReferrals,
  getEvents,
  cancelAppointment,
  rescheduleAppointment
};
