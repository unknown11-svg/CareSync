const express = require('express');
const router = express.Router();
const specialityController = require('../controllers/specialityC');

// All routes are now public
router.get('/', specialityController.getAllSpecialities);
router.get('/:id', specialityController.getSpecialityById);
router.post('/', specialityController.createSpeciality);
router.put('/:id', specialityController.updateSpeciality);
router.delete('/:id', specialityController.deleteSpecialityById);

module.exports = router;
