import express from "express";
import PatientFile from "../models/patientfile.js";

const router = express.Router();

// Create new patient
router.post("/", async (req, res) => {
  try {
    const patient = new PatientFile(req.body);
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
  console.error("Error saving patient:", err);
  res.status(400).json({ error: err.message, details: err.errors });
  }
});

// Get all patients
router.get("/", async (req, res) => {
  try {
    const patients = await PatientFile.find();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//get patient file using their identity number
router.get("/:identityNumber", async (req, res) => {
  try {
    const { identityNumber } = req.params;
    const patient = await PatientFile.findOne({ identityNumber });
    console.log("Searching for:", identityNumber);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    console.log(patient);
    res.json(patient);
  } catch (err) {
    console.error("Error fetching patient:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/:id/appointments", async (req, res) => {
  try {
    const { id } = req.params;
    const { hospital, doctor, date, reason, notes } = req.body;

    const patient = await PatientFile.findById(id);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    patient.appointments.push({ hospital, doctor, date, reason, notes });
    await patient.save();

    res.status(201).json(patient);
  } catch (err) {
    console.error("Error adding appointment:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

