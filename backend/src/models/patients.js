const mongoose = require('mongoose');

// Define the schema for a single notification object.
// This will be used inside the 'notifications' array.
const notificationSchema = new mongoose.Schema({
  // The content of the notification message.
  message: {
    type: String,
    required: true
  },
  // The timestamp when the notification was sent.
  // Using the Date type is best for time-series data.
  sentAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// Define the main schema for the User model.
const patientSchema = new mongoose.Schema({
  // The user's phone number, stored as a string.
  phone: {
    type: String,
    required: true,
    unique: true // Phone numbers should be unique for each user.
  },
  // The user's preferred language, e.g., 'en' or 'es'.
  preferredLanguage: {
    type: String,
    default: 'en'
  },
  // A boolean to track if the user has consented to terms or notifications.
  consented: {
    type: Boolean,
    default: false
  },
  // An array of notification objects using the schema defined above.
  notifications: [notificationSchema]
}, {
  // Automatically add 'createdAt' and 'updatedAt' timestamps.
  timestamps: true
});

// Create and export the Mongoose model based on the schema.
const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
