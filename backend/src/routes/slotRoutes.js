const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');
const authMiddleware = require('../middleware/authMiddleware');


// GET slots: public (for patients to view open slots)
router.get('/', slotController.getSlots);

// The following require provider authentication
router.use(authMiddleware.requireProvider);
router.post('/', slotController.createSlot);
router.post('/book', slotController.bookSlot);

module.exports = router;