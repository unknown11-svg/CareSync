const express = require('express');
const router = express.Router();
const specialityController = require('../controllers/specialityC');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (anyone can view specialities)
router.get('/', specialityController.getAllSpecialities);
router.get('/:id', specialityController.getSpecialityById);

// The following require provider/admin authentication
router.use(authMiddleware.requireProvider);

// Create a new speciality
router.post('/', specialityController.createSpeciality);

// Update a speciality
router.put('/:id', specialityController.updateSpeciality);

// Delete a speciality
router.delete('/:id', specialityController.deleteSpecialityById);

module.exports = router;
