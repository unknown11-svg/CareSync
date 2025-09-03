const mongoose = require('mongoose');

// Define a schema for a GeoJSON Point. This is necessary for geospatial queries.
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'], // The type must be 'Point' for geospatial indexing
    required: true
  },
  coordinates: {
    type: [Number], // An array of numbers for longitude and latitude
    required: true
  }
});

// Define the schema for a single RSVP object within the rsvps array.
const rsvpSchema = new mongoose.Schema({
  // The ID of the patient who RSVP'd.
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // The status of the RSVP, e.g., 'yes'.
  status: {
    type: String,
    required: true
  }
});

// Define the main schema for the Mobile Clinic Event model.
const mobileClinicSchema = new mongoose.Schema({
  // The ID of the facility hosting the mobile clinic.
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // Title of the event
  title: {
    type: String,
    required: true
  },
  // Description of the event
  description: {
    type: String,
    default: ''
  },
  // The type of mobile clinic event. Using an enum to restrict values.
  type: {
    type: String,
    enum: ['mobile_clinic', 'meds_pickup'],
    required: true
  },
  // The location of the mobile clinic, using the GeoJSON Point schema.
  location: {
    type: pointSchema,
    required: true
  },
  // An array of services offered at this event.
  services: {
    type: [String],
    required: true
  },
  // The date and time the event starts.
  startsAt: {
    type: Date,
    required: true
  },
  // The maximum number of patients the event can handle.
  capacity: {
    type: Number,
    required: true
  },
  // An array of RSVP objects from patients who confirmed attendance.
  rsvps: [rsvpSchema]
}, {
  // Automatically add 'createdAt' and 'updatedAt' timestamps.
  timestamps: true
});

// Create a geospatial index on the 'location' field for efficient queries.
mobileClinicSchema.index({ location: '2dsphere' });

// Create and export the Mongoose model based on the schema.
const MobileClinic = mongoose.model('MobileClinic', mobileClinicSchema);

module.exports = MobileClinic;
