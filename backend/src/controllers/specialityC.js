const Speciality = require('../models/Speciality');
const mongoose = require('mongoose');

// Create a new speciality
const createSpeciality = async (req, res) => {
  try {
    const payload = req.body;
    const speciality = new Speciality({
      _id: new mongoose.Types.ObjectId(),
      ...payload,
    });

    await speciality.save();
    res.status(201).json({ message: 'Speciality created successfully', speciality });
  } catch (error) {
    res.status(500).json({ message: 'Error creating speciality', error: error.message });
  }
};

// Get all specialities
const getAllSpecialities = async (req, res) => {
  try {
    const specialities = await Speciality.find();
    res.json(specialities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching specialities', error: error.message });
  }
};

// Get a speciality by ID
const getSpecialityById = async (req, res) => {
  try {
    const { id } = req.params;
    const speciality = await Speciality.findById(id);
    if (!speciality) {
      return res.status(404).json({ message: 'Speciality not found' });
    }
    res.json(speciality);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching speciality by ID', error: error.message });
  }
};

// Update a speciality
const updateSpeciality = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const speciality = await Speciality.findByIdAndUpdate(id, payload, { new: true });
    if (!speciality) {
      return res.status(404).json({ message: 'Speciality not found' });
    }

    res.json({ message: 'Speciality updated successfully', speciality });
  } catch (error) {
    res.status(500).json({ message: 'Error updating speciality', error: error.message });
  }
};

// Delete a speciality
const deleteSpecialityById = async (req, res) => {
  try {
    const { id } = req.params;
    const speciality = await Speciality.findByIdAndDelete(id);
    if (!speciality) {
      return res.status(404).json({ message: 'Speciality not found' });
    }

    res.json({ message: 'Speciality deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting speciality', error: error.message });
  }
};

module.exports = {
  createSpeciality,
  getAllSpecialities,
  getSpecialityById,
  updateSpeciality,
  deleteSpecialityById
};
