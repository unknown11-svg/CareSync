// List referrals for provider, with populated fields
const listReferrals = async (req, res) => {
  try {
    // Optionally filter by provider's facility or department if needed
    const referrals = await Referral.find({})
      .populate({ path: 'patientId', select: 'name surname phone preferredLanguage consented' })
      .populate({ path: 'fromFacilityId', select: 'name' })
      .populate({ path: 'toDepartmentId', select: 'name' })
      .populate({ path: 'slotId', select: 'start_at end_at status' });
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching referrals', error: error.message });
  }
};

const Referral = require('../models/referral');
const Slot = require('../models/slot');
const Provider = require('../models/provider');
const Facility = require('../models/facilities');
const MobileClinic = require('../models/events');
const jwt = require('jsonwebtoken');
const Patient = require('../models/patients');

// Provider authentication
const providerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const provider = await Provider.findOne({ email, isActive: true });
    if (!provider) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await provider.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    provider.lastLogin = new Date();
    await provider.save();

    const token = jwt.sign(
      {
        id: provider._id,
        email: provider.email,
        role: provider.role,
        type: 'provider'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const providerResponse = provider.toObject();
    delete providerResponse.password;

    res.json({
      token,
      provider: providerResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  providerLogin,
  listReferrals,
  // Edit an event for provider facility
  updateMyEvent: async (req, res) => {
    try {
      const provider = req.user;
      const { eventId } = req.params;
      const { title, description, type, location, services, startsAt, capacity } = req.body;
      const event = await MobileClinic.findOne({ _id: eventId, facilityId: provider.facilityId });
      if (!event) return res.status(404).json({ message: 'Event not found' });
      if (title !== undefined) event.title = title;
      if (description !== undefined) event.description = description;
      if (type !== undefined) event.type = type;
      if (location !== undefined) event.location = location;
      if (services !== undefined) event.services = services;
      if (startsAt !== undefined) event.startsAt = startsAt;
      if (capacity !== undefined) event.capacity = capacity;
      await event.save();
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: 'Error updating event', error: error.message });
    }
  },
    // List all patients (for provider referrals)
    listPatients: async (req, res) => {
      try {
        // Optionally, filter by facility or other logic if needed
        const patients = await Patient.find({}, '_id name surname phone preferredLanguage consented');
        res.json(patients);
      } catch (error) {
        console.error(error); // Log the real error for debugging
        res.status(500).json({ message: 'Error fetching patients', error: error.message });
      }
    },
  // Delete an event for provider facility
  deleteMyEvent: async (req, res) => {
    try {
      const provider = req.user;
      const { eventId } = req.params;
      const event = await MobileClinic.findOneAndDelete({ _id: eventId, facilityId: provider.facilityId });
      if (!event) return res.status(404).json({ message: 'Event not found' });
      res.json({ message: 'Event deleted', eventId });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting event', error: error.message });
    }
  },
  getMyAnalytics: async (req, res) => {
    try {
      const provider = req.user;
      // Referrals: count by status
      const referralAgg = await Referral.aggregate([
        { $match: { fromFacilityId: provider.facilityId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      const referralStats = referralAgg.reduce((acc, cur) => {
        acc[cur._id] = cur.count;
        return acc;
      }, {});

      // Slots: total, open, booked
      const slotAgg = await Slot.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      const slotStats = slotAgg.reduce((acc, cur) => {
        acc[cur._id] = cur.count;
        return acc;
      }, {});

      // Events: total, total RSVPs, capacity utilization
      const events = await MobileClinic.find({ facilityId: provider.facilityId });
      const totalEvents = events.length;
      const totalRsvps = events.reduce((sum, ev) => sum + (ev.rsvps?.length || 0), 0);
      const totalCapacity = events.reduce((sum, ev) => sum + (ev.capacity || 0), 0);
      const capacityUtilization = totalCapacity ? ((totalRsvps / totalCapacity) * 100).toFixed(1) : 0;

      res.json({
        referrals: {
          total: Object.values(referralStats).reduce((a, b) => a + b, 0),
          ...referralStats
        },
        slots: {
          total: Object.values(slotStats).reduce((a, b) => a + b, 0),
          ...slotStats
        },
        events: {
          total: totalEvents,
          totalRsvps,
          totalCapacity,
          capacityUtilization: Number(capacityUtilization)
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching analytics', error: error.message });
    }
  },
  // List slots for the authenticated provider's facility and department
  getMySlots: async (req, res) => {
    try {
      const provider = req.user; // from middleware
      if (!provider?.facilityId) return res.status(400).json({ message: 'Provider missing facility' });

      const facility = await Facility.findById(provider.facilityId);
      if (!facility) return res.status(404).json({ message: 'Facility not found' });

      const departmentName = provider.department;
      const dept = facility.departments?.find(d => d.name === departmentName);
      return res.json({
        facilityId: facility._id,
        department: departmentName || null,
        slots: dept?.slots || []
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching slots', error: error.message });
    }
  },
  // Create a slot under the provider's department (creates department if missing)
  createMySlot: async (req, res) => {
    try {
      const provider = req.user;
      const { startAt, endAt, status } = req.body;

      if (!provider?.facilityId) return res.status(400).json({ message: 'Provider missing facility' });
      if (!provider?.department) return res.status(400).json({ message: 'Provider missing department' });
      if (!startAt || !endAt) return res.status(400).json({ message: 'startAt and endAt are required' });

      const facility = await Facility.findById(provider.facilityId);
      if (!facility) return res.status(404).json({ message: 'Facility not found' });

      const departmentName = provider.department;
      let dept = facility.departments?.find(d => d.name === departmentName);

      if (!dept) {
        facility.departments = facility.departments || [];
        dept = {
          id: provider._id, // associate creator as id for now
          name: departmentName,
          slots: []
        };
        facility.departments.push(dept);
      }

      dept.slots = dept.slots || [];
      dept.slots.push({
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        status: status || 'open'
      });

      await facility.save();

      return res.status(201).json({ message: 'Slot created', department: departmentName });
    } catch (error) {
      res.status(500).json({ message: 'Error creating slot', error: error.message });
    }
  }
  ,
  // Close or open a slot by subdocument id
  setMySlotStatus: async (req, res) => {
    try {
      const provider = req.user;
      const { slotId } = req.params;
      const { status } = req.body; // 'open' | 'closed' | 'booked'
      if (!provider?.facilityId || !provider?.department) return res.status(400).json({ message: 'Missing context' });
      const facility = await Facility.findById(provider.facilityId);
      if (!facility) return res.status(404).json({ message: 'Facility not found' });
      const dept = (facility.departments || []).find(d => d.name === provider.department);
      if (!dept) return res.status(404).json({ message: 'Department not found' });
      const slot = (dept.slots || []).find(s => String(s._id) === String(slotId));
      if (!slot) return res.status(404).json({ message: 'Slot not found' });
      slot.status = status || 'closed';
      await facility.save();
      res.json({ message: 'Slot status updated', slotId });
    } catch (error) {
      res.status(500).json({ message: 'Error updating slot', error: error.message });
    }
  },
  // Delete slot by id
  deleteMySlot: async (req, res) => {
    try {
      const provider = req.user;
      const { slotId } = req.params;
      if (!provider?.facilityId || !provider?.department) return res.status(400).json({ message: 'Missing context' });
      const facility = await Facility.findById(provider.facilityId);
      if (!facility) return res.status(404).json({ message: 'Facility not found' });
      const dept = (facility.departments || []).find(d => d.name === provider.department);
      if (!dept) return res.status(404).json({ message: 'Department not found' });
      const before = (dept.slots || []).length;
      dept.slots = (dept.slots || []).filter(s => String(s._id) !== String(slotId));
      if (dept.slots.length === before) return res.status(404).json({ message: 'Slot not found' });
      await facility.save();
      res.json({ message: 'Slot deleted', slotId });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting slot', error: error.message });
    }
  },
  // Book slot (minimal flow: mark status booked)
  bookMySlot: async (req, res) => {
    try {
      const provider = req.user;
      const { slotId } = req.params;
      if (!provider?.facilityId || !provider?.department) return res.status(400).json({ message: 'Missing context' });
      const facility = await Facility.findById(provider.facilityId);
      if (!facility) return res.status(404).json({ message: 'Facility not found' });
      const dept = (facility.departments || []).find(d => d.name === provider.department);
      if (!dept) return res.status(404).json({ message: 'Department not found' });
      const slot = (dept.slots || []).find(s => String(s._id) === String(slotId));
      if (!slot) return res.status(404).json({ message: 'Slot not found' });
      slot.status = 'booked';
      await facility.save();
      res.json({ message: 'Slot booked', slotId });
    } catch (error) {
      res.status(500).json({ message: 'Error booking slot', error: error.message });
    }
  },
  // List provider facility events
  listMyEvents: async (req, res) => {
    try {
      const provider = req.user;
      if (!provider?.facilityId) return res.status(400).json({ message: 'Provider missing facility' });
      const events = await MobileClinic.find({ facilityId: provider.facilityId }).sort({ startsAt: -1 });
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
  },
  // Create event for provider facility
  createMyEvent: async (req, res) => {
    try {
      const provider = req.user;
      if (!provider?.facilityId) return res.status(400).json({ message: 'Provider missing facility' });
      const { title, description, type, location, services, startsAt, capacity } = req.body;
      if (!title || !type || !location || !services || !startsAt || !capacity) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      const event = await MobileClinic.create({
        facilityId: provider.facilityId,
        title,
        description: description || '',
        type,
        location,
        services: services || [],
        startsAt,
        capacity,
        rsvps: []
      });
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: 'Error creating event', error: error.message });
    }
  },
  // Update a slot's details (startAt, endAt, status) by subdocument id
  updateMySlot: async (req, res) => {
    try {
      const provider = req.user;
      const { slotId } = req.params;
      const { startAt, endAt, status } = req.body;
      if (!provider?.facilityId || !provider?.department) return res.status(400).json({ message: 'Missing context' });
      const facility = await Facility.findById(provider.facilityId);
      if (!facility) return res.status(404).json({ message: 'Facility not found' });
      const dept = (facility.departments || []).find(d => d.name === provider.department);
      if (!dept) return res.status(404).json({ message: 'Department not found' });
      const slot = (dept.slots || []).find(s => String(s._id) === String(slotId));
      if (!slot) return res.status(404).json({ message: 'Slot not found' });
      if (startAt) slot.startAt = new Date(startAt);
      if (endAt) slot.endAt = new Date(endAt);
      if (status) slot.status = status;
      await facility.save();
      res.json({ message: 'Slot updated', slotId });
    } catch (error) {
      res.status(500).json({ message: 'Error updating slot', error: error.message });
    }
  }
};


