import mongoose from "mongoose";

// Sub-schema for appointments
const appointmentSchema = new mongoose.Schema({
  hospital: { type: String, required: true },
  doctor: { type: String, required: true },
  date: { type: Date, required: true },
  reason: { type: String },
  notes: { type: String }
});

// Patient schema
const patientSchema = new mongoose.Schema({
  // Personal Information
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ["male", "female", "other", "prefer-not-to-say"], required: true },
  identityNumber: { type: String, required: true, unique: true },
  preferredLanguage: { type: String },

  // Contact Information
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String, required: true },
  city: { type: String, required: true },
  province: { type: String, required: true },
  zipCode: { type: String, required: true },

  //Emergency Contact
  emergencyName: { type: String, required: true },
  emergencyRelationship: { type: String, required: true },
  emergencyPhone: { type: String, required: true },
  emergencyAddress: { type: String },

  // Insurance Information
  insuranceProvider: { type: String },
  policyNumber: { type: String },
  groupNumber: { type: String },
  subscriberName: { type: String },

  //Medical History
  allergies: { type: String, required: true },
  medications: { type: String, required: true },
  medicalConditions: { type: String, required: true },
  previousSurgeries: { type: String, required: true },
  familyHistory: { type: String, required: true },

  createdAt: { type: Date, default: Date.now },
  //Appointments
  appointments: {type:[appointmentSchema],default:[]},
});

export default mongoose.model("PatientFile", patientSchema);
