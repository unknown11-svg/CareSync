const mongoose = require('mongoose');

const specialitySchema = new mongoose.Schema({
  _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Speciality',
        required: true,
      }, 
  name: {
    type: String,
    required: true,
  },
  location: {type: {type: String, default: 'Point'}, coordinates: [Number]},
  description: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  services: {
    type: [String],
    required: true,
  },
  referralContact: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    required: true,
  },

}, { timestamps: true });

const Speciality = mongoose.model('Speciality', specialitySchema);
module.exports = Speciality;
