const Slot = require('../models/slot');

// Get available slots for a department, with optional date filtering
const getSlots = async (req, res) => {
  try {
    const { department_id, start_at, end_at } = req.query;
    const query = { status: 'open' };
    if (department_id) query.department_id = department_id;
    if (start_at && end_at) {
      query.start_at = { $gte: new Date(start_at), $lte: new Date(end_at) };
    }

    const slots = await Slot.find(query).sort({ start_at: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching slots', error: error.message });
  }
};

// Create a new slot
const createSlot = async (req, res) => {
  try {
    const { department_id, start_at, end_at } = req.body;

    const slot = new Slot({
      department_id,
      start_at,
      end_at
    });

    await slot.save();
    res.status(201).json({ message: 'Slot created successfully', slot });
  } catch (error) {
    res.status(500).json({ message: 'Error creating slot', error: error.message });
  }
};

// Book a slot (mark as booked)
const bookSlot = async (req, res) => {
  try {
    const { slot_id } = req.body;

    const slot = await Slot.findById(slot_id);
    if (!slot || slot.status !== 'open') {
      return res.status(400).json({ message: 'Slot not available' });
    }

    slot.status = 'booked';
    await slot.save();

    res.json({ message: 'Slot booked successfully', slot });
  } catch (error) {
    res.status(500).json({ message: 'Error booking slot', error: error.message });
  }
};

module.exports = {
  getSlots,
  createSlot,
  bookSlot
};