const mongoose = require('mongoose');

// Define the schema for a Referral model.
const referralSchema = new mongoose.Schema({
  // The ID of the facility from which the referral originated.
  // We use mongoose.Schema.Types.ObjectId to create a reference to another document.
  fromFacilityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // The ID of the target department for the referral.
  toDepartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // The ID of the patient being referred.
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // The ID of the specific appointment slot that was booked.
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // The status of the referral. Using an enum to restrict possible values.
  status: {
    type: String,
    enum: ['booked', 'confirmed', 'cancelled'],
    required: false
  }
}, {
  // Automatically add 'createdAt' and 'updatedAt' timestamps.
  // This is better practice than defining 'createdAt' manually as a string.
  timestamps: true
});

// Create and export the Mongoose model based on the schema.
const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;
