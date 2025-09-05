// Get referral analytics (counts by status, monthly trends)
const getReferralAnalytics = async (req, res) => {
  try {
    // Count by status
    const statusAgg = await Referral.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const statusCounts = statusAgg.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    // Monthly trend (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyAgg = await Referral.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, status: '$status' },
        count: { $sum: 1 }
      } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    // Format monthly data
    const monthly = {};
    monthlyAgg.forEach(item => {
      const key = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`;
      if (!monthly[key]) monthly[key] = {};
      monthly[key][item._id.status] = item.count;
    });

    res.json({ statusCounts, monthly });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching referral analytics', error: error.message });
  }
};
const Referral = require('../models/referral');
const Slot = require('../models/slot');

// Create a new referral and book the slot
const createReferral = async (req, res) => {
  try {
    const { fromFacilityId, toDepartmentId, patientId, slotId } = req.body;
    console.log('Referral payload:', req.body);

    // Check if slot is available
    const slot = await Slot.findById(slotId);
    console.log('Slot found:', slot);
    if (!slot || slot.status !== 'open') {
      console.log('Slot not available or not open:', slot);
      return res.status(400).json({ message: 'Slot not available', slot });
    }

    // Create referral
    const referral = new Referral({
      fromFacilityId,
      toDepartmentId,
      patientId,
      slotId,
      status: 'booked'
    });
    await referral.save();

    // Update slot status
    slot.status = 'booked';
    await slot.save();

    // TODO: Trigger notification to patient here

    res.status(201).json({ message: 'Referral created', referral });
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({ message: 'Error creating referral', error: error.message });
  }
};

// Get all referrals (optionally filter by provider, patient, etc.)
const getReferrals = async (req, res) => {
  try {
    // You can add filters as needed, e.g., by provider or patient
    const { patientId, fromFacilityId } = req.query;
    const filter = {};
    if (patientId) filter.patientId = patientId;
    if (fromFacilityId) filter.fromFacilityId = fromFacilityId;

    const referrals = await Referral.find(filter)
      .populate('fromFacilityId toDepartmentId patientId slotId');
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching referrals', error: error.message });
  }
};

// Cancel a referral (set status to 'cancelled')
const cancelReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const referral = await Referral.findById(id);
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }
    if (referral.status === 'cancelled') {
      return res.status(400).json({ message: 'Referral already cancelled' });
    }
    referral.status = 'cancelled';
    await referral.save();
    res.json({ message: 'Referral cancelled', referral });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling referral', error: error.message });
  }
};

module.exports = {
  createReferral,
  getReferrals,
  cancelReferral,
  getReferralAnalytics
};