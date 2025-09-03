const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  start_at: {
    type: Date,
    required: true
  },
  end_at: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'held', 'booked'],
    default: 'open'
  }
}, {
  timestamps: true
});

const Slot = mongoose.model('Slot', slotSchema);

module.exports = Slot;