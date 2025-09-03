const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const FacilityAdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

FacilityAdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

FacilityAdminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('FacilityAdmin', FacilityAdminSchema);
